"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Award, Trophy, Medal, ArrowUp, Crown, TrendingUp, TrendingDown,
    Minus, Filter, BarChart3, Activity, Zap, Shield, Search,
    ArrowUpRight, ArrowDownRight, Info, RefreshCcw, Users,
    ChevronLeft, ChevronRight, Share2
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getMarketRankings, type RankedAsset, type RankingCategory } from "@/app/actions/leaderboard";
import { getTopUsers } from "@/app/actions/gamification";
import { useUserProfile } from "@/lib/useUserProfile";
import { useDebounce } from "@/hooks/use-debounce";

export default function LeaderboardPage() {
    const [viewMode, setViewMode] = useState<"market" | "users">("market");
    const [category, setCategory] = useState<RankingCategory>("gainers");
    const [rankings, setRankings] = useState<RankedAsset[]>([]);
    const [userRankings, setUserRankings] = useState<any[]>([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { partnerCode } = useUserProfile();

    // Bolt Performance: Debounce search input to avoid expensive list filtering operations
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    async function loadRankings(isRefresh = false, page = userPage) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (viewMode === "market") {
                const data = await getMarketRankings(category);
                setRankings(data);
            } else {
                const result = await getTopUsers(page, PAGE_SIZE);

                // Client-side rank change detection using localStorage snapshot
                const SNAPSHOT_KEY = "inv_leaderboard_rank_snapshot";
                let prevSnapshot: Record<string, number> = {};
                try {
                    prevSnapshot = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "{}");
                } catch {}

                const annotated = result.users.map((user: any) => {
                    const prevRank = prevSnapshot[user.id];
                    let rankChange: 'up' | 'down' | 'same' = 'same';
                    if (prevRank !== undefined) {
                        if (user.globalRank < prevRank) rankChange = 'up';
                        else if (user.globalRank > prevRank) rankChange = 'down';
                    }
                    return { ...user, rankChange };
                });

                // Save new snapshot (merge with existing pages so other pages aren't lost)
                const newSnapshot = { ...prevSnapshot };
                annotated.forEach((u: any) => { newSnapshot[u.id] = u.globalRank; });
                localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(newSnapshot));

                setUserRankings(annotated);
                setUserTotal(result.total);
                setUserPage(result.page);
                setUserTotalPages(result.totalPages);
            }
        } catch (err) {
            console.error("Failed to load rankings", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        setUserPage(1); // reset page when switching mode/category
        loadRankings(false, 1);
    }, [category, viewMode]);

    const filteredRankings = useMemo(() => {
        if (viewMode === "users") {
            return userRankings.filter(u =>
                (u.full_name || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
        }
        return rankings.filter(r =>
            r.symbol.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            r.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    }, [rankings, userRankings, debouncedSearchQuery, viewMode]);

    const handleUserPageChange = (newPage: number) => {
        if (newPage < 1 || newPage > userTotalPages) return;
        setUserPage(newPage);
        loadRankings(false, newPage);
    };

    const handleShareLeaderboard = async () => {
        const referralLink = `${window.location.origin}/register${partnerCode ? `?ref=${partnerCode}` : ""}`;
        const message = `The competition on InvLab is heating up! 📈 Check out this week's top traders building wealth on the GSE Investment Simulator. 🇬🇭 Join our community and see if you can make the top 10! \n\n🚀 Join here: ${referralLink}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "InvLab Leaderboard",
                    text: message,
                    url: referralLink,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
        }
    };

    const categories: { key: RankingCategory; label: string; icon: any; description: string }[] = [
        { key: 'gainers', label: 'Top Gainers', icon: TrendingUp, description: 'Highest price appreciation.' },
        { key: 'momentum', label: 'Momentum', icon: Zap, description: 'High-speed movers based on price/volume velocity.' },
        { key: 'stability', label: 'Stability', icon: Shield, description: 'Consistent low-volatility performers.' },
        { key: 'volume', label: 'Volume', icon: Activity, description: 'Most actively traded symbols by liquidity.' },
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-sans">
            <DashboardHeader />

            {/* ── Header / Banner ── */}
            <div className="relative rounded-2xl p-8 md:p-16 bg-card text-foreground border border-border shadow-premium overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-muted/30 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                            <Activity size={12} /> Global Rankings
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-syne text-foreground">Platform Leaderboards</h1>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest max-w-lg leading-relaxed">
                            Assess top performing assets in the market and benchmark your performance and accreditation XP against top traders in the network.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={handleShareLeaderboard}
                            className="group flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                        >
                            <Share2 size={16} className="transition-transform group-hover:scale-110" />
                            Invite & Share
                        </button>
                        
                        <button
                            onClick={() => loadRankings(true)}
                            disabled={refreshing}
                            className="group flex items-center gap-4 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-primary/20"
                        >
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
                            {refreshing ? "SYNCING..." : "Refresh Feed"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── View Toggle & Strategy Selectors ── */}
            <div className="flex border-b border-border mb-8">
                <button
                    onClick={() => setViewMode("market")}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${viewMode === "market" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                    Market Assets
                </button>
                <button
                    onClick={() => setViewMode("users")}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${viewMode === "users" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                    <Users size={14} /> Top Traders
                </button>
            </div>

            {/* ── Strategy Filters (formerly cards) ── */}
            {viewMode === "market" && (
                <div className="flex items-center gap-4 px-2 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-xl border border-border flex-shrink-0">
                        <Filter size={14} className="text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Filters</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setCategory(cat.key)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 ${category === cat.key
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                : "bg-card/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-card"
                                }`}
                        >
                            <cat.icon size={14} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Table Area ── */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                    <div className="relative w-full max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search assets or traders..."
                            aria-label="Search items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-xs font-semibold focus:bg-muted/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
                        />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        Displaying {filteredRankings.length} results
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-premium backdrop-blur-md">
                    {loading ? (
                        <div className="py-48 flex flex-col items-center gap-6">
                            <RefreshCcw size={40} className="animate-spin text-primary opacity-50" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregating Layouts...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    {viewMode === "market" ? (
                                        <tr className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <th className="px-8 py-5">Rank</th>
                                            <th className="px-8 py-5">Asset</th>
                                            <th className="px-6 py-5 text-right">Live Price</th>
                                            <th className="px-6 py-5 text-right">Performance</th>
                                            <th className="px-6 py-5 text-right">Intensity</th>
                                            <th className="px-8 py-5 text-right">Momentum Vector</th>
                                        </tr>
                                    ) : (
                                        <tr className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <th className="px-8 py-5 text-center w-24">Global Rank</th>
                                            <th className="px-8 py-5 text-left w-full">Trader Profile & Stats</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {viewMode === "market" ? filteredRankings.map((asset) => {
                                        const scoreValue = category === 'stability' ? asset.stabilityScore :
                                            category === 'momentum' ? asset.momentumScore :
                                                category === 'volume' ? (asset.volume / 1000) : asset.changePercent;

                                        const isUp = asset.changePercent >= 0;
                                        const rankRising = (asset.prevRank ?? asset.rank) > asset.rank;

                                        return (
                                            <tr key={asset.symbol} className="group hover:bg-muted/20 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-base font-bold w-6 tabular-nums tracking-tight ${asset.rank <= 3 ? "text-primary" : "text-muted-foreground"
                                                            }`}>
                                                            {asset.rank === 1 ? "01" : asset.rank < 10 ? `0${asset.rank}` : asset.rank}
                                                        </span>
                                                        {(asset.prevRank ?? asset.rank) !== asset.rank && (
                                                            <div className={`p-1 rounded-md ${rankRising ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                                                                {rankRising ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center font-bold text-muted-foreground text-xs border border-border group-hover:bg-muted/50 group-hover:border-primary/40 group-hover:text-primary transition-all uppercase tracking-widest leading-none">
                                                            {asset.symbol.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground leading-tight uppercase tracking-widest">{asset.symbol}</div>
                                                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">{asset.sector}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="text-sm font-bold text-foreground tabular-nums tracking-tight">GH₵{asset.price.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className={`text-sm font-bold tabular-nums tracking-tight ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                                                        {isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <div className="flex-1 max-w-[80px] h-1.5 bg-muted/20 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${category === 'gainers' || category === 'stability' ? 'bg-emerald-500' : 'bg-primary'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.abs(scoreValue))}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-foreground tabular-nums tracking-tight w-8 text-right">
                                                            {Math.abs(scoreValue).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${asset.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                        asset.trend === 'down' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                            "bg-muted/30 text-muted-foreground border border-border"
                                                        }`}>
                                                        {asset.trend === 'up' ? <TrendingUp size={12} /> : asset.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                                                        {asset.trend}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : filteredRankings.map((user, idx) => {
                                        const rank = user.globalRank ?? (((userPage - 1) * PAGE_SIZE) + idx + 1);
                                        const isTopThree = rank <= 3;
                                        return (
                                            <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-xl font-bold tabular-nums tracking-tight ${isTopThree ? "text-primary" : "text-muted-foreground"}`}>
                                                            {rank < 10 ? `0${rank}` : rank}
                                                        </span>
                                                        {user.rankChange === 'up' && (
                                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                                                                <ChevronRight className="rotate-[-90deg]" size={10} /> Up
                                                            </span>
                                                        )}
                                                        {user.rankChange === 'down' && (
                                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-500">
                                                                <ChevronRight className="rotate-90" size={10} /> Down
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 w-full">
                                                    <div className="flex items-center gap-4 sm:gap-5">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/30 flex items-center justify-center font-bold text-muted-foreground text-xs border border-border group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:text-primary transition-all uppercase tracking-widest leading-none shadow-premium group-hover:shadow-primary/10 relative overflow-hidden shrink-0">
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                user.full_name ? user.full_name.charAt(0) : "T"
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-foreground leading-tight flex items-center gap-2 truncate">
                                                                {user.full_name || "Anonymous Trader"}
                                                                {rank === 1 && <Crown size={14} className="text-primary shrink-0" />}
                                                            </div>
                                                            <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 sm:gap-2 mt-1 truncate">
                                                                <span className="uppercase tracking-widest whitespace-nowrap">Lvl {user.accreditation_level || 1}</span>
                                                                <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                                                                <span className="text-emerald-500 font-bold flex items-center gap-1 whitespace-nowrap">
                                                                    <Zap size={10} className="shrink-0" /> {(user.knowledge_xp || 0).toLocaleString()} XP
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination footer — only for Users view */}
                    {!loading && viewMode === "users" && userTotalPages > 0 && (
                        <div className="px-6 md:px-8 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="text-foreground">{userTotal.toLocaleString()}</span> Traders in the Network
                                &nbsp;·&nbsp;
                                Page <span className="text-foreground">{userPage}</span> of <span className="text-foreground">{userTotalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleUserPageChange(userPage - 1)}
                                    disabled={userPage <= 1}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} /> Prev
                                </button>

                                {/* Page number pills */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(userTotalPages, 5) }).map((_, i) => {
                                        // Build a window of up to 5 pages centered on the current page
                                        const half = 2;
                                        let start = Math.max(1, userPage - half);
                                        const end = Math.min(userTotalPages, start + 4);
                                        start = Math.max(1, end - 4);
                                        const p = start + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => handleUserPageChange(p)}
                                                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                                    p === userPage
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handleUserPageChange(userPage + 1)}
                                    disabled={userPage >= userTotalPages}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}