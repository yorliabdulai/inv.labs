"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    ArrowRight,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Eye,
    Target,
    Clock,
    Shield,
    BarChart3,
    Trophy,
    AlertTriangle,
    Layers,
    Activity,
    Briefcase,
    Zap,
    ChevronRight,
    Search
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/mutual-funds-data";
import { AllocationChart } from "@/components/portfolio/AllocationChart";

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [activeRange, setActiveRange] = useState('1M');

    useEffect(() => {
        setMounted(true);
        async function fetchInitialData() {
            const result = await getDashboardData();
            setData(result);
            setLoading(false);
        }
        fetchInitialData();
    }, []);

    const isPositive = (data?.dailyChange ?? 0) >= 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                    Synchronizing Command Center...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* Premium Command Center Header - Real Stats */}
            <div className="relative isolate overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Total Value Hero */}
                    <div className="md:col-span-2 glass-card p-6 md:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border-indigo-500/20 text-white relative group overflow-hidden shadow-2xl shadow-indigo-500/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />

                        <div className="relative">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                    <Briefcase size={20} className="text-indigo-300" />
                                </div>
                                <span className="text-xs font-black text-indigo-100 uppercase tracking-[0.2em] opacity-90">Portfolio Intelligence</span>
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                <div>
                                    <div className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
                                        {formatCurrency(data?.totalEquity ?? 0)}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-black text-xs ${isPositive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'}`}>
                                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            <span>{isPositive ? '+' : ''}{data?.dailyChangePercent.toFixed(2)}% TODAY</span>
                                        </div>
                                        <div className="h-4 w-px bg-white/20" />
                                        <div className="text-xs font-black text-indigo-100 uppercase tracking-widest">
                                            {formatCurrency(data?.dailyChange ?? 0)} Movement
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 min-w-[140px]">
                                        <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Return</div>
                                        <div className="text-xl font-black text-white">{data?.totalGainPercent.toFixed(1)}%</div>
                                        <div className="text-[10px] font-bold text-indigo-400 mt-1">{formatCurrency(data?.totalGain ?? 0)} PROFIT</div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 min-w-[140px]">
                                        <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Buying Power</div>
                                        <div className="text-xl font-black text-white">{formatCurrency(data?.cashBalance ?? 0)}</div>
                                        <div className="text-[10px] font-bold text-indigo-400 mt-1">AVAILABLE CASH</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk & Health Metrics */}
                    <div className="glass-card p-6 bg-white border-border shadow-md flex flex-col justify-between group h-full">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="stat-label flex items-center gap-2">
                                    <Shield size={16} className="text-brand" />
                                    Portfolio Health
                                </h3>
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-brand/5 transition-colors">
                                    <Zap size={14} className="text-brand" />
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <div className={`text-4xl font-black mb-1 ${data?.riskColor}`}>
                                    {data?.riskLabel}
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Assessment Score: {data?.riskScore}/100</div>
                            </div>

                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full`}
                                    style={{
                                        width: `${data?.riskScore ?? 0}%`,
                                        background: `linear-gradient(90deg, #10B981, ${(data?.riskScore ?? 0) > 50 ? ((data?.riskScore ?? 0) > 75 ? '#EF4444' : '#F59E0B') : '#10B981'})`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-wide">Diversification</span>
                                <span className="text-xs font-black text-gray-900">{data?.allocation.length} Asset Segments</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                                <span className="text-xs font-black text-gray-600 uppercase tracking-wide">Asset Classes</span>
                                <span className="text-xs font-black text-gray-900">
                                    {[data?.stockMarketValue && 'Stocks', data?.mutualFundsValue && 'Funds'].filter(Boolean).length} Active Types
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Performance Visualizer */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-card p-6 bg-white flex flex-col min-h-[440px] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <BarChart3 size={18} className="text-indigo-600" />
                                    Growth Analysis
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Projected vs Actual performance</p>
                            </div>
                            <div className="flex gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100">
                                {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setActiveRange(range)}
                                        className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${activeRange === range ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-600/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px]">
                            <PortfolioChart period={activeRange} startingValue={10000} />
                        </div>
                    </div>

                    {/* Holdings Snapshot */}
                    <div className="glass-card p-6 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Layers size={18} className="text-brand" />
                                Core Holdings
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                FULL PORTFOLIO <ChevronRight size={12} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.holdings.slice(0, 4).map((holding) => (
                                <div key={holding.symbol} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border-2 shadow-sm transition-transform group-hover:scale-105 ${holding.type === 'STOCK' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-purple-50 border-purple-100 text-purple-600'
                                            }`}>
                                            {holding.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-sm truncate max-w-[120px]">{holding.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{holding.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-900">{formatCurrency(holding.value)}</div>
                                        <div className={`text-[10px] font-black ${holding.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!data?.holdings || data.holdings.length === 0) && (
                                <div className="col-span-2 py-12 text-center text-gray-400">
                                    <Briefcase size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No Active Holdings</p>
                                    <Link href="/dashboard/market" className="text-xs font-black text-brand underline mt-2 inline-block">Execute your first trade</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Insights & Activity */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Recent Activity Feed */}
                    <div className="glass-card p-6 bg-white shadow-sm flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Activity size={18} className="text-orange-500" />
                                Recent Activity
                            </h3>
                            <button className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                                <Search size={14} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <RecentActivity transactions={data?.recentActivity ?? []} />
                        </div>
                    </div>

                    {/* Allocation Insight */}
                    <div className="glass-card p-6 bg-gradient-to-br from-slate-50 to-white border-border shadow-sm group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="stat-label flex items-center gap-2">
                                <PieChart size={16} className="text-purple-600" />
                                Distribution
                            </h3>
                            <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                REAL-TIME
                            </div>
                        </div>

                        <div className="h-48 mb-8 group-hover:scale-105 transition-transform duration-500">
                            {data && data.allocation.length > 0 ? (
                                <AllocationChart data={data.allocation} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-300 font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-100 rounded-3xl">
                                    No Data Available
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {data?.allocation.slice(0, 3).map((item) => (
                                <div key={item.name} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                        <span className="text-xs font-bold text-gray-600 group-hover/item:text-gray-900 transition-colors uppercase truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">
                                        {((item.value / data.totalEquity) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Intelligence Context Banner */}
            <div className="glass-card p-6 md:p-8 bg-text-primary text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full -mr-48 -mt-48 blur-3xl" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={18} className="text-brand" fill="currentColor" />
                            <span className="text-xs font-black text-brand uppercase tracking-[0.2em]">Platform Opportunity</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-3 text-white leading-tight">Your capital is growing. <br />Optimize your next move.</h3>
                        <p className="text-indigo-200/80 text-sm font-medium leading-relaxed">
                            Based on your {data?.riskLabel.toLowerCase()} risk profile, we&apos;ve identified emerging trends in the {data?.allocation[0]?.name || 'Financial'} sector. Check out the latest opportunities on the market.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                        <Link
                            href="/dashboard/market"
                            className="px-8 py-4 bg-white text-text-primary font-black rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Eye size={18} className="text-brand" />
                            Explore Markets
                        </Link>
                        <Link
                            href="/dashboard/portfolio"
                            className="px-8 py-4 bg-brand text-white font-black rounded-2xl hover:bg-brand-hover hover:scale-105 transition-all shadow-lg border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Target size={18} />
                            Manage Portfolio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
