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
    Filter, Zap, ShieldCheck, Wallet, ArrowUpRight, AlertCircle, LayoutGrid
} from "lucide-react";
import Link from "next/link";
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
    const [error, setError] = useState<string | null>(null);

    // Bolt Performance: Debounce search input to prevent expensive filtering on every keystroke
    const debouncedSearch = useDebounce(search, 300);

    const fetchData = async (showLoader = false, userId?: string) => {
        if (showLoader) setLoading(true);
        setError(null);
        try {
            // Parallel fetches with 8-second timeout
            const fetchPromise = Promise.all([
                getMutualFunds(),
                getAllMutualFundsPerformance(),
                getAllMutualFundsLatestNAV(),
                userId ? getUserMutualFundHoldings(userId) : Promise.resolve([])
            ]);

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout")), 8000)
            );

            const [fundsData, perfData, navData, userHoldings] = await Promise.race([
                fetchPromise,
                timeoutPromise
            ]) as any;

            setFunds(fundsData);
            setPerformance(perfData);
            setHoldings(userHoldings);

            // Map NAVs for quick lookup
            const navMap: Record<string, number> = {};
            navData.forEach((n: any) => {
                navMap[n.fund_id] = n.daily_change_percent;
            });
            setLatestNavs(navMap);

            if (user) {
                const { data: profile, error: profileErr } = await supabase
                    .from("profiles")
                    .select("cash_balance")
                    .eq("id", user.id)
                    .single();
                if (profile && !profileErr) setCashBalance(profile.cash_balance);
            }
        } catch (err: any) {
            console.error("Failed to load mutual funds data:", err);
            setError(err.message === "Timeout" 
                ? "Data request timed out. Please verify your connection." 
                : "Failed to establish a reliable connection to the market data provider.");
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
        const query = debouncedSearch.toLowerCase();
        return funds.filter((fund) => {
            const matchesSearch = query === "" ||
                fund.fund_name.toLowerCase().includes(query) ||
                fund.fund_manager.toLowerCase().includes(query);
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
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none font-syne uppercase">
                            Mutual Funds
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed max-w-2xl uppercase tracking-wider">
                            Explore professionally managed portfolios tailored for risk management and strong returns.
                        </p>
                    </div>

                    {/* Market Asset Toggle */}
                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border w-fit">
                        <Link 
                            href="/dashboard/market"
                            className="px-6 py-2 text-muted-foreground hover:text-foreground text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <LayoutGrid size={14} />
                            Stocks
                        </Link>
                        <button className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">
                            Mutual Funds
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 text-[10px] font-bold uppercase tracking-widest">
                            <Zap size={14} />
                            {funds.length} Available Funds
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-primary" />
                            SEC Regulated
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-card rounded-2xl p-8 border border-border shadow-premium relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all pointer-events-none" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Wallet size={16} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio Value</span>
                                </div>
                                <div className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                                    {formatCurrency(totalPortfolioValue)}
                                </div>
                            </div>

                            <div className="mt-8 space-y-6 pt-6 border-t border-border">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Active Positions</div>
                                        <div className="text-xl font-bold text-foreground tabular-nums">{holdings.length}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Asset Weight</div>
                                        <div className="text-xl font-bold tabular-nums text-primary">
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
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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
                                    className="group bg-card rounded-2xl p-6 md:p-8 border border-border hover:border-primary/30 transition-all cursor-pointer shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[240px]"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-all" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-muted/50 text-primary rounded-lg text-[10px] font-bold border border-border uppercase tracking-widest">
                                                {fund.fund_type.replace(' Fund', '')}
                                            </span>
                                            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-foreground text-xl tracking-tight group-hover:text-primary transition-colors font-syne uppercase">{fund.fund_name}</h4>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{fund.fund_manager}</div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-6 flex items-end justify-between border-t border-border pt-6">
                                        <div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">1Y Yield Spectrum</div>
                                            <div className="text-3xl font-bold text-emerald-500 tabular-nums tracking-tighter">
                                                +{fundPerformanceMap[fund.fund_id]?.oneYear?.toFixed(2)}%
                                            </div>
                                        </div>
                                        {isOwned && (
                                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-bold border border-primary/20 tracking-widest">
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
            <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-premium space-y-8 mx-4 md:mx-0">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by fund name or manager..."
                            aria-label="Search mutual funds"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-border rounded-xl text-foreground focus:bg-muted/50 focus:border-primary/50 outline-none transition-all text-sm font-bold placeholder:text-muted-foreground/50 uppercase tracking-widest shadow-inner shadow-black/5"
                        />
                    </div>
                    <button
                        onClick={() => fetchData(false)}
                        className="px-6 py-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-all group"
                        aria-label="Refresh Mutual Funds"
                    >
                        <RefreshCw size={18} className="text-muted-foreground group-hover:text-primary group-hover:rotate-180 transition-all duration-700" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Strategy Type</div>
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        {fundTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-6 py-2.5 rounded-lg text-[10px] font-bold transition-all border uppercase tracking-widest ${filterType === type
                                    ? "bg-primary border-transparent text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {type === "All" ? "All Strategies" : type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-8 border-t border-border">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 min-w-[120px]">Risk Intensity</div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        {[0, 1, 2, 3, 4, 5].map((risk) => (
                            <button
                                key={risk}
                                onClick={() => setFilterRisk(risk)}
                                className={`w-12 h-12 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all border uppercase tracking-widest ${filterRisk === risk
                                    ? "bg-primary border-transparent text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
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
                        <div key={i} className="bg-card rounded-2xl border border-border h-[400px] animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-card rounded-2xl border border-red-500/20 p-20 text-center mx-4 md:mx-0 shadow-premium">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight mb-4 uppercase font-syne">Data Access Failed</h3>
                    <p className="text-red-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto">{error}</p>
                    <button
                        onClick={() => fetchData(true, user?.id)}
                        className="px-10 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 text-[10px] uppercase tracking-widest active:scale-95"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : filteredFunds.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-20 text-center mx-4 md:mx-0 shadow-premium">
                    <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-8 border border-border">
                        <Filter size={32} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight mb-4 uppercase font-syne">No Tactical Match</h3>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto">Adjust yield parameters or discover new market vehicles.</p>
                    <button
                        onClick={() => { setSearch(""); setFilterType("All"); setFilterRisk(0); }}
                        className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest"
                    >
                        Reset Parameters
                    </button>
                </div>
            ) : (
                <div className="space-y-8 mx-4 md:mx-0">
                    <div className="px-2 flex items-center justify-between border-b border-border pb-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Active Inventory: {filteredFunds.length} Instrument{filteredFunds.length !== 1 ? 's' : ''}
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
