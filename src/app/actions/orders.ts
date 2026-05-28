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
            throw new Error(`Failed to cancel order.`);
        }

        revalidatePath("/dashboard/portfolio", "page");
        return { success: true, message: "Order cancelled successfully." };

    } catch (error: any) {
        console.error("[cancelLimitOrder] Unhandled error:", error.message || error);
        return { success: false, message: "Failed to cancel order. Please try again." };
    }
}
