"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export const KeyMetrics = React.memo(function KeyMetrics({ balance, dayChange, totalReturn }: { balance: number, dayChange: number, totalReturn: number }) {
    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Total Balance */}
            <div className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <DollarSign size={14} /> Total Equity
                </div>
                <div className="text-3xl font-bold text-white tracking-tight leading-none">
                    GH₵ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`font-semibold bg-white/[0.05] px-2 py-0.5 rounded-md ${dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                    </span>
                    <span className="text-zinc-500 font-medium tracking-wide">Today</span>
                </div>
            </div>

            {/* P&L */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                    <TrendingUp size={14} /> P&L
                </div>
                <div>
                    <div className="font-bold text-lg text-emerald-400 tracking-tight">
                        +GH₵ {((balance * totalReturn) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-medium tracking-wide">Total Return</div>
                </div>
            </div>

            {/* Buying Power */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                    <PieChart size={14} /> Cash
                </div>
                <div>
                    <div className="font-bold text-lg text-zinc-200 tracking-tight">
                        GH₵ {(balance * 0.4).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-medium tracking-wide">Buying Power</div>
                </div>
            </div>
        </div>
    );
});
