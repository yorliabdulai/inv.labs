"use server";

import { createClient } from "@/lib/supabase/server";

export interface PartnerStats {
    clicks_count: number;
    total_referrals: number;
    active_referrals: number;
    revenue_attributed: number;
    referral_code: string;
}

export async function getPartnerStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Fetch partner info
    const { data: partner, error: pError } = await supabase
        .from("partners")
        .select("*")
        .eq("email", user.email)
        .eq("status", "active")
        .single();

    if (pError || !partner) {
        return { success: false, error: "Partner not found" };
    }

    // Fetch referral stats
    const { data: referrals, error: rError } = await supabase
        .from("referrals")
        .select("activation_status, revenue_attributed")
        .eq("partner_id", partner.id);

    if (rError) {
        return { success: false, error: "Failed to fetch referrals" };
    }

    const stats: PartnerStats = {
        clicks_count: partner.clicks_count || 0,
        total_referrals: referrals.length,
        active_referrals: referrals.filter(r => r.activation_status).length,
        revenue_attributed: referrals.reduce((acc, r) => acc + (Number(r.revenue_attributed) || 0), 0),
        referral_code: partner.referral_code
    };

    return { success: true, stats };
}
