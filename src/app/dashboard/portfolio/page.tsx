"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStocks } from "@/lib/market-data";
import { TrendingUp, TrendingDown, RefreshCcw, Briefcase, Plus, Wallet, ShieldCheck, ArrowUpRight, BarChart3, PieChart, Activity, Eye } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import Link from "next/link";

interface Holding {
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    gain: number;
    gainPercent: number;
    sector?: string;
}

export default function PortfolioPage() {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [cashBalance, setCashBalance] = useState(10000);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            let cash = 10000;

            if (!transactions || transactions.length === 0) {
                setHoldings([]);
                setLoading(false);
                return;
            }

            const stocks = await getStocks();
            const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));
            const sectorMap = new Map(stocks.map(s => [s.symbol, s.sector]));
            const holdingMap = new Map<string, { quantity: number; totalCost: number }>();

            transactions.forEach(tx => {
                const current = holdingMap.get(tx.symbol) || { quantity: 0, totalCost: 0 };
                if (tx.type === 'BUY') {
                    current.quantity += tx.quantity;
                    current.totalCost += tx.total_amount;
                    cash -= tx.total_amount;
                } else {
                    const avgCost = current.totalCost / current.quantity;
                    current.totalCost -= avgCost * tx.quantity;
                    current.quantity -= tx.quantity;
                    cash += tx.total_amount;
                }
                holdingMap.set(tx.symbol, current);
            });

            const calculatedHoldings: Holding[] = [];
            let portfolioSum = 0;

            holdingMap.forEach((data, symbol) => {
                if (data.quantity > 0) {
                    const currentPrice = priceMap.get(symbol) || 0;
                    const marketValue = data.quantity * currentPrice;
                    const gain = marketValue - data.totalCost;
                    const gainPercent = (gain / data.totalCost) * 100;

                    calculatedHoldings.push({
                        symbol,
                        quantity: data.quantity,
                        averageCost: data.totalCost / data.quantity,
                        currentPrice,
                        marketValue,
                        gain,
                        gainPercent,
                        sector: sectorMap.get(symbol) || "Other"
                    });
                    portfolioSum += marketValue;
                }
            });

            setCashBalance(cash);
            setHoldings(calculatedHoldings);
            setTotalValue(portfolioSum);
            setLoading(false);
        }

        fetchData();
    }, []);

    const totalEquity = totalValue + cashBalance;
    const totalGain = totalEquity - 10000;
    const totalGainPercent = (totalGain / 10000) * 100;
    const isPositive = totalGain >= 0;

    const sectorData = holdings.reduce((acc, h) => {
        const existing = acc.find(item => item.name === h.sector);
        if (existing) {
            existing.value += h.marketValue;
        } else {
            const colors: Record<string, string> = {
                "Finance": "#4F46E5",
                "Technology": "#10B981",
                "Mining": "#F59E0B",
                "Consumer": "#EC4899",
                "Agriculture": "#8B5CF6",
                "Energy": "#EF4444"
            };
            acc.push({
                name: h.sector || "Other",
                value: h.marketValue,
                color: colors[h.sector || ""] || "#9CA3AF"
            });
        }
        return acc;
    }, [] as { name: string; value: number; color: string }[]);

    if (cashBalance > 0) {
        sectorData.push({ name: "Cash", value: cashBalance, color: "#E5E7EB" });
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <RefreshCcw size={32} className="animate-spin mb-4 text-indigo-600" />
            <p className="text-sm font-bold uppercase tracking-widest">Aggregating Asset Data...</p>
        </div>
    );

    return (
        <div className="pb-16 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Portfolio Analytics Header - Mobile Optimized */}
            <div className="glass-card p-4 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Briefcase size={20} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl md:text-3xl font-black text-[#1A1C4E] tracking-tight">Portfolio Analytics</h1>
                                <p className="text-indigo-600 font-medium text-sm">Advanced insights and performance metrics</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                            <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                                <div className="text-xl md:text-2xl font-black text-indigo-800">
                                    GH₵{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1">Total Value</div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                                <div className={`text-xl md:text-2xl font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {totalGain >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%
                                </div>
                                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">Total Return</div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3 md:p-4 border border-white/50">
                                <div className="text-xl md:text-2xl font-black text-purple-600">
                                    GH₵{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mt-1">Buying Power</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                        <Link href="/dashboard/market" className="w-full sm:w-auto px-4 md:px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-95">
                            <Plus size={16} />
                            <span>Add Position</span>
                        </Link>
                        <button className="w-full sm:w-auto px-4 md:px-6 py-3 bg-white text-indigo-600 font-black rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-95">
                            <RefreshCcw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Analytics Grid */}
            <div className="bento-grid">

                {/* Performance Chart - Mobile Optimized */}
                <div className="bento-col-8">
                    <div className="glass-card p-4 md:p-8 h-full bg-gradient-to-br from-white to-emerald-50/30">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4 md:mb-6">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={18} className="text-emerald-600" />
                                <h3 className="text-lg md:text-xl font-black text-[#1A1C4E]">Performance Timeline</h3>
                            </div>
                            <div className="flex gap-1 bg-white/60 p-1 rounded-xl border border-gray-100 overflow-x-auto touch-manipulation">
                                {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                                    <button
                                        key={period}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-xs font-black transition-all min-w-[44px] touch-manipulation active:scale-95 ${period === '1M'
                                                ? 'bg-emerald-600 text-white shadow-lg'
                                                : 'text-gray-500 hover:text-emerald-600 hover:bg-white/80'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[240px] md:h-[320px]">
                            <PortfolioChart />
                        </div>
                    </div>
                </div>

                {/* Risk & Analytics Panel */}
                <div className="bento-col-4 space-y-6">
                    {/* Risk Assessment */}
                    <div className="glass-card p-6 bg-gradient-to-br from-slate-900 to-purple-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4 text-slate-300 text-xs font-black uppercase tracking-wider">
                                <ShieldCheck size={14} /> Portfolio Risk
                            </div>
                            <div className="text-3xl font-black mb-3">Conservative</div>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-300">Risk Score</span>
                                    <span className="text-sm font-black text-emerald-400">35/100</span>
                                </div>
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full transition-all duration-1000" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-200 uppercase">Diversification</span>
                                    <span className="text-sm font-black text-emerald-400">Excellent</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Well-balanced across 4 sectors with optimal risk-adjusted returns.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation - Enhanced */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart size={16} className="text-indigo-600" />
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-wider">Allocation</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 relative">
                                    <AllocationChart data={sectorData} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    {sectorData.slice(0, 4).map((sector, i) => (
                                        <div key={sector.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-gray-400'][i]}`}></div>
                                                <span className="text-xs font-bold text-gray-600 uppercase">{sector.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-800">
                                                {((sector.value / sectorData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="bento-col-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={16} className="text-blue-600" />
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-wider">Key Metrics</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Sharpe Ratio', value: '1.85', change: '+0.12', positive: true },
                                { label: 'Beta', value: '0.78', change: '-0.03', positive: true },
                                { label: 'Max Drawdown', value: '8.2%', change: '-2.1%', positive: true },
                                { label: 'Win Rate', value: '68%', change: '+5%', positive: true },
                            ].map((metric) => (
                                <div key={metric.label} className="bg-white/60 rounded-lg p-4 border border-white/50">
                                    <div className="text-lg font-black text-blue-800">{metric.value}</div>
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">{metric.label}</div>
                                    <div className={`text-xs font-bold mt-2 ${metric.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {metric.change}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sector Performance */}
                <div className="bento-col-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={16} className="text-purple-600" />
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-wider">Sector Performance</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { sector: 'Financial Services', performance: '+12.4%', contribution: '45%', trend: 'up' },
                                { sector: 'Technology', performance: '+8.7%', contribution: '30%', trend: 'up' },
                                { sector: 'Consumer Goods', performance: '+3.2%', contribution: '15%', trend: 'neutral' },
                                { sector: 'Cash', performance: '+0.1%', contribution: '10%', trend: 'neutral' },
                            ].map((item) => (
                                <div key={item.sector} className="bg-white/60 rounded-lg p-4 border border-white/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-black text-gray-800">{item.sector}</span>
                                        <div className="flex items-center gap-2">
                                            {item.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                                            <span className={`text-sm font-black ${item.performance.startsWith('+') ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                {item.performance}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-500 uppercase">Contribution</span>
                                        <span className="font-black text-gray-800">{item.contribution}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Advanced Holdings Analysis - Mobile Optimized */}
            <div className="glass-card overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Briefcase size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-lg md:text-xl text-[#1A1C4E]">Portfolio Holdings</h3>
                                <p className="text-indigo-600 font-medium text-xs md:text-sm">Detailed position analysis and performance</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-4 py-3 bg-white text-indigo-600 rounded-xl text-xs md:text-sm font-black border border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-95">
                                <RefreshCcw size={14} /> Refresh Prices
                            </button>
                            <Link href="/dashboard/market" className="w-full sm:w-auto px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs md:text-sm font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[48px] touch-manipulation active:scale-95">
                                <Plus size={16} /> Add Position
                            </Link>
                        </div>
                    </div>
                </div>

                {holdings.length === 0 ? (
                    <div className="py-16 md:py-32 text-center px-4">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
                                <Wallet size={28} className="text-gray-300" />
                            </div>
                            <h4 className="text-base md:text-lg font-black text-gray-800 mb-2">No Active Positions</h4>
                            <p className="text-sm md:text-base text-gray-500 mb-6">Start building your portfolio by exploring market opportunities</p>
                            <Link href="/dashboard/market" className="inline-flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[52px] touch-manipulation active:scale-95">
                                <Eye size={18} /> Explore Markets
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
                                        <th className="px-8 py-5">Security</th>
                                        <th className="px-6 py-5 text-right">Shares</th>
                                        <th className="px-6 py-5 text-right">Avg Cost</th>
                                        <th className="px-6 py-5 text-right">Market Price</th>
                                        <th className="px-6 py-5 text-right">Market Value</th>
                                        <th className="px-8 py-5 text-right">Unrealized P&L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {holdings.map(holding => (
                                        <tr key={holding.symbol} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all duration-200 ${holding.gain >= 0
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white"
                                                            : "bg-red-50 border-red-200 text-red-700 group-hover:bg-red-500 group-hover:text-white"
                                                        }`}>
                                                        {holding.symbol.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-lg">{holding.symbol}</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{holding.sector}</div>
                                                        <div className="text-xs font-medium text-gray-400 mt-1">
                                                            {holding.quantity} shares owned
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="font-mono font-black text-gray-900 text-lg">
                                                    {holding.quantity.toLocaleString()}
                                                </div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shares</div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="font-mono font-bold text-gray-600">
                                                    GH₵{holding.averageCost.toFixed(2)}
                                                </div>
                                                <div className="text-xs font-medium text-gray-400">Average Cost</div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="font-mono font-black text-[#1A1C4E] text-lg">
                                                        GH₵{holding.currentPrice.toFixed(2)}
                                                    </div>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Real-time price"></div>
                                                </div>
                                                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Price</div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="font-mono font-black text-gray-900 text-lg">
                                                    GH₵{holding.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-xs font-medium text-gray-400">Market Value</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className={`font-mono font-black text-xl ${holding.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                    {holding.gain >= 0 ? "+" : ""}GH₵{holding.gain.toFixed(2)}
                                                </div>
                                                <div className={`text-sm font-black uppercase tracking-wider ${holding.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    {holding.gainPercent >= 0 ? "+" : ""}{holding.gainPercent.toFixed(2)}%
                                                </div>
                                                <div className="mt-2 flex items-center justify-end gap-1">
                                                    {holding.gain >= 0 ? (
                                                        <TrendingUp size={12} className="text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown size={12} className="text-red-500" />
                                                    )}
                                                    <span className={`text-xs font-bold ${holding.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                        Unrealized
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {holdings.map(holding => (
                                <div
                                    key={holding.symbol}
                                    className="glass-card p-4 bg-white border border-gray-100 rounded-xl touch-manipulation active:scale-[0.98]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border-2 flex-shrink-0 ${holding.gain >= 0
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                    : "bg-red-50 border-red-200 text-red-700"
                                                }`}>
                                                {holding.symbol.substring(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-gray-900 text-base mb-1">{holding.symbol}</div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{holding.sector}</div>
                                            </div>
                                        </div>
                                        <div className={`flex flex-col items-end ${holding.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            <div className="font-mono font-black text-lg">
                                                {holding.gain >= 0 ? "+" : ""}GH₵{holding.gain.toFixed(2)}
                                            </div>
                                            <div className="text-xs font-black uppercase">
                                                {holding.gainPercent >= 0 ? "+" : ""}{holding.gainPercent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shares</div>
                                            <div className="font-mono font-black text-gray-900 text-sm">
                                                {holding.quantity.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Cost</div>
                                            <div className="font-mono font-bold text-gray-600 text-sm">
                                                GH₵{holding.averageCost.toFixed(2)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Market Price</div>
                                            <div className="flex items-center gap-1">
                                                <div className="font-mono font-black text-[#1A1C4E] text-sm">
                                                    GH₵{holding.currentPrice.toFixed(2)}
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Market Value</div>
                                            <div className="font-mono font-black text-gray-900 text-sm">
                                                GH₵{holding.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Portfolio Summary Footer - Mobile Optimized */}
                {holdings.length > 0 && (
                    <div className="px-4 md:px-8 py-4 md:py-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                            <div className="flex items-center justify-around md:justify-start gap-4 md:gap-6">
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-black text-indigo-600">{holdings.length}</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Positions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-black text-emerald-600">
                                        {holdings.filter(h => h.gain > 0).length}
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Winners</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-black text-red-600">
                                        {holdings.filter(h => h.gain < 0).length}
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Losers</div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-4 py-3 bg-white text-gray-600 rounded-xl text-xs font-black border border-gray-200 hover:bg-gray-50 transition-all min-h-[48px] touch-manipulation active:scale-95">
                                    Export Report
                                </button>
                                <button className="w-full sm:w-auto px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[48px] touch-manipulation active:scale-95">
                                    Performance Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
