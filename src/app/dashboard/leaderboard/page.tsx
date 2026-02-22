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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20 space-y-8 animate-in fade-in duration-500">
            <DashboardHeader />

            {/* Header / Banner */}
            <div className="rounded-3xl p-8 bg-slate-950 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                            <Activity size={12} /> Live Market Intelligence
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Market Leaderboards</h1>
                        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                            Advanced algorithmic rankings using weighted scoring for GSE assets based on price velocity, stability, and liquidity depth.
                        </p>
                    </div>

                    <button
                        onClick={() => loadRankings(true)}
                        disabled={refreshing}
                        className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        {refreshing ? "Updating..." : "Refresh Feed"}
                    </button>
                </div>
            </div>

            {/* Strategy Selectors */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`p-5 rounded-2xl border transition-all text-left group relative ${category === cat.key
                                ? "bg-white border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100"
                                : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${category === cat.key ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}>
                            <cat.icon size={18} />
                        </div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${category === cat.key ? "text-indigo-600" : "text-slate-400"}`}>
                            {cat.label}
                        </h3>
                        <p className="text-slate-500 text-[11px] font-medium leading-normal line-clamp-1">
                            {cat.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="relative w-full max-w-xs">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by symbol or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                        />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                        Analysis of {filteredRankings.length} symbols
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculating Positions...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Price</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signal Score</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRankings.map((asset) => {
                                        const scoreValue = category === 'stability' ? asset.stabilityScore :
                                            category === 'momentum' ? asset.momentumScore :
                                                category === 'volume' ? (asset.volume / 1000) : asset.changePercent;

                                        const isUp = asset.changePercent >= 0;
                                        const rankRising = (asset.prevRank ?? asset.rank) > asset.rank;

                                        return (
                                            <tr key={asset.symbol} className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-sm font-bold w-4 tabular-nums ${asset.rank <= 3 ? "text-indigo-600" : "text-slate-400"
                                                            }`}>
                                                            {asset.rank === 1 ? "01" : asset.rank < 10 ? `0${asset.rank}` : asset.rank}
                                                        </span>
                                                        {(asset.prevRank ?? asset.rank) !== asset.rank && (
                                                            <div className={`p-1 rounded ${rankRising ? "text-emerald-500 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
                                                                {rankRising ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px] border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                                            {asset.symbol.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 leading-tight">{asset.symbol}</div>
                                                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{asset.sector}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-bold text-slate-900 tabular-nums">GH₵ {asset.price.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`text-sm font-bold tabular-nums ${isUp ? "text-emerald-600" : "text-red-600"}`}>
                                                        {isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${category === 'gainers' || category === 'stability' ? 'bg-emerald-500' : 'bg-indigo-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.abs(scoreValue))}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                                                            {Math.abs(scoreValue).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${asset.trend === 'up' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                            asset.trend === 'down' ? "bg-red-50 text-red-700 border border-red-100" :
                                                                "bg-slate-100 text-slate-600 border border-slate-200"
                                                        }`}>
                                                        {asset.trend === 'up' ? <TrendingUp size={10} /> : asset.trend === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
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