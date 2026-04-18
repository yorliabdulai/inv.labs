import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, MousePointerClick, Zap, PiggyBank, Percent, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Attempt to find partner record by email
    const { data: partner } = await supabase
        .from("partners")
        .select("*")
        .eq("email", user.email)
        .single();

    if (!partner) {
        // Handle case where user is not a partner
        return (
            <div className="max-w-[1440px] mx-auto min-h-screen p-8 text-center flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold font-syne mb-2 text-foreground">Access Denied</h1>
                <p className="text-muted-foreground mb-6">Your account is not linked to an active partner profile.</p>
                <Link href="/dashboard" className="px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:opacity-90 flex items-center gap-2">
                    <ArrowLeft size={16} /> Return to Dashboard
                </Link>
            </div>
        );
    }

    // Fetch referral stats
    const { data: referrals } = await supabase
        .from("referrals")
        .select("*")
        .eq("partner_id", partner.id);

    const refs = referrals || [];
    const clicks = partner.clicks_count || 0;
    const registered = refs.length;
    const activated = refs.filter((r: any) => r.activation_status).length;
    const activationRate = registered > 0 ? (activated / registered) * 100 : 0;
    const revenue = refs.reduce((acc: number, r: any) => acc + (Number(r.revenue_attributed) || 0), 0);

    return (
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 text-foreground pb-12 mt-10">
            
            <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-8">
                <ArrowLeft size={16} /> Back to main app
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-bold font-syne tracking-tight text-foreground">
                            Partner Dashboard
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        Welcome, {partner.name}
                    </p>
                </div>
            </div>

            <div className="p-5 bg-card/50 border border-border rounded-xl mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-foreground mb-1">Your Unique Referral Link</p>
                        <p className="text-xs text-muted-foreground">Share this link to automatically track clicks, registrations, and active traders.</p>
                    </div>
                    <div className="bg-muted px-4 py-3 rounded-lg border border-border flex items-center gap-4">
                        <span className="font-mono text-sm font-semibold text-foreground break-all">
                            https://investmentsimulator.com/?ref={partner.referral_code}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-4">
                
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-500">
                        <MousePointerClick size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <MousePointerClick size={20} />
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Clicks</h3>
                    </div>
                    <p className="text-4xl font-bold font-syne tabular-nums text-foreground">{clicks}</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-indigo-500">
                        <Users size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Registered</h3>
                    </div>
                    <p className="text-4xl font-bold font-syne tabular-nums text-foreground">{registered}</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-emerald-500">
                        <Zap size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Activated</h3>
                    </div>
                    <p className="text-4xl font-bold font-syne tabular-nums text-foreground">{activated}</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-purple-500">
                        <Percent size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                            <Percent size={20} />
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Conversion</h3>
                    </div>
                    <p className="text-4xl font-bold font-syne tabular-nums text-foreground">{activationRate.toFixed(1)}%</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-amber-500">
                        <PiggyBank size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <PiggyBank size={20} />
                        </div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Revenue</h3>
                    </div>
                    <p className="text-4xl font-bold font-syne tabular-nums text-foreground">GH₵{revenue.toFixed(2)}</p>
                </div>

            </div>
        </div>
    );
}
