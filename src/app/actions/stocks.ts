"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStock } from "@/lib/market-data";

export async function executeStockTrade(symbol: string, type: "BUY" | "SELL", quantity: number) {
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

        // Calculate fees server-side (replicating client logic)
        const brokerFee = subtotal * 0.015;
        const secLevy = subtotal * 0.004;
        const gseLevy = subtotal * 0.0014;
        const vat = brokerFee * 0.15;
        const fees = brokerFee + secLevy + gseLevy + vat;

        const totalCost = type === "BUY" ? subtotal + fees : subtotal - fees;

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
            // We might want to throw here if we want strictly consistent records
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
        return { success: false, message: error.message || "Trade execution failed" };
    }
}
