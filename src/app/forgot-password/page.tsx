"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { AlertCircle, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider } from "next-themes";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <ThemeProvider attribute="class" forcedTheme="light">
            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
                {/* V3 Global Fluid Background Mesh - Anchors the entire page */}
                <div className="fixed inset-0 pointer-events-none -z-50">
                    <div className="absolute top-[0%] left-[-10%] w-[50%] h-[40%] bg-blue-50/50 rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full blur-[160px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[60%] left-[20%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[180px] opacity-50 mix-blend-multiply" />
                    <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px] relative z-10"
                >
                    <div className="bg-white/80 backdrop-blur-2xl border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
                            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-110">
                                iL
                            </div>
                            <span className="font-bold text-lg tracking-tight text-zinc-950">inv.labs</span>
                        </Link>

                        {success ? (
                            /* Success state */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center text-center py-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mb-2 font-syne">Check your inbox</h2>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8 max-w-xs">
                                    We sent a password reset link to <span className="text-zinc-900 font-bold">{email}</span>.
                                </p>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 w-full justify-center py-4 bg-zinc-950 text-white font-bold text-xs rounded-xl shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-zinc-950 tracking-tight mb-1.5 font-syne">Reset password</h1>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                        Enter your email and we'll send you a reset link.
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6 font-medium"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-blue-500/70 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-white bg-zinc-950 rounded-xl shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                                        <span className="relative z-10 uppercase tracking-widest text-xs">
                                            {loading ? "Sending..." : "Send Reset Link"}
                                        </span>
                                        {!loading && <Loader2 className="w-4 h-4 hidden group-disabled:block animate-spin relative z-10" />}
                                        {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
                                    </button>
                                </form>

                                {/* Back link */}
                                <div className="flex justify-center mt-8">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </ThemeProvider>
    );
}
