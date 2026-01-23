"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Award, Shield, Settings, CreditCard, ChevronRight, Mail, Calendar, TrendingUp } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Redirect to Series A Login
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <DashboardHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Identity Card */}
                    <div className="glass-card p-6 text-center relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
                                <span className="text-3xl font-bold text-white">
                                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                {user?.user_metadata?.full_name || "Investory User"}
                            </h2>
                            <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                <Mail size={12} /> {user?.email}
                            </div>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide uppercase">
                                Pro Member
                            </span>
                        </div>
                        {/* Decor */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gray-50 opacity-50 z-0"></div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trading Stats</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Trades</span>
                                <span className="font-mono font-bold text-gray-900">142</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Win Rate</span>
                                <span className="font-mono font-bold text-emerald-500">68.5%</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-600">Member Since</span>
                                <span className="font-mono font-bold text-gray-900 flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-400" /> Jan 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Badges */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Badges Section */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="text-indigo-600" size={24} />
                            <h3 className="font-bold text-lg text-gray-900">Achievements</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="group cursor-pointer">
                                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                                    🏆
                                </div>
                                <div className="text-xs font-bold text-gray-900">Early Bird</div>
                                <div className="text-[10px] text-gray-500">Joined Beta</div>
                            </div>
                            <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-2 grayscale">
                                    📈
                                </div>
                                <div className="text-xs font-bold text-gray-400">Trader</div>
                                <div className="text-[10px] text-gray-400">100 Trades</div>
                            </div>
                            <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-2 grayscale">
                                    🐋
                                </div>
                                <div className="text-xs font-bold text-gray-400">Whale</div>
                                <div className="text-[10px] text-gray-400">GH₵1M Volume</div>
                            </div>
                            <div className="group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-2 grayscale">
                                    🧠
                                </div>
                                <div className="text-xs font-bold text-gray-400">Guru</div>
                                <div className="text-[10px] text-gray-400">Top 1% Rank</div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Menu */}
                    <div className="glass-card p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[
                                { icon: Settings, label: "App Settings", desc: "Theme, Language" },
                                { icon: Shield, label: "Security & Privacy", desc: "2FA, Password" },
                                { icon: CreditCard, label: "Billing & Subscription", desc: "Manage Plan" },
                            ].map((item, i) => (
                                <button key={i} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.label}</div>
                                            <div className="text-xs text-gray-500">{item.desc}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>

                    <div className="text-center text-xs text-gray-400">
                        GSE Labs Stable v2.4.0 • Build 8921
                    </div>
                </div>
            </div>
        </div>
    );
}
