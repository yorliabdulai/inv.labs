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

export async function getPartnerMonthlyReport(partnerId: string, month: number, year: number) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const supabase = await createClient();
        
        // 1. Fetch Partner info
        const { data: partner } = await supabase.from('partners').select('*').eq('id', partnerId).single();
        if (!partner) return { success: false, error: "Partner not found" };

        const rate = Number(partner.commission_rate) || 0.10;

        // 2. Fetch Referrals for this partner
        const { data: referrals } = await supabase
            .from('referrals')
            .select('*')
            .eq('partner_id', partnerId);

        if (!referrals) return { success: true, stats: { conversions: 0, revenue: 0, earnings: 0 } };

        // 3. Define Month Boundaries
        // ⚡ Bolt: Pre-calculate boundary timestamps to avoid repeated Object instantiations in O(n) loop
        const startDateTime = new Date(year, month - 1, 1).getTime();
        const endDateTime = new Date(year, month, 0, 23, 59, 59).getTime();

        let qualifyingCount = 0;
        let totalRevenue = 0;
        const thirtyDaysMs = 1000 * 3600 * 24 * 30;

        // 4. Calculate Qualifying Conversions in that month
        // A conversion qualifies if activation_date is in this month AND it happened within 30 days of registration
        for (const ref of referrals) {
            if (ref.activation_status && ref.activation_date) {
                // ⚡ Bolt: Use Date.parse to get numeric timestamps directly instead of full Date objects
                const actTime = Date.parse(ref.activation_date);
                
                // Is activation in the requested month?
                if (actTime >= startDateTime && actTime <= endDateTime) {
                    const regTime = Date.parse(ref.registration_date);

                    // Was it within 30 days of registration?
                    const diffMs = actTime - regTime;
                    
                    if (diffMs <= thirtyDaysMs) {
                        qualifyingCount++;
                        // Assume a flat revenue value of GH₵200 per activated trader for commission purpose
                        totalRevenue += 200; 
                    }
                }
            }
        }

        const stats = {
            partnerName: partner.name,
            month,
            year,
            conversions: qualifyingCount,
            revenue: totalRevenue,
            earnings: totalRevenue * rate,
            commissionRate: rate,
        };

        return { success: true, stats };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function publishMonthlyReport(partnerId: string, month: number, year: number, stats: any) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const supabase = await createClient();
        
        const { error } = await supabase.from('partner_earnings_reports').upsert({
            partner_id: partnerId,
            month,
            year,
            conversions_count: stats.conversions,
            total_revenue: stats.revenue,
            commission_earned: stats.earnings,
            status: 'published'
        }, {
            onConflict: 'partner_id, month, year'
        });

        if (error) throw error;

        revalidatePath("/admin/partners");
        revalidatePath("/dashboard/partner");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
