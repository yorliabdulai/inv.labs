"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { ThemeProvider } from "next-themes";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    const handleOAuth = async (provider: 'google' | 'apple') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setError(error.message);
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
                    {/* Card */}
                    <div className="bg-white/80 backdrop-blur-2xl border border-zinc-200 rounded-3xl p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
                            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-110">
                                iL
                            </div>
                            <span className="font-bold text-lg tracking-tight text-zinc-950">inv.labs</span>
                        </Link>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-zinc-950 tracking-tight mb-1.5 font-syne">Welcome back</h1>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed">Sign in to your investment dashboard.</p>
                        </div>

                        {/* Error banner */}
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

                        {/* OAuth */}
                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={() => handleOAuth('google')}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 shadow-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                            <button
                                onClick={() => handleOAuth('apple')}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-sm font-bold text-white hover:bg-black transition-all duration-200 shadow-md"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.96.95-2.04 2.22-3.66 2.22-1.58 0-2.08-.96-3.88-.96-1.83 0-2.39.95-3.86.95-1.58 0-2.79-1.39-3.76-2.36-2-2-3.48-5.32-3.48-8.52 0-5.24 3.38-8.01 6.58-8.01 1.64 0 3.01.95 3.96.95.95 0 2.24-1.07 4.09-1.07.78 0 3.09.28 4.54 2.4-3.67 2.14-3.08 6.51.52 8-.74 1.84-2.2 4.01-4 6.4zM12.03 3.31c.12-2 .81-3.6 2.39-4.31-.05 1.96-.83 3.65-2.39 4.31z" />
                                </svg>
                                Continue with Apple
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-zinc-100" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">or email</span>
                            <div className="flex-1 h-px bg-zinc-100" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-blue-500/70 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                                    <Link href="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-blue-500/70 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-white bg-zinc-950 rounded-xl shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                                <span className="relative z-10 uppercase tracking-widest text-xs">
                                    {loading ? "Signing in..." : "Sign In"}
                                </span>
                                {!loading && <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
                                {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-sm text-zinc-500 font-medium mt-8">
                            New here?{" "}
                            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                Create a free account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </ThemeProvider>
    );
}
