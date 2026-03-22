"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    Layers,
    Activity,
    Target,
    ChevronRight,
    Search,
    PieChart,
    Wallet
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
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                <span className="relative flex h-8 w-8">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary/50 border border-primary/20"></span>
                </span>
                <p className="text-xs font-semibold tracking-wider text-zinc-500 animate-pulse">Establishing secure connection...</p>
            </div>
        );
    }

    const isPositive = (data?.dailyChange ?? 0) >= 0;

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-700 text-foreground">
            <DashboardHeader />

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Equity Panel */}
                <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none text-foreground">
                        <Wallet size={120} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
                            <span>Total Equity</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight tabular-nums relative z-10 font-syne">
                            {formatCurrency(data?.totalEquity ?? 10000)}
                        </h1>
                    </div>
                    <div className="mt-8 flex items-center gap-3 relative z-10">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{isPositive ? '+' : ''}{formatCurrency(data?.dailyChange ?? 0)} ({data?.dailyChangePercent.toFixed(2)}%)</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Today</span>
                    </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-card/50 border border-border rounded-2xl p-5 flex flex-col justify-center transition-all hover:bg-card hover:shadow-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-70">Purchasing Power</p>
                        <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums font-syne">{formatCurrency(data?.cashBalance ?? 0)}</p>
                    </div>
                    <div className="bg-card/50 border border-border rounded-2xl p-5 flex flex-col justify-center transition-all hover:bg-card hover:shadow-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-70">Total Return</p>
                        <p className={`text-xl md:text-2xl font-bold tabular-nums font-syne ${(data?.totalGain ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {(data?.totalGain ?? 0) >= 0 ? '+' : ''}{formatCurrency(data?.totalGain ?? 0)}
                        </p>
                    </div>
                    <div className="bg-card/50 border border-border rounded-2xl p-5 flex flex-col justify-center transition-all hover:bg-card hover:shadow-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-70">Active Positions</p>
                        <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums font-syne">{data?.activePositions ?? 0}</p>
                    </div>
                    <div className="bg-card/50 border border-border rounded-2xl p-5 flex flex-col justify-center transition-all hover:bg-card hover:shadow-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">System Status</p>
                        <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                            </span>
                            Live
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Chart Panel */}
                    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
                        <div className="p-5 md:px-6 md:py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary">
                                    <Activity size={16} />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">Performance Overview</h3>
                            </div>

                            <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-xl border border-border">
                                {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setActiveRange(range)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeRange === range
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full relative p-6 min-h-[400px]">
                            {/* Pass minimal props as before, UI chart library handles drawing */}
                            <PortfolioUniversalChart period={activeRange} chartType={chartType} currentTotal={data?.totalEquity ?? 10000} />
                        </div>
                    </div>

                    {/* Holdings Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Layers size={16} className="text-muted-foreground" />
                                Core Holdings
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors">
                                View Portfolio <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.holdings.slice(0, 4).map((holding) => (
                                <div key={holding.symbol} className="group p-5 bg-card border border-border rounded-2xl hover:border-blue-500/40 transition-all flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center font-bold text-xs uppercase border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary/40 transition-colors">
                                            {holding.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground text-sm">{holding.name}</h4>
                                            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-0.5 block">{holding.symbol}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground tabular-nums text-sm">{formatCurrency(holding.value)}</p>
                                        <div className={`flex items-center justify-end gap-1 text-[11px] font-semibold mt-1 ${holding.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {holding.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            <span>{Math.abs(holding.changePercent).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Activity Feed */}
                    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[400px] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Activity size={16} className="text-muted-foreground" />
                                Ledger
                            </h3>
                            <button
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                aria-label="Search ledger"
                            >
                                <Search size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar -mr-1">
                            <RecentActivity transactions={data?.recentActivity ?? []} />
                        </div>
                    </div>

                    {/* Allocation */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <PieChart size={16} className="text-muted-foreground" />
                                Allocation
                            </h3>
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                Computed
                            </span>
                        </div>

                        <div className="h-40 mb-8">
                            {data && data.allocation.length > 0 ? (
                                <AllocationChart data={data.allocation} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground font-semibold text-xs tracking-wider border border-border rounded-xl border-dashed">
                                    Awaiting Initial Capital
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {data?.allocation.slice(0, 3).map((item) => (
                                <div key={item.name} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                                        <span className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground transition-colors truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-foreground tabular-nums">
                                        {((item.value / (data.totalEquity || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gamification Action */}
                    <button
                        onClick={() => setIsChallengeModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Target size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-foreground dark:text-blue-100">Trading Cohorts</p>
                                <p className="text-[10px] text-muted-foreground dark:text-blue-300 mt-0.5">Start a challenge</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Bottom Conversion Area */}
            <div className="bg-gradient-to-br from-blue-600/10 via-background to-blue-600/5 rounded-2xl p-8 md:p-12 text-foreground relative overflow-hidden border border-border shadow-sm">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[100px]" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 w-full">
                    <div className="max-w-xl space-y-4">
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Expand your portfolio footprint.</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                            Analyze advanced market patterns in real-time or securely execute block trades over the Ghana Stock Exchange sandbox protocol.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                        <Link
                            href="/dashboard/market"
                            className="px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm"
                        >
                            <Activity size={16} />
                            Launch Market Scanner
                        </Link>
                        <Link
                            href="/dashboard/portfolio"
                            className="px-6 py-3.5 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 active:scale-95 transition-all border border-border flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                            <Wallet size={16} />
                            Manage Portfolio
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