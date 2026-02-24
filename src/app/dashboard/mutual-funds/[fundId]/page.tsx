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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-8 animate-in fade-in duration-700 font-instrument-sans text-[#F9F9F9]">
            <DashboardHeader />

            {/* ── Navigation Vector ── */}
            <button
                onClick={() => router.push("/dashboard/mutual-funds")}
                className="flex items-center gap-3 text-[#C05E42] hover:text-[#D16D4F] font-black text-[10px] uppercase tracking-[0.4em] transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Return_to_Catalog</span>
            </button>

            {/* ── Institutional Node Header ── */}
            <div className="relative overflow-hidden rounded-[2px] bg-[#121417] p-8 md:p-12 text-[#F9F9F9] border border-white/10 shadow-3xl group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C05E42]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-[#C05E42]/10" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-10">
                    <div className="flex-1 space-y-10">
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl flex-shrink-0 group-hover:border-[#C05E42]/40 transition-colors">
                                <PieChart size={32} className="text-[#C05E42]" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-3xl md:text-5xl font-black text-[#F9F9F9] tracking-tighter uppercase font-instrument-serif leading-tight">
                                        {fund.fund_name}
                                    </h1>
                                    <p className="text-white/30 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                                        MAN_BY: <span className="text-[#C05E42]">{fund.fund_manager}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="px-4 py-1.5 bg-white/5 text-[#C05E42] rounded-[1px] text-[9px] font-black uppercase tracking-widest border border-white/10">
                                        {fund.fund_type.toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-[1px] border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Risk_Profile</span>
                                            <span className="text-[10px] font-black text-[#C05E42] font-instrument-serif">{fund.risk_rating}/05</span>
                                        </div>
                                        <div className="h-[2px] w-24 bg-white/5 rounded-[1px] overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full flex-1 transition-all ${level <= fund.risk_rating
                                                        ? "bg-[#C05E42]"
                                                        : 'bg-white/5'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NAV Display Overlay */}
                        <div className="inline-flex flex-col space-y-2 p-8 bg-white/[0.02] border border-white/10 rounded-[2px] backdrop-blur-3xl shadow-2xl">
                            <div className="flex items-baseline gap-4">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Current_NAV:</span>
                                <span className="text-4xl md:text-6xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                                    {formatCurrency(fund.current_nav)}
                                </span>
                            </div>
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                Timestamped Analysis // {new Date(fund.updated_at).toLocaleDateString("en-GB", {
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
                            className="w-full py-6 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] text-[10px] uppercase tracking-[0.4em] hover:bg-[#D16D4F] transition-all shadow-2xl shadow-[#C05E42]/20 flex items-center justify-center gap-3 active:scale-95 group/btn"
                        >
                            <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                            Acquire_Units
                        </button>
                        {userHolding && userHolding.units_held > 0 && (
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="w-full py-6 bg-white/5 text-[#F9F9F9] font-black rounded-[2px] text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Wallet size={18} />
                                Liquefy_Units
                            </button>
                        )}
                    </div>
                </div>

                {/* Performance Analytics Bar */}
                {userHolding && userHolding.units_held > 0 && (
                    <div className="bg-[#10B981]/5 rounded-[2px] p-8 border border-[#10B981]/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                        <div className="flex flex-col space-y-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <Zap size={16} className="text-[#10B981]" />
                                <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.4em]">
                                    Portfolio_Position
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                <div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Units_Held</div>
                                    <div className="text-xl font-black text-[#F9F9F9] font-instrument-serif tabular-nums">
                                        {userHolding.units_held.toFixed(4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Market_Value</div>
                                    <div className="text-xl font-black text-[#F9F9F9] font-instrument-serif tabular-nums">
                                        {formatCurrency(userHolding.current_value || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Unrealized_P/L</div>
                                    <div className={`text-xl font-black font-instrument-serif tabular-nums ${(userHolding.gain || 0) >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                                        {(userHolding.gain || 0) >= 0 ? "+" : ""}{formatCurrency(userHolding.gain || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Node_Yield</div>
                                    <div className={`text-xl font-black font-instrument-serif tabular-nums ${(userHolding.gain_percent || 0) >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                                        {(userHolding.gain_percent || 0) >= 0 ? "+" : ""}{formatPercent(userHolding.gain_percent || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Intelligence Tabs ── */}
            <div className="bg-[#121417] rounded-[2px] border border-white/10 shadow-3xl overflow-hidden">
                <div className="border-b border-white/5 px-6 md:px-10">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: "overview", label: "Overview", icon: Info },
                            { id: "performance", label: "Performance", icon: BarChart3 },
                            { id: "holdings", label: "Top_Nodes", icon: PieChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 py-6 font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                    ? "border-[#C05E42] text-[#F9F9F9]"
                                    : "border-transparent text-white/20 hover:text-white/40"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Fund Objective */}
                            <div className="max-w-4xl space-y-6">
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em] flex items-center gap-4">
                                    <Target size={20} className="text-[#C05E42]" />
                                    Deployment_Objective
                                </h3>
                                <p className="text-white/40 text-lg font-medium leading-[1.8] uppercase tracking-wider">{fund.objective}</p>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 rounded-[2px] p-8 border border-white/5 group hover:border-[#C05E42]/20 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Calendar size={18} className="text-[#C05E42]" />
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                                            Launch_Date
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                                        {new Date(fund.inception_date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        }).toUpperCase()}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-[2px] p-8 border border-white/5 group hover:border-[#C05E42]/20 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <DollarSign size={18} className="text-[#C05E42]" />
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                                            Entry_Threshold
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                                        {formatCurrency(fund.minimum_investment)}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-[2px] p-8 border border-white/5 group hover:border-[#C05E42]/20 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield size={18} className="text-[#C05E42]" />
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                                            Risk_Intensity
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                                        {getRiskRatingLabel(fund.risk_rating).toUpperCase()} ({fund.risk_rating}/5)
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-[2px] p-8 border border-white/5 group hover:border-[#C05E42]/20 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp size={18} className="text-[#C05E42]" />
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                                            Expense_Ratio
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                                        {formatPercent(fund.expense_ratio, false)} <span className="text-xs uppercase tracking-widest text-white/20 font-instrument-sans">ANN_BIAS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fees Array */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em]">Node_Protocol_Fees</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-8">
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Ingress Fee</div>
                                        <div className="text-3xl font-black text-[#F9F9F9] font-instrument-serif">
                                            {formatPercent(fund.entry_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-8">
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Egress Fee</div>
                                        <div className="text-3xl font-black text-[#EF4444] font-instrument-serif">
                                            {formatPercent(fund.exit_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2px] p-8">
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Cooling_Period</div>
                                        <div className="text-3xl font-black text-[#C05E42] font-instrument-serif">
                                            {fund.minimum_holding_period} <span className="text-xs uppercase font-instrument-sans">Days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Allocation visualization */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em] flex items-center gap-4">
                                    <PieChart size={20} className="text-[#C05E42]" />
                                    Vector_Decomposition
                                </h3>
                                <div className="bg-white/5 rounded-[2px] p-10 border border-white/10 shadow-3xl">
                                    <AssetAllocationChart allocation={fund.asset_allocation} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Analytics Tab */}
                    {activeTab === "performance" && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* High-Contrast NAV Chart */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em]">Historical_Value_Projection</h3>
                                <div className="bg-white/5 rounded-[2px] p-8 border border-white/10 shadow-3xl">
                                    <MutualFundChart navHistory={navHistory} fundName={fund.fund_name} />
                                </div>
                            </div>

                            {/* Returns Array */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em]">Periodical_Alpha_Yield</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {performance.map((perf) => {
                                        const isPositive = perf.return_percent >= 0;
                                        return (
                                            <div
                                                key={perf.period}
                                                className={`rounded-[2px] p-6 border transition-all hover:scale-105 duration-300 ${isPositive
                                                    ? "bg-[#10B981]/5 border-[#10B981]/20 shadow-2xl shadow-[#10B981]/5"
                                                    : "bg-[#EF4444]/5 border-[#EF4444]/20 shadow-2xl shadow-[#EF4444]/5"
                                                    }`}
                                            >
                                                <div className={`text-[9px] font-black mb-3 uppercase tracking-widest ${isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                                                    {getPeriodLabel(perf.period).toUpperCase().replace(' ', '_')}
                                                </div>
                                                <div className={`text-3xl font-black font-instrument-serif tracking-tighter ${isPositive ? "text-[#F9F9F9]" : "text-[#EF4444]"}`}>
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
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em] mb-10">Top_Concentrated_Positions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fund.top_holdings.map((holding, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-6 bg-white/5 rounded-[2px] border border-white/10 hover:bg-white/[0.08] hover:border-[#C05E42]/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-[1px] bg-[#C05E42]/10 flex items-center justify-center border border-[#C05E42]/20 group-hover:bg-[#C05E42] transition-colors">
                                                    <span className="text-[10px] font-black text-[#C05E42] group-hover:text-[#F9F9F9]">#{index + 1}</span>
                                                </div>
                                                <span className="font-black text-[#F9F9F9] uppercase tracking-tight text-sm font-instrument-sans">{holding.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-[#C05E42] font-instrument-serif tracking-tighter">
                                                    {holding.weight.toFixed(2)}%
                                                </div>
                                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">WEIGHT</div>
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
