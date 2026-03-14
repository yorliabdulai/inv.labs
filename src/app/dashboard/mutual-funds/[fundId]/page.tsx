"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
    getMutualFund,
    getMutualFundNAVHistory,
    getMutualFundPerformance,
    getUserMutualFundHoldings,
} from "@/app/actions/mutual-funds";
import {
    type MutualFund,
    type MutualFundNAVHistory,
    type MutualFundPerformance,
    type UserMutualFundHolding,
    formatCurrency,
    formatPercent,
    getRiskRatingLabel,
    getRiskRatingColor,
    getFundTypeColor,
    getPeriodLabel,
} from "@/lib/mutual-funds-data";
import { MutualFundChart } from "@/components/mutual-funds/MutualFundChart";
import { AssetAllocationChart } from "@/components/mutual-funds/AssetAllocationChart";
import { BuyMutualFundModal } from "@/components/mutual-funds/BuyMutualFundModal";
import { RedeemMutualFundModal } from "@/components/mutual-funds/RedeemMutualFundModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Star,
    PieChart,
    BarChart3,
    Info,
    ShoppingCart,
    Wallet,
    Calendar,
    Target,
    Shield,
    DollarSign,
    RefreshCw,
    Zap,
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";

export default function MutualFundDetailPage() {
    const params = useParams();
    const router = useRouter();
    const fundId = params.fundId as string;
    const { user, profile: userProfile, loading: profileLoading } = useUserProfile();

    const [fund, setFund] = useState<MutualFund | null>(null);
    const [navHistory, setNavHistory] = useState<MutualFundNAVHistory[]>([]);
    const [performance, setPerformance] = useState<MutualFundPerformance[]>([]);
    const [userHolding, setUserHolding] = useState<UserMutualFundHolding | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "performance" | "holdings">("overview");
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [cashBalance, setCashBalance] = useState(10000);

    useEffect(() => {
        if (profileLoading) return;

        async function fetchData() {
            try {
                setLoading(true);

                if (user) {
                    // Get cash balance
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("cash_balance")
                        .eq("id", user.id)
                        .single();

                    if (profile) {
                        setCashBalance(profile.cash_balance);
                    }

                    // Get user holding
                    const holdings = await getUserMutualFundHoldings(user.id);
                    const holding = holdings.find((h) => h.fund_id === fundId);
                    if (holding) {
                        setUserHolding(holding);
                    }
                }

                // Get fund details
                const fundData = await getMutualFund(fundId);
                if (fundData) {
                    setFund(fundData);
                }

                // Get NAV history
                const navData = await getMutualFundNAVHistory(fundId, 365);
                setNavHistory(navData);

                // Get performance
                const perfData = await getMutualFundPerformance(fundId);
                setPerformance(perfData);
            } catch (err) {
                console.error("Failed to load fund details", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [fundId]);

    const refreshData = async () => {
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("cash_balance")
                .eq("id", user.id)
                .single();

            if (profile) {
                setCashBalance(profile.cash_balance);
            }

            const holdings = await getUserMutualFundHoldings(user.id);
            const holding = holdings.find((h) => h.fund_id === fundId);
            setUserHolding(holding || null);
        }
    };

    if (loading) {
        return (
            <div className="pb-20 space-y-4 md:space-y-8">
                <DashboardHeader />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                    <RefreshCw size={32} className="animate-spin mb-4 text-indigo-600" />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Fund Details...</p>
                </div>
            </div>
        );
    }

    if (!fund) {
        return (
            <div className="pb-20 space-y-4 md:space-y-8">
                <DashboardHeader />
                <div className="glass-card p-16 text-center">
                    <h3 className="text-lg font-black text-gray-800 mb-2">Fund Not Found</h3>
                    <p className="text-gray-500 mb-6">The requested mutual fund could not be found.</p>
                    <button
                        onClick={() => router.push("/dashboard/mutual-funds")}
                        className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        Back to Mutual Funds
                    </button>
                </div>
            </div>
        );
    }

    const fundColor = getFundTypeColor(fund.fund_type);
    const riskColor = getRiskRatingColor(fund.risk_rating);

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-8 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* ── Navigation Vector ── */}
            <button
                onClick={() => router.push("/dashboard/mutual-funds")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-[0.2em] transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Ecosystem</span>
            </button>

            {/* ── Main Fund Header ── */}
            <div className="relative overflow-hidden rounded-2xl bg-card p-6 md:p-12 text-foreground border border-border shadow-premium group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-all pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-10">
                    <div className="flex-1 space-y-10">
                        <div className="flex items-start gap-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-muted/50 border border-border flex items-center justify-center shadow-premium flex-shrink-0">
                                <PieChart size={40} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-5">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-none font-syne uppercase">
                                        {fund.fund_name}
                                    </h1>
                                    <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                                        Portfolio Manager: <span className="text-primary">{fund.fund_manager}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold tracking-[0.1em] border border-primary/20 uppercase">
                                        {fund.fund_type}
                                    </span>
                                    <div className="flex items-center gap-4 px-4 py-1.5 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Risk Intensity</span>
                                            <span className="text-[11px] font-bold text-primary tabular-nums tracking-widest">{fund.risk_rating}/5</span>
                                        </div>
                                        <div className="h-1.5 w-24 bg-muted border border-border rounded-full overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full flex-1 transition-all rounded-full ${level <= fund.risk_rating
                                                        ? "bg-primary"
                                                        : "bg-transparent"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NAV Display Overlay */}
                        <div className="inline-flex flex-col space-y-3 p-8 bg-muted/20 border border-border rounded-2xl backdrop-blur-3xl shadow-premium">
                            <div className="flex items-baseline gap-6">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Session NAV</span>
                                <span className="text-5xl md:text-7xl font-bold text-foreground tabular-nums tracking-tighter">
                                    {formatCurrency(fund.current_nav)}
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pt-2 border-t border-border/50">
                                Market Pulse // {new Date(fund.updated_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Trade Control Panel */}
                    <div className="flex flex-col gap-5 lg:w-80">
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="w-full py-5 bg-primary text-primary-foreground font-bold rounded-xl text-[11px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 group/btn"
                        >
                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                            Establish Position
                        </button>
                        {userHolding && userHolding.units_held > 0 && (
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="w-full py-5 bg-muted/30 text-foreground font-bold rounded-xl text-[11px] uppercase tracking-[0.2em] hover:bg-muted/50 transition-all border border-border flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Wallet size={20} className="text-primary" />
                                Liquidate Units
                            </button>
                        )}
                    </div>
                </div>

                {/* Performance Analytics Bar */}
                {userHolding && userHolding.units_held > 0 && (
                    <div className="bg-emerald-500/5 rounded-2xl p-8 md:p-10 border border-emerald-500/20 shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex flex-col space-y-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
                                    Strategic Position
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Units Held</div>
                                    <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                        {userHolding.units_held.toFixed(4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Market Value</div>
                                    <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                        {formatCurrency(userHolding.current_value || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Unrealized P/L</div>
                                    <div className={`text-2xl font-bold tabular-nums tracking-tight ${(userHolding.gain || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                        {(userHolding.gain || 0) >= 0 ? "+" : ""}{formatCurrency(userHolding.gain || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Yield</div>
                                    <div className={`text-2xl font-bold tabular-nums tracking-tight ${(userHolding.gain_percent || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                        {(userHolding.gain_percent || 0) >= 0 ? "+" : ""}{formatPercent(userHolding.gain_percent || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Intelligence Tabs ── */}
            <div className="bg-card rounded-2xl border border-border shadow-premium overflow-hidden">
                <div className="border-b border-border px-6 md:px-10 bg-muted/20">
                    <div className="flex gap-10 overflow-x-auto no-scrollbar">
                        {[
                            { id: "overview", label: "Overview", icon: Info },
                            { id: "performance", label: "Performance Series", icon: BarChart3 },
                            { id: "holdings", label: "Portfolio Composition", icon: PieChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 py-6 font-bold text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-10">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-16 animate-in fade-in duration-500">
                            {/* Fund Objective */}
                            <div className="max-w-4xl space-y-8">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Target size={18} className="text-primary" />
                                    Fund Objective
                                </h3>
                                <p className="text-foreground text-xl md:text-3xl font-bold leading-tight font-syne">{fund.objective}</p>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-muted/30 rounded-2xl p-8 md:p-10 border border-border group hover:border-primary/20 transition-all shadow-premium">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Calendar size={18} className="text-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Launch Date
                                        </span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight uppercase font-syne">
                                        {new Date(fund.inception_date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-2xl p-8 md:p-10 border border-border group hover:border-primary/20 transition-all shadow-premium">
                                    <div className="flex items-center gap-3 mb-4">
                                        <DollarSign size={18} className="text-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Initial Capital
                                        </span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight tabular-nums font-syne uppercase">
                                        {formatCurrency(fund.minimum_investment)}
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-2xl p-8 md:p-10 border border-border group hover:border-primary/20 transition-all shadow-premium">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield size={18} className="text-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Risk Rating
                                        </span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight uppercase font-syne">
                                        {getRiskRatingLabel(fund.risk_rating)} ({fund.risk_rating}/5)
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-2xl p-8 md:p-10 border border-border group hover:border-primary/20 transition-all shadow-premium">
                                    <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp size={18} className="text-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Expense Ratio
                                        </span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight tabular-nums uppercase font-syne px-1">
                                        {formatPercent(fund.expense_ratio, false)} <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest font-sans">Per Annum</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fees Array */}
                            <div className="space-y-10">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Fee Architecture</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-muted/20 border border-border rounded-2xl p-8 md:p-10 shadow-premium">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Entry Load</div>
                                        <div className="text-3xl font-bold text-foreground tabular-nums tracking-tighter">
                                            {formatPercent(fund.entry_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-muted/20 border border-border rounded-2xl p-8 md:p-10 shadow-premium">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Exit Load</div>
                                        <div className="text-3xl font-bold text-red-500 tabular-nums tracking-tighter">
                                            {formatPercent(fund.exit_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-muted/20 border border-border rounded-2xl p-8 md:p-10 shadow-premium">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Holding Lock</div>
                                        <div className="text-3xl font-bold text-primary tabular-nums tracking-tighter">
                                            {fund.minimum_holding_period} <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Allocation visualization */}
                            <div className="space-y-10">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                                    <PieChart size={18} className="text-primary" />
                                    Tactical Allocation
                                </h3>
                                <div className="bg-muted/10 rounded-2xl p-8 md:p-12 border border-border shadow-premium">
                                    <AssetAllocationChart allocation={fund.asset_allocation} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Analytics Tab */}
                    {activeTab === "performance" && (
                        <div className="space-y-16 animate-in fade-in duration-500">
                            {/* High-Contrast NAV Chart */}
                            <div className="space-y-10">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nav Projection Series</h3>
                                <div className="bg-muted/10 rounded-2xl p-8 md:p-12 border border-border shadow-premium">
                                    <MutualFundChart navHistory={navHistory} fundName={fund.fund_name} />
                                </div>
                            </div>

                            {/* Returns Array */}
                            <div className="space-y-10">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Historical Yield Metrics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                                    {performance.map((perf) => {
                                        const isPositive = perf.return_percent >= 0;
                                        return (
                                            <div
                                                key={perf.period}
                                                className={`rounded-2xl p-6 md:p-8 border transition-all hover:scale-[1.02] duration-300 shadow-premium ${isPositive
                                                    ? "bg-emerald-500/5 border-emerald-500/10"
                                                    : "bg-red-500/5 border-red-500/10"
                                                    }`}
                                            >
                                                <div className={`text-[10px] font-bold mb-4 uppercase tracking-[0.2em] ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                                    {getPeriodLabel(perf.period)}
                                                </div>
                                                <div className={`text-3xl md:text-4xl font-bold tabular-nums tracking-tighter ${isPositive ? "text-foreground" : "text-red-600"}`}>
                                                    {isPositive ? "+" : ""}{formatPercent(perf.return_percent)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Node Holdings Tab */}
                    {activeTab === "holdings" && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            <div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">Asset Concentration</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {fund.top_holdings.map((holding, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-6 md:p-8 bg-muted/20 rounded-2xl border border-border hover:border-primary/30 transition-all group shadow-premium"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-colors shadow-premium">
                                                    <span className="text-xs font-bold text-primary group-hover:text-primary-foreground tracking-widest">#{index + 1}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-bold text-foreground tracking-tight text-lg uppercase font-syne">{holding.name}</span>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Strategic Asset</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-primary tabular-nums tracking-tighter">
                                                    {holding.weight.toFixed(2)}%
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Weight</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Vector */}
            {showBuyModal && (
                <BuyMutualFundModal
                    fund={fund}
                    userId={user?.id || ""}
                    cashBalance={cashBalance}
                    isOpen={showBuyModal}
                    onClose={() => setShowBuyModal(false)}
                    onSuccess={refreshData}
                />
            )}

            {showRedeemModal && userHolding && (
                <RedeemMutualFundModal
                    fund={fund}
                    holding={userHolding}
                    userId={user?.id || ""}
                    isOpen={showRedeemModal}
                    onClose={() => setShowRedeemModal(false)}
                    onSuccess={refreshData}
                />
            )}
        </div>
    );
}
