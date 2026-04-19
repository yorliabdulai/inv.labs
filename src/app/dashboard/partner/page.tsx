"use client";

import { useEffect, useState } from "react";
import { 
    Share2, 
    MousePointer2, 
    UserPlus, 
    CheckCircle2, 
    DollarSign, 
    Copy, 
    Check, 
    ExternalLink,
    AlertCircle,
    Loader2
} from "lucide-react";
import { getPartnerStats, type PartnerStats } from "@/app/actions/partner";
import { formatCurrency } from "@/lib/mutual-funds-data";
import { toast } from "sonner";

export default function PartnerDashboardPage() {
    const [stats, setStats] = useState<PartnerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        async function fetchStats() {
            const res = await getPartnerStats();
            if (res.success && res.stats) {
                setStats(res.stats);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const referralLink = stats ? `${appUrl}/?ref=${stats.referral_code}` : '';

    const copyToClipboard = async (text: string, type: 'link' | 'code') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'link') {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            } else {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            }
            toast.success(`${type === 'link' ? 'Link' : 'Code'} copied to clipboard!`);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading partner profile...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold font-syne">Partner Access Required</h1>
                    <p className="text-muted-foreground max-w-md">Your account is not currently registered as an active partner. If you believe this is an error, please contact the administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-bold font-syne tracking-tight text-foreground">
                            Partner Zone
                        </h1>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                            Active
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        Referral Program • <span className="text-primary font-bold">Growth Dashboard</span>
                    </p>
                </div>
            </div>

            {/* Quick Actions / Link Copy Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 via-card to-card border border-border rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary rotate-12 group-hover:rotate-0 transition-all duration-700">
                        <Share2 size={120} />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold font-syne mb-1 text-foreground">Your Referral Link</h3>
                            <p className="text-sm text-muted-foreground">Share this link with potential investors to start earning.</p>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-background/50 backdrop-blur-md border border-border rounded-2xl">
                            <div className="flex-1 px-4 py-2 text-sm font-mono text-muted-foreground truncate">
                                {referralLink}
                            </div>
                            <button 
                                onClick={() => copyToClipboard(referralLink, 'link')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                    copiedLink 
                                    ? "bg-emerald-500 text-white" 
                                    : "bg-primary text-white hover:opacity-90 active:scale-95"
                                }`}
                            >
                                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                                {copiedLink ? "Copied" : "Copy Link"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold font-syne mb-1 text-foreground">Partner Code</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Unique Identifier</p>
                    </div>

                    <div className="my-6">
                        <div className="text-4xl font-bold font-syne tracking-tighter text-primary">
                            {stats.referral_code}
                        </div>
                    </div>

                    <button 
                        onClick={() => copyToClipboard(stats.referral_code, 'code')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-foreground hover:bg-muted border border-border rounded-xl font-bold text-sm transition-all"
                    >
                        {copiedCode ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        {copiedCode ? "Copied Code" : "Copy Code"}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    label="Total Clicks" 
                    value={stats.clicks_count} 
                    icon={MousePointer2} 
                    color="blue"
                    description="People who clicked your link"
                />
                <StatsCard 
                    label="Registrations" 
                    value={stats.total_referrals} 
                    icon={UserPlus} 
                    color="purple"
                    description="Accounts created with your code"
                />
                <StatsCard 
                    label="Active Traders" 
                    value={stats.active_referrals} 
                    icon={CheckCircle2} 
                    color="emerald"
                    description="Users who made their first trade"
                />
                <StatsCard 
                    label="Attributed Revenue" 
                    value={formatCurrency(stats.revenue_attributed)} 
                    icon={DollarSign} 
                    color="blue"
                    description="Total value generated"
                />
            </div>

            {/* Program Details Section */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold font-syne">How it works</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                                <div>
                                    <p className="font-bold text-foreground">Share your Link</p>
                                    <p className="text-sm text-muted-foreground mt-1">Send your unique link to friends, family, or your community. We use cookies to track clicks for up to 30 days.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                                <div>
                                    <p className="font-bold text-foreground">User Registration</p>
                                    <p className="text-sm text-muted-foreground mt-1">When someone signs up using your link, they are automatically tagged as your referral in our system.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">3</div>
                                <div>
                                    <p className="font-bold text-foreground">Activation</p>
                                    <p className="text-sm text-muted-foreground mt-1">A referral becomes "Active" once they execute their first trade (Stocks or Mutual Funds) on the platform.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-8 border border-border flex flex-col justify-between">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">Partner Support</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Need custom creatives or have questions about your attributed revenue? Our partner support team is here to help you scale your reach.
                            </p>
                        </div>
                        
                        <div className="mt-8 space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/40 transition-all group">
                                <span className="text-sm font-semibold">Program FAQ</span>
                                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/40 transition-all group">
                                <span className="text-sm font-semibold">Contact Manager</span>
                                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon: Icon, color, description }: { label: string, value: string | number, icon: any, color: string, description: string }) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm group hover:border-primary/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorClasses[color] || colorClasses.blue}`}>
                <Icon size={24} />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                <h4 className="text-3xl font-bold font-syne tracking-tight text-foreground">{value}</h4>
                <p className="text-[10px] text-muted-foreground pt-2 group-hover:text-primary transition-colors">{description}</p>
            </div>
        </div>
    );
}
