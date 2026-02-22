"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Award, Shield, Settings, CreditCard, ChevronRight, Mail, Calendar, TrendingUp, Edit2, Bell, Lock, Globe } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useUserProfile } from "@/lib/useUserProfile";

export default function ProfilePage() {
    const { user, loading } = useUserProfile();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="pb-20 space-y-4 md:space-y-8">
            <DashboardHeader />

            {/* Identity Card - Mobile Optimized */}
            <div className="glass-card p-4 md:p-8 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-2xl md:text-3xl font-black text-white">
                                {user?.user_metadata?.full_name?.charAt(0) || "U"}
                            </span>
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-indigo-700 transition-colors touch-manipulation active:scale-95">
                            <Edit2 size={14} className="text-white" />
                        </button>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-gray-900 mb-1">
                        {user?.user_metadata?.full_name || "Investory User"}
                    </h2>
                    <div className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 flex items-center justify-center gap-1 flex-wrap">
                        <Mail size={12} /> {user?.email || "user@example.com"}
                    </div>
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black tracking-wide uppercase">
                        Pro Member
                    </span>
                </div>
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-20 md:h-24 bg-gray-50 opacity-50 z-0"></div>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="glass-card p-0 overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trading Stats</h3>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="p-4 text-center">
                        <div className="text-xl md:text-2xl font-black text-gray-900 mb-1">142</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Trades</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-xl md:text-2xl font-black text-emerald-500 mb-1">68.5%</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Win Rate</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-xl md:text-2xl font-black text-indigo-600 mb-1 flex items-center justify-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span>Jan 2026</span>
                        </div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Member Since</div>
                    </div>
                </div>
            </div>

            {/* Achievements - Mobile Optimized */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2">
                        <Award className="text-indigo-600" size={20} />
                        <h3 className="font-black text-base md:text-lg text-gray-900">Achievements</h3>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors min-h-[44px] px-2 touch-manipulation">
                        View All
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <div className="group cursor-pointer touch-manipulation active:scale-95">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-yellow-100 rounded-xl flex items-center justify-center text-xl md:text-2xl mb-2 group-hover:scale-110 transition-transform">
                            🏆
                        </div>
                        <div className="text-xs font-black text-gray-900">Early Bird</div>
                        <div className="text-[10px] text-gray-500">Joined Beta</div>
                    </div>
                    <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity touch-manipulation active:scale-95">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-xl md:text-2xl mb-2 grayscale">
                            📈
                        </div>
                        <div className="text-xs font-black text-gray-400">Trader</div>
                        <div className="text-[10px] text-gray-400">100 Trades</div>
                    </div>
                    <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity touch-manipulation active:scale-95">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-xl md:text-2xl mb-2 grayscale">
                            🐋
                        </div>
                        <div className="text-xs font-black text-gray-400">Whale</div>
                        <div className="text-[10px] text-gray-400">GH₵1M Volume</div>
                    </div>
                    <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity touch-manipulation active:scale-95">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-xl md:text-2xl mb-2 grayscale">
                            🧠
                        </div>
                        <div className="text-xs font-black text-gray-400">Guru</div>
                        <div className="text-[10px] text-gray-400">Top 1% Rank</div>
                    </div>
                </div>
            </div>

            {/* Preferences Menu - Mobile Optimized */}
            <div className="glass-card p-0 overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {[
                        { icon: Settings, label: "App Settings", desc: "Theme, Language", href: "/dashboard/settings" },
                        { icon: Bell, label: "Notifications", desc: "Alerts & Updates", href: "/dashboard/settings/notifications" },
                        { icon: Shield, label: "Security & Privacy", desc: "2FA, Password", href: "/dashboard/settings/security" },
                        { icon: CreditCard, label: "Billing & Subscription", desc: "Manage Plan", href: "/dashboard/settings/billing" },
                        { icon: Globe, label: "Language & Region", desc: "Localization", href: "/dashboard/settings/language" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group min-h-[64px] touch-manipulation active:bg-gray-50"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                                    <item.icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm md:text-base font-black text-gray-900">{item.label}</div>
                                    <div className="text-xs md:text-sm text-gray-500">{item.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Sign Out Button - Mobile Optimized */}
            <button
                onClick={handleSignOut}
                className="w-full py-4 rounded-xl border-2 border-red-200 text-red-600 font-black hover:bg-red-50 transition-colors flex items-center justify-center gap-2 min-h-[52px] touch-manipulation active:scale-95"
            >
                <LogOut size={18} /> Sign Out
            </button>

            {/* Version Info */}
            <div className="text-center text-xs text-gray-400 pb-4">
                GSE Labs Stable v2.4.0 • Build 8921
            </div>
        </div>
    );
}