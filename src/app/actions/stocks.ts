"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/app/actions/xp";
import { fetchStockBySymbol } from "@/lib/market-data";

interface TradeParams {
    symbol: string;
    type: "BUY" | "SELL";
    quantity: number;
    orderType?: "MARKET" | "LIMIT";
    limitPrice?: number;
}

export async function executeStockTrade(params: TradeParams) {
    const { symbol, type, quantity, orderType = "MARKET", limitPrice } = params;

    // Security: Validate inputs
    if (!quantity || quantity <= 0) {
        return { success: false, message: "Invalid quantity. Must be greater than 0." };
    }
    if (!symbol) {
        return { success: false, message: "Invalid stock symbol. Please refresh and try again." };
    }

    try {
        // Step 1: Authenticate user
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error("[executeStockTrade] Auth error:", authError.message);
            throw new Error("Authentication failed. Please sign in again.");
        }
        if (!user) {
            throw new Error("Authentication required");
        }

        // Step 2: Fetch current live price and metadata securely server-side
        const stockData = await fetchStockBySymbol(symbol);

        if (!stockData || !stockData.price || stockData.price <= 0) {
             return { success: false, message: "Could not fetch valid stock data. Please try again." };
        }

        const price = stockData.price;
        const name = stockData.name;
        const sector = stockData.sector;
        const changePercent = stockData.changePercent;

        // Step 3: Calculate costs server-side (Ghana Stock Exchange fee structure)
        // This is a simulator — no real money is at stake.
        const subtotal = price * quantity;

        const brokerFee = subtotal * 0.015;
        const secLevy = subtotal * 0.004;
        const gseLevy = subtotal * 0.0014;
        const vat = brokerFee * 0.15;
        const fees = brokerFee + secLevy + gseLevy + vat;

        const totalCost = type === "BUY" ? subtotal + fees : subtotal - fees;

        console.log(`[executeStockTrade] ${type} ${quantity}x ${symbol} @ GH₵${price} | subtotal: ${subtotal.toFixed(2)} | fees: ${fees.toFixed(2)} | total: ${totalCost.toFixed(2)}`);

        // Step 4: Execution Logic
        // Determine if this order should execute immediately or be placed as pending
        const isLimit = orderType === "LIMIT" && limitPrice !== undefined;
        let shouldExecuteImmediately = true;

        if (isLimit) {
            if (type === "BUY" && price > limitPrice) {
                shouldExecuteImmediately = false;
            } else if (type === "SELL" && price < limitPrice) {
                shouldExecuteImmediately = false;
            }
        }

        if (shouldExecuteImmediately) {
            // Execute atomic trade via Postgres RPC
            const { error: rpcError } = await supabase.rpc('execute_stock_trade', {
                p_user_id: user.id,
                p_symbol: symbol,
                p_stock_name: name,
                p_stock_sector: sector,
                p_current_price: price,
                p_change_percent: changePercent,
                p_type: type,
                p_quantity: quantity,
                p_total_cost: totalCost,
                p_fees: fees,
            });

            if (rpcError) {
                console.error(`[executeStockTrade] RPC error:`, rpcError.message);
                if (rpcError.message.includes('funds') || rpcError.message.includes('shares')) {
                    return { success: false, message: rpcError.message };
                }
                throw new Error(`Execution failed: ${rpcError.message}`);
            }

            // XP and revalidation logic handled below...
        } else {
            // Place as pending order
            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    symbol,
                    type,
                    quantity,
                    price_per_share: 0, // Not executed yet
                    total_amount: totalCost,
                    fees,
                    order_type: 'limit',
                    status: 'pending',
                    limit_price: limitPrice
                });

            if (insertError) {
                console.error(`[executeStockTrade] Insert error:`, insertError.message);
                throw new Error(`Failed to place pending order: ${insertError.message}`);
            }

            revalidatePath("/dashboard", "page");
            revalidatePath("/dashboard/portfolio", "page");

            return { 
                success: true, 
                message: "Limit order placed successfully. It will execute when the market price hits your target.",
                isPending: true
            };
        }

        // Step 5: Revalidate cache for affected views
        revalidatePath("/dashboard", "page");
        revalidatePath("/dashboard/portfolio", "page");

        // Step 6: Award XP for the trade (fire & forget — non-blocking)
        const xpEvent = type === 'BUY' ? 'STOCK_TRADE_BUY' : 'STOCK_TRADE_SELL';
        awardXP(xpEvent, { symbol, quantity, total: totalCost }).catch(err =>
            console.warn('[executeStockTrade] XP award failed:', err)
        );

        console.log(`[executeStockTrade] ✓ Success: ${type} ${quantity}x ${symbol} for user ${user.id}`);
        return { success: true, message: `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol}` };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[executeStockTrade] Unhandled error:", message, error instanceof Error ? error.stack : '');
        return { success: false, message: message || "Trade execution failed. Please try again." };
    }
}
