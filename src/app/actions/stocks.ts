"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface TradeParams {
    userId: string;
    symbol: string;
    type: "BUY" | "SELL";
    quantity: number;
    price: number;
    totalCost: number;
    fees: number;
}

export async function executeStockTrade(params: TradeParams) {
    const { userId, symbol, type, quantity, price, totalCost, fees } = params;

    try {
        const supabase = await createServerClient();

        // 1. Record the transaction
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: userId,
            symbol,
            type,
            quantity,
            price_per_share: price,
            total_amount: totalCost,
            fees,
        });

        if (txError) {
            console.warn("Transaction record error:", txError.message);
            // We might want to throw here if we want strictly consistent records
        }

        // 2. Fetch current balance
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('cash_balance')
            .eq('id', userId)
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
            .eq('id', userId);

        if (updateError) throw new Error("Balance update failed");

        // 4. Revalidate cache for affected views
        revalidatePath("/dashboard", "page");
        revalidatePath("/dashboard/portfolio", "page");

        return { success: true, message: `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol}` };

    } catch (error: any) {
        console.error("Stock trade error:", error);
        return { success: false, message: error.message || "Trade execution failed" };
    }
}
