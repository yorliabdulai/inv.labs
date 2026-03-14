"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Award, Trophy, Medal, ArrowUp, Crown, TrendingUp, TrendingDown,
    Minus, Filter, BarChart3, Activity, Zap, Shield, Search,
    ArrowUpRight, ArrowDownRight, Info, RefreshCcw, Users
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getMarketRankings, type RankedAsset, type RankingCategory } from "@/app/actions/leaderboard";
import { getTopUsers } from "@/app/actions/gamification";
import { useDebounce } from "@/hooks/use-debounce";

export default function LeaderboardPage() {
    const [viewMode, setViewMode] = useState<"market" | "users">("market");
    const [category, setCategory] = useState<RankingCategory>("gainers");
    const [rankings, setRankings] = useState<RankedAsset[]>([]);
    const [userRankings, setUserRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Bolt Performance: Debounce search input to avoid expensive list filtering operations
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    async function loadRankings(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (viewMode === "market") {
                const data = await getMarketRankings(category);
                setRankings(data);
            } else {
                const data = await getTopUsers();
                setUserRankings(data);
            }
        } catch (err) {
            console.error("Failed to load rankings", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadRankings();
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

    const categories: { key: RankingCategory; label: string; icon: any; description: string }[] = [
        { key: 'gainers', label: 'Top Gainers', icon: TrendingUp, description: 'Highest price appreciation.' },
        { key: 'momentum', label: 'Momentum', icon: Zap, description: 'High-speed movers based on price/volume velocity.' },
        { key: 'stability', label: 'Stability', icon: Shield, description: 'Consistent low-volatility performers.' },
        { key: 'volume', label: 'Volume', icon: Activity, description: 'Most actively traded symbols by liquidity.' },
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-instrument-sans">
            <DashboardHeader />

            {/* ── Header / Banner ── */}
            <div className="relative rounded-2xl p-8 md:p-16 bg-[#121417] text-white border border-white/[0.06] shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-blue-600/10" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-blue-500">
                            <Activity size={12} /> Global Rankings
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-instrument-serif text-white">Platform Leaderboards</h1>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest max-w-lg leading-relaxed">
                            Assess top performing assets in the market and benchmark your performance and accreditation XP against top traders in the network.
                        </p>
                    </div>

                    <button
                        onClick={() => loadRankings(true)}
                        disabled={refreshing}
                        className="group flex items-center gap-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-blue-900/20"
                    >
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
                        {refreshing ? "SYNCING..." : "Refresh Feed"}
                    </button>
                </div>
            </div>

            {/* ── View Toggle & Strategy Selectors ── */}
            <div className="flex border-b border-white/[0.06] mb-8">
                <button
                    onClick={() => setViewMode("market")}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${viewMode === "market" ? "text-blue-500 border-blue-500" : "text-zinc-500 border-transparent hover:text-white"}`}
                >
                    Market Assets
                </button>
                <button
                    onClick={() => setViewMode("users")}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${viewMode === "users" ? "text-blue-500 border-blue-500" : "text-zinc-500 border-transparent hover:text-white"}`}
                >
                    <Users size={14} /> Top Traders
                </button>
            </div>

            {viewMode === "market" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setCategory(cat.key)}
                            className={`p-6 rounded-2xl border transition-all text-left group relative flex flex-col h-full backdrop-blur-md ${category === cat.key
                                ? "bg-white/[0.03] border-blue-500/40 shadow-2xl"
                                : "bg-white/[0.01] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.03]"
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 border ${category === cat.key
                                ? "bg-blue-600/10 text-blue-500 border-blue-500/20 shadow-lg shadow-blue-900/20"
                                : "bg-white/[0.03] text-zinc-400 border-white/[0.06] group-hover:text-white"
                                }`}>
                                <cat.icon size={20} />
                            </div>
                            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${category === cat.key ? "text-white" : "text-zinc-400 group-hover:text-white"}`}>
                                {cat.label}
                            </h3>
                            <p className="text-zinc-500 text-[10px] font-medium leading-relaxed line-clamp-2">
                                {cat.description}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Table Area ── */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                    <div className="relative w-full max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search assets or traders..."
                            aria-label="Search items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-semibold focus:bg-white/[0.06] focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600 text-white"
                        />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                        Displaying {filteredRankings.length} results
                    </p>
                </div>

                <div className="bg-[#0D0F12] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                    {loading ? (
                        <div className="py-48 flex flex-col items-center gap-6">
                            <RefreshCcw size={40} className="animate-spin text-blue-500 opacity-50" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aggregating Layouts...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    {viewMode === "market" ? (
                                        <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <th className="px-8 py-5">Rank</th>
                                            <th className="px-8 py-5">Asset</th>
                                            <th className="px-6 py-5 text-right">Live Price</th>
                                            <th className="px-6 py-5 text-right">Performance</th>
                                            <th className="px-6 py-5 text-right">Intensity</th>
                                            <th className="px-8 py-5 text-right">Momentum Vector</th>
                                        </tr>
                                    ) : (
                                        <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <th className="px-8 py-5 text-center w-24">Global Rank</th>
                                            <th className="px-8 py-5">Trader Profile</th>
                                            <th className="px-6 py-5 text-right">Accreditation Level</th>
                                            <th className="px-8 py-5 text-right">Knowledge XP</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {viewMode === "market" ? filteredRankings.map((asset) => {
                                        const scoreValue = category === 'stability' ? asset.stabilityScore :
                                            category === 'momentum' ? asset.momentumScore :
                                                category === 'volume' ? (asset.volume / 1000) : asset.changePercent;

                                        const isUp = asset.changePercent >= 0;
                                        const rankRising = (asset.prevRank ?? asset.rank) > asset.rank;

                                        return (
                                            <tr key={asset.symbol} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-base font-bold w-6 tabular-nums tracking-tight ${asset.rank <= 3 ? "text-blue-500" : "text-zinc-500"
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
                                                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center font-bold text-zinc-400 text-xs border border-white/[0.06] group-hover:bg-white/[0.06] group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all uppercase tracking-widest leading-none">
                                                            {asset.symbol.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white leading-tight uppercase tracking-widest">{asset.symbol}</div>
                                                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">{asset.sector}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="text-sm font-bold text-white tabular-nums tracking-tight">GH₵{asset.price.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className={`text-sm font-bold tabular-nums tracking-tight ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                                                        {isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <div className="flex-1 max-w-[80px] h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${category === 'gainers' || category === 'stability' ? 'bg-emerald-500' : 'bg-blue-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.abs(scoreValue))}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-white tabular-nums tracking-tight w-8 text-right">
                                                            {Math.abs(scoreValue).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${asset.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                        asset.trend === 'down' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                            "bg-white/[0.03] text-zinc-500 border border-white/[0.06]"
                                                        }`}>
                                                        {asset.trend === 'up' ? <TrendingUp size={12} /> : asset.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                                                        {asset.trend}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : filteredRankings.map((user, idx) => {
                                        const rank = idx + 1;
                                        return (
                                            <tr key={user.id} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-xl font-bold tabular-nums tracking-tight ${rank <= 3 ? "text-blue-500" : "text-zinc-500"}`}>
                                                        {rank < 10 ? `0${rank}` : rank}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center font-bold text-zinc-400 text-xs border border-white/[0.06] group-hover:bg-blue-600/10 group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all uppercase tracking-widest leading-none shadow-xl shadow-transparent group-hover:shadow-blue-900/10">
                                                            {user.full_name ? user.full_name.charAt(0) : "T"}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white leading-tight flex items-center gap-2">
                                                                {user.full_name || "Anonymous Trader"}
                                                                {rank === 1 && <Crown size={14} className="text-blue-500" />}
                                                            </div>
                                                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">ID: {user.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="text-sm font-bold text-white tabular-nums tracking-tight">
                                                        Level {user.accreditation_level || 1}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="text-base font-bold text-emerald-500 tabular-nums tracking-tight">
                                                            {(user.knowledge_xp || 0).toLocaleString()} XP
                                                        </div>
                                                        <Zap size={14} className="text-emerald-500 opacity-60" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}