"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getMutualFunds, getMutualFundPerformance } from "@/app/actions/mutual-funds";
import { type MutualFund } from "@/lib/mutual-funds-data";
import { MutualFundCard } from "@/components/mutual-funds/MutualFundCard";
import { BuyMutualFundModal } from "@/components/mutual-funds/BuyMutualFundModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Search, SlidersHorizontal, PieChart, TrendingUp, RefreshCw, Filter, Star } from "lucide-react";

export default function MutualFundsPage() {
    const router = useRouter();
    const [funds, setFunds] = useState<MutualFund[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterRisk, setFilterRisk] = useState(0);
    const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [cashBalance, setCashBalance] = useState(10000);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Get user
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);

                    // Get cash balance
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("cash_balance")
                        .eq("id", user.id)
                        .single();

                    if (profile) {
                        setCashBalance(profile.cash_balance);
                    }
                }

                // Get mutual funds
                const fundsData = await getMutualFunds();
                setFunds(fundsData);
            } catch (err) {
                console.error("Failed to load mutual funds", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredFunds = funds.filter((fund) => {
        const matchesSearch =
            fund.fund_name.toLowerCase().includes(search.toLowerCase()) ||
            fund.fund_manager.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "All" || fund.fund_type === filterType;
        const matchesRisk = filterRisk === 0 || fund.risk_rating === filterRisk;
        return matchesSearch && matchesType && matchesRisk;
    });

    const fundTypes = ["All", ...Array.from(new Set(funds.map((f) => f.fund_type)))];

    const handleFundClick = (fund: MutualFund) => {
        router.push(`/dashboard/mutual-funds/${fund.fund_id}`);
    };

    return (
        <div className="pb-20 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Header Section */}
            <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-100 flex-shrink-0">
                            <PieChart size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl font-black text-[#1A1C4E] tracking-tight">
                                Mutual Funds
                            </h1>
                            <p className="text-purple-600 font-medium text-sm md:text-base">
                                Diversified investment opportunities
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 min-h-[44px]">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs md:text-sm font-bold">{funds.length} Funds Available</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <TrendingUp size={14} className="text-purple-600" />
                            <span className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-wider">
                                Avg Return
                            </span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2 text-emerald-600">
                            +12.4%
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                            1-Year Average
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <PieChart size={14} className="text-indigo-600" />
                            <span className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-wider">
                                Fund Types
                            </span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">4</div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Categories
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Star size={14} className="text-amber-600" />
                            <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-wider">
                                Top Rated
                            </span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">
                            {funds.filter((f) => f.risk_rating >= 4).length}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                            High Growth
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Filter size={14} className="text-emerald-600" />
                            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-wider">
                                Low Risk
                            </span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">
                            {funds.filter((f) => f.risk_rating <= 2).length}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Conservative
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-white to-slate-50 border-slate-200">
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Search Bar */}
                    <div className="relative w-full group">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10"
                        />
                        <input
                            type="text"
                            placeholder="Search fund name or manager..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-400 transition-all text-base md:text-sm font-medium placeholder:text-gray-400 touch-manipulation"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Fund Type Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1 no-scrollbar touch-manipulation">
                            {fundTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border min-h-[44px] touch-manipulation active:scale-95 ${filterType === type
                                        ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                                        }`}
                                >
                                    {type === "All" ? "All Funds" : type.replace(" Fund", "")}
                                </button>
                            ))}
                        </div>

                        {/* Risk Rating Filter */}
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
                            {[0, 1, 2, 3, 4, 5].map((risk) => (
                                <button
                                    key={risk}
                                    onClick={() => setFilterRisk(risk)}
                                    className={`px-3 py-2 rounded-lg transition-all min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 ${filterRisk === risk
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    title={risk === 0 ? "All Risk Levels" : `Risk ${risk}`}
                                >
                                    {risk === 0 ? <Filter size={16} /> : <Star size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(search || filterType !== "All" || filterRisk !== 0) && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Active Filters:
                            </span>
                            {search && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                    Search: "{search}"
                                    <button onClick={() => setSearch("")} className="ml-1 hover:text-purple-900">
                                        ×
                                    </button>
                                </span>
                            )}
                            {filterType !== "All" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    Type: {filterType}
                                    <button onClick={() => setFilterType("All")} className="ml-1 hover:text-emerald-900">
                                        ×
                                    </button>
                                </span>
                            )}
                            {filterRisk !== 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    Risk: {filterRisk}
                                    <button onClick={() => setFilterRisk(0)} className="ml-1 hover:text-amber-900">
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Funds Grid */}
                {loading ? (
                    <div className="glass-card p-16 text-center mt-6">
                        <div className="max-w-md mx-auto">
                            <RefreshCw size={48} className="animate-spin text-purple-500 mx-auto mb-6" />
                            <h3 className="text-lg font-black text-gray-800 mb-2">Loading Mutual Funds</h3>
                            <p className="text-gray-500">Fetching available investment opportunities...</p>
                        </div>
                    </div>
                ) : filteredFunds.length === 0 ? (
                    <div className="glass-card p-16 text-center mt-6">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 mb-2">No Funds Found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setFilterType("All");
                                    setFilterRisk(0);
                                }}
                                className="px-6 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 mt-6">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                            <span>
                                Showing {filteredFunds.length} of {funds.length} funds
                            </span>
                        </div>

                        {/* Funds Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                            {filteredFunds.map((fund) => (
                                <MutualFundCard
                                    key={fund.fund_id}
                                    fund={fund}
                                    onClick={() => handleFundClick(fund)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Buy Modal */}
            {selectedFund && (
                <BuyMutualFundModal
                    fund={selectedFund}
                    userId={userId}
                    cashBalance={cashBalance}
                    isOpen={showBuyModal}
                    onClose={() => {
                        setShowBuyModal(false);
                        setSelectedFund(null);
                    }}
                    onSuccess={() => {
                        // Refresh cash balance
                        supabase.auth.getUser().then(({ data: { user } }) => {
                            if (user) {
                                supabase
                                    .from("profiles")
                                    .select("cash_balance")
                                    .eq("id", user.id)
                                    .single()
                                    .then(({ data }) => {
                                        if (data) setCashBalance(data.cash_balance);
                                    });
                            }
                        });
                    }}
                />
            )}
        </div>
    );
}
