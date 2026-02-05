"use client";

import { type MutualFund, getFundTypeColor, getRiskRatingColor, formatCurrency, formatPercent } from "@/lib/mutual-funds-data";
import { TrendingUp, TrendingDown, Star, Info } from "lucide-react";

interface MutualFundCardProps {
    fund: MutualFund;
    onClick?: () => void;
    performance?: {
        ytd?: number;
        oneYear?: number;
    };
}

export function MutualFundCard({ fund, onClick, performance }: MutualFundCardProps) {
    const fundColor = getFundTypeColor(fund.fund_type);
    const riskColor = getRiskRatingColor(fund.risk_rating);

    // Calculate daily change (mock for now, would come from NAV history)
    const dailyChange = Math.random() * 2 - 1; // -1% to +1%
    const isPositive = dailyChange >= 0;

    return (
        <div
            onClick={onClick}
            className="glass-card p-4 md:p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-indigo-200 touch-manipulation active:scale-[0.98]"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                        {fund.fund_name}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                        {fund.fund_manager}
                    </p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-${fundColor}-50 text-${fundColor}-700 border border-${fundColor}-200 whitespace-nowrap ml-2`}>
                    {fund.fund_type.replace(' Fund', '')}
                </div>
            </div>

            {/* NAV Display */}
            <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl md:text-3xl font-black text-gray-900">
                        {formatCurrency(fund.current_nav)}
                    </span>
                    <span className="text-xs font-bold text-gray-500 uppercase">NAV</span>
                </div>
                <div className={`flex items-center gap-1 text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{formatPercent(dailyChange)}</span>
                    <span className="text-xs font-medium text-gray-400">Today</span>
                </div>
            </div>

            {/* Performance Metrics */}
            {performance && (
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">YTD Return</div>
                        <div className={`text-base font-black ${(performance.ytd || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercent(performance.ytd || 0)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">1-Year Return</div>
                        <div className={`text-base font-black ${(performance.oneYear || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatPercent(performance.oneYear || 0)}
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Rating */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Risk</span>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={12}
                                className={`${star <= fund.risk_rating
                                        ? `fill-${riskColor}-500 text-${riskColor}-500`
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                <div className="text-xs font-bold text-gray-500">
                    Min: {formatCurrency(fund.minimum_investment)}
                </div>
            </div>

            {/* Hover Effect Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">View Details</span>
                <Info size={14} className="text-indigo-600" />
            </div>
        </div>
    );
}
