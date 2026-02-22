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
            className={`group relative bg-white rounded-3xl p-5 md:p-6 border transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-100/50 touch-manipulation active:scale-[0.98] ${isOwned ? "border-indigo-200 ring-1 ring-indigo-50" : "border-gray-100 hover:border-indigo-200"
                }`}
        >
            {/* Ownership Badge */}
            {isOwned && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white z-10">
                    <CheckCircle2 size={16} strokeWidth={3} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-${fundColor}-50 text-${fundColor}-700 border border-${fundColor}-100`}>
                            {fund.fund_type.replace(' Fund', '')}
                        </span>
                        {isOwned && (
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Portfolio</span>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-[#1A1C4E] group-hover:text-indigo-600 transition-colors truncate">
                        {fund.fund_name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                        {fund.fund_manager}
                    </p>
                </div>
            </div>

            {/* NAV & Daily Change */}
            <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current NAV</div>
                    <div className="text-xl font-black text-[#1A1C4E] font-mono">
                        {formatCurrency(fund.current_nav)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">24h Change</div>
                    <div className={`text-sm font-black flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{formatPercent(dailyChange ?? 0)}</span>
                    </div>
                </div>
            </div>

            {/* Selection/Risk Visual */}
            <div className="space-y-4">
                {/* Performance Preview */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">1Y Return</div>
                        <div className={`text-base font-black ${(performance?.oneYear ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {performance?.oneYear !== undefined ? formatPercent(performance.oneYear) : "—"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Risk Level</div>
                        <div className={`text-xs font-black text-${riskColor}-600 uppercase`}>
                            {getRiskRatingLabel(fund.risk_rating)}
                        </div>
                    </div>
                </div>

                {/* Risk Progress Bar */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <Shield size={12} className={`text-${riskColor}-500`} />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Risk Profile</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-900">{fund.risk_rating}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`h-full flex-1 transition-all duration-500 ${level <= fund.risk_rating
                                        ? `bg-${riskColor}-500 opacity-${100 - (5 - level) * 10}`
                                        : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Allocation Indicators */}
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white" title="Stocks" />
                        <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Bonds" />
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white" title="Cash" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Diversified Asset Mix
                    </span>
                </div>
            </div>

            {/* Hover Action */}
            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between group-hover:border-indigo-100 transition-colors">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Analyze fund
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Info size={14} />
                </div>
            </div>
        </div>
    );
}
