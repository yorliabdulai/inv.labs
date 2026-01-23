"use client";

import { Award, Trophy, Medal, ArrowUp, Crown } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function LeaderboardPage() {
    // Enhanced Mock Data for Series A feel
    const leaders = [
        { rank: 1, name: "Kofi Mensah", return: 45.3, badges: 12, strategy: "Risk Taker", trend: "up" },
        { rank: 2, name: "Ama Serwaa", return: 38.2, badges: 9, strategy: "Balanced", trend: "up" },
        { rank: 3, name: "Yaw Boateng", return: 32.1, badges: 8, strategy: "Value", trend: "down" },
        { rank: 4, name: "Kwame (You)", return: 24.5, badges: 3, strategy: "Growth", trend: "neutral", isUser: true },
        { rank: 5, name: "Adwoa Manu", return: 18.2, badges: 5, strategy: "Dividend", trend: "up" },
        { rank: 6, name: "Esi Darko", return: 15.4, badges: 4, strategy: "Tech Focus", trend: "down" },
    ];

    return (
        <div style={{ paddingBottom: "2rem" }}>
            <DashboardHeader />

            {/* Weekly Challenge Banner */}
            <div className="glass-card mb-8 relative overflow-hidden text-white" style={{
                background: "linear-gradient(135deg, #3730A3 0%, #312E81 100%)",
                padding: "2rem",
                borderRadius: "16px"
            }}>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                            <Trophy size={14} /> Weekly League • Week 3
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Technicals Master Challenge</h2>
                        <p className="text-indigo-100 max-w-md text-sm">
                            Achieve the highest Sharpe ratio with a portfolio beta under 1.2 to win the 'Quantitative Analyst' badge.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl text-center">
                            <div className="text-xs text-indigo-200 mb-1">Time Remaining</div>
                            <div className="text-xl font-mono font-bold">2d 14h 45m</div>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Leaderboard Table */}
            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_0.5fr] px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div>Rank</div>
                    <div>Trader</div>
                    <div>Strategy</div>
                    <div className="text-right">Total Return</div>
                    <div className="text-right">Trend</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {leaders.map((leader) => (
                        <div
                            key={leader.rank}
                            className={`grid grid-cols-[0.5fr_2fr_1fr_1fr_0.5fr] items-center px-6 py-4 hover:bg-gray-50/50 transition-colors ${leader.isUser ? "bg-indigo-50/50" : ""
                                }`}
                        >
                            <div className="font-bold text-lg text-gray-400 w-8">
                                {leader.rank === 1 && <Crown size={20} className="text-yellow-500" />}
                                {leader.rank === 2 && <Medal size={20} className="text-gray-400" />}
                                {leader.rank === 3 && <Medal size={20} className="text-amber-700" />}
                                {leader.rank > 3 && `#${leader.rank}`}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${leader.isUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
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
                                {leader.trend === 'up' && <ArrowUp size={16} className="text-emerald-500" />}
                                {leader.trend === 'down' && <ArrowUp size={16} className="text-red-500 rotate-180" />}
                                {leader.trend === 'neutral' && <div className="w-1.5 h-1.5 rounded-full bg-gray-300 my-2 mx-1"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
