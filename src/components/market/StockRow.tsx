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
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-50 last:border-b-0"
                    onClick={() => setIsModalOpen(true)}
                >
                    {/* Symbol */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-900 text-sm">{stock.symbol}</span>
                            {isOwned && <CheckCircle2 size={12} className="text-indigo-500 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                    </div>
                    <div className="w-16 h-8 flex-shrink-0">
                        <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                    </div>
                    <div className="text-right flex-shrink-0 w-24">
                        <div className="font-black text-gray-900 text-sm">GH₵{stock.price.toFixed(2)}</div>
                        <div className={`text-xs font-black ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                    <button
                        className="ml-2 px-3 py-1.5 bg-indigo-600 text-white font-black rounded-lg hover:bg-indigo-700 transition-colors text-xs flex-shrink-0 min-h-[32px]"
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
                    onSuccess={() => { setIsModalOpen(false); refetch(); }}
                />
            </>
        );
    }

    return (
        <>
            <div
                className={`bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 cursor-pointer group border hover:border-indigo-200 touch-manipulation relative ${isOwned ? "border-indigo-100 ring-1 ring-indigo-100/50" : "border-gray-100"
                    }`}
                onClick={() => setIsModalOpen(true)}
            >
                {/* Ownership badge */}
                {isOwned && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        <CheckCircle2 size={10} className="text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">Owned</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border-2 flex-shrink-0 ${isPositive ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                        }`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="text-base font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{stock.symbol}</h3>
                            {isPositive ? <TrendingUp size={13} className="text-emerald-500" /> : <TrendingDown size={13} className="text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stock.sector}</span>
                    </div>
                </div>

                {/* Price & Change */}
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <div className="text-xl font-black text-gray-900 font-mono">
                            GH₵{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-xs font-black flex items-center gap-1 mt-0.5 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            <span className="text-[10px] font-medium text-gray-400">today</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Vol</div>
                        <div className="text-xs font-black text-gray-700">{(stock.volume / 1000).toFixed(1)}K</div>
                    </div>
                </div>

                {/* Sparkline */}
                <div className="h-10 w-full mb-3">
                    <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                </div>

                {/* Holdings P&L strip — shown only when user owns this stock */}
                {isOwned && holding && (
                    <div className="bg-indigo-50 rounded-xl p-3 mb-3 border border-indigo-100">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">Your position</span>
                            <span className={`text-xs font-black ${holding.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {holding.pnl >= 0 ? "+" : ""}GH₵{Math.abs(holding.pnl).toFixed(2)} ({holding.pnlPct >= 0 ? "+" : ""}{holding.pnlPct.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-indigo-700 font-bold">
                            <span>{holding.qty} shares</span>
                            <span>Avg GH₵{holding.avgCost.toFixed(2)}</span>
                            <span>GH₵{holding.currentValue.toFixed(2)} now</span>
                        </div>
                        {/* P&L progress bar */}
                        <div className="mt-2 h-1 bg-indigo-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${holding.pnl >= 0 ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${Math.min(100, Math.abs(holding.pnlPct) * 5)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        className="flex-1 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors text-xs shadow-lg shadow-indigo-100 min-h-[40px] touch-manipulation"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                    >
                        Trade
                    </button>
                    <button
                        className="px-4 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-xs min-h-[40px] touch-manipulation border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Bookmark size={14} />
                    </button>
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={userBalance}
                onSuccess={() => { setIsModalOpen(false); refetch(); }}
            />
        </>
    );
}
