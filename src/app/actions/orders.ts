"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelLimitOrder(orderId: string) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Authentication required");
        }

        const { error } = await supabase
            .from('transactions')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('user_id', user.id)
            .eq('status', 'pending');

        if (error) {
            console.error("[cancelLimitOrder] error:", error.message);
            return { success: false, message: "Failed to cancel order. Please try again." };
        }

        revalidatePath("/dashboard/portfolio", "page");
        return { success: true, message: "Order cancelled successfully." };

    } catch (error: unknown) {
        return { success: false, message: "Failed to cancel order. Please try again." };
    }
}
