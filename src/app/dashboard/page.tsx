"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";

export default function DashboardPage() {
    // Mock User Data
    const user = {
        name: "Kwame",
        balance: 12450.00,
        dayChange: 2.5,
        totalReturn: 24.5,
        buyingPower: 4500.00
    };

    return (
        <div className="space-y-8 pb-12">
            <DashboardHeader userInitial={user.name[0]} />

            {/* Bento Grid Layout */}
            <div className="bento-grid">

                {/* Main Performance Chart - span 8 */}
                <div className="bento-col-8">
                    <div className="glass-card p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="stat-label">Portfolio Performance</h3>
                                <div className="flex items-end gap-3 mt-1">
                                    <span className="text-3xl font-black text-[#1A1C4E]">GH₵ {user.balance.toLocaleString()}</span>
                                    <span className="mb-1 text-sm font-bold text-emerald-500 flex items-center gap-1">
                                        <TrendingUp size={14} /> +8.5%
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {['1D', '1W', '1M', '1Y', 'ALL'].map((range) => (
                                    <button
                                        key={range}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${range === '1W' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <PortfolioChart />
                        </div>
                    </div>
                </div>

                {/* Side Metrics - span 4 */}
                <div className="bento-col-4 space-y-6">
                    {/* Key Stat: Total Return */}
                    <div className="glass-card p-6 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
                        <div className="flex items-center gap-2 mb-4 text-indigo-100 text-[10px] font-black uppercase tracking-[0.1em]">
                            <Zap size={14} fill="currentColor" /> Account Growth
                        </div>
                        <div className="text-4xl font-black tracking-tighter mb-2">
                            +{user.totalReturn}%
                        </div>
                        <p className="text-indigo-100/80 text-xs font-medium leading-relaxed">
                            Your portfolio is outperforming 85% of simulator participants this month.
                        </p>
                    </div>

                    {/* Key Stat: Buying Power */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">
                            <DollarSign size={14} /> Buying Power
                        </div>
                        <div className="text-2xl font-black text-[#1A1C4E]">
                            GH₵ {user.buyingPower.toLocaleString()}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Cash Reserve</span>
                            <span className="text-xs font-black text-gray-900">36.1%</span>
                        </div>
                    </div>
                </div>

                {/* Market Movers - span 6 */}
                <div className="bento-col-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="stat-label flex items-center gap-2">
                                <Activity size={14} className="text-indigo-600" /> Market Watch
                            </h3>
                            <Link href="/dashboard/market" className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:underline flex items-center gap-1">
                                Full Market <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {[
                                { symbol: "MTNGH", name: "Scancom PLC", price: 1.55, change: 1.2 },
                                { symbol: "EGH", name: "Ecobank Ghana", price: 6.80, change: -0.4 },
                                { symbol: "CAL", name: "Cal Bank", price: 0.65, change: 2.1 },
                            ].map((stock, i) => (
                                <Link
                                    href={`/dashboard/market?symbol=${stock.symbol}`}
                                    key={stock.symbol}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#1A1C4E] text-xs border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                            {stock.symbol[0]}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-sm">{stock.symbol}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">{stock.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-900 text-sm">GH₵ {stock.price.toFixed(2)}</div>
                                        <div className={`text-[10px] font-black ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Portfolio Mix - span 6 */}
                <div className="bento-col-6">
                    <div className="glass-card p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="stat-label flex items-center gap-2">
                                <PieChart size={14} className="text-indigo-600" /> Asset Allocation
                            </h3>
                            <Link href="/dashboard/portfolio" className="text-[10px] font-black text-indigo-600 uppercase tracking-wider hover:underline flex items-center gap-1">
                                Details <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 py-4">
                            <div className="w-32 h-32 rounded-full border-[12px] border-indigo-600 relative flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-[12px] border-emerald-500"></div>
                                <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                                    <span className="bg-white px-2 py-0.5 rounded-full border border-gray-100 text-[10px] font-black shadow-sm text-gray-600">Diverse</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                {[
                                    { label: 'Financials', value: 45, color: 'bg-indigo-600' },
                                    { label: 'Technology', value: 30, color: 'bg-emerald-500' },
                                    { label: 'Other', value: 25, color: 'bg-gray-200' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                                            <span>{item.label}</span>
                                            <span>{item.value}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
