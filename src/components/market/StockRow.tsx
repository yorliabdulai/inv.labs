"use client";

import type { Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Bookmark, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { TradeModal } from "@/components/trade/TradeModal";
import { Sparkline } from "./Sparkline";
import { useUserProfile } from "@/lib/useUserProfile";

export interface StockHolding {
    qty: number;
    avgCost: number;
    currentValue: number;
    pnl: number;
    pnlPct: number;
}

interface StockRowProps {
    stock: Stock;
    holding?: StockHolding;
    compact?: boolean; // list view mode
}

// ⚡ BOLT OPTIMIZATION: Extracted seed generation and history computation
// out of the component body. This prevents re-calculating the O(n) seed reduction
// on every re-render and allows memoizing the sparkline generator across rows.
const generateSparkline = (symbol: string, price: number, isPositive: boolean) => {
    const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const pseudo = (n: number) => {
        const x = Math.sin(n + seed) * 10000;
        return x - Math.floor(x);
    };
    const pts = Array.from({ length: 16 }, (_, i) =>
        price + (pseudo(i) - 0.5) * (price * 0.04)
    );
    pts[pts.length - 1] = isPositive ? price * 1.005 : price * 0.995;
    return pts;
};

export function StockRow({ stock, holding, compact = false }: StockRowProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { profile, refetch } = useUserProfile();
    const userBalance = profile?.cash_balance ?? 0;
    const isOwned = !!holding && holding.qty > 0;

    // Deterministic sparkline seeded from symbol (no flicker on re-renders)
    const history = useMemo(() => {
        return generateSparkline(stock.symbol, stock.price, isPositive);
    }, [stock.symbol, stock.price, isPositive]);

    if (compact) {
        return (
            <>
                <div
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.04] transition-colors cursor-pointer group border-b border-white/[0.06] last:border-b-0"
                    onClick={() => setIsModalOpen(true)}
                >
                    {/* Symbol Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 tracking-widest border ${isPositive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight">{stock.symbol}</span>
                            {isOwned && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Owned" />}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium truncate mt-0.5">{stock.name}</div>
                    </div>
                    <div className="w-20 h-8 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Sparkline data={history} color={isPositive ? "#34d399" : "#f87171"} />
                    </div>
                    <div className="text-right flex-shrink-0 w-28">
                        <div className="font-bold text-white text-sm tabular-nums tracking-tight">GH₵{stock.price.toFixed(2)}</div>
                        <div className={`text-xs font-semibold mt-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                    <button
                        className="ml-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 active:scale-95 transition-all text-xs flex-shrink-0 min-h-[36px] shadow-sm shadow-blue-500/20"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                    >
                        Trade
                    </button>
                </div>
                <TradeModal
                    stock={stock}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userBalance={userBalance}
                    onSuccess={() => { refetch(); }}
                />
            </>
        );
    }

    return (
        <>
            <div
                className={`bg-white/[0.02] rounded-2xl p-6 transition-all duration-300 cursor-pointer group border flex flex-col h-full hover:bg-white/[0.04] ${isOwned ? "border-blue-500/30" : "border-white/[0.05] hover:border-white/[0.1]"
                    }`}
                onClick={() => setIsModalOpen(true)}
            >
                {/* Ownership Label */}
                {isOwned && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                        <CheckCircle2 size={12} className="text-blue-400" />
                        <span className="text-[10px] font-semibold text-blue-400 tracking-wide">Owned</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border flex-shrink-0 tracking-wider ${isPositive ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-500"
                        }`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white tracking-tight">{stock.symbol}</h3>
                            {isPositive ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-500" />}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate leading-tight">{stock.name}</p>
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-1 block">{stock.sector}</span>
                    </div>
                </div>

                {/* Price & Primary Meta */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                            GH₵{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-[11px] font-semibold flex items-center gap-1.5 mt-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            <span className="text-[10px] text-zinc-600 font-medium">today</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">Volume</div>
                        <div className="text-sm font-bold text-white tracking-tight">{(stock.volume / 1000).toFixed(1)}K</div>
                    </div>
                </div>

                {/* Sparkline Visualization */}
                <div className="h-12 w-full mb-6 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={history} color={isPositive ? "#34d399" : "#f87171"} />
                </div>

                {/* Position Summary Strip */}
                {isOwned && holding && (
                    <div className="bg-blue-500/5 rounded-xl p-4 mb-6 border border-blue-500/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-widest">Position</span>
                            <span className={`text-[11px] font-bold tabular-nums ${holding.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {holding.pnl >= 0 ? "+" : ""}GH₵{Math.abs(holding.pnl).toFixed(2)} ({holding.pnlPct >= 0 ? "+" : ""}{holding.pnlPct.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                            <span>{holding.qty} Units</span>
                            <span>Avg <span className="text-zinc-300 font-semibold">{holding.avgCost.toFixed(2)}</span></span>
                            <span>Val <span className="text-zinc-300 font-semibold">{holding.currentValue.toFixed(2)}</span></span>
                        </div>
                        {/* P&L Vector */}
                        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${holding.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, Math.abs(holding.pnlPct) * 5)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Direct Action Interface */}
                <div className="flex gap-2 mt-auto">
                    <button
                        className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all text-xs border border-transparent hover:bg-blue-500 active:scale-[0.98] min-h-[44px] shadow-sm shadow-blue-500/20"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                    >
                        Trade Asset
                    </button>
                    <button
                        className="px-5 py-3 bg-white/[0.03] text-zinc-400 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all min-h-[44px] border border-white/[0.05]"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Add to watchlist"
                    >
                        <Bookmark size={15} />
                    </button>
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={userBalance}
                onSuccess={() => { refetch(); }}
            />
        </>
    );
}
