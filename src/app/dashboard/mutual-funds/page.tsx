"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
    getMutualFunds,
    getAllMutualFundsPerformance,
    getAllMutualFundsLatestNAV,
    getUserMutualFundHoldings
} from "@/app/actions/mutual-funds";
import {
    type MutualFund,
    type MutualFundPerformance,
    type MutualFundNAVHistory,
    type UserMutualFundHolding,
    formatCurrency
} from "@/lib/mutual-funds-data";
import { MutualFundCard } from "@/components/mutual-funds/MutualFundCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
    Search, PieChart, TrendingUp, RefreshCw,
    Filter, Zap, ShieldCheck, Wallet, ArrowUpRight
} from "lucide-react";

export default function MutualFundsPage() {
    const router = useRouter();
    const [funds, setFunds] = useState<MutualFund[]>([]);
    const [performance, setPerformance] = useState<MutualFundPerformance[]>([]);
    const [latestNavs, setLatestNavs] = useState<Record<string, number>>({});
    const [holdings, setHoldings] = useState<UserMutualFundHolding[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterRisk, setFilterRisk] = useState(0);
    const [cashBalance, setCashBalance] = useState(0);

    const fetchData = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Parallel fetches
            const [fundsData, perfData, navData, userHoldings] = await Promise.all([
                getMutualFunds(),
                getAllMutualFundsPerformance(),
                getAllMutualFundsLatestNAV(),
                user ? getUserMutualFundHoldings(user.id) : Promise.resolve([])
            ]);

            setFunds(fundsData);
            setPerformance(perfData);
            setHoldings(userHoldings);

            // Map NAVs for quick lookup
            const navMap: Record<string, number> = {};
            navData.forEach(n => {
                navMap[n.fund_id] = n.daily_change_percent;
            });
            setLatestNavs(navMap);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("cash_balance")
                    .eq("id", user.id)
                    .single();
                if (profile) setCashBalance(profile.cash_balance);
            }
        } catch (err) {
            console.error("Failed to load mutual funds data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, []);

    // ─── Derived Data ─────────────────────────────────────────────────────────
    const fundTypes = useMemo(() => ["All", ...Array.from(new Set(funds.map((f) => f.fund_type)))], [funds]);

    const fundPerformanceMap = useMemo(() => {
        const map: Record<string, { ytd?: number; oneYear?: number }> = {};
        performance.forEach(p => {
            if (!map[p.fund_id]) map[p.fund_id] = {};
            if (p.period === "1_year") map[p.fund_id].oneYear = p.return_percent;
            if (p.period === "inception") map[p.fund_id].ytd = p.return_percent; // Fallback or inception
        });
        return map;
    }, [performance]);

    const filteredFunds = useMemo(() => {
        return funds.filter((fund) => {
            const matchesSearch =
                fund.fund_name.toLowerCase().includes(search.toLowerCase()) ||
                fund.fund_manager.toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === "All" || fund.fund_type === filterType;
            const matchesRisk = filterRisk === 0 || fund.risk_rating === filterRisk;
            return matchesSearch && matchesType && matchesRisk;
        });
    }, [funds, search, filterType, filterRisk]);

    const trendingFunds = useMemo(() => {
        return [...funds]
            .sort((a, b) => (fundPerformanceMap[b.fund_id]?.oneYear || 0) - (fundPerformanceMap[a.fund_id]?.oneYear || 0))
            .slice(0, 3);
    }, [funds, fundPerformanceMap]);

    const totalPortfolioValue = useMemo(() =>
        holdings.reduce((sum, h) => sum + (h.current_value || 0), 0)
        , [holdings]);

    const handleFundClick = (fundId: string) => {
        router.push(`/dashboard/mutual-funds/${fundId}`);
    };

    return (
        <div className="pb-24 space-y-6 md:space-y-8">
            <DashboardHeader />

            {/* ── Page Header & Stats ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#1A1C4E] tracking-tight">Investment Funds</h2>
                    <p className="text-gray-500 font-medium max-w-lg mt-2">
                        Explore professionally managed portfolios tailored to your risk appetite and financial goals.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                            <Zap size={14} className="text-emerald-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wide">{funds.length} Available Funds</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                            <ShieldCheck size={14} className="text-indigo-500" />
                            <span className="text-xs font-black uppercase tracking-wide">SEC Regulated</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-100 opacity-80 mb-1">
                                <Wallet size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Fund Holdings</span>
                            </div>
                            <div className="text-3xl font-black mb-4">
                                {formatCurrency(totalPortfolioValue)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Total Funds</div>
                                    <div className="text-lg font-black">{holdings.length}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-indigo-200 uppercase mb-1">Portfolio Weight</div>
                                    <div className="text-lg font-black">
                                        {totalPortfolioValue > 0 ? ((totalPortfolioValue / (totalPortfolioValue + cashBalance)) * 100).toFixed(1) : "0"}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Trending Section ─────────────────────────────────────────── */}
            {!loading && trendingFunds.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            Top Performing
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {trendingFunds.map((fund) => {
                            const isOwned = holdings.some(h => h.fund_id === fund.fund_id);
                            return (
                                <div
                                    key={fund.fund_id}
                                    onClick={() => handleFundClick(fund.fund_id)}
                                    className="group bg-white rounded-3xl p-5 border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8 -z-0" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                                                {fund.fund_type.replace(' Fund', '')}
                                            </span>
                                            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                        <h4 className="font-black text-[#1A1C4E] text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{fund.fund_name}</h4>
                                        <div className="text-xs font-bold text-gray-400">{fund.fund_manager}</div>
                                    </div>
                                    <div className="relative z-10 mt-4 flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">1Y Return</div>
                                            <div className="text-2xl font-black text-emerald-600">
                                                +{fundPerformanceMap[fund.fund_id]?.oneYear?.toFixed(2)}%
                                            </div>
                                        </div>
                                        {isOwned && (
                                            <div className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase border border-emerald-100">
                                                Owned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search funds, managers, categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchData(false)}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Category</div>
                    {fundTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === type
                                    ? "bg-[#1A1C4E] text-white shadow-lg shadow-indigo-100"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {type === "All" ? "All Strategies" : type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Risk Appetite</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((risk) => (
                            <button
                                key={risk}
                                onClick={() => setFilterRisk(risk)}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${filterRisk === risk
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-white border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                                    }`}
                            >
                                {risk === 0 ? "All" : risk}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Fund Grid ───────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-[32px] p-6 border border-gray-100 h-[280px] animate-pulse" />
                    ))}
                </div>
            ) : filteredFunds.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-gray-100 p-20 text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                        <Filter size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-[#1A1C4E] mb-2">No funds found</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">We couldn't find any funds matching your criteria. Try resetting filters.</p>
                    <button
                        onClick={() => { setSearch(""); setFilterType("All"); setFilterRisk(0); }}
                        className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="px-1 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing {filteredFunds.length} Funds
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFunds.map((fund) => (
                            <MutualFundCard
                                key={fund.fund_id}
                                fund={fund}
                                dailyChange={latestNavs[fund.fund_id]}
                                performance={fundPerformanceMap[fund.fund_id]}
                                isOwned={holdings.some(h => h.fund_id === fund.fund_id)}
                                onClick={() => handleFundClick(fund.fund_id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
