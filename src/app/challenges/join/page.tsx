"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, Users, Clock, Zap, ArrowRight, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getChallengePreview, joinChallenge, type ChallengePreview } from "@/app/actions/challenges";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function daysRemaining(endDate: string): number {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function JoinPageContent() {
    const router = useRouter();
    const params = useSearchParams();
    const code = params.get('code') || '';

    const [preview, setPreview] = useState<ChallengePreview | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    // Load preview (no auth needed)
    useEffect(() => {
        if (!code) { setLoadingPreview(false); return; }
        getChallengePreview(code)
            .then(p => setPreview(p))
            .finally(() => setLoadingPreview(false));
    }, [code]);

    // Check auth state
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setIsLoggedIn(!!data.user);
        });
    }, []);

    const handleJoin = async () => {
        if (!isLoggedIn) {
            // Redirect to login, come back after
            router.push(`/login?redirect=/challenges/join?code=${code}`);
            return;
        }

        setJoining(true);
        setError(null);

        const result = await joinChallenge(code);
        if (result.success) {
            router.push(`/dashboard?joined=${result.challengeId}`);
        } else {
            setError(result.error || "Failed to join challenge. Please try again.");
            setJoining(false);
        }
    };

    if (!code) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle size={40} className="text-muted-foreground mx-auto" />
                    <h1 className="text-xl font-bold text-foreground">Invalid Link</h1>
                    <p className="text-sm text-muted-foreground">This challenge link appears to be incomplete. Ask the organiser to share the link again.</p>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingPreview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Loading challenge...</p>
                </div>
            </div>
        );
    }

    if (!preview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle size={40} className="text-red-500 mx-auto" />
                    <h1 className="text-xl font-bold text-foreground">Challenge Not Found</h1>
                    <p className="text-sm text-muted-foreground">
                        This challenge may have ended or the invite code is invalid.
                    </p>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const days = daysRemaining(preview.end_date);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 font-sans">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ChevronLeft size={14} />
                    inv.labs
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Card */}
                    <div className="bg-card border border-border rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden">

                        {/* Hero banner */}
                        <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-background p-8 border-b border-border overflow-hidden">
                            <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -15 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
                                    className="w-20 h-20 rounded-2xl bg-primary shadow-2xl shadow-primary/30 flex items-center justify-center"
                                >
                                    <Trophy size={36} className="text-white" />
                                </motion.div>

                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        Challenge Invite
                                    </p>
                                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                        {preview.title}
                                    </h1>
                                    {preview.description && (
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
                                            {preview.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                            <div className="flex flex-col items-center py-5 px-3 text-center">
                                <Clock size={14} className="text-muted-foreground mb-1.5" />
                                <p className="text-lg font-bold text-foreground tabular-nums">{days}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">days left</p>
                            </div>
                            <div className="flex flex-col items-center py-5 px-3 text-center">
                                <Users size={14} className="text-muted-foreground mb-1.5" />
                                <p className="text-lg font-bold text-foreground tabular-nums">{preview.participant_count}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    {preview.participant_count === 1 ? "member" : "members"}
                                </p>
                            </div>
                            <div className="flex flex-col items-center py-5 px-3 text-center">
                                <Zap size={14} className="text-amber-500 mb-1.5" />
                                <p className="text-lg font-bold text-primary tabular-nums">+{preview.xp_reward}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">XP reward</p>
                            </div>
                        </div>

                        {/* Creator & CTA */}
                        <div className="p-8 space-y-6">
                            {preview.creator_name && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground border border-border">
                                        {preview.creator_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Organised by</p>
                                        <p className="text-xs font-semibold text-foreground">{preview.creator_name}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            {/* Join CTA */}
                            <motion.button
                                onClick={handleJoin}
                                disabled={joining || days === 0}
                                whileHover={{ scale: joining ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl text-sm tracking-wide shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {joining ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Joining...
                                    </>
                                ) : days === 0 ? (
                                    "Challenge Has Ended"
                                ) : isLoggedIn === false ? (
                                    <>
                                        Sign in to Join Challenge
                                        <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        Join Challenge
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </motion.button>

                            <p className="text-center text-[11px] text-muted-foreground">
                                {isLoggedIn === false
                                    ? "You'll be asked to sign in, then automatically joined."
                                    : "You'll be added to the leaderboard immediately."}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-[11px] text-muted-foreground">
                            Powered by <span className="font-bold text-primary">inv.labs</span> · Learn. Simulate. Invest.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function ChallengeJoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        }>
            <JoinPageContent />
        </Suspense>
    );
}
