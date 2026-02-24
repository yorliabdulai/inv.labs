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
            <div className="relative overflow-hidden rounded-[2px] bg-[#121417] p-8 md:p-12 text-[#F9F9F9] border border-white/10 shadow-3xl group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#C05E42]/5 rounded-full blur-[120px] -mr-32 -mt-32 transition-all group-hover:bg-[#C05E42]/10" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 rounded-[2px] flex items-center justify-center border border-white/10 shadow-2xl group/avatar overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <span className="text-5xl font-black text-white/10 font-instrument-serif group-hover/avatar:text-[#C05E42] transition-colors">
                                    {user?.user_metadata?.full_name?.charAt(0) || "U"}
                                </span>
                            )}
                        </div>
                        <button className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#C05E42] rounded-[2px] flex items-center justify-center border-4 border-[#121417] hover:bg-[#D16D4F] transition-all shadow-2xl active:scale-90 group/edit">
                            <Edit2 size={16} className="text-[#F9F9F9] group-hover/edit:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase font-instrument-serif text-[#F9F9F9]">
                                {user?.user_metadata?.full_name || "Unverified User"}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail size={14} className="text-[#C05E42]" /> {user?.email}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="flex items-center gap-2"><Fingerprint size={14} className="text-[#C05E42]" /> NODE_ID: {user?.id?.slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="px-4 py-1.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-[1px] text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <BadgeCheck size={12} className="fill-current" /> Verified_Analyst
                            </span>
                            <span className="px-4 py-1.5 bg-white/5 text-white/40 border border-white/10 rounded-[1px] text-[9px] font-black uppercase tracking-[0.2em]">
                                Institutional_Tier
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Performance Audit Strip ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-[2px] border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 text-center md:text-left border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.03] transition-colors">
                    <p className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em] mb-3">Executed_Positions</p>
                    <p className="text-3xl font-black text-[#F9F9F9] tabular-nums font-instrument-serif">142</p>
                    <p className="text-[9px] font-black text-[#10B981] mt-3 flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest">
                        <TrendingUp size={12} /> INC_12_CYCLE
                    </p>
                </div>
                <div className="p-8 text-center md:text-left border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.03] transition-colors">
                    <p className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em] mb-3">Alpha_Probability</p>
                    <p className="text-3xl font-black text-[#F9F9F9] tabular-nums font-instrument-serif">68.5%</p>
                    <div className="w-full h-1 bg-white/5 rounded-[1px] mt-6 overflow-hidden">
                        <div className="h-full bg-[#10B981]" style={{ width: '68.5%' }} />
                    </div>
                </div>
                <div className="p-8 text-center md:text-left hover:bg-white/[0.03] transition-colors">
                    <p className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em] mb-3">Node_Tenure</p>
                    <p className="text-3xl font-black text-[#F9F9F9] flex items-center justify-center md:justify-start gap-3 font-instrument-serif">
                        <Calendar size={24} className="text-white/10" />
                        <span className="tabular-nums">JAN 2026</span>
                    </p>
                    <p className="text-[9px] font-black text-white/20 mt-3 uppercase tracking-widest">Active_State: LIVE</p>
                </div>
            </div>

            {/* ── Professional Milestones ── */}
            <div className="bg-white/5 border border-white/10 rounded-[2px] p-10 space-y-12 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Award className="text-[#C05E42]" size={24} />
                        <h3 className="font-black text-xl text-[#F9F9F9] uppercase tracking-tighter font-instrument-sans">Milestone_Certificates</h3>
                    </div>
                    <button className="text-[10px] font-black text-[#C05E42] uppercase tracking-[0.4em] hover:text-[#D16D4F] transition-colors">
                        Audited_Report_PDF
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                    {[
                        { label: "Genesis Block", desc: "Beta Pioneer", icon: Zap, color: "text-[#C05E42] bg-[#C05E42]/10" },
                        { label: "Volume Major", desc: "100+ Positions", icon: Activity, color: "text-[#F9F9F9] bg-white/10" },
                        { label: "Alpha Whale", desc: "GH₵1M Volume", icon: TrendingUp, color: "text-[#10B981] bg-[#10B981]/10" },
                        { label: "Market Guru", desc: "Top 1% Global", icon: Shield, color: "text-white/20 bg-white/5" },
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4 group cursor-help transition-transform hover:-translate-y-1">
                            <div className={`w-20 h-20 rounded-[2px] flex items-center justify-center border border-white/10 transition-all group-hover:shadow-2xl group-hover:border-white/30 ${badge.color}`}>
                                <badge.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-[#F9F9F9] uppercase tracking-widest">{badge.label}</p>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── System Configurations ── */}
            <div className="bg-white/5 border border-white/10 rounded-[2px] overflow-hidden shadow-2xl">
                <div className="px-8 py-5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Terminal_Configuration</h3>
                    <span className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.2em]">GSE Terminal v2.4</span>
                </div>
                <div className="divide-y divide-white/5">
                    {[
                        { icon: Settings, label: "Interface Preferences", desc: "System localization and visual parameters", href: "/settings" },
                        { icon: Bell, label: "Signal Notifications", desc: "Configure real-time market alert thresholds", href: "/settings/notifications" },
                        { icon: Lock, label: "Access Security", desc: "Multi-factor authentication and vault security", href: "/settings/security" },
                        { icon: CreditCard, label: "Subscription Ledger", desc: "Manage institutional billing and plan tiers", href: "/settings/billing" },
                        { icon: Globe, label: "Market Region", desc: "Adjust exchange connectivity and timezones", href: "/settings/region" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="w-full p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all group"
                        >
                            <div className="flex items-center gap-6 text-left">
                                <div className="w-14 h-14 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#C05E42] group-hover:border-[#C05E42]/40 group-hover:shadow-2xl transition-all">
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-[#F9F9F9] uppercase tracking-tight font-instrument-sans">{item.label}</div>
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.1em] mt-1">{item.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-white/10 group-hover:text-[#F9F9F9] group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Critical Actions ── */}
            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={handleSignOut}
                    className="flex-1 py-5 rounded-[2px] bg-white text-[#121417] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[#F9F9F9] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 border-b-4 border-white/20"
                >
                    <LogOut size={20} /> Terminate_Session
                </button>
            </div>

            <div className="text-center space-y-3 pt-8 border-t border-white/5">
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
                    Build_Encryption: AES-256 • Nodes_Active: GSE-ACC-01
                </p>
                <div className="flex items-center justify-center gap-3">
                    <span className="h-1 w-1 bg-[#10B981] rounded-full animate-pulse" />
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Last_Session_Sync: 22 Feb 2026 16:05 GMT
                    </p>
                </div>
            </div>
        </div>
    );
}