"use client";

import { useRouter } from "next/navigation";
import {
    LogOut, User, Award, Shield, Settings, CreditCard,
    ChevronRight, Mail, Calendar, TrendingUp, Edit2,
    Bell, Lock, Globe, BadgeCheck,
    Fingerprint, Activity, Zap, ShieldCheck, Trophy
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useUserProfile } from "@/lib/useUserProfile";
import { supabase } from "@/lib/supabase/client";
import { LevelBadge } from "@/components/dashboard/gamification/LevelBadge";
import { AchievementsPanel } from "@/components/dashboard/gamification/AchievementsPanel";
import { InvestorJourneyMap } from "@/components/dashboard/gamification/InvestorJourneyMap";
import { FoundingMemberBadge } from "@/components/dashboard/gamification/FoundingMemberBanner";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const { user, profile, loading: profileLoading, displayName, displayInitial } = useUserProfile();
    const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
    const [timeoutError, setTimeoutError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (profileLoading) {
            timer = setTimeout(() => {
                setTimeoutError(true);
            }, 8000);
        } else {
            setTimeoutError(false);
        }
        return () => clearTimeout(timer);
    }, [profileLoading]);

    useEffect(() => {
        if (user) {
            const fetchPromise = supabase.from('user_achievements').select('achievement_key').eq('user_id', user.id);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
            
            Promise.race([fetchPromise, timeoutPromise])
                .then((result: any) => {
                    const data = result.data;
                    if (data) setEarnedAchievements(data.map((a: any) => a.achievement_key));
                })
                .catch(err => {
                    console.error("Failed to load achievements", err);
                });
        }
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (timeoutError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <ShieldCheck size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2 uppercase font-syne">Data Access Failed</h3>
                <p className="text-red-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Profile synchronization timed out.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 text-[10px] uppercase tracking-widest active:scale-95"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0 font-sans">
            <DashboardHeader />

            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Trader Portfolio</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                        Institutional Analytics & Accreditation
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        Accreditation Path: Tier 1
                    </p>
                </div>
            </div>

            {/* ── Main Profile Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Identity & Stats */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-premium backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-muted/30 border border-border flex items-center justify-center font-bold text-3xl text-primary shadow-premium transition-transform group-hover:scale-105 overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        displayInitial
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 z-20">
                                    <LevelBadge level={profile?.level || 1} className="scale-110" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-foreground mb-1 font-syne tracking-tight flex items-center gap-2">
                                    {displayName}
                                    {profile?.is_founding_member && <FoundingMemberBadge className="mt-1" />}
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8 truncate max-w-full px-4">
                                    Professional ID: GH-{profile?.id.substring(0, 8)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-lg font-bold text-foreground">Level {profile?.level || 1}</div>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">XP Points</div>
                                    <div className="text-lg font-bold text-foreground tabular-nums tracking-tight">{profile?.knowledge_xp || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-premium">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <ShieldCheck size={14} className="text-primary" /> Security Baseline
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">Portfolio Health</span>
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Optimized</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[84%] rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="w-full py-3.5 bg-muted/30 hover:bg-muted font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-border text-foreground">
                                    Enable 2FA
                                </button>
                                <button className="w-full py-3.5 bg-muted/30 hover:bg-muted font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-border text-foreground">
                                    Export Ledger
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Analytics & Identity Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* ── Intelligence Factor ── */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-premium overflow-hidden relative group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                            <div>
                                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-1.5">Intelligence Factor</h4>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Global Ranking Percentile: Top 1.2%</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Consistency</div>
                                    <div className="text-lg font-bold text-foreground tabular-nums tracking-tight">88.4</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Growth</div>
                                    <div className="text-lg font-bold text-primary tabular-nums tracking-tight">+14.2%</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* ── Investor Evolution Track ── */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                                        <TrendingUp size={14} className="text-primary" /> Investor Evolution Track
                                    </h4>
                                </div>
                                <InvestorJourneyMap currentLevel={profile?.level || 1} />
                            </div>

                            {/* ── Achievements & Milestones ── */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                                        <Trophy size={14} className="text-primary" /> Achievements & Milestones
                                    </h4>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{earnedAchievements.length} Unlocked</span>
                                </div>
                                <AchievementsPanel earnedAchievementKeys={earnedAchievements} />
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed Strip */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-premium">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                                <Activity size={14} className="text-primary" /> Active Terminal Sessions
                            </h4>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">Live Stream</span>
                        </div>
                        <div className="space-y-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0 group cursor-pointer hover:px-2 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                        <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Market Order Executed: GSE-GCB</div>
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2m ago</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-widest rounded-xl border border-border transition-all">
                            View Full Activity Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Professional Badges ── */}
            <div className="bg-card border border-border rounded-2xl p-10 space-y-12 shadow-premium backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Award className="text-primary" size={24} />
                        <h3 className="font-bold text-xl text-foreground uppercase tracking-tight font-sans">Milestone Certificates</h3>
                    </div>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors">
                        Audited Report PDF
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                    {[
                        { label: "Genesis Block", desc: "Beta Pioneer", icon: Zap, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
                        { label: "Volume Major", desc: "100+ Positions", icon: Activity, color: "text-foreground bg-muted/30 border-border" },
                        { label: "Alpha Whale", desc: "GH₵1M Volume", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                        { label: "Market Guru", desc: "Top 1% Global", icon: Shield, color: "text-muted-foreground bg-muted/30 border-border" },
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-4 group cursor-help transition-transform hover:-translate-y-1">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all group-hover:shadow-xl ${badge.color}`}>
                                <badge.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground uppercase tracking-widest">{badge.label}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── System Configurations ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-premium">
                <div className="px-8 py-5 bg-muted/30 border-b border-border flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">General Settings</h3>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        GSE Terminal v2.4
                    </span>
                </div>
                <div className="divide-y divide-border">
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
                            className="w-full p-8 flex items-center justify-between hover:bg-muted/30 transition-all group"
                        >
                            <div className="flex items-center gap-6 text-left">
                                <div className="w-14 h-14 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:shadow-xl transition-all">
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-foreground uppercase tracking-tight font-sans">{item.label}</div>
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1.5">{item.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Critical Actions ── */}
            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={handleSignOut}
                    className="flex-1 py-5 rounded-xl bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                    <LogOut size={18} /> Terminate Session
                </button>
            </div>

            <div className="text-center space-y-3 pt-8 border-t border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Build Encryption: AES-256 • Nodes Active: GSE-ACC-01
                </p>
                <div className="flex items-center justify-center gap-3">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Last Session Sync: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
