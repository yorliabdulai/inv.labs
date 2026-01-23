"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStocks } from "@/lib/market-data";
import { TrendingUp, TrendingDown, RefreshCcw, Briefcase, Plus, Wallet, ShieldCheck, ArrowUpRight } from "lucide-react";
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
        <div className="pb-16 space-y-8">
            <DashboardHeader />

            {/* Performance Snapshot */}
            <div className="bento-grid">
                <div className="bento-col-8">
                    <div className="glass-card p-8 h-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h2 className="stat-label mb-1">Net Portfolio Value</h2>
                                <div className="text-5xl font-black text-[#1A1C4E] tracking-tighter">
                                    GH₵{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className={`flex items-center gap-2 mt-3 text-sm font-black ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                    {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                    <span>{totalGain >= 0 ? "+" : ""}{totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)</span>
                                    <span className="text-gray-400 font-bold uppercase text-[10px] ml-1 tracking-wider">Historical ROI</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right border-l border-gray-100 pl-6">
                                    <div className="stat-label mb-1">Buying Power</div>
                                    <div className="text-2xl font-black text-gray-900">
                                        GH₵{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px]">
                            <PortfolioChart />
                        </div>
                    </div>
                </div>

                <div className="bento-col-4 space-y-6">
                    <div className="glass-card p-6 bg-[#1A1C4E] text-white border-none">
                        <div className="flex items-center gap-2 mb-4 text-indigo-200 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} /> Risk Analysis
                        </div>
                        <div className="text-3xl font-black mb-2 tracking-tight">Balanced</div>
                        <p className="text-indigo-200/70 text-xs font-medium leading-relaxed mb-6">
                            Your portfolio shows optimal diversification across 4 key sectors. Risk exposure is currently mitigated.
                        </p>
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="text-[10px] font-black uppercase">Volatility Index</span>
                            <span className="text-xs font-black text-emerald-400">LOW</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col items-center justify-center">
                        <h3 className="stat-label mb-4 w-full">Asset Allocation</h3>
                        <div className="w-full aspect-square max-w-[180px]">
                            <AllocationChart data={sectorData} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Holdings */}
            <div className="glass-card overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-black text-base flex items-center gap-3 text-[#1A1C4E]">
                        <Briefcase size={20} className="text-indigo-600" /> Active Positions
                    </h3>
                    <div className="flex gap-3">
                        <Link href="/dashboard/market" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            <Plus size={14} strokeWidth={3} /> Rebalance Portfolio
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Security</th>
                                <th className="px-4 py-4 text-right">Position Size</th>
                                <th className="px-4 py-4 text-right">Avg Cost</th>
                                <th className="px-4 py-4 text-right">Live Price</th>
                                <th className="px-8 py-4 text-right">Net Return</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Wallet size={40} className="text-gray-200" />
                                            <p className="text-sm font-bold text-gray-400">Zero active holdings detected.</p>
                                            <Link href="/dashboard/market" className="text-xs font-black text-indigo-600 uppercase hover:underline">Execute First Trade</Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                holdings.map(holding => (
                                    <tr key={holding.symbol} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-[#1A1C4E] text-xs border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all shadow-sm">
                                                    {holding.symbol[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-base">{holding.symbol}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{holding.sector}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <div className="font-mono font-bold text-gray-900">{holding.quantity.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shares</div>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <div className="font-mono font-bold text-gray-500">₵{holding.averageCost.toFixed(2)}</div>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <div className="font-mono font-black text-[#1A1C4E] text-base">₵{holding.currentPrice.toFixed(2)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1">
                                                Real-time <ArrowUpRight size={10} className="text-emerald-500" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={`font-mono font-black text-base ${holding.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                {holding.gain >= 0 ? "+" : ""}₵{holding.gain.toFixed(2)}
                                            </div>
                                            <div className={`text-[10px] font-black uppercase ${holding.gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                {holding.gainPercent >= 0 ? "+" : ""}{holding.gainPercent.toFixed(2)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
