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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-in fade-in duration-300 font-instrument-sans">
            <div className="relative w-full max-w-lg bg-[#121417] border border-white/10 rounded-[2px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[2px] bg-[#C05E42]/10 flex items-center justify-center border border-[#C05E42]/20">
                            <Target size={18} className="text-[#C05E42]" />
                        </div>
                        <div>
                            <h2 className="text-[#F9F9F9] font-black uppercase tracking-widest text-sm">Create Challenge</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Gamified Cohort Learning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-[#F9F9F9] hover:bg-white/5 rounded-[2px] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                    {inviteLink ? (
                        <div className="space-y-6 py-4">
                            <div className="p-6 border border-[#10B981]/30 bg-[#10B981]/5 rounded-[2px] text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                                    <Check size={24} className="text-[#10B981]" />
                                </div>
                                <h3 className="text-[#F9F9F9] font-black uppercase tracking-widest text-lg">Challenge Live!</h3>
                                <p className="text-xs text-white/40 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                                    Your challenge has been created. Invite peers using the unique link below.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Share Invitation Link</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-[2px] text-xs font-mono text-[#F9F9F9] truncate">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="h-10 px-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-[#F9F9F9] rounded-[2px] font-black text-[10px] uppercase tracking-widest transition-colors"
                                    >
                                        {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target size={12} className="text-white/20" /> Challenge Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. GSE Q1 Trading Competition"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[2px] text-xs font-black text-[#F9F9F9] placeholder:text-white/20 outline-none focus:border-[#C05E42]/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CalendarDays size={12} className="text-white/20" /> Duration (Days)
                                </label>
                                <select
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[2px] text-xs font-black text-[#F9F9F9] outline-none focus:border-[#C05E42]/50 transition-all uppercase tracking-widest appearance-none"
                                >
                                    <option value="7">1 Week</option>
                                    <option value="14">2 Weeks</option>
                                    <option value="30">1 Month</option>
                                    <option value="90">1 Quarter</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Objective Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the rules and goals..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[2px] text-xs font-black text-[#F9F9F9] placeholder:text-white/20 outline-none focus:border-[#C05E42]/50 focus:bg-white/10 transition-all uppercase tracking-widest resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.title}
                                className="w-full py-4 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] text-[10px] uppercase tracking-[0.3em] hover:bg-[#C05E42]/90 transition-all shadow-xl shadow-[#C05E42]/10 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? "Generating Parameters..." : "Initialize Challenge Segment"}
                                {!loading && <KeyRound size={14} />}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
