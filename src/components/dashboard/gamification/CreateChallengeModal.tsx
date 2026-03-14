"use client";

import { useState } from "react";
import { X, Target, CalendarDays, KeyRound, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

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
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({ title: "Auth Required", description: "You must be logged in to create a challenge", variant: "destructive" });
                return;
            }

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(formData.days));

            const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            const { data, error } = await supabase.from('challenges').insert({
                creator_id: user.id,
                title: formData.title,
                description: formData.description,
                end_date: endDate.toISOString(),
                invite_code: randomCode,
            }).select().single();

            if (error) throw error;

            toast({
                title: "Challenge Created!",
                description: "Share the code with your friends to start competing.",
            });

            // Generate link based on current origin
            setInviteLink(`${window.location.origin}/dashboard/challenges/join?code=${data.invite_code}`);
            onSuccess();

        } catch (error: any) {
            toast({
                title: "Failed To Create",
                description: error.message || "Something went wrong.",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 font-instrument-sans">
            <div className="relative w-full max-w-lg bg-[#0D0F12] border border-white/[0.06] shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/[0.06] bg-[#0D0F12]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 shadow-xl shadow-blue-600/5">
                            <Target size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold uppercase tracking-widest text-sm font-instrument-serif text-lg">Create Challenge</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Gamified Institutional Learning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all" aria-label="Close">
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
                                    <h3 className="text-white font-bold uppercase tracking-tight text-xl font-instrument-serif">Challenge Live!</h3>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest max-w-[280px] mx-auto mt-3 leading-relaxed">
                                        Your challenge has been commissioned. Invite peers using the secure link below.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Share Invitation Link</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-mono text-white truncate shadow-inner">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="h-12 px-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Target size={14} className="text-blue-500" /> Challenge Identity
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. GSE Q1 Trading Competition"
                                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-xs font-bold text-white placeholder:text-zinc-800 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all uppercase tracking-widest shadow-inner"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <CalendarDays size={14} className="text-blue-500" /> Timeline Duration
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.days}
                                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest appearance-none shadow-inner"
                                    >
                                        <option value="7" className="bg-[#0D0F12]">1 Week Schedule</option>
                                        <option value="14" className="bg-[#0D0F12]">2 Weeks Schedule</option>
                                        <option value="30" className="bg-[#0D0F12]">1 Month Tenure</option>
                                        <option value="90" className="bg-[#0D0F12]">1 Quarter Roadmap</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Strategic Objective (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe rules, milestones and goal parameters..."
                                    className="w-full px-6 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-xs font-bold text-white placeholder:text-zinc-800 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all uppercase tracking-widest resize-none shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.title}
                                className="w-full py-6 bg-blue-600 text-white font-bold rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-20 disabled:grayscale flex justify-center items-center gap-4 mt-4"
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
