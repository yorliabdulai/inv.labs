"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStock } from "@/lib/market-data";

interface TradeParams {
    symbol: string;
    type: "BUY" | "SELL";
    quantity: number;
}

export async function executeStockTrade(params: TradeParams) {
    const { symbol, type, quantity } = params;

    // Security: Validate quantity to prevent negative or zero trades
    if (!quantity || quantity <= 0) {
        return { success: false, message: "Invalid quantity. Must be greater than 0." };
    }

    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Authentication required");
        }

        // 1. Fetch real-time price server-side
        const stock = await getStock(symbol);
        if (!stock) {
            throw new Error(`Stock ${symbol} not found`);
        }

        // 2. Get live price & Calculate Costs
        const price = stock.price;
        const subtotal = price * quantity;

        // Calculate Ghana Stock Exchange fees server-side
        const brokerFee = subtotal * 0.015;
        const secLevy = subtotal * 0.004;
        const gseLevy = subtotal * 0.0014;
        const vat = brokerFee * 0.15;
        const fees = brokerFee + secLevy + gseLevy + vat;

        const totalCost = type === "BUY" ? subtotal + fees : subtotal - fees;

        // Execute atomic trade via Postgres RPC to prevent race conditions (TOCTOU)
        // This handles upserting stock, validating balance/holdings, creating transaction,
        // updating balance, and updating holdings in a single DB transaction block.
        const { error: rpcError } = await supabase.rpc('execute_stock_trade', {
            p_user_id: user.id,
            p_symbol: stock.symbol,
            p_stock_name: stock.name,
            p_stock_sector: stock.sector,
            p_current_price: stock.price,
            p_change_percent: stock.changePercent,
            p_type: type,
            p_quantity: quantity,
            p_total_cost: totalCost,
            p_fees: fees
        });

        if (rpcError) {
            // Handle expected business logic errors cleanly
            if (rpcError.message.includes('Insufficient funds') || rpcError.message.includes('Insufficient shares')) {
                return { success: false, message: rpcError.message };
            }
            throw new Error(`Database transaction failed: ${rpcError.message}`);
        }

        // 4. Revalidate cache for affected views
        revalidatePath("/dashboard", "page");
        revalidatePath("/dashboard/portfolio", "page");

        return { success: true, message: `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol}` };

    } catch (error: unknown) {
        console.error("Stock trade error:", error);
        return { success: false, message: "Trade execution failed. Please try again." };
    }
}
