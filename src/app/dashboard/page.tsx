"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    Layers,
    Activity,
    Zap,
    PieChart,
    Eye,
    Target,
    ChevronRight,
    Search
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioUniversalChart } from "@/components/dashboard/PortfolioUniversalChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { CreateChallengeModal } from "@/components/dashboard/gamification/CreateChallengeModal";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/mutual-funds-data";

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRange, setActiveRange] = useState('1M');
    const [chartType, setChartType] = useState<'area' | 'bar' | 'candle'>('area');
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

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

            {/* Cinematic Brand Hero */}
            <div className="relative mb-12 overflow-hidden rounded-[2px] bg-[#121417] p-8 md:p-16 border border-white/5 shadow-3xl">
                {/* Visual Identity Accents */}
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#C05E42] opacity-[0.08] blur-[120px]" />
                <div className="absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-[#F9F9F9] opacity-[0.03] blur-[100px]" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-8 bg-[#C05E42]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C05E42]">
                                Purchasing Power
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-instrument-serif text-6xl md:text-9xl font-normal leading-none text-[#F9F9F9] tracking-tighter tabular-nums drop-shadow-sm">
                                {formatCurrency(data?.totalEquity ?? 10000)}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-bold border ${isPositive ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'}`}>
                                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    <span>{isPositive ? '+' : ''}{data?.dailyChangePercent.toFixed(2)}%</span>
                                </div>
                                <span className="text-xs font-medium text-white/30 uppercase tracking-widest">Global Performance Index</span>
                            </div>
                        </div>

                        <p className="mt-6 text-sm md:text-base font-light text-white/40 max-w-xl leading-relaxed font-instrument-sans">
                            Your institutional-grade terminal for the Ghana Stock Exchange.
                            Strategize, deploy, and monitor your digital assets with surgical precision.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto mt-8 lg:mt-0">
                        <button className="group flex flex-1 sm:flex-auto lg:flex-initial items-center justify-center gap-3 rounded-[2px] bg-[#C05E42] px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black text-[#F9F9F9] uppercase tracking-widest transition-all hover:bg-[#D16D4F] active:scale-95 shadow-xl shadow-[#C05E42]/20 whitespace-nowrap">
                            <TrendingUp size={16} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 shrink-0" />
                            Execute Trades
                        </button>
                        <button className="flex flex-1 sm:flex-auto lg:flex-initial items-center justify-center gap-3 rounded-[2px] bg-white/5 border border-white/10 px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black text-[#F9F9F9] uppercase tracking-widest backdrop-blur-xl transition-all hover:bg-white/10 active:scale-95 whitespace-nowrap">
                            <Layers size={16} className="shrink-0" />
                            Asset Allocation
                        </button>
                    </div>
                </div>

                {/* Data Visualizer Strips */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-10">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C05E42]/80">Available Cash</p>
                        <p className="text-xl font-medium text-[#F9F9F9] font-instrument-sans">{formatCurrency(data?.cashBalance ?? 0)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C05E42]/80">Total Realized</p>
                        <p className="text-xl font-medium text-[#F9F9F9] font-instrument-sans">{formatCurrency(data?.totalGain ?? 0)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C05E42]/80">Active Assets</p>
                        <p className="text-xl font-medium text-[#F9F9F9] font-instrument-sans">0 Positions</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C05E42]/80">Terminal State</p>
                        <div className="flex items-center gap-2 text-xl font-medium text-[#F9F9F9] font-instrument-sans">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            Live
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                {/* Main Market Visualizer Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#121417] border border-white/5 rounded-[2px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col group">
                        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#C05E42] rounded-[2px] flex items-center justify-center text-[#F9F9F9] shadow-lg shadow-[#C05E42]/20 group-hover:scale-105 transition-transform">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#F9F9F9] tracking-tight truncate max-w-[200px] md:max-w-none font-instrument-sans uppercase">Portfolio Intelligence</h3>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">Proprietary Performance Visualizer</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Chart Type Toggle */}
                                <div className="flex flex-wrap gap-1 p-1 bg-white/5 border border-white/10 rounded-[2px] max-w-full">
                                    <button
                                        onClick={() => setChartType('area')}
                                        className={`px-3 py-1.5 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${chartType === 'area' ? 'bg-[#C05E42] text-[#F9F9F9]' : 'text-white/40 hover:text-[#F9F9F9]'}`}
                                    >
                                        Area
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-3 py-1.5 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${chartType === 'bar' ? 'bg-[#C05E42] text-[#F9F9F9]' : 'text-white/40 hover:text-[#F9F9F9]'}`}
                                    >
                                        Bar
                                    </button>
                                    <button
                                        onClick={() => setChartType('candle')}
                                        className={`px-3 py-1.5 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${chartType === 'candle' ? 'bg-[#C05E42] text-[#F9F9F9]' : 'text-white/40 hover:text-[#F9F9F9]'}`}
                                    >
                                        Candle
                                    </button>
                                </div>

                                {/* Period Toggle */}
                                <div className="flex flex-wrap gap-1 p-1 bg-white/5 border border-white/10 rounded-[2px] max-w-full">
                                    {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setActiveRange(range)}
                                            className={`px-4 py-1.5 rounded-[1px] text-[10px] font-black tracking-widest transition-all ${activeRange === range
                                                ? 'bg-[#F9F9F9] text-[#121417]'
                                                : 'text-white/40 hover:text-[#F9F9F9]'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="flex-1 w-full relative bg-transparent p-6 min-h-[450px]">
                            <PortfolioUniversalChart period={activeRange} chartType={chartType} totalEquity={data?.totalEquity ?? 10000} />
                        </div>
                    </div>

                    {/* Top Holdings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em] flex items-center gap-3">
                                <Layers size={18} className="text-[#C05E42]" />
                                Core Holdings
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-[10px] font-black text-[#C05E42] uppercase tracking-[0.3em] flex items-center gap-1 hover:gap-2 transition-all">
                                Expand Portfolio <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.holdings.slice(0, 4).map((holding) => (
                                <div key={holding.symbol} className="group p-5 bg-white/5 border border-white/5 rounded-[2px] hover:border-[#C05E42]/30 transition-all flex items-center justify-between shadow-2xl hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[2px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-black text-xs shadow-lg shadow-[#C05E42]/10 group-hover:scale-105 transition-transform uppercase">
                                            {holding.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#F9F9F9] text-sm leading-tight uppercase font-instrument-sans">{holding.name}</h4>
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1 block tracking-[0.2em]">{holding.symbol}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#F9F9F9] tabular-nums text-base">{formatCurrency(holding.value)}</p>
                                        <div className={`flex items-center justify-end gap-1 text-[10px] font-black mt-1.5 ${holding.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
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
                    {/* Challenge Prompt */}
                    <div className="bg-[#121417] border border-white/5 rounded-[2px] shadow-2xl p-6 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C05E42]/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-all group-hover:bg-[#C05E42]/10" />
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div>
                                <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Target size={18} className="text-[#C05E42]" />
                                    Cohorts
                                </h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Gamified Trading</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChallengeModalOpen(true)}
                            className="w-full mt-2 py-4 bg-white/5 hover:bg-white/10 text-[#F9F9F9] border border-white/10 rounded-[2px] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Initialize Challenge
                        </button>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-[#121417] border border-white/5 rounded-[2px] shadow-2xl p-6 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em] flex items-center gap-3">
                                <Activity size={18} className="text-[#C05E42]" />
                                Feed
                            </h3>
                            <div className="p-2 bg-white/5 rounded-[2px] text-white/40 border border-white/5 hover:bg-white/10 hover:text-[#F9F9F9] cursor-pointer transition-colors">
                                <Search size={14} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <RecentActivity transactions={data?.recentActivity ?? []} />
                        </div>
                    </div>

                    {/* Allocation Insight - BRAND STYLE */}
                    <div className="bg-[#121417] border border-white/5 rounded-[2px] shadow-2xl p-6 group">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em] flex items-center gap-3">
                                <PieChart size={18} className="text-[#C05E42]" />
                                Allocation
                            </h3>
                            <div className="text-[8px] font-black text-[#F9F9F9] bg-[#C05E42] px-2 py-1 rounded-[1px] shadow-lg shadow-[#C05E42]/10 uppercase tracking-widest">
                                Institutional
                            </div>
                        </div>

                        <div className="h-44 mb-10 group-hover:scale-105 transition-transform duration-500">
                            {data && data.allocation.length > 0 ? (
                                <AllocationChart data={data.allocation} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-white/10 font-black uppercase text-[10px] tracking-[0.3em] border border-white/5 rounded-[2px]">
                                    Awaiting Ledger
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {data?.allocation.slice(0, 3).map((item) => (
                                <div key={item.name} className="flex items-center justify-between group/item border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                                        <span className="text-[10px] font-black text-white/40 group-hover/item:text-[#F9F9F9] transition-colors uppercase tracking-widest truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[#F9F9F9] tabular-nums">
                                        {((item.value / (data.totalEquity || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#121417] rounded-[2px] p-8 md:p-16 text-[#F9F9F9] relative overflow-hidden border border-white/5 shadow-3xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C05E42]/10 rounded-full -mr-48 -mt-48 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F9F9F9]/5 rounded-full -ml-40 -mb-40 blur-[100px]" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                    <div className="max-w-2xl space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[2px] bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                <Zap size={18} className="text-[#C05E42]" />
                            </div>
                            <span className="text-[10px] font-black text-[#C05E42] uppercase tracking-[0.4em]">Strategic Opportunity</span>
                        </div>
                        <h3 className="text-3xl md:text-6xl font-normal font-instrument-serif mb-6 leading-tight tracking-tighter">Your capital is ready.<br />Optimize your next move.</h3>
                        <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed max-w-xl font-instrument-sans uppercase tracking-widest">
                            Based on your institutional risk profile, we&apos;ve identified emerging trends in the alpha-heavy sectors. Check out the latest opportunities on the terminal.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 flex-shrink-0">
                        <Link
                            href="/dashboard/market"
                            className="px-10 py-5 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] hover:bg-[#D16D4F] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-[#C05E42]/20"
                        >
                            <Eye size={18} />
                            Terminal Market
                        </Link>
                        <Link
                            href="/dashboard/portfolio"
                            className="px-10 py-5 bg-white/5 text-[#F9F9F9] font-black rounded-[2px] hover:bg-white/10 active:scale-95 transition-all shadow-2xl border border-white/10 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                        >
                            <Target size={18} />
                            Master Portfolio
                        </Link>
                    </div>
                </div>
            </div>
            <CreateChallengeModal
                isOpen={isChallengeModalOpen}
                onClose={() => setIsChallengeModalOpen(false)}
                onSuccess={() => setIsChallengeModalOpen(false)}
            />
        </div>
    );
}