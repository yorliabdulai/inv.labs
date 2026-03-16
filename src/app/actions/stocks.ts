"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fetchStockBySymbol } from "@/lib/market-data";

interface TradeParams {
    symbol: string;
    name: string;       // pass stock metadata from client (already fetched for UI display)
    sector: string;
    type: "BUY" | "SELL";
    quantity: number;
    price: number;      // current price from live feed (already shown in UI)
    changePercent: number;
}

export async function executeStockTrade(params: TradeParams) {
    const { symbol, type, quantity } = params;

    // Security: Validate inputs
    if (!quantity || quantity <= 0) {
        return { success: false, message: "Invalid quantity. Must be greater than 0." };
    }
    if (!symbol) {
        return { success: false, message: "Invalid stock data. Please refresh and try again." };
    }

    try {
        // Step 1: Fetch fresh stock data server-side
        const freshStockData = await fetchStockBySymbol(symbol);

        if (!freshStockData) {
            return { success: false, message: `Stock symbol "${symbol}" not found or currently unavailable.` };
        }

        const { price, name, sector, changePercent } = freshStockData;

        // Security: validate the fetched price
        if (!price || price <= 0) {
            return { success: false, message: "Invalid price retrieved from market data." };
        }

        // Step 2: Authenticate user
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error("[executeStockTrade] Auth error:", authError.message);
            throw new Error("Authentication failed. Please sign in again.");
        }
        if (!user) {
            throw new Error("Authentication required");
        }

        // Step 3: Calculate costs server-side (Ghana Stock Exchange fee structure)
        // Price comes from the server-side fetched data.
        // This is a simulator — no real money is at stake.
        const subtotal = price * quantity;

        const brokerFee = subtotal * 0.015;
        const secLevy = subtotal * 0.004;
        const gseLevy = subtotal * 0.0014;
        const vat = brokerFee * 0.15;
        const fees = brokerFee + secLevy + gseLevy + vat;

        const totalCost = type === "BUY" ? subtotal + fees : subtotal - fees;

        console.log(`[executeStockTrade] ${type} ${quantity}x ${symbol} @ GH₵${price} | subtotal: ${subtotal.toFixed(2)} | fees: ${fees.toFixed(2)} | total: ${totalCost.toFixed(2)}`);

        // Step 4: Execute atomic trade via Postgres RPC to prevent race conditions (TOCTOU).
        // The function handles: upserting stock, validating balance/holdings, creating
        // transaction record, updating balance, and updating holdings — all in one DB transaction.
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
            p_fees: fees
        });

        if (rpcError) {
            console.error(`[executeStockTrade] RPC error for ${type} ${symbol}:`, rpcError.message, '| code:', rpcError.code, '| details:', rpcError.details);

            // Handle expected business logic errors — surface them directly
            if (
                rpcError.message.includes('Insufficient funds') ||
                rpcError.message.includes('Insufficient shares')
            ) {
                return { success: false, message: rpcError.message };
            }

            // Handle missing RPC function (migration not yet applied to Supabase)
            if (rpcError.code === 'PGRST202' || rpcError.message.includes('does not exist')) {
                console.error('[executeStockTrade] The execute_stock_trade DB function is not deployed. Run supabase/migrations/20260301_atomic_stock_trades.sql in the Supabase SQL Editor.');
                return { success: false, message: "Database not configured. Please contact support." };
            }

            throw new Error(`Database transaction failed: ${rpcError.message}`);
        }

        // Step 5: Revalidate cache for affected views
        revalidatePath("/dashboard", "page");
        revalidatePath("/dashboard/portfolio", "page");

        console.log(`[executeStockTrade] ✓ Success: ${type} ${quantity}x ${symbol} for user ${user.id}`);
        return { success: true, message: `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol}` };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[executeStockTrade] Unhandled error:", message, error instanceof Error ? error.stack : '');
        return { success: false, message: message || "Trade execution failed. Please try again." };
    }
}
