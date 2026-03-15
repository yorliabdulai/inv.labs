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
            className={`group relative bg-card rounded-2xl p-6 md:p-8 border transition-all duration-300 cursor-pointer shadow-premium hover:border-primary/40 touch-manipulation active:scale-[0.98] overflow-hidden ${isOwned ? "border-primary/30" : "border-border"
                }`}
        >
            {/* ── Ownership Badge ── */}
            {isOwned && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-xl shadow-md z-10 text-[10px] font-bold tracking-widest uppercase">
                    Owned
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-muted/50 text-primary rounded-lg text-[10px] font-bold border border-border uppercase tracking-widest">
                            {fund.fund_type.replace(' Fund', '')}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[--text-primary] dark:text-[--text-dark-primary] group-hover:text-primary transition-colors line-clamp-2 tracking-tighter uppercase font-syne">
                            {fund.fund_name}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                            {fund.fund_manager}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── NAV & Daily Delta ── */}
            <div className="grid grid-cols-1 gap-6 mb-8 p-5 rounded-xl bg-muted/30 border border-border group-hover:bg-muted/50 transition-colors">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Current Nav</div>
                        <div className="text-2xl font-bold text-[--text-primary] dark:text-[--text-dark-primary] tabular-nums tracking-tight">
                            {formatCurrency(fund.current_nav)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Daily Session</div>
                        <div className={`text-sm font-bold flex items-center justify-end gap-1.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="tabular-nums tracking-tight">{formatPercent(dailyChange ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alpha Metrics & Risk ── */}
            <div className="space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">1Y Velocity</div>
                        <div className={`text-xl font-bold tabular-nums tracking-tight ${(performance?.oneYear ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {performance?.oneYear !== undefined ? formatPercent(performance.oneYear) : "—"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Risk Index</div>
                        <div className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 border border-primary/20 rounded-md uppercase tracking-widest">
                            {getRiskRatingLabel(fund.risk_rating)}
                        </div>
                    </div>
                </div>

                {/* ── Risk Node visualization ── */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-primary" />
                            <span>Risk Threshold</span>
                        </div>
                        <span className="text-foreground">{fund.risk_rating}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted border border-border rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`h-full flex-1 transition-all duration-700 rounded-full ${level <= fund.risk_rating
                                    ? "bg-primary"
                                    : "bg-transparent"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Analysis Trigger ── */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between group-hover:border-primary/20 transition-colors">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 uppercase tracking-widest">
                    Technical Analysis
                </span>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-premium">
                    <Info size={16} />
                </div>
            </div>
        </div>
    );
}
