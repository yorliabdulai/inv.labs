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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-instrument-sans text-[#F9F9F9]">
            <DashboardHeader />

            {/* ── Page Header & Institutional Overview ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-instrument-serif leading-none">
                            Investment <span className="text-[#C05E42]">Funds.</span>
                        </h2>
                        <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest max-w-2xl">
                            Explore professionally managed portfolios tailored for institutional-grade risk management and alpha generation.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 text-[#C05E42] rounded-[1px] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Zap size={14} className="animate-pulse" />
                            {funds.length}_Available_Nodes
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 text-white/40 rounded-[1px] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck size={14} className="text-[#C05E42]" />
                            SEC_Regulated_Framework
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-[#121417] rounded-[2px] p-8 text-[#F9F9F9] border border-white/10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C05E42]/5 rounded-full blur-[80px] group-hover:bg-[#C05E42]/10 transition-all" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 text-[#C05E42] mb-2">
                                    <Wallet size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Asset_Intensity</span>
                                </div>
                                <div className="text-4xl font-black font-instrument-serif tracking-tighter">
                                    {formatCurrency(totalPortfolioValue)}
                                </div>
                            </div>

                            <div className="mt-8 space-y-6 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Active_Nodes</div>
                                        <div className="text-xl font-black font-instrument-serif">{holdings.length}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Node_Weight</div>
                                        <div className="text-xl font-black font-instrument-serif text-[#C05E42]">
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
                <section className="space-y-10">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.4em] flex items-center gap-4">
                            <TrendingUp size={18} className="text-[#C05E42]" />
                            Alpha_Leaders
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trendingFunds.map((fund) => {
                            const isOwned = holdings.some(h => h.fund_id === fund.fund_id);
                            return (
                                <div
                                    key={fund.fund_id}
                                    onClick={() => handleFundClick(fund.fund_id)}
                                    className="group bg-white/5 rounded-[2px] p-8 border border-white/10 hover:border-[#C05E42]/40 transition-all cursor-pointer shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-12 -mt-12 -z-0" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-white/5 text-[#C05E42] rounded-[1px] text-[9px] font-black uppercase tracking-widest border border-white/5">
                                                {fund.fund_type.replace(' Fund', '')}
                                            </span>
                                            <ArrowUpRight size={18} className="text-white/10 group-hover:text-[#C05E42] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-[#F9F9F9] text-xl leading-tight uppercase tracking-tighter font-instrument-sans group-hover:text-[#C05E42] transition-colors">{fund.fund_name}</h4>
                                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{fund.fund_manager}</div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-8 flex items-end justify-between border-t border-white/5 pt-6">
                                        <div>
                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">1Y_Cycle_Return</div>
                                            <div className="text-3xl font-black text-[#10B981] font-instrument-serif tracking-tighter">
                                                +{fundPerformanceMap[fund.fund_id]?.oneYear?.toFixed(2)}%
                                            </div>
                                        </div>
                                        {isOwned && (
                                            <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-[1px] text-[8px] font-black uppercase tracking-[0.2em] border border-[#10B981]/20">
                                                ACQUIRED
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
            <div className="bg-[#121417] rounded-[2px] p-8 border border-white/10 shadow-3xl space-y-10">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="relative flex-1 group">
                        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C05E42] transition-colors" />
                        <input
                            type="text"
                            placeholder="FILTER_BY_NODE_NAME_OR_ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-[2px] text-[#F9F9F9] focus:ring-1 focus:ring-[#C05E42]/30 focus:border-[#C05E42]/40 outline-none transition-all text-xs font-black uppercase tracking-widest placeholder:text-white/10"
                        />
                    </div>
                    <button
                        onClick={() => fetchData(false)}
                        className="px-6 py-5 bg-white/5 border border-white/10 rounded-[2px] hover:bg-white/10 transition-all group"
                    >
                        <RefreshCw size={20} className="text-white/20 group-hover:text-[#C05E42] group-hover:rotate-180 transition-all duration-700" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-2">Strategy_Domain</div>
                    <div className="flex flex-wrap items-center gap-3">
                        {fundTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-6 py-2.5 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all border ${filterType === type
                                    ? "bg-[#C05E42] border-[#C05E42] text-[#F9F9F9] shadow-2xl shadow-[#C05E42]/20"
                                    : "bg-white/5 border-white/10 text-white/30 hover:border-white/30 hover:text-[#F9F9F9]"
                                    }`}
                            >
                                {type === "All" ? "Global_Strategy" : type.toUpperCase().replace(' ', '_')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-8 pt-4 border-t border-white/5">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-2 min-w-[120px]">Risk_Intensity</div>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((risk) => (
                            <button
                                key={risk}
                                onClick={() => setFilterRisk(risk)}
                                className={`w-12 h-12 flex items-center justify-center rounded-[1px] text-[11px] font-black transition-all border uppercase ${filterRisk === risk
                                    ? "bg-[#C05E42] border-[#C05E42] text-[#F9F9F9]"
                                    : "bg-white/5 border-white/10 text-white/20 hover:border-[#C05E42]/30 hover:text-[#F9F9F9]"
                                    }`}
                            >
                                {risk === 0 ? "ALL" : risk}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Terminal Fund Array ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-[2px] border border-white/10 h-[320px] animate-pulse" />
                    ))}
                </div>
            ) : filteredFunds.length === 0 ? (
                <div className="bg-[#121417] rounded-[2px] border border-white/10 p-24 text-center shadow-3xl">
                    <div className="w-24 h-24 rounded-[2px] bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/10">
                        <Filter size={40} className="text-white/10" />
                    </div>
                    <h3 className="text-3xl font-black text-[#F9F9F9] uppercase tracking-tighter mb-4 font-instrument-serif">Zero_Nodes_Detected</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-12 max-w-sm mx-auto leading-loose">The requested parameters produced an empty result set. Adjust the filter array to resume scanning.</p>
                    <button
                        onClick={() => { setSearch(""); setFilterType("All"); setFilterRisk(0); }}
                        className="px-10 py-5 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] text-[10px] uppercase tracking-[0.4em] hover:bg-[#D16D4F] transition-all shadow-2xl active:scale-95"
                    >
                        Reset_Filter_Matrix
                    </button>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="px-2 flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                            Active_Node_Count: {filteredFunds.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
