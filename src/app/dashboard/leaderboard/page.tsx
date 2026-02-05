"use client";

import { useState } from "react";
import { Award, Trophy, Medal, ArrowUp, Crown, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function LeaderboardPage() {
    const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly">("weekly");

    // Enhanced Mock Data for Series A feel
    const leaders = [
        { rank: 1, name: "Kofi Mensah", return: 45.3, badges: 12, strategy: "Risk Taker", trend: "up" },
        { rank: 2, name: "Ama Serwaa", return: 38.2, badges: 9, strategy: "Balanced", trend: "up" },
        { rank: 3, name: "Yaw Boateng", return: 32.1, badges: 8, strategy: "Value", trend: "down" },
        { rank: 4, name: "Kwame (You)", return: 24.5, badges: 3, strategy: "Growth", trend: "neutral", isUser: true },
        { rank: 5, name: "Adwoa Manu", return: 18.2, badges: 5, strategy: "Dividend", trend: "up" },
        { rank: 6, name: "Esi Darko", return: 15.4, badges: 4, strategy: "Tech Focus", trend: "down" },
    ];

    const userRank = leaders.findIndex(l => l.isUser) + 1;

    return (
        <div className="pb-20 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Weekly Challenge Banner - Mobile Optimized */}
            <div className="glass-card p-4 md:p-8 relative overflow-hidden text-white bg-gradient-to-br from-indigo-600 to-purple-600">
                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                            <Trophy size={14} /> Weekly League • Week 3
                        </div>
                        <h2 className="text-xl md:text-2xl font-black mb-2">Technicals Master Challenge</h2>
                        <p className="text-indigo-100 text-sm max-w-md">
                            Achieve the highest Sharpe ratio with a portfolio beta under 1.2 to win the 'Quantitative Analyst' badge.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 md:p-4 rounded-xl text-center min-w-[120px]">
                        <div className="text-[10px] md:text-xs text-indigo-200 mb-1">Time Remaining</div>
                        <div className="text-lg md:text-xl font-mono font-black">2d 14h 45m</div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Time Period Filters - Mobile Optimized */}
            <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-white to-slate-50 border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-black text-[#1A1C4E]">Rankings</h3>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Filter</span>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar touch-manipulation">
                    {[
                        { key: "daily", label: "Daily" },
                        { key: "weekly", label: "Weekly" },
                        { key: "monthly", label: "Monthly" },
                    ].map((period) => (
                        <button
                            key={period.key}
                            onClick={() => setTimeFilter(period.key as typeof timeFilter)}
                            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap border min-h-[44px] touch-manipulation active:scale-95 transition-all ${
                                timeFilter === period.key
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Highlight Card - Mobile Optimized */}
            {userRank > 0 && (
                <div className="glass-card p-4 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white text-lg md:text-xl flex-shrink-0">
                                {leaders[userRank - 1].name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-gray-900 text-base md:text-lg mb-1">
                                    Your Rank: #{userRank}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600">
                                    {leaders[userRank - 1].return.toFixed(1)}% return • {leaders[userRank - 1].badges} badges
                                </div>
                            </div>
                        </div>
                        <button className="px-3 md:px-4 py-2 bg-indigo-600 text-white font-black rounded-xl text-xs md:text-sm hover:bg-indigo-700 transition-all min-h-[44px] touch-manipulation active:scale-95">
                            View Details
                        </button>
                    </div>
                </div>
            )}

            {/* Leaderboard - Card-Based on Mobile, Table on Desktop */}
            <div className="glass-card overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_0.5fr] px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div>Rank</div>
                    <div>Trader</div>
                    <div>Strategy</div>
                    <div className="text-right">Total Return</div>
                    <div className="text-right">Trend</div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {leaders.map((leader) => (
                        <div
                            key={leader.rank}
                            className={`p-4 ${leader.isUser ? "bg-indigo-50/50" : ""}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {leader.rank === 1 && <Crown size={24} className="text-yellow-500" />}
                                        {leader.rank === 2 && <Medal size={24} className="text-gray-400" />}
                                        {leader.rank === 3 && <Medal size={24} className="text-amber-700" />}
                                        {leader.rank > 3 && (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-sm">
                                                #{leader.rank}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-base flex-shrink-0 ${
                                        leader.isUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                    }`}>
                                        {leader.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-black text-sm md:text-base mb-1 ${leader.isUser ? "text-indigo-900" : "text-gray-900"}`}>
                                            {leader.name}
                                            {leader.isUser && (
                                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">You</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Award size={12} /> {leader.badges} Badges
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Strategy</div>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                            {leader.strategy}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Return</div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-emerald-500 text-base">
                                                +{leader.return.toFixed(1)}%
                                            </span>
                                            {leader.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
                                            {leader.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                                            {leader.trend === 'neutral' && <Minus size={16} className="text-gray-400" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block divide-y divide-gray-100">
                    {leaders.map((leader) => (
                        <div
                            key={leader.rank}
                            className={`grid grid-cols-[0.5fr_2fr_1fr_1fr_0.5fr] items-center px-6 py-4 hover:bg-gray-50/50 transition-colors ${leader.isUser ? "bg-indigo-50/50" : ""}`}
                        >
                            <div className="font-bold text-lg text-gray-400 w-8">
                                {leader.rank === 1 && <Crown size={20} className="text-yellow-500" />}
                                {leader.rank === 2 && <Medal size={20} className="text-gray-400" />}
                                {leader.rank === 3 && <Medal size={20} className="text-amber-700" />}
                                {leader.rank > 3 && `#${leader.rank}`}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                    leader.isUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}>
                                    {leader.name.charAt(0)}
                                </div>
                                <div>
                                    <div className={`font-bold ${leader.isUser ? "text-indigo-900" : "text-gray-900"}`}>
                                        {leader.name} {leader.isUser && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">You</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Award size={12} /> {leader.badges} Badges
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                    {leader.strategy}
                                </span>
                            </div>

                            <div className="text-right font-mono font-bold text-emerald-500">
                                +{leader.return.toFixed(1)}%
                            </div>

                            <div className="flex justify-end text-gray-400">
                                {leader.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
                                {leader.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                                {leader.trend === 'neutral' && <Minus size={16} className="text-gray-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}