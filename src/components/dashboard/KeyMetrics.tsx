"use client";

import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export function KeyMetrics({ balance, dayChange, totalReturn }: { balance: number, dayChange: number, totalReturn: number }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* Total Balance */}
            <div className="glass-card" style={{ padding: "1.25rem", gridColumn: "span 2" }}>
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <DollarSign size={14} /> Total Equity
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                    GH₵ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className={`font-bold ${dayChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                    </span>
                    <span className="text-gray-400">Today</span>
                </div>
            </div>

            {/* P&L */}
            <div className="glass-card" style={{ padding: "1rem" }}>
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp size={14} /> P&L
                </div>
                <div className="font-bold text-lg text-emerald-600">
                    +GH₵ {((balance * totalReturn) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Return</div>
            </div>

            {/* Buying Power */}
            <div className="glass-card" style={{ padding: "1rem" }}>
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <PieChart size={14} /> Cash
                </div>
                <div className="font-bold text-lg text-gray-700">
                    GH₵ {(balance * 0.4).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-gray-400 mt-1">Buying Power</div>
            </div>
        </div>
    );
}
