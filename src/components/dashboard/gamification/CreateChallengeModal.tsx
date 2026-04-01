"use client";

import { useState } from "react";
import { X, Target, CalendarDays, KeyRound, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createChallenge } from "@/app/actions/challenges";

export function CreateChallengeModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        days: "7",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createChallenge(
                formData.title,
                formData.description,
                parseInt(formData.days),
                100 // default XP reward
            );

            if (!result.success || !result.inviteCode) {
                throw new Error(result.error || 'Failed to create challenge');
            }

            toast({
                title: "Challenge Created!",
                description: "Share the link with your friends to start competing.",
            });

            setInviteLink(`${window.location.origin}/challenges/join?code=${result.inviteCode}`);
            onSuccess();

        } catch (error: unknown) {
            toast({
                title: "Failed To Create",
                description: error instanceof Error ? error.message : "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300 font-sans">
            <div className="relative w-full max-w-lg bg-card border border-border shadow-premium rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-border bg-card/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                            <Target size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-foreground font-bold uppercase tracking-widest text-sm font-syne text-lg">Create Challenge</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Gamified Institutional Learning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-[--text-primary] dark:text-[--text-dark-primary] hover:bg-muted/80 border border-border rounded-xl transition-all" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-8">
                    {inviteLink ? (
                        <div className="space-y-8 py-4">
                            <div className="p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl text-center space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/10 relative z-10">
                                    <Check size={32} className="text-emerald-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-foreground font-bold uppercase tracking-tight text-xl font-syne">Challenge Live!</h3>
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest max-w-[280px] mx-auto mt-3 leading-relaxed">
                                        Your challenge has been commissioned. Invite peers using the secure link below.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Share Invitation Link</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 px-5 py-4 bg-muted border border-border rounded-xl text-xs font-mono text-foreground truncate shadow-inner">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="h-12 px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
                                    >
                                        {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                                        {copied ? "Copied" : "Copy Link"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label htmlFor="challenge-title" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2 cursor-pointer">
                                    <Target size={14} className="text-primary" /> Challenge Identity
                                </label>
                                <input
                                    id="challenge-title"
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. GSE Q1 Trading Competition"
                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl text-xs font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-muted/80 transition-all uppercase tracking-widest shadow-inner"
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="challenge-duration" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2 cursor-pointer">
                                    <CalendarDays size={14} className="text-primary" /> Timeline Duration
                                </label>
                                <div className="relative">
                                    <select
                                        id="challenge-duration"
                                        value={formData.days}
                                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                        className="w-full px-6 py-4 bg-muted border border-border rounded-2xl text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-all uppercase tracking-widest appearance-none shadow-inner"
                                    >
                                        <option value="7" className="bg-card">1 Week Schedule</option>
                                        <option value="14" className="bg-card">2 Weeks Schedule</option>
                                        <option value="30" className="bg-card">1 Month Tenure</option>
                                        <option value="90" className="bg-card">1 Quarter Roadmap</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="challenge-description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Strategic Objective (Optional)</label>
                                <textarea
                                    id="challenge-description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe rules, milestones and goal parameters..."
                                    className="w-full px-6 py-5 bg-muted border border-border rounded-2xl text-xs font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-muted/80 transition-all uppercase tracking-widest resize-none shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.title}
                                className="w-full py-6 bg-primary text-white font-bold rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-20 disabled:grayscale flex justify-center items-center gap-4 mt-4"
                            >
                                {loading ? "Authorizing Parameters..." : "Initialize Segment"}
                                {!loading && <KeyRound size={18} />}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
