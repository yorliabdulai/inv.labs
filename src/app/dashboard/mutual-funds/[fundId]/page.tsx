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
        <div className="pb-20 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Back Button */}
            <button
                onClick={() => router.push("/dashboard/mutual-funds")}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
            >
                <ArrowLeft size={18} />
                <span>Back to Mutual Funds</span>
            </button>

            {/* Fund Header */}
            <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                    <div className="flex-1">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <PieChart size={24} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl md:text-4xl font-black text-[#1A1C4E] tracking-tight mb-2">
                                    {fund.fund_name}
                                </h1>
                                <p className="text-purple-600 font-medium text-sm md:text-base mb-3">
                                    Managed by {fund.fund_manager}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-${fundColor}-50 text-${fundColor}-700 border border-${fundColor}-200`}>
                                        {fund.fund_type}
                                    </span>
                                    <div className="flex flex-col gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 min-w-[140px]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Risk Profile</span>
                                            <span className="text-[10px] font-black text-gray-900">{fund.risk_rating}/5</span>
                                        </div>
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-full flex-1 transition-all ${level <= fund.risk_rating
                                                        ? `bg-${riskColor}-500`
                                                        : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NAV Display */}
                        <div className="bg-white/60 rounded-xl p-4 md:p-6 border border-white/50">
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-3xl md:text-5xl font-black text-gray-900">
                                    {formatCurrency(fund.current_nav)}
                                </span>
                                <span className="text-sm font-bold text-gray-500 uppercase">NAV</span>
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                                As of {new Date(fund.updated_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:w-64">
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="w-full px-6 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={18} />
                            Buy Units
                        </button>
                        {userHolding && userHolding.units_held > 0 && (
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="w-full px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                            >
                                <Wallet size={18} />
                                Redeem Units
                            </button>
                        )}
                    </div>
                </div>

                {/* User Holding (if exists) */}
                {userHolding && userHolding.units_held > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet size={16} className="text-emerald-600" />
                            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                                Your Holdings
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs font-bold text-emerald-600 mb-1">Units Held</div>
                                <div className="text-lg font-black text-emerald-900">
                                    {userHolding.units_held.toFixed(4)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-600 mb-1">Current Value</div>
                                <div className="text-lg font-black text-emerald-900">
                                    {formatCurrency(userHolding.current_value || 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-600 mb-1">Total Gain/Loss</div>
                                <div className={`text-lg font-black ${(userHolding.gain || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {formatCurrency(userHolding.gain || 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-600 mb-1">Return</div>
                                <div className={`text-lg font-black ${(userHolding.gain_percent || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {formatPercent(userHolding.gain_percent || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="glass-card bg-white border-gray-100">
                <div className="border-b border-gray-100 px-4 md:px-6">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {[
                            { id: "overview", label: "Overview", icon: Info },
                            { id: "performance", label: "Performance", icon: BarChart3 },
                            { id: "holdings", label: "Top Holdings", icon: PieChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-black text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 md:p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Fund Objective */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                                    <Target size={18} className="text-indigo-600" />
                                    Investment Objective
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{fund.objective}</p>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={16} className="text-gray-600" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                                            Inception Date
                                        </span>
                                    </div>
                                    <div className="text-lg font-black text-gray-900">
                                        {new Date(fund.inception_date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign size={16} className="text-gray-600" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                                            Minimum Investment
                                        </span>
                                    </div>
                                    <div className="text-lg font-black text-gray-900">
                                        {formatCurrency(fund.minimum_investment)}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={16} className="text-gray-600" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                                            Risk Rating
                                        </span>
                                    </div>
                                    <div className="text-lg font-black text-gray-900">
                                        {getRiskRatingLabel(fund.risk_rating)} ({fund.risk_rating}/5)
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={16} className="text-gray-600" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">
                                            Expense Ratio
                                        </span>
                                    </div>
                                    <div className="text-lg font-black text-gray-900">
                                        {formatPercent(fund.expense_ratio, false)} annually
                                    </div>
                                </div>
                            </div>

                            {/* Fees */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-3">Fees & Charges</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="text-xs font-bold text-blue-600 mb-1">Entry Fee</div>
                                        <div className="text-2xl font-black text-blue-900">
                                            {formatPercent(fund.entry_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                        <div className="text-xs font-bold text-red-600 mb-1">Exit Fee</div>
                                        <div className="text-2xl font-black text-red-900">
                                            {formatPercent(fund.exit_fee, false)}
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <div className="text-xs font-bold text-amber-600 mb-1">Min. Holding Period</div>
                                        <div className="text-2xl font-black text-amber-900">
                                            {fund.minimum_holding_period} days
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Allocation */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                                    <PieChart size={18} className="text-indigo-600" />
                                    Asset Allocation
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <AssetAllocationChart allocation={fund.asset_allocation} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === "performance" && (
                        <div className="space-y-6">
                            {/* NAV Chart */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-4">NAV History</h3>
                                <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
                                    <MutualFundChart navHistory={navHistory} fundName={fund.fund_name} />
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-4">Returns by Period</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {performance.map((perf) => {
                                        const isPositive = perf.return_percent >= 0;
                                        return (
                                            <div
                                                key={perf.period}
                                                className={`rounded-xl p-4 border ${isPositive
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : "bg-red-50 border-red-200"
                                                    }`}
                                            >
                                                <div className={`text-xs font-bold mb-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                                                    {getPeriodLabel(perf.period)}
                                                </div>
                                                <div className={`text-xl md:text-2xl font-black ${isPositive ? "text-emerald-900" : "text-red-900"}`}>
                                                    {formatPercent(perf.return_percent)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Holdings Tab */}
                    {activeTab === "holdings" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-4">Top 10 Holdings</h3>
                                <div className="space-y-2">
                                    {fund.top_holdings.map((holding, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-xs font-black text-indigo-600">#{index + 1}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{holding.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-indigo-600">
                                                    {holding.weight.toFixed(2)}%
                                                </div>
                                                <div className="text-xs font-medium text-gray-500">of portfolio</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
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
