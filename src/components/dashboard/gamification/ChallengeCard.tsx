"use client";

import { Trophy, Clock, Users, Copy, Check, TrendingUp, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Challenge, ChallengeParticipant } from "@/app/actions/challenges";

interface ChallengeCardProps {
    challenge: Challenge & { xp_earned?: number };
    participants?: ChallengeParticipant[];
    currentUserId?: string;
    inviteCode?: string;
}

function daysRemaining(endDate: string): number {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ChallengeCard({
    challenge,
    participants = [],
    currentUserId,
    inviteCode,
}: ChallengeCardProps) {
    const [copied, setCopied] = useState(false);
    const days = daysRemaining(challenge.end_date);
    const isEnded = days === 0;
    const top3 = participants.slice(0, 3);

    const shareUrl = inviteCode
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/challenges/join?code=${inviteCode}`
        : null;

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Header */}
            <div className="relative p-5 bg-gradient-to-br from-primary/8 via-card to-card border-b border-border overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <Trophy size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">
                                    {challenge.title}
                                </h3>
                                {challenge.description && (
                                    <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                                        {challenge.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status badge */}
                        <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                            isEnded
                                ? "bg-muted text-muted-foreground"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}>
                            {isEnded ? "Ended" : "Live"}
                        </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <Clock size={11} />
                            <span>{isEnded ? "Challenge ended" : `${days}d remaining`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <Users size={11} />
                            <span>{participants.length} {participants.length === 1 ? "participant" : "participants"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                            <TrendingUp size={11} />
                            <span>+{challenge.xp_reward} XP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini leaderboard */}
            {top3.length > 0 && (
                <div className="p-4 space-y-2">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Leaderboard
                    </p>
                    {top3.map((p, i) => {
                        const isCurrentUser = p.user_id === currentUserId;
                        const name = p.profile?.full_name?.split(' ')[0] || `Trader ${i + 1}`;
                        const xpEarned = p.xp_earned ?? 0;

                        return (
                            <div
                                key={p.id}
                                className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                                    isCurrentUser ? "bg-primary/5 border border-primary/10" : ""
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className={`text-[11px] font-bold w-4 text-center ${
                                        i === 0 ? "text-amber-500" :
                                        i === 1 ? "text-zinc-400" :
                                        "text-amber-700"
                                    }`}>
                                        #{i + 1}
                                    </span>
                                    <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-xs font-semibold ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                                        {name} {isCurrentUser && <span className="text-[9px] font-normal text-muted-foreground">(you)</span>}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-foreground tabular-nums">
                                    +{xpEarned} XP
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer: share link */}
            {shareUrl && !isEnded && (
                <div className="px-4 pb-4">
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 hover:bg-muted border border-border hover:border-primary/20 rounded-xl transition-all group text-left"
                    >
                        <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate flex-1 mr-2">
                            {shareUrl}
                        </span>
                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-primary">
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "Copied!" : "Share"}
                        </span>
                    </button>
                </div>
            )}
        </motion.div>
    );
}
