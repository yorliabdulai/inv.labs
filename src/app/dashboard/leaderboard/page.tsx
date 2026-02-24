"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Award, Trophy, Medal, ArrowUp, Crown, TrendingUp, TrendingDown,
    Minus, Filter, BarChart3, Activity, Zap, Shield, Search,
    ArrowUpRight, ArrowDownRight, Info, RefreshCcw
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getMarketRankings, type RankedAsset, type RankingCategory } from "@/app/actions/leaderboard";

export default function LeaderboardPage() {
    const [category, setCategory] = useState<RankingCategory>("gainers");
    const [rankings, setRankings] = useState<RankedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    async function loadRankings(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await getMarketRankings(category);
            setRankings(data);
        } catch (err) {
            console.error("Failed to load rankings", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadRankings();
    }, [category]);

    const filteredRankings = useMemo(() => {
        return rankings.filter(r =>
            r.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rankings, searchQuery]);

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
            <div className="relative rounded-[2px] p-8 md:p-16 bg-[#121417] text-[#F9F9F9] border border-white/10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C05E42]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-[#C05E42]/10" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-[2px] border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-[#C05E42]">
                            <Activity size={12} /> Live_Market_Intelligence
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-instrument-serif text-[#F9F9F9]">Market Leaderboards</h1>
                        <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em] max-w-lg leading-loose">
                            Advanced algorithmic rankings using weighted scoring for GSE assets based on price velocity, stability, and liquidity depth.
                        </p>
                    </div>

                    <button
                        onClick={() => loadRankings(true)}
                        disabled={refreshing}
                        className="group flex items-center gap-4 px-8 py-4 bg-[#C05E42] text-[#F9F9F9] rounded-[2px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#C05E42]/90 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-[#C05E42]/10"
                    >
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
                        {refreshing ? "SYNCING..." : "Refresh_Feed"}
                    </button>
                </div>
            </div>

            {/* ── Strategy Selectors ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`p-6 rounded-[2px] border transition-all text-left group relative flex flex-col h-full ${category === cat.key
                            ? "bg-white/5 border-[#C05E42]/40 shadow-2xl"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/5"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-[2px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 border ${category === cat.key
                            ? "bg-[#C05E42] text-[#F9F9F9] border-[#C05E42]"
                            : "bg-white/5 text-white/20 border-white/10 group-hover:text-[#F9F9F9]"
                            }`}>
                            <cat.icon size={20} />
                        </div>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${category === cat.key ? "text-[#C05E42]" : "text-white/40 group-hover:text-white/60"}`}>
                            {cat.label}
                        </h3>
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed line-clamp-2">
                            {cat.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* ── Table Area ── */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
                    <div className="relative w-full max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                            type="text"
                            placeholder="IDENTIFY SYMBOLS OR NODES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[2px] text-[11px] font-black uppercase tracking-widest focus:bg-white/10 focus:border-[#C05E42]/50 outline-none transition-all placeholder:text-white/20 text-[#F9F9F9]"
                        />
                    </div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] whitespace-nowrap">
                        Analysis of {filteredRankings.length} active_nodes
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2px] overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="py-48 flex flex-col items-center gap-6">
                            <RefreshCcw size={40} className="animate-spin text-[#C05E42] opacity-50" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Calculating_Market_Positions...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                                        <th className="px-8 py-5">Rank</th>
                                        <th className="px-8 py-5">Asset_Node</th>
                                        <th className="px-6 py-5 text-right">Live_NAV</th>
                                        <th className="px-6 py-5 text-right">Performance</th>
                                        <th className="px-6 py-5 text-right">Intensity_Score</th>
                                        <th className="px-8 py-5 text-right">Momentum_Vector</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredRankings.map((asset) => {
                                        const scoreValue = category === 'stability' ? asset.stabilityScore :
                                            category === 'momentum' ? asset.momentumScore :
                                                category === 'volume' ? (asset.volume / 1000) : asset.changePercent;

                                        const isUp = asset.changePercent >= 0;
                                        const rankRising = (asset.prevRank ?? asset.rank) > asset.rank;

                                        return (
                                            <tr key={asset.symbol} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-base font-black w-6 tabular-nums tracking-tighter ${asset.rank <= 3 ? "text-[#C05E42]" : "text-white/20"
                                                            }`}>
                                                            {asset.rank === 1 ? "01" : asset.rank < 10 ? `0${asset.rank}` : asset.rank}
                                                        </span>
                                                        {(asset.prevRank ?? asset.rank) !== asset.rank && (
                                                            <div className={`p-1.5 rounded-[1px] ${rankRising ? "text-[#10B981] bg-[#10B981]/10" : "text-red-500 bg-red-500/10"}`}>
                                                                {rankRising ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-[2px] bg-white/5 flex items-center justify-center font-black text-white/20 text-[10px] border border-white/10 group-hover:bg-white/10 group-hover:border-[#C05E42]/40 group-hover:text-[#F9F9F9] transition-all uppercase tracking-widest leading-none">
                                                            {asset.symbol.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-[#F9F9F9] leading-tight uppercase tracking-widest">{asset.symbol}</div>
                                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{asset.sector}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="text-sm font-black text-[#F9F9F9] tabular-nums tracking-tighter">GH₵{asset.price.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className={`text-sm font-black tabular-nums tracking-tighter ${isUp ? "text-[#10B981]" : "text-red-500"}`}>
                                                        {isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <div className="flex-1 max-w-[80px] h-1 bg-white/5 rounded-[1px] overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-[1px] transition-all duration-1000 ${category === 'gainers' || category === 'stability' ? 'bg-[#10B981]' : 'bg-[#C05E42]'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.abs(scoreValue))}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-[#F9F9F9] tabular-nums tracking-tighter w-8 text-right">
                                                            {Math.abs(scoreValue).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[1px] text-[9px] font-black uppercase tracking-[0.15em] ${asset.trend === 'up' ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" :
                                                        asset.trend === 'down' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                            "bg-white/5 text-white/20 border border-white/10"
                                                        }`}>
                                                        {asset.trend === 'up' ? <TrendingUp size={12} /> : asset.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                                                        {asset.trend}
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