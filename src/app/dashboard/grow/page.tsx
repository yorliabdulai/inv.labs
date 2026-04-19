"use client";

import Link from "next/link";
import { Award, GraduationCap, ChevronRight, Target, Sparkles, TrendingUp } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { XPProgressBar } from "@/components/dashboard/gamification/XPProgressBar";

export default function GrowPage() {
    const { profile, displayName } = useUserProfile();

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header section with User Status */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-bold font-syne tracking-tight text-foreground">
                        Mastery Hub
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        Evolution & Competition • <span className="text-primary font-bold">Growth Map</span>
                    </p>
                </div>

                {profile && (
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                                {profile.level}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-syne">{displayName}</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Current Stature</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <XPProgressBar currentXP={profile.knowledge_xp} level={profile.level} variant="full" />
                        </div>
                    </div>
                )}
            </div>

            {/* Main Hub Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rankings Card */}
                <Link href="/dashboard/leaderboard" className="group relative overflow-hidden bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/40 transition-all duration-500 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 pointer-events-none">
                        <Award size={160} />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-syne mb-2">Global Rankings</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">Companied yourself against the top investors on the GSE. Climb the ranks to unlock exclusive badges and legacy status.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                            Enter Leaderboard <ChevronRight size={16} />
                        </div>
                    </div>
                </Link>

                {/* Education Card */}
                <Link href="/dashboard/learn" className="group relative overflow-hidden bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/40 transition-all duration-500 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 pointer-events-none">
                        <GraduationCap size={160} />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-syne mb-2">Investor Academy</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">Access institutional-grade research modules and accreditation paths. Master market microstructure and valuation frameworks.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                            Launch Academy <ChevronRight size={16} />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                        <Target size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Challenges</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">3 Active</p>
                    </div>
                </div>
                
                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Missions</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Today's Progress</p>
                    </div>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Certificates</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">View All</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
