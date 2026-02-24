"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    LogOut, User, Award, Shield, Settings, CreditCard,
    ChevronRight, Mail, Calendar, TrendingUp, Edit2,
    Bell, Lock, Globe, BadgeCheck,
    Fingerprint, Activity, Zap
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useUserProfile } from "@/lib/useUserProfile";

export default function ProfilePage() {
    const { user, loading: profileLoading } = useUserProfile();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0">
            <DashboardHeader />

            {/* Institutional Identity Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-500">
                                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                                </span>
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center border-4 border-slate-950 hover:bg-indigo-500 transition-all shadow-xl active:scale-90">
                            <Edit2 size={14} className="text-white" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {user?.user_metadata?.full_name || "Unverified User"}
                            </h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-slate-400 text-sm">
                                <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block" />
                                <span className="flex items-center gap-1.5"><Fingerprint size={14} /> ID: {user?.id?.slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Shield size={12} className="fill-current" /> Verified Professional
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                Institutional Access
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Audit strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-6 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Executed Positions</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">142</p>
                    <p className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center justify-center md:justify-start gap-1">
                        <TrendingUp size={10} /> +12 this month
                    </p>
                </div>
                <div className="p-6 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Success Probability</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">68.5%</p>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: '68.5%' }} />
                    </div>
                </div>
                <div className="p-6 text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Tenure</p>
                    <p className="text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                        <Calendar size={20} className="text-slate-300" />
                        <span className="tabular-nums">Jan 2026</span>
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">Active Status</p>
                </div>
            </div>

            {/* Professional Milestones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="text-indigo-600" size={20} />
                        <h3 className="font-bold text-lg text-slate-900">Milestone Certificates</h3>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Audited Report</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: "Genesis Block", desc: "Beta Pioneer", icon: Zap, color: "text-amber-500 bg-amber-50" },
                        { label: "Volume Major", desc: "100+ Positions", icon: Activity, color: "text-indigo-600 bg-indigo-50" },
                        { label: "Alpha Whale", desc: "GH₵1M Volume", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                        { label: "Market Guru", desc: "Top 1% Global", icon: Shield, color: "text-slate-600 bg-slate-50" },
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-3 group cursor-help">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg ${badge.color}`}>
                                <badge.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">{badge.label}</p>
                                <p className="text-[10px] font-medium text-slate-400">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Configurations */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Configuration</h3>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">GSE Terminal v2.4</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { icon: Settings, label: "Interface Preferences", desc: "System localization and visual parameters", href: "/settings" },
                        { icon: Bell, label: "Signal Notifications", desc: "Configure real-time market alert thresholds", href: "/settings/notifications" },
                        { icon: Lock, label: "Access Security", desc: "Multi-factor authentication and vault security", href: "/settings/security" },
                        { icon: CreditCard, label: "Subscription Ledger", desc: "Manage institutional billing and plan tiers", href: "/settings/billing" },
                        { icon: Globe, label: "Market Region", desc: "Adjust exchange connectivity and timezones", href: "/settings/region" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all group"
                        >
                            <div className="flex items-center gap-5 text-left">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:shadow-sm transition-all">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{item.label}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-0.5">{item.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Critical Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleSignOut}
                    className="flex-1 py-4 rounded-2xl bg-white border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                    <LogOut size={18} /> Terminate Session
                </button>
            </div>

            <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Build Encryption: AES-256 • Nodes Active: GSE-ACC-01
                </p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-tighter">
                    Last Session Sync: 22 Feb 2026 16:05 GMT
                </p>
            </div>
        </div>
    );
}