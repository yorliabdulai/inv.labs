import { createClient } from "@/lib/supabase/server";
import { CreatePartnerForm, AddRevenueForm } from "./components";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
    const supabase = await createClient();
    
    // Fetch all partners and their referrals
    const { data: partners } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    const { data: referrals } = await supabase.from('referrals').select('id, partner_id, activation_status, revenue_attributed');

    const refs = referrals || [];
    
    return (
        <div className="max-w-[1440px] mx-auto p-6 md:p-12 mb-12 animate-in fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-syne tracking-tight">Partner Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create and track referral partners for your ecosystem.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms Section */}
                <div className="space-y-6 lg:col-span-1">
                    <CreatePartnerForm />
                    
                    <div className="p-4 bg-muted/50 border border-border rounded-xl">
                        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                            Adding revenue to a partner dynamically attributes real-world or subscription revenue back to the referral pipeline. 
                            It applies to their oldest tracked referral to correctly reflect total lifetime value.
                        </p>
                    </div>
                </div>

                {/* Partners List */}
                <div className="lg:col-span-2 space-y-4">
                    {partners?.length === 0 && (
                        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                            No partners found. Create your first partner to get started.
                        </div>
                    )}
                    
                    {partners?.map(partner => {
                        const partnerRefs = refs.filter((r: any) => r.partner_id === partner.id);
                        const registered = partnerRefs.length;
                        const activated = partnerRefs.filter((r: any) => r.activation_status).length;
                        const revenue = partnerRefs.reduce((acc: number, r: any) => acc + (Number(r.revenue_attributed) || 0), 0);

                        return (
                            <div key={partner.id} className="p-6 bg-card border border-border rounded-2xl shadow-sm text-foreground">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg font-syne">{partner.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold tracking-wider">CODE: {partner.referral_code}</span>
                                            <span className="text-xs text-muted-foreground font-semibold">{partner.email}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-2 rounded-full">{partner.status}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 bg-muted/30 p-2 rounded-xl border border-border/50">
                                        <AddRevenueForm partnerId={partner.id} referralId={partnerRefs[0]?.id || null} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Link Clicks</p>
                                        <p className="text-xl font-syne font-bold">{partner.clicks_count}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Registered</p>
                                        <p className="text-xl font-syne font-bold">{registered}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 bg-emerald-500/5 border-emerald-500/10">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Activated Traders</p>
                                        <p className="text-xl font-syne font-bold text-emerald-600">{activated}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 bg-amber-500/5 border-amber-500/10">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Total Revenue</p>
                                        <p className="text-xl font-syne font-bold text-amber-600 tabular-nums">GH₵{revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
