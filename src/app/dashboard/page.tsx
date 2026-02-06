"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Eye, Target, Clock, Shield, BarChart3, Users, Trophy, AlertTriangle, Layers } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";

export default function DashboardPage() {
    // Enhanced Mock User Data with real-time simulation
    const [userData, setUserData] = useState({
        name: "Kwame",
        balance: 12450.00,
        dayChange: 2.5,
        totalReturn: 24.5,
        buyingPower: 4500.00,
        lastUpdate: new Date(),
        portfolioValue: 12450.00,
        riskScore: 65,
        rank: 847,
        totalUsers: 15420
    });

    const [mounted, setMounted] = useState(false);

    // Simulate real-time updates
    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setUserData(prev => ({
                ...prev,
                balance: prev.balance + (Math.random() - 0.5) * 50,
                dayChange: prev.dayChange + (Math.random() - 0.5) * 0.2,
                lastUpdate: new Date()
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4 md:space-y-6 pb-24 md:pb-12">
            <DashboardHeader userInitial={userData.name[0]} />

            {/* Real-time Status Banner - Mobile Optimized */}
            <div className="glass-card p-4 md:p-5 bg-gradient-to-r from-emerald-50/50 to-indigo-50/50 border-emerald-100/50 animate-fade-in-scale">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                        </span>
                        <span className="text-sm md:text-sm font-black text-emerald-800 uppercase tracking-wide">Market Live</span>
                        <div className="h-4 w-px bg-emerald-200 hidden sm:block"></div>
                        <span className="text-xs text-emerald-700 font-bold hidden sm:inline">
                            Last update: {mounted ? userData.lastUpdate.toLocaleTimeString() : "--:--:--"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary min-h-[36px] px-3 py-1.5 rounded-lg bg-white/60 border border-emerald-100/50 hover:bg-white transition-colors touch-manipulation">
                            <Users size={14} className="text-brand" />
                            <span className="hidden sm:inline">Rank #{userData.rank.toLocaleString()} of {userData.totalUsers.toLocaleString()}</span>
                            <span className="sm:hidden">#{userData.rank.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-status-warning min-h-[36px] px-3 py-1.5 rounded-lg bg-white/60 border border-amber-100/50 hover:bg-white transition-colors touch-manipulation">
                            <AlertTriangle size={14} />
                            <span>Risk: {userData.riskScore}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Bento Grid Layout - Mobile First */}
            <div className="bento-grid stagger-children">

                {/* Main Performance Chart - Mobile Optimized */}
                <div className="bento-col-8">
                    <div className="glass-card p-4 md:p-8 h-full flex flex-col bg-background-surface">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4 md:mb-8">
                            <div className="flex-1">
                                <h3 className="stat-label flex items-center gap-2 mb-2 md:mb-0">
                                    <BarChart3 size={16} className="text-brand" />
                                    Portfolio Performance
                                </h3>
                                <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mt-2">
                                    <div>
                                        <span className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter">
                                            GH₵ {userData.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider mt-1">
                                            Total Equity
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg min-h-[36px] self-start md:self-end mb-1 ${userData.dayChange >= 0 ? 'bg-emerald-50 text-status-success border border-emerald-100' : 'bg-red-50 text-status-error border border-red-100'}`}>
                                        {userData.dayChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        <span className="font-black text-sm">
                                            {userData.dayChange >= 0 ? '+' : ''}{userData.dayChange.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-gray-50/80 p-1 rounded-xl border border-border overflow-x-auto touch-manipulation">
                                {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                                    <button
                                        key={range}
                                        className={`px-3 md:px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-200 min-w-[40px] touch-manipulation ${range === '1W'
                                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                                            : 'text-text-tertiary hover:text-text-primary hover:bg-white'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-h-[240px] md:min-h-[320px] w-full">
                            <PortfolioChart />
                        </div>
                    </div>
                </div>

                {/* Enhanced Side Metrics - Mobile Stack */}
                <div className="bento-col-4 space-y-4 md:space-y-6">
                    {/* Account Growth with Trophy */}
                    <div className="glass-card p-5 md:p-6 bg-gradient-to-br from-brand to-brand-accent text-white border-none shadow-xl shadow-brand/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3 md:mb-4 text-white/80 text-xs font-black uppercase tracking-wider">
                                <Trophy size={14} fill="currentColor" /> Monthly Return
                            </div>
                            <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                                +{userData.totalReturn.toFixed(1)}%
                            </div>
                            <p className="text-indigo-100/90 text-xs md:text-sm font-medium leading-relaxed mb-4 md:mb-6">
                                Outperforming <span className="text-white font-bold">87%</span> of traders. <br />You are in the top 15%.
                            </p>
                            <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <span className="text-xs font-bold text-indigo-50 uppercase">Target</span>
                                <div className="flex items-center gap-2">
                                    <Target size={14} className="text-emerald-300" />
                                    <span className="text-sm font-black text-emerald-300">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buying Power with Shield */}
                    <div className="glass-card p-5 md:p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-100/50">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider">
                                <Shield size={14} /> Buying Power
                            </div>
                            <button className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                                <DollarSign size={12} />
                            </button>
                        </div>
                        <div className="text-3xl md:text-4xl font-black text-emerald-900 mb-2 tracking-tight">
                            GH₵ {userData.buyingPower.toLocaleString()}
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-800/70 uppercase">Cash Sim</span>
                                <span className="text-xs font-black text-emerald-800">36.1%</span>
                            </div>
                            <div className="w-full h-2 bg-emerald-100/50 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '36.1%' }}></div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-emerald-600/80">
                                <Clock size={10} />
                                <span>Instant Settlement Available</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Intelligence Hub - Mobile Stacked */}
                <div className="bento-col-12 lg:bento-col-6">
                    <div className="glass-card p-4 md:p-6 bg-background-surface border-border h-full">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="stat-label flex items-center gap-2">
                                <TrendingUp size={16} className="text-brand" />
                                Top Stocks
                            </h3>
                            <Link href="/dashboard/market" className="text-xs font-black text-brand uppercase tracking-wider hover:text-brand-hover flex items-center gap-1 transition-colors min-h-[44px] px-2 touch-manipulation">
                                Explorer <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            {[
                                { symbol: "MTNGH", name: "Scancom PLC", price: 1.55, change: 1.2, trend: "bullish" },
                                { symbol: "EGH", name: "Ecobank Ghana", price: 6.80, change: -0.4, trend: "bearish" },
                            ].map((stock, i) => (
                                <Link
                                    href={`/dashboard/market?symbol=${stock.symbol}`}
                                    key={stock.symbol}
                                    className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-100 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border-2 ${stock.change >= 0 ? "bg-emerald-50 border-emerald-100 text-status-success" : "bg-red-50 border-red-100 text-status-error"}`}>
                                            {stock.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-black text-text-primary text-sm">{stock.symbol}</div>
                                            <div className="text-[10px] font-bold text-text-tertiary uppercase truncate max-w-[100px]">{stock.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-text-primary">GH₵ {stock.price.toFixed(2)}</div>
                                        <div className={`text-[10px] font-black uppercase ${stock.change >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mutual Fund Gems - NEW SECTION */}
                <div className="bento-col-12 lg:bento-col-6">
                    <div className="glass-card p-4 md:p-6 bg-gradient-to-br from-amber-50/30 to-orange-50/30 border-amber-100/50 h-full">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="stat-label flex items-center gap-2">
                                <Layers size={16} className="text-amber-600" />
                                Featured Funds
                            </h3>
                            <Link href="/dashboard/mutual-funds" className="text-xs font-black text-amber-600 uppercase tracking-wider hover:text-amber-700 flex items-center gap-1 transition-colors min-h-[44px] px-2 touch-manipulation">
                                All Funds <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                            {[
                                { name: "EDC Fixed Income", type: "Balanced", nav: 5.82, ytd: 18.4, trend: "up" },
                                { name: "Databank MFund", type: "Money Market", nav: 2.14, ytd: 22.1, trend: "up" },
                            ].map((fund, i) => (
                                <Link
                                    href="/dashboard/mutual-funds"
                                    key={fund.name}
                                    className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-white/60 transition-all duration-200 group border border-transparent hover:border-amber-100 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-black text-amber-600 text-xs border-2 border-amber-200">
                                            {fund.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-black text-amber-900 text-sm">{fund.name}</div>
                                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">{fund.type}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-amber-900 text-sm">NAV {fund.nav.toFixed(2)}</div>
                                        <div className="text-[10px] font-black uppercase text-emerald-600">
                                            +{fund.ytd}% YTD
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Advanced Asset Allocation - Mobile Optimized */}
                <div className="bento-col-6">
                    <div className="glass-card p-4 md:p-6 h-full bg-background-surface border-border">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="stat-label flex items-center gap-2">
                                <PieChart size={16} className="text-brand-accent" />
                                Asset Allocation
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-xs font-black text-brand-accent uppercase tracking-wider hover:text-brand flex items-center gap-1 transition-colors min-h-[44px] px-2 touch-manipulation">
                                Analytics <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 py-2 md:py-4">
                            {/* Enhanced Donut Chart - Mobile Centered */}
                            <div className="relative mx-auto md:mx-0">
                                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[10px] md:border-[12px] border-brand relative flex items-center justify-center shadow-lg shadow-brand/10">
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[10px] md:border-[12px] border-emerald-400 absolute inset-0 m-auto"></div>
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[10px] md:border-[12px] border-amber-400 absolute inset-0 m-auto"></div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-auto w-10 h-10 md:w-12 md:h-12 shadow-sm">
                                        <span className="text-[10px] font-black text-text-primary">GSE</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-white px-3 py-1 rounded-full border border-gray-100 text-[10px] font-black shadow-md text-text-secondary whitespace-nowrap">
                                        Balanced
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 w-full">
                                {[
                                    { label: 'Financial Services', value: 45, color: 'bg-brand', change: '+2.1%' },
                                    { label: 'Technology', value: 30, color: 'bg-emerald-500', change: '+4.7%' },
                                    { label: 'Consumer Goods', value: 15, color: 'bg-amber-500', change: '-0.8%' },
                                    { label: 'Cash Reserve', value: 10, color: 'bg-gray-300', change: '0.0%' },
                                ].map((item) => (
                                    <div key={item.label} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                <span className="text-xs font-bold uppercase text-text-secondary truncate">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs font-black text-text-primary">{item.value}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${item.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Actions Bar - Mobile Optimized */}
            <div className="glass-card p-5 md:p-6 bg-text-primary text-white shadow-xl shadow-indigo-900/20 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black mb-1">Ready to Trade?</h3>
                        <p className="text-indigo-200 text-sm font-medium">Execute your next move with confidence</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link
                            href="/dashboard/market"
                            className="w-full sm:w-auto px-6 py-3.5 bg-white text-text-primary font-black rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-h-[52px] touch-manipulation active:scale-95"
                        >
                            <Eye size={18} className="text-brand" />
                            <span>Explore Markets</span>
                        </Link>
                        <Link
                            href="/dashboard/portfolio"
                            className="w-full sm:w-auto px-6 py-3.5 bg-brand text-white font-black rounded-xl hover:bg-brand-hover transition-all duration-200 flex items-center justify-center gap-2 min-h-[52px] touch-manipulation active:scale-95 border border-white/10"
                        >
                            <Target size={18} />
                            <span>Manage Portfolio</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
