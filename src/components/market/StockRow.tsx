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

export function StockRow({ stock, holding, compact = false }: StockRowProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { profile, refetch } = useUserProfile();
    const userBalance = profile?.cash_balance ?? 0;
    const isOwned = !!holding && holding.qty > 0;

    // Deterministic sparkline seeded from symbol (no flicker on re-renders)
    const history = useMemo(() => {
        const seed = stock.symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const pseudo = (n: number) => {
            const x = Math.sin(n + seed) * 10000;
            return x - Math.floor(x);
        };
        const pts = Array.from({ length: 16 }, (_, i) =>
            stock.price + (pseudo(i) - 0.5) * (stock.price * 0.04)
        );
        pts[pts.length - 1] = isPositive ? stock.price * 1.005 : stock.price * 0.995;
        return pts;
    }, [stock.symbol, stock.price, isPositive]);

    if (compact) {
        return (
            <>
                <div
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group border-b border-white/10 last:border-b-0 font-instrument-sans"
                    onClick={() => setIsModalOpen(true)}
                >
                    {/* Symbol Icon */}
                    <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center font-black text-[10px] flex-shrink-0 tracking-widest border border-white/10 ${isPositive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-red-500/10 text-red-500"}`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-[#F9F9F9] text-xs uppercase tracking-widest">{stock.symbol}</span>
                            {isOwned && <CheckCircle2 size={12} className="text-[#C05E42] flex-shrink-0" />}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest truncate mt-0.5">{stock.name}</div>
                    </div>
                    <div className="w-20 h-8 flex-shrink-0 opacity-50">
                        <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                    </div>
                    <div className="text-right flex-shrink-0 w-28">
                        <div className="font-black text-[#F9F9F9] text-sm tabular-nums tracking-tighter">GH₵{stock.price.toFixed(2)}</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isPositive ? "text-[#10B981]" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                    <button
                        className="ml-4 px-4 py-2 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] hover:bg-[#C05E42]/90 transition-all text-[10px] uppercase tracking-widest flex-shrink-0 min-h-[36px] shadow-lg shadow-[#C05E42]/10"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                    >
                        TRANS_EXEC
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
                className={`bg-white/5 rounded-[2px] p-6 shadow-2xl transition-all duration-300 cursor-pointer group border flex flex-col h-full font-instrument-sans ${isOwned ? "border-[#C05E42]/40" : "border-white/10 hover:border-white/20"
                    }`}
                onClick={() => setIsModalOpen(true)}
            >
                {/* Ownership Label */}
                {isOwned && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#C05E42]/10 px-2 py-0.5 rounded-[1px] border border-[#C05E42]/20">
                        <CheckCircle2 size={10} className="text-[#C05E42]" />
                        <span className="text-[8px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Asset Owned</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-[2px] flex items-center justify-center font-black text-xs border flex-shrink-0 tracking-[0.1em] ${isPositive ? "bg-[#10B981]/5 border-[#10B981]/20 text-[#10B981]" : "bg-red-500/5 border-red-500/20 text-red-500"
                        }`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em] group-hover:text-[#C05E42] transition-colors">{stock.symbol}</h3>
                            {isPositive ? <TrendingUp size={14} className="text-[#10B981]" /> : <TrendingDown size={14} className="text-red-500" />}
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest truncate leading-tight">{stock.name}</p>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1 block">{stock.sector}</span>
                    </div>
                </div>

                {/* Price & Primary Meta */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <div className="text-2xl font-black text-[#F9F9F9] tabular-nums tracking-tighter">
                            GH₵{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-black flex items-center gap-1.5 mt-1 uppercase tracking-widest ${isPositive ? "text-[#10B981]" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            <span className="text-[8px] text-white/20">/ session</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Vol 24H</div>
                        <div className="text-xs font-black text-[#F9F9F9] uppercase tracking-widest">{(stock.volume / 1000).toFixed(1)}K</div>
                    </div>
                </div>

                {/* Sparkline Visualization */}
                <div className="h-12 w-full mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                </div>

                {/* Position Summary Strip */}
                {isOwned && holding && (
                    <div className="bg-[#C05E42]/5 rounded-[1px] p-4 mb-6 border border-[#C05E42]/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-[#C05E42]/60 uppercase tracking-widest">Performance</span>
                            <span className={`text-[11px] font-black tabular-nums ${holding.pnl >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                                {holding.pnl >= 0 ? "+" : ""}GH₵{Math.abs(holding.pnl).toFixed(2)} ({holding.pnlPct >= 0 ? "+" : ""}{holding.pnlPct.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest">
                            <span>{holding.qty} Units</span>
                            <span>@ {holding.avgCost.toFixed(2)}</span>
                            <span>Val: {holding.currentValue.toFixed(2)}</span>
                        </div>
                        {/* P&L Vector */}
                        <div className="h-1 bg-white/5 rounded-[1px] overflow-hidden">
                            <div
                                className={`h-full rounded-[1px] transition-all duration-1000 ${holding.pnl >= 0 ? "bg-[#10B981]" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, Math.abs(holding.pnlPct) * 5)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Direct Action Interface */}
                <div className="flex gap-2 mt-auto">
                    <button
                        className="flex-1 py-3 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] transition-all text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-[#C05E42]/10 hover:shadow-[#C05E42]/20 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                    >
                        TRADE_INDEX
                    </button>
                    <button
                        className="px-5 py-3 bg-white/5 text-white/40 font-bold rounded-[2px] hover:bg-white/10 hover:text-[#F9F9F9] transition-all text-xs min-h-[44px] border border-white/10"
                        onClick={(e) => e.stopPropagation()}
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
