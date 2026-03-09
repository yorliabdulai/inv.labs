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

        // Fetch real-time price server-side
        const stock = await getStock(symbol);
        if (!stock) {
            throw new Error(`Stock ${symbol} not found`);
        }

        const price = stock.price;
        const subtotal = price * quantity;

        // Calculate Ghana Stock Exchange fees server-side
        const brokerFee = subtotal * 0.015;
        const secLevy = subtotal * 0.004;
        const gseLevy = subtotal * 0.0014;
        const vat = brokerFee * 0.15;
        const fees = brokerFee + secLevy + gseLevy + vat;

        const totalCost = type === "BUY" ? subtotal + fees : subtotal - fees;

        // Check if user has enough shares to sell
        if (type === "SELL") {
            const { data: txs, error: txsError } = await supabase
                .from('transactions')
                .select('type, quantity')
                .eq('user_id', user.id)
                .eq('symbol', symbol);

            if (txsError) throw new Error("Failed to verify holdings");

            let currentShares = 0;
            for (const tx of txs || []) {
                if (tx.type === "BUY") currentShares += tx.quantity;
                else if (tx.type === "SELL") currentShares -= tx.quantity;
            }

            if (currentShares < quantity) {
                return { success: false, message: "Insufficient shares for this trade." };
            }
        }

        // 1. Record the transaction
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: user.id,
            symbol,
            type,
            quantity,
            price_per_share: price,
            total_amount: totalCost,
            fees,
        });

        if (txError) {
            console.warn("Transaction record error:", txError.message);
        }

        // 2. Fetch current balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('cash_balance')
            .eq('id', user.id)
            .single();

        if (profileError) throw new Error("Could not retrieve user balance");

        // 3. Update balance
        const newBalance = type === "BUY"
            ? profile.cash_balance - totalCost
            : profile.cash_balance + totalCost;

        if (newBalance < 0 && type === "BUY") {
            throw new Error("Insufficient funds for this trade");
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ cash_balance: Math.max(0, newBalance) })
            .eq('id', user.id);

        if (updateError) throw new Error("Balance update failed");

        // 4. Revalidate cache for affected views
        revalidatePath("/dashboard", "page");
        revalidatePath("/dashboard/portfolio", "page");

        return { success: true, message: `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol}` };

    } catch (error: any) {
        console.error("Stock trade error:", error);
        return { success: false, message: "Trade execution failed. Please try again." };
    }
}
