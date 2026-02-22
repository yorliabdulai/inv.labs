"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    Shield,
    BarChart3,
    Layers,
    Activity,
    Briefcase,
    Zap,
    PieChart,
    Eye,
    Target,
    ChevronRight,
    Search,
    CandlestickChart as CandlestickIcon
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioUniversalChart } from "@/components/dashboard/PortfolioUniversalChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/mutual-funds-data";

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState('1M');
    const [chartType, setChartType] = useState<'area' | 'bar' | 'candle'>('area');

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const result = await getDashboardData();
                setData(result);
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <div className="w-8 h-8 border-2 border-[#1A1C4E] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-[#1A1C4E]/40">Authenticating Ledger...</p>
            </div>
        );
    }

    const isPositive = (data?.dailyChange ?? 0) >= 0;

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-10 pb-20 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* High-Impact Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Briefcase size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Net Capital Allocation</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-8">
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-[#1A1C4E] tabular-nums leading-[0.85]">
                            {formatCurrency(data?.totalEquity ?? 0)}
                        </h1>

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-black border shadow-sm self-start md:self-auto ${isPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            <span>{isPositive ? '+' : ''}{data?.dailyChangePercent.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>

                {/* Performance Snapshot Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200/50 rounded-full -mr-8 -mt-8" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Cash</p>
                        <p className="text-2xl font-black text-[#1A1C4E] tabular-nums">{formatCurrency(data?.cashBalance ?? 0)}</p>
                    </div>
                    <div className="p-6 bg-[#1A1C4E] rounded-3xl text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Profit</p>
                        <p className="text-2xl font-black tabular-nums text-white">{formatCurrency(data?.totalGain ?? 0)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                {/* Main Market Visualizer Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[600px] flex flex-col group">
                        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#1A1C4E] tracking-tight truncate max-w-[200px] md:max-w-none">Portfolio Intelligence</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 whitespace-nowrap">Proprietary Performance Visualizer</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Chart Type Toggle */}
                                <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${chartType === 'area' ? 'bg-[#1A1C4E] text-white' : 'text-slate-500 hover:text-[#1A1C4E]'}`}
                                    >
                                        Area
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${chartType === 'bar' ? 'bg-[#1A1C4E] text-white' : 'text-slate-500 hover:text-[#1A1C4E]'}`}
                                    >
                                        Bar
                                    </button>
                                    <button
                                        onClick={() => setChartType('candle')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${chartType === 'candle' ? 'bg-[#1A1C4E] text-white' : 'text-slate-500 hover:text-[#1A1C4E]'}`}
                                    >
                                        Candle
                                    </button>
                                </div>

                                {/* Period Toggle - Responsive Scroll */}
                                <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
                                    {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setActiveRange(range)}
                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all flex-shrink-0 ${activeRange === range
                                                ? 'bg-white text-[#1A1C4E] shadow-sm border border-slate-200'
                                                : 'text-slate-500 hover:text-[#1A1C4E]'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="flex-1 w-full relative bg-white p-6 min-h-[450px]">
                            <PortfolioUniversalChart period={activeRange} chartType={chartType} />
                        </div>
                    </div>

                    {/* Top Holdings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-widest flex items-center gap-2">
                                <Layers size={18} className="text-brand" />
                                Core Holdings
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                Expand Portfolio <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.holdings.slice(0, 4).map((holding) => (
                                <div key={holding.symbol} className="group p-5 bg-white border border-slate-100 rounded-[28px] hover:border-indigo-200 transition-all flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#1A1C4E] text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                            {holding.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1A1C4E] text-sm leading-tight">{holding.name}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">{holding.symbol}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#1A1C4E] tabular-nums text-base">{formatCurrency(holding.value)}</p>
                                        <div className={`flex items-center justify-end gap-1 text-[10px] font-black mt-1 ${holding.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {holding.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            <span>{Math.abs(holding.change).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Insights Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Recent Activity Feed */}
                    <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-6 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-widest flex items-center gap-2">
                                <Activity size={18} className="text-orange-500" />
                                Recent Activity
                            </h3>
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                                <Search size={14} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <RecentActivity transactions={data?.recentActivity ?? []} />
                        </div>
                    </div>

                    {/* Allocation Insight - PREMIUM STYLE */}
                    <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-6 group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-[#1A1C4E] uppercase tracking-widest flex items-center gap-2">
                                <PieChart size={18} className="text-purple-600" />
                                Distribution
                            </h3>
                            <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 uppercase">
                                Real-Time
                            </div>
                        </div>

                        <div className="h-44 mb-8 group-hover:scale-105 transition-transform duration-500">
                            {data && data.allocation.length > 0 ? (
                                <AllocationChart data={data.allocation} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-100 rounded-[32px]">
                                    Awaiting Data
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {data?.allocation.slice(0, 3).map((item) => (
                                <div key={item.name} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                        <span className="text-xs font-black text-slate-600 group-hover/item:text-[#1A1C4E] transition-colors uppercase truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[#1A1C4E] tabular-nums">
                                        {((item.value / (data.totalEquity || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Market Intelligence Context Banner */}
            <div className="bg-[#1A1C4E] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full -ml-40 -mb-40 blur-[100px]" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Zap size={14} className="text-indigo-300" />
                            </div>
                            <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em]">Platform Opportunity</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tighter">Your capital is growing.<br />Optimize your next move.</h3>
                        <p className="text-white/90 text-lg font-black leading-relaxed max-w-xl">
                            Based on your {data?.riskLabel.toLowerCase()} risk profile, we&apos;ve identified emerging trends in the {data?.allocation[0]?.name || 'Financial'} sector. Check out the latest opportunities on the market.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                        <Link
                            href="/dashboard/market"
                            className="px-10 py-5 bg-white text-[#1A1C4E] font-black rounded-2xl hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <Eye size={20} className="text-indigo-600" />
                            Explore Markets
                        </Link>
                        <Link
                            href="/dashboard/portfolio"
                            className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Target size={20} />
                            Manage Portfolio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}