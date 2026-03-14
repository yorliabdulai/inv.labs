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
                className="flex items-center gap-2 text-zinc-400 hover:text-white font-semibold text-xs tracking-wider transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to All Funds</span>
            </button>

            {/* ── Main Fund Header ── */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 md:p-10 text-white border border-white/[0.06] shadow-2xl group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-all pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10 mb-8">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shadow-lg flex-shrink-0">
                                <PieChart size={32} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                        {fund.fund_name}
                                    </h1>
                                    <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
                                        Managed By: <span className="text-blue-400">{fund.fund_manager}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold tracking-wide border border-blue-500/20">
                                        {fund.fund_type}
                                    </span>
                                    <div className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Risk Level</span>
                                            <span className="text-xs font-bold text-blue-400 tabular-nums">{fund.risk_rating}/5</span>
                                        </div>
                                        <div className="h-1.5 w-20 bg-white/[0.04] rounded-full overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full flex-1 transition-all rounded-full ${level <= fund.risk_rating
                                                        ? "bg-blue-500"
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
                        <div className="inline-flex flex-col space-y-2 p-6 bg-white/[0.03] border border-white/[0.06] rounded-xl backdrop-blur-3xl shadow-lg">
                            <div className="flex items-baseline gap-4">
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Current NAV:</span>
                                <span className="text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight">
                                    {formatCurrency(fund.current_nav)}
                                </span>
                            </div>
                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                                Analysis Date // {new Date(fund.updated_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Trade Control Panel */}
                    <div className="flex flex-col gap-4 lg:w-72">
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-sm uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                            <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                            Invest in Fund
                        </button>
                        {userHolding && userHolding.units_held > 0 && (
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="w-full py-4 bg-white/[0.03] text-white font-bold rounded-xl text-sm uppercase tracking-wider hover:bg-white/[0.08] transition-all border border-white/[0.06] flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Wallet size={18} className="text-blue-400" />
                                Redeem Units
                            </button>
                        )}
                    </div>
                </div>

                {/* Performance Analytics Bar */}
                {userHolding && userHolding.units_held > 0 && (
                    <div className="bg-emerald-500/5 rounded-xl p-6 md:p-8 border border-emerald-500/20 shadow-lg relative overflow-hidden mt-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex flex-col space-y-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                                    Your Position
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div>
                                    <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest mb-1.5">Units Held</div>
                                    <div className="text-xl font-bold text-white tabular-nums">
                                        {userHolding.units_held.toFixed(4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest mb-1.5">Market Value</div>
                                    <div className="text-xl font-bold text-white tabular-nums">
                                        {formatCurrency(userHolding.current_value || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest mb-1.5">Unrealized P/L</div>
                                    <div className={`text-xl font-bold tabular-nums ${(userHolding.gain || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {(userHolding.gain || 0) >= 0 ? "+" : ""}{formatCurrency(userHolding.gain || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest mb-1.5">Yield</div>
                                    <div className={`text-xl font-bold tabular-nums ${(userHolding.gain_percent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {(userHolding.gain_percent || 0) >= 0 ? "+" : ""}{formatPercent(userHolding.gain_percent || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Intelligence Tabs ── */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden">
                <div className="border-b border-white/[0.06] px-6 md:px-10">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: "overview", label: "Overview", icon: Info },
                            { id: "performance", label: "Performance Series", icon: BarChart3 },
                            { id: "holdings", label: "Portfolio Composition", icon: PieChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 py-5 font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                    ? "border-blue-500 text-white"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
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
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Fund Objective */}
                            <div className="max-w-4xl space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                                    <Target size={18} className="text-blue-400" />
                                    Fund Objective
                                </h3>
                                <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed max-w-3xl">{fund.objective}</p>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] rounded-xl p-6 md:p-8 border border-white/[0.06] group hover:border-blue-500/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar size={16} className="text-blue-400" />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                            Launch Date
                                        </span>
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                        {new Date(fund.inception_date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] rounded-xl p-6 md:p-8 border border-white/[0.06] group hover:border-blue-500/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <DollarSign size={16} className="text-blue-400" />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                            Minimum Investment
                                        </span>
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold text-white tracking-tight tabular-nums">
                                        {formatCurrency(fund.minimum_investment)}
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] rounded-xl p-6 md:p-8 border border-white/[0.06] group hover:border-blue-500/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield size={16} className="text-blue-400" />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                            Risk Profile
                                        </span>
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">
                                        {getRiskRatingLabel(fund.risk_rating)} ({fund.risk_rating}/5)
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] rounded-xl p-6 md:p-8 border border-white/[0.06] group hover:border-blue-500/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp size={16} className="text-blue-400" />
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                            Expense Ratio
                                        </span>
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold text-white tracking-tight tabular-nums">
                                        {formatPercent(fund.expense_ratio, false)} <span className="text-sm text-zinc-500 font-medium">annual</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fees Array */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Fee Structure</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 md:p-8 shadow-sm">
                                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Entry Fee</div>
                                        <div className="text-2xl font-bold text-white tabular-nums">
                                            {formatPercent(fund.entry_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 md:p-8 shadow-sm">
                                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Exit Fee</div>
                                        <div className="text-2xl font-bold text-red-400 tabular-nums">
                                            {formatPercent(fund.exit_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 md:p-8 shadow-sm">
                                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Cooling Period</div>
                                        <div className="text-2xl font-bold text-blue-400 tabular-nums">
                                            {fund.minimum_holding_period} <span className="text-sm font-medium text-zinc-500 lowercase">days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Allocation visualization */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                                    <PieChart size={18} className="text-blue-400" />
                                    Asset Allocation
                                </h3>
                                <div className="bg-white/[0.02] rounded-2xl p-6 md:p-10 border border-white/[0.06] shadow-lg">
                                    <AssetAllocationChart allocation={fund.asset_allocation} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Analytics Tab */}
                    {activeTab === "performance" && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* High-Contrast NAV Chart */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Historical Performance</h3>
                                <div className="bg-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/[0.06] shadow-lg">
                                    <MutualFundChart navHistory={navHistory} fundName={fund.fund_name} />
                                </div>
                            </div>

                            {/* Returns Array */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Return Metrics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                    {performance.map((perf) => {
                                        const isPositive = perf.return_percent >= 0;
                                        return (
                                            <div
                                                key={perf.period}
                                                className={`rounded-xl p-5 md:p-6 border transition-all hover:scale-[1.02] duration-300 ${isPositive
                                                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-md shadow-emerald-500/5"
                                                    : "bg-red-500/5 border-red-500/20 shadow-md shadow-red-500/5"
                                                    }`}
                                            >
                                                <div className={`text-[10px] md:text-xs font-bold mb-2 uppercase tracking-widest ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                                    {getPeriodLabel(perf.period)}
                                                </div>
                                                <div className={`text-2xl md:text-3xl font-bold tabular-nums tracking-tight ${isPositive ? "text-white" : "text-red-400"}`}>
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
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Top Holdings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fund.top_holdings.map((holding, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-5 md:p-6 bg-white/[0.02] rounded-xl border border-white/[0.06] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-4 md:gap-6">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 transition-colors">
                                                    <span className="text-xs font-bold text-blue-400 group-hover:text-white">#{index + 1}</span>
                                                </div>
                                                <span className="font-bold text-white tracking-tight text-sm md:text-base">{holding.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl md:text-2xl font-bold text-blue-400 tabular-nums tracking-tight">
                                                    {holding.weight.toFixed(2)}%
                                                </div>
                                                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">Weight</div>
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
