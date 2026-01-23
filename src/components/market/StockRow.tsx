"use client";

import type { Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { TradeModal } from "@/components/trade/TradeModal";
import { Sparkline } from "./Sparkline";

interface StockRowProps {
    stock: Stock;
}

export function StockRow({ stock }: StockRowProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                className="group flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1.2fr_0.4fr] items-center px-6 py-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer mb-3"
                onClick={() => setIsModalOpen(true)}
            >
                {/* Security Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border transition-colors ${isPositive
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                            : "bg-red-50 border-red-100 text-red-600 group-hover:bg-red-500 group-hover:text-white"
                        }`}>
                        {stock.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#1A1C4E]">{stock.symbol}</h3>
                            {isPositive && <ArrowUpRight size={14} className="text-emerald-500" />}
                            {!isPositive && <ArrowDownRight size={14} className="text-red-500" />}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{stock.name}</p>
                    </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col items-end md:items-start w-full md:w-auto mt-4 md:mt-0">
                    <div className="text-lg font-black text-[#1A1C4E] font-mono">
                        ₵{stock.price.toFixed(2)}
                    </div>
                    <div className="stat-label text-[9px]">Last Price</div>
                </div>

                {/* Day Change */}
                <div className="w-full md:w-auto mt-2 md:mt-0">
                    <div className={`flex items-center gap-1.5 font-black text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="stat-label text-[9px]">24h Delta</div>
                </div>

                {/* Performance Curve */}
                <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex-1 h-8 min-w-[100px]">
                        <Sparkline data={history} color={isPositive ? "#10B981" : "#EF4444"} />
                    </div>
                    <div className="text-right hidden xl:block">
                        <div className="text-[11px] font-black text-gray-900 font-mono">{(stock.volume / 1000).toFixed(1)}K</div>
                        <div className="stat-label text-[9px]">Volume</div>
                    </div>
                </div>

                {/* Options */}
                <div className="hidden md:flex justify-end w-full">
                    <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-300 hover:text-indigo-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={12450}
            />
        </>
    );
}
