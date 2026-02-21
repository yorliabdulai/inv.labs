"use client";

import type { Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Bookmark } from "lucide-react";
import { useState } from "react";
import { TradeModal } from "@/components/trade/TradeModal";
import { Sparkline } from "./Sparkline";
import { useUserProfile } from "@/lib/useUserProfile";

interface StockRowProps {
    stock: Stock;
}

export function StockRow({ stock }: StockRowProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { profile, refetch } = useUserProfile();
    const userBalance = profile?.cash_balance ?? 0;

    // Mock history for sparkline
    const history = Array.from({ length: 15 }, () => {
        return stock.price + (Math.random() - 0.5) * (stock.price * 0.05);
    });

    if (isPositive) {
        history.push(stock.price * 1.01);
    } else {
        history.push(stock.price * 0.99);
    }

    return (
        <>
            <div
                className="bg-white rounded-[24px] p-4 md:p-6 shadow-premium hover:shadow-2xl hover:shadow-indigo-100/50 transition-shadow duration-300 cursor-pointer group border border-gray-100 hover:border-indigo-200 touch-manipulation"
                onClick={() => setIsModalOpen(true)}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-xs md:text-sm border-2 transition-all duration-200 flex-shrink-0 ${isPositive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 group-active:bg-emerald-500 group-active:text-white"
                            : "bg-red-50 border-red-200 text-red-700 group-active:bg-red-500 group-active:text-white"
                            }`}>
                            {stock.symbol.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-lg font-black text-[#1A1C4E] group-hover:text-indigo-600 transition-colors truncate">
                                    {stock.symbol}
                                </h3>
                                {isPositive && <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />}
                                {!isPositive && <TrendingDown size={14} className="text-red-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stock.name}</p>
                            <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stock.sector}</div>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-indigo-600 opacity-40 md:opacity-100 hover:opacity-100 min-h-[44px] min-w-[44px] touch-manipulation flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle bookmark
                        }}
                    >
                        <Bookmark size={16} />
                    </button>
                </div>

                {/* Price & Change */}
                <div className="flex items-end justify-between mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="text-xl md:text-2xl font-black text-[#1A1C4E] font-mono">
                            GH₵{stock.price.toFixed(2)}
                        </div>
                        <div className={`text-xs md:text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'} flex items-center gap-1 mt-1`}>
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            <span className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">24h</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-wider">Volume</div>
                        <div className="text-xs md:text-sm font-black text-gray-800">{(stock.volume / 1000).toFixed(1)}K</div>
                    </div>
                </div>

                {/* Sparkline Chart */}
                <div className="mb-3 md:mb-4">
                    <div className="h-12 md:h-16 w-full">
                        <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        className="flex-1 py-3 md:py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors duration-200 text-xs md:text-sm shadow-lg shadow-indigo-100 min-h-[48px] touch-manipulation"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                    >
                        Trade
                    </button>
                    <button
                        className="px-4 md:px-4 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors duration-200 text-xs md:text-sm min-h-[48px] min-w-[80px] touch-manipulation"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle watch
                        }}
                    >
                        Watch
                    </button>
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={userBalance}
                onSuccess={() => {
                    setIsModalOpen(false);
                    refetch();
                }}
            />
        </>
    );
}
