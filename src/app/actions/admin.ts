"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if admin
    const { data } = await supabase.rpc('is_admin');
    return data === true;
}

export async function createPartner(formData: FormData) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const referralCode = formData.get("referral_code") as string;

    if (!name || !referralCode) return { success: false, error: "Name and Referral Code are required" };

    try {
        const supabase = await createClient();
        const { error } = await supabase.from('partners').insert({
            name,
            email,
            referral_code: referralCode,
            status: "active"
        });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/admin/partners");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Unknown error" };
    }
}

export async function addRevenue(referralId: string, additionalAmount: number) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    if (additionalAmount <= 0) return { success: false, error: "Amount must be greater than 0" };

    try {
        const supabase = await createClient();
        
        // Fetch current revenue
        const { data: ref } = await supabase.from('referrals').select('revenue_attributed').eq('id', referralId).single();
        if (!ref) return { success: false, error: "Referral not found" };

        const newAmount = (Number(ref.revenue_attributed) || 0) + additionalAmount;

        const { error } = await supabase.from('referrals').update({ revenue_attributed: newAmount }).eq('id', referralId);
        
        if (error) return { success: false, error: error.message };

        revalidatePath("/admin/partners");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Unknown error" };
    }
}
