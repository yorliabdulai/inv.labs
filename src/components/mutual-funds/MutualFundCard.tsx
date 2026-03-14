"use client";

import {
    type MutualFund,
    getFundTypeColor,
    getRiskRatingColor,
    formatCurrency,
    formatPercent,
    getRiskRatingLabel
} from "@/lib/mutual-funds-data";
import { TrendingUp, TrendingDown, Info, Shield, CheckCircle2 } from "lucide-react";

interface MutualFundCardProps {
    fund: MutualFund;
    onClick?: () => void;
    dailyChange?: number;
    performance?: {
        ytd?: number;
        oneYear?: number;
    };
    isOwned?: boolean;
}

export function MutualFundCard({ fund, onClick, dailyChange, performance, isOwned }: MutualFundCardProps) {
    const fundColor = getFundTypeColor(fund.fund_type);
    const riskColor = getRiskRatingColor(fund.risk_rating);
    const isPositive = (dailyChange ?? 0) >= 0;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white/[0.02] rounded-2xl p-6 md:p-8 border transition-all duration-300 cursor-pointer hover:bg-white/[0.04] touch-manipulation active:scale-[0.98] overflow-hidden shadow-2xl ${isOwned ? "border-blue-500/30" : "border-white/[0.05] hover:border-white/[0.1]"
                }`}
        >
            {/* ── Ownership Badge ── */}
            {isOwned && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-xl shadow-md z-10 text-[10px] font-bold tracking-wide">
                    OWNED
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/[0.03] text-blue-400 rounded-lg text-xs font-semibold border border-white/[0.06]">
                            {fund.fund_type.replace(' Fund', '')}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate tracking-tight">
                            {fund.fund_name}
                        </h3>
                        <p className="text-xs font-medium text-zinc-500 mt-1">
                            {fund.fund_manager}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── NAV & Daily Delta ── */}
            <div className="grid grid-cols-1 gap-6 mb-8 p-5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Current NAV</div>
                        <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                            {formatCurrency(fund.current_nav)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Daily Change</div>
                        <div className={`text-sm font-semibold flex items-center justify-end gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{formatPercent(dailyChange ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alpha Metrics & Risk ── */}
            <div className="space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">1Y Return</div>
                        <div className={`text-xl font-bold tabular-nums tracking-tight ${(performance?.oneYear ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {performance?.oneYear !== undefined ? formatPercent(performance.oneYear) : "—"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Risk Level</div>
                        <div className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 border border-blue-500/20 rounded-md">
                            {getRiskRatingLabel(fund.risk_rating)}
                        </div>
                    </div>
                </div>

                {/* ── Risk Node visualization ── */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 text-xs font-semibold text-zinc-500">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-zinc-600" />
                            <span>Risk Profile</span>
                        </div>
                        <span className="text-white">{fund.risk_rating}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`h-full flex-1 transition-all duration-700 rounded-full ${level <= fund.risk_rating
                                    ? "bg-blue-500"
                                    : "bg-transparent"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Analysis Trigger ── */}
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between group-hover:border-blue-500/20 transition-colors">
                <span className="text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    View Details
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-zinc-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Info size={14} />
                </div>
            </div>
        </div>
    );
}
