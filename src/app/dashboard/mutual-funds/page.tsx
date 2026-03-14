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
import { useUserProfile } from "@/lib/useUserProfile";
import { useDebounce } from "@/hooks/use-debounce";

export default function MutualFundsPage() {
    const router = useRouter();
    const { user, profile: userProfile, loading: profileLoading } = useUserProfile();
    const [funds, setFunds] = useState<MutualFund[]>([]);
    const [performance, setPerformance] = useState<MutualFundPerformance[]>([]);
    const [latestNavs, setLatestNavs] = useState<Record<string, number>>({});
    const [holdings, setHoldings] = useState<UserMutualFundHolding[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterRisk, setFilterRisk] = useState(0);
    const [cashBalance, setCashBalance] = useState(0);

    // Bolt Performance: Debounce search input to prevent expensive filtering on every keystroke
    const debouncedSearch = useDebounce(search, 300);

    const fetchData = async (showLoader = false, userId?: string) => {
        if (showLoader) setLoading(true);
        try {
            // Parallel fetches
            const [fundsData, perfData, navData, userHoldings] = await Promise.all([
                getMutualFunds(),
                getAllMutualFundsPerformance(),
                getAllMutualFundsLatestNAV(),
                userId ? getUserMutualFundHoldings(userId) : Promise.resolve([])
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
        if (profileLoading) return;
        fetchData(true, user?.id);
    }, [user, profileLoading]);

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
                fund.fund_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                fund.fund_manager.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesType = filterType === "All" || fund.fund_type === filterType;
            const matchesRisk = filterRisk === 0 || fund.risk_rating === filterRisk;
            return matchesSearch && matchesType && matchesRisk;
        });
    }, [funds, debouncedSearch, filterType, filterRisk]);

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* ── Page Header & Institutional Overview ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
                            Mutual Funds
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                            Explore professionally managed portfolios tailored for risk management and strong returns.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 text-xs font-semibold">
                            <Zap size={14} />
                            {funds.length} Available Funds
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] text-zinc-400 rounded-lg border border-white/[0.06] text-xs font-semibold">
                            <ShieldCheck size={14} className="text-zinc-500" />
                            SEC Regulated
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white/[0.02] rounded-2xl p-8 border border-white/[0.06] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Wallet size={16} className="text-blue-400" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Portfolio Value</span>
                                </div>
                                <div className="text-4xl font-bold tracking-tight text-white tabular-nums">
                                    {formatCurrency(totalPortfolioValue)}
                                </div>
                            </div>

                            <div className="mt-8 space-y-6 pt-6 border-t border-white/[0.06]">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Active Positions</div>
                                        <div className="text-xl font-bold text-white tabular-nums">{holdings.length}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Asset Weight</div>
                                        <div className="text-xl font-bold tabular-nums text-blue-400">
                                            {totalPortfolioValue > 0 ? ((totalPortfolioValue / (totalPortfolioValue + cashBalance)) * 100).toFixed(1) : "0"}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── High-Velocity Performance ── */}
            {!loading && trendingFunds.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-400" />
                            Top Performers
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingFunds.map((fund) => {
                            const isOwned = holdings.some(h => h.fund_id === fund.fund_id);
                            return (
                                <div
                                    key={fund.fund_id}
                                    onClick={() => handleFundClick(fund.fund_id)}
                                    className="group bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-12 -mt-12 pointer-events-none" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-white/[0.03] text-blue-400 rounded-lg text-xs font-semibold border border-white/[0.06]">
                                                {fund.fund_type.replace(' Fund', '')}
                                            </span>
                                            <ArrowUpRight size={18} className="text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{fund.fund_name}</h4>
                                            <div className="text-xs font-medium text-zinc-500">{fund.fund_manager}</div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-6 flex items-end justify-between border-t border-white/[0.06] pt-5">
                                        <div>
                                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">1Y Return</div>
                                            <div className="text-2xl font-bold text-emerald-400 tabular-nums tracking-tight">
                                                +{fundPerformanceMap[fund.fund_id]?.oneYear?.toFixed(2)}%
                                            </div>
                                        </div>
                                        {isOwned && (
                                            <div className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-semibold border border-blue-500/20">
                                                OWNED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Intelligence Filter Array ── */}
            <div className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.06] shadow-2xl space-y-8 mx-4 md:mx-0">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by fund name or manager..."
                            aria-label="Search mutual funds"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:bg-white/[0.05] focus:border-blue-500/50 outline-none transition-all text-sm font-medium placeholder:text-zinc-600"
                        />
                    </div>
                    <button
                        onClick={() => fetchData(false)}
                        className="px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-all group"
                        aria-label="Refresh Mutual Funds"
                    >
                        <RefreshCw size={18} className="text-zinc-500 group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">Strategy Type</div>
                    <div className="flex flex-wrap items-center gap-2">
                        {fundTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all border ${filterType === type
                                    ? "bg-blue-600 border-transparent text-white shadow-sm shadow-blue-500/20"
                                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                            >
                                {type === "All" ? "All Strategies" : type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-white/[0.04]">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1 min-w-[120px]">Risk Level</div>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((risk) => (
                            <button
                                key={risk}
                                onClick={() => setFilterRisk(risk)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all border ${filterRisk === risk
                                    ? "bg-blue-600 border-transparent text-white shadow-sm"
                                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                                    }`}
                            >
                                {risk === 0 ? "All" : risk}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Terminal Fund Array ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4 md:mx-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-2xl border border-white/[0.05] h-[320px] animate-pulse" />
                    ))}
                </div>
            ) : filteredFunds.length === 0 ? (
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-16 text-center mx-4 md:mx-0">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-6 border border-white/[0.05]">
                        <Filter size={32} className="text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-2">No Funds Found</h3>
                    <p className="text-zinc-500 text-sm font-medium mb-8 max-w-sm mx-auto">Try adjusting your search criteria or removing filters to view more mutual funds.</p>
                    <button
                        onClick={() => { setSearch(""); setFilterType("All"); setFilterRisk(0); }}
                        className="px-8 py-3 bg-white/[0.03] text-white font-semibold rounded-xl hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-6 mx-4 md:mx-0">
                    <div className="px-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-500">
                            Showing {filteredFunds.length} funds
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
