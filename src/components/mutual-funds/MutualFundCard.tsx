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
            className={`group relative bg-white/5 rounded-[2px] p-6 md:p-8 border transition-all duration-500 cursor-pointer hover:bg-white/[0.08] touch-manipulation active:scale-[0.98] font-instrument-sans overflow-hidden shadow-2xl ${isOwned ? "border-[#C05E42]/40" : "border-white/10 hover:border-[#C05E42]/40"
                }`}
        >
            {/* ── Ownership Badge ── */}
            {isOwned && (
                <div className="absolute top-0 right-0 bg-[#C05E42] text-[#F9F9F9] px-4 py-1.5 rounded-bl-[2px] shadow-2xl z-10 text-[8px] font-black uppercase tracking-[0.3em]">
                    ACQUIRED
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/5 text-[#C05E42] rounded-[1px] text-[8px] font-black uppercase tracking-[0.2em] border border-white/10">
                            {fund.fund_type.replace(' Fund', '').toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#F9F9F9] group-hover:text-[#C05E42] transition-colors truncate font-instrument-sans uppercase tracking-tight">
                            {fund.fund_name}
                        </h3>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">
                            {fund.fund_manager}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── NAV & Daily Delta ── */}
            <div className="grid grid-cols-1 gap-6 mb-8 p-6 rounded-[2px] bg-white/[0.02] border border-white/5">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Current_NAV</div>
                        <div className="text-2xl font-black text-[#F9F9F9] font-instrument-serif tracking-tighter">
                            {formatCurrency(fund.current_nav)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">24H_Delta</div>
                        <div className={`text-sm font-black flex items-center justify-end gap-2 ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="font-instrument-serif">{formatPercent(dailyChange ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alpha Metrics & Risk ── */}
            <div className="space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">1Y_Return</div>
                        <div className={`text-xl font-black font-instrument-serif tracking-tighter ${(performance?.oneYear ?? 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {performance?.oneYear !== undefined ? formatPercent(performance.oneYear) : "—"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Intensity</div>
                        <div className="text-[10px] font-black text-[#C05E42] uppercase tracking-widest bg-[#C05E42]/10 px-3 py-1 border border-[#C05E42]/20 rounded-[1px]">
                            {getRiskRatingLabel(fund.risk_rating).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* ── Risk Node visualization ── */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-[0.3em]">
                        <div className="flex items-center gap-2">
                            <Shield size={12} className="text-[#C05E42]" />
                            <span className="text-white/20 uppercase">Risk_Profile</span>
                        </div>
                        <span className="text-[#F9F9F9]">{fund.risk_rating}/5</span>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 rounded-[1px] overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`h-full flex-1 transition-all duration-700 ${level <= fund.risk_rating
                                    ? "bg-[#C05E42]"
                                    : 'bg-white/5'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Analysis Trigger ── */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-[#C05E42]/20 transition-colors">
                <span className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    ACCESS_NODE_INTEL
                </span>
                <div className="w-10 h-10 rounded-[2px] bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#C05E42] group-hover:text-[#F9F9F9] transition-all">
                    <Info size={16} />
                </div>
            </div>
        </div>
    );
}
