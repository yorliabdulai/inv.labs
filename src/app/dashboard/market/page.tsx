"use client";

import { useEffect, useState } from "react";
import { type Stock } from "@/lib/market-data";
import { getMarketData } from "@/app/actions/market";
import { StockRow } from "@/components/market/StockRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Search, SlidersHorizontal, ArrowUpRight, TrendingDown, RefreshCw, BarChart3, PieChart, Activity, Filter, Grid3X3, List, Star, Bookmark, TrendingUp, Clock, DollarSign } from "lucide-react";

export default function MarketPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const fetchStocks = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const data = await getMarketData();
            setStocks(data);
        } catch (err) {
            console.error("Failed to load market data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (manual = false) => {
        await fetchStocks(manual);
    };

    useEffect(() => {
        fetchStocks(true);
        const interval = setInterval(() => fetchStocks(false), 60000);
        return () => clearInterval(interval);
    }, []);

    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        // Initialize clock on client only to prevent hydration mismatch
        setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
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
        <div className="pb-20 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Market Intelligence Dashboard - Mobile Optimized */}
            <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                            <BarChart3 size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl font-black text-[#1A1C4E] tracking-tight">Market Explorer</h1>
                            <p className="text-indigo-600 font-medium text-sm md:text-base">Real-time GSE data and trading opportunities</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 min-h-[44px]">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs md:text-sm font-bold">Market Open</span>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <button
                                onClick={() => handleRefresh(true)}
                                disabled={loading}
                                className={`p-2 rounded-lg bg-white/50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all ${loading ? 'animate-spin' : ''}`}
                                title="Sync Quote"
                            >
                                <RefreshCw size={18} />
                            </button>
                            <div>
                                <div className="text-sm md:text-lg font-black text-gray-800">{currentTime || "--:--:--"}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">GSE Time</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Metrics Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Activity size={14} className="text-indigo-600" />
                            <span className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-wider">Sentiment</span>
                        </div>
                        <div className={`text-xl md:text-3xl font-black mb-1 md:mb-2 ${isMarketUp ? "text-emerald-600" : "text-red-600"}`}>
                            {isMarketUp ? <TrendingUp size={18} className="inline mr-1" /> : <TrendingDown size={18} className="inline mr-1" />}
                            {Math.abs(marketTrend).toFixed(2)}%
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">GSE Composite</div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <DollarSign size={14} className="text-emerald-600" />
                            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-wider">24h Volume</span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">
                            2.4M
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">+12.4% vs Avg</div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <PieChart size={14} className="text-purple-600" />
                            <span className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-wider">Securities</span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">
                            {stocks.length}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Listed Companies</div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-3 md:p-6 border border-white/50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Clock size={14} className="text-amber-600" />
                            <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-wider">Market Cap</span>
                        </div>
                        <div className="text-xl md:text-3xl font-black mb-1 md:mb-2">
                            GH₵1.2T
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value</div>
                    </div>
                </div>
            </div>

            {/* Advanced Search & Filters - Mobile Optimized */}
            <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-white to-slate-50 border-slate-200">
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Search Bar - Full Width on Mobile */}
                    <div className="relative w-full group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                        <input
                            type="text"
                            placeholder="Search ticker, company, or sector..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 transition-all text-base md:text-sm font-medium placeholder:text-gray-400 touch-manipulation"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Sector Filters - Horizontal Scroll on Mobile */}
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1 no-scrollbar touch-manipulation">
                            {sectors.map(sector => (
                                <button
                                    key={sector}
                                    onClick={() => setFilter(sector)}
                                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border min-h-[44px] touch-manipulation active:scale-95 ${filter === sector
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                        }`}
                                >
                                    {sector}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle & Advanced Filters */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
                                <button className="p-2 rounded-lg bg-indigo-600 text-white transition-all min-h-[44px] min-w-[44px] touch-manipulation active:scale-95">
                                    <Grid3X3 size={16} />
                                </button>
                                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-all min-h-[44px] min-w-[44px] touch-manipulation active:scale-95">
                                    <List size={16} />
                                </button>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-3 bg-white text-gray-600 rounded-xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm font-medium min-h-[44px] touch-manipulation active:scale-95">
                                <SlidersHorizontal size={16} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(search || filter !== "All") && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Filters:</span>
                            {search && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                    Search: "{search}" <button className="ml-1 hover:text-indigo-900">×</button>
                                </span>
                            )}
                            {filter !== "All" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    Sector: {filter} <button className="ml-1 hover:text-emerald-900">×</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Market Data Display */}
                {loading ? (
                    <div className="glass-card p-16 text-center border-none shadow-none">
                        <div className="max-w-md mx-auto">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">Syncing Terminal...</h3>
                            <p className="text-gray-500 font-medium">Fetching the latest quotes from GSE</p>
                        </div>
                    </div>
                ) : filteredStocks.length === 0 ? (
                    <div className="glass-card p-16 text-center bg-gray-50/50 border-dashed border-2 border-gray-200">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">No Matching Assets</h3>
                            <p className="text-gray-500 mb-8 font-medium">We couldn't find any stocks matching your current filters. Try resetting or adjusting your search.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => { setSearch(""); setFilter("All"); }}
                                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                >
                                    Reset All Filters
                                </button>
                                <button
                                    onClick={() => handleRefresh(true)}
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-gray-600 font-black rounded-xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                                >
                                    Force Re-sync
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                            <span>Showing {filteredStocks.length} of {stocks.length} securities</span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Real-time data
                                </span>
                            </div>
                        </div>

                        {/* Stock Grid - Single Column on Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                            {filteredStocks.map(stock => (
                                <StockRow key={stock.symbol} stock={stock} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Market Insights Footer - Mobile Optimized */}
                <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white mt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                        <div className="flex-1">
                            <h3 className="text-base md:text-lg font-black mb-1">Market Insights</h3>
                            <p className="text-indigo-100 text-xs md:text-sm">Advanced analytics and trading signals</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button className="px-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm min-h-[44px] touch-manipulation active:scale-95">
                                Top Movers
                            </button>
                            <button className="px-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm min-h-[44px] touch-manipulation active:scale-95">
                                Watchlist
                            </button>
                            <button className="px-4 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm min-h-[44px] touch-manipulation active:scale-95">
                                Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
