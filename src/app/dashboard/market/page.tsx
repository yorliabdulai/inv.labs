"use client";

import { useEffect, useState } from "react";
import { type Stock } from "@/lib/market-data";
import { getMarketData } from "@/app/actions/market";
import { StockRow } from "@/components/market/StockRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Search, SlidersHorizontal, ArrowUpRight, TrendingDown, RefreshCw, BarChart3, PieChart, Activity } from "lucide-react";

export default function MarketPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        async function fetchStocks() {
            try {
                const data = await getMarketData();
                setStocks(data);
            } catch (err) {
                console.error("Failed to load market data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStocks();

        const interval = setInterval(fetchStocks, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredStocks = stocks.filter(stock => {
        const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
            stock.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || stock.sector === filter;
        return matchesSearch && matchesFilter;
    });

    const sectors = ["All", ...Array.from(new Set(stocks.map(s => s.sector)))];
    const marketTrend = stocks.length > 0 ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length : 0;
    const isMarketUp = marketTrend >= 0;

    return (
        <div className="pb-20 space-y-8">
            <DashboardHeader />

            {/* Market Intelligence Bar */}
            <div className="bento-grid">
                <div className="bento-col-4">
                    <div className="glass-card p-6">
                        <div className="stat-label mb-2 flex items-center gap-2">
                            <Activity size={14} className="text-indigo-600" /> Market Sentiment
                        </div>
                        <div className={`text-3xl font-black flex items-center gap-2 ${isMarketUp ? "text-emerald-500" : "text-red-500"}`}>
                            {isMarketUp ? <ArrowUpRight size={28} /> : <TrendingDown size={28} />}
                            {Math.abs(marketTrend).toFixed(2)}%
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aggregate GSE Trend</div>
                    </div>
                </div>
                <div className="bento-col-4">
                    <div className="glass-card p-6">
                        <div className="stat-label mb-2 flex items-center gap-2">
                            <BarChart3 size={14} className="text-indigo-600" /> 24h Volume
                        </div>
                        <div className="text-3xl font-black text-[#1A1C4E]">
                            2.4M <span className="text-xs font-bold text-gray-400 uppercase ml-1">Shares Traded</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+12.4% vs Avg</div>
                    </div>
                </div>
                <div className="bento-col-4">
                    <div className="glass-card p-6">
                        <div className="stat-label mb-2 flex items-center gap-2">
                            <PieChart size={14} className="text-indigo-600" /> Listed Securities
                        </div>
                        <div className="text-3xl font-black text-[#1A1C4E]">
                            {stocks.length} <span className="text-xs font-bold text-gray-400 uppercase ml-1">Active Symbols</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ghana Stock Exchange</div>
                    </div>
                </div>
            </div>

            {/* Exploration Toolbar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-2 md:p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search ticker or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all text-sm font-bold placeholder:text-gray-400"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2 md:px-0 no-scrollbar">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setFilter(sector)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filter === sector
                                ? "bg-[#1A1C4E] text-white border-[#1A1C4E] shadow-xl shadow-indigo-100"
                                : "bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-gray-600"
                                }`}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            {/* High-Density Data List */}
            <div className="space-y-1">
                {/* Table Logic Column Header - Hidden on Mobile */}
                <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1.2fr_0.4fr] px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div>Security</div>
                    <div>Pricing</div>
                    <div>Performance</div>
                    <div>Market Trend (15m)</div>
                    <div className="text-right pr-4">Data</div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-300 glass-card">
                        <RefreshCw size={40} className="animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-bold uppercase tracking-[0.2em]">Syncing with GSE Data Terminal...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {filteredStocks.map(stock => (
                            <StockRow key={stock.symbol} stock={stock} />
                        ))}
                        {filteredStocks.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                                <div className="text-3xl mb-4">🔍</div>
                                <p className="text-sm font-bold uppercase tracking-widest">Null return for "{search}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
