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
        <div className="max-w-4xl mx-auto pb-24 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0 font-instrument-sans">
            <DashboardHeader />

            {/* ── Institutional Identity Card ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#121417] p-8 md:p-12 text-white border border-white/[0.06] shadow-3xl group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] -mr-32 -mt-32 transition-all group-hover:bg-blue-600/10" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-28 h-28 md:w-40 md:h-40 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/[0.06] shadow-2xl group/avatar overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <span className="text-5xl font-bold text-zinc-600 font-instrument-serif group-hover/avatar:text-blue-500 transition-colors">
                                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                                </span>
                            )}
                        </div>
                        <button className="absolute -bottom-3 -right-3 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center border-4 border-[#121417] hover:bg-blue-700 transition-all shadow-2xl active:scale-95 group/edit">
                            <Edit2 size={16} className="text-white group-hover/edit:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase font-instrument-serif text-white">
                                {user?.user_metadata?.full_name || "Unverified User"}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /> {user?.email}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="flex items-center gap-2"><Fingerprint size={14} className="text-blue-500" /> NODE ID: {user?.id?.slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <BadgeCheck size={14} className="fill-current" /> Verified Analyst
                            </span>
                            <span className="px-4 py-1.5 bg-white/[0.03] text-zinc-400 border border-white/[0.06] rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                Institutional Tier
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Performance Audit Strip ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="p-8 text-center md:text-left border-b md:border-b-0 md:border-r border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Executed Positions</p>
                    <p className="text-3xl font-bold text-white tabular-nums font-instrument-serif tracking-tight">142</p>
                    <p className="text-[10px] font-bold text-emerald-500 mt-3 flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest">
                        <TrendingUp size={14} /> +12 THIS CYCLE
                    </p>
                </div>
                <div className="p-8 text-center md:text-left border-b md:border-b-0 md:border-r border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Alpha Probability</p>
                    <p className="text-3xl font-bold text-white tabular-nums font-instrument-serif tracking-tight">68.5%</p>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68.5%' }} />
                    </div>
                </div>
                <div className="p-8 text-center md:text-left hover:bg-white/[0.04] transition-colors">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Node Tenure</p>
                    <p className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 font-instrument-serif tracking-tight">
                        <Calendar size={24} className="text-zinc-600" />
                        <span className="tabular-nums">JAN 2026</span>
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 mt-3 uppercase tracking-widest">Active State: LIVE</p>
                </div>
            </div>

            {/* ── Professional Milestones ── */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 space-y-12 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Award className="text-blue-500" size={24} />
                        <h3 className="font-bold text-xl text-white uppercase tracking-tight font-instrument-sans">Milestone Certificates</h3>
                    </div>
                    <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                        Audited Report PDF
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                    {[
                        { label: "Genesis Block", desc: "Beta Pioneer", icon: Zap, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
                        { label: "Volume Major", desc: "100+ Positions", icon: Activity, color: "text-white bg-white/10 border-white/[0.06]" },
                        { label: "Alpha Whale", desc: "GH₵1M Volume", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                        { label: "Market Guru", desc: "Top 1% Global", icon: Shield, color: "text-zinc-500 bg-white/[0.03] border-white/[0.06]" },
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4 group cursor-help transition-transform hover:-translate-y-1">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all group-hover:shadow-2xl ${badge.color}`}>
                                <badge.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-widest">{badge.label}</p>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── System Configurations ── */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="px-8 py-5 bg-white/[0.01] border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">General Settings</h3>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">GSE Terminal v2.4</span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                    {[
                        { icon: Settings, label: "Interface Preferences", desc: "System localization and visual parameters", href: "/dashboard/settings" },
                        { icon: Bell, label: "Signal Notifications", desc: "Configure real-time market alert thresholds", href: "/dashboard/settings" },
                        { icon: Lock, label: "Access Security", desc: "Multi-factor authentication and vault security", href: "/dashboard/settings" },
                        { icon: CreditCard, label: "Subscription Ledger", desc: "Manage institutional billing and plan tiers", href: "/dashboard/settings" },
                        { icon: Globe, label: "Market Region", desc: "Adjust exchange connectivity and timezones", href: "/dashboard/settings" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => router.push(item.href)}
                            className="w-full p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all group"
                        >
                            <div className="flex items-center gap-6 text-left">
                                <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 group-hover:text-blue-500 group-hover:bg-blue-600/10 group-hover:border-blue-500/30 group-hover:shadow-xl transition-all">
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white uppercase tracking-tight font-instrument-sans">{item.label}</div>
                                    <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1.5">{item.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Critical Actions ── */}
            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={handleSignOut}
                    className="flex-1 py-5 rounded-xl bg-white text-[#121417] font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                >
                    <LogOut size={18} /> Terminate Session
                </button>
            </div>

            <div className="text-center space-y-3 pt-8 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                    Build Encryption: AES-256 • Nodes Active: GSE-ACC-01
                </p>
                <div className="flex items-center justify-center gap-3">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Last Session Sync: 22 Feb 2026 16:05 GMT
                    </p>
                </div>
            </div>
        </div>
    );
}