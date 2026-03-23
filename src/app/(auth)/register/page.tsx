"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, User, AtSign, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider } from "next-themes";

const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-emerald-500" };
    return { score, label: "Strong", color: "bg-emerald-400" };
};

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const passwordStrength = getPasswordStrength(password);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            router.push("/login?message=Account created. Check your email to confirm.");
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
        <ThemeProvider attribute="class">
            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
                {/* V3 Global Fluid Background Mesh - Anchors the entire page using Brand Primary */}
                <div className="fixed inset-0 pointer-events-none -z-50">
                    <div className="absolute top-[0%] left-[-10%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[160px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[60%] left-[20%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[180px] opacity-50 mix-blend-multiply" />
                    <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[480px] relative z-10"
                >
                    <div className="bg-card/80 backdrop-blur-2xl border border-border rounded-3xl p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-110">
                                iL
                            </div>
                            <span className="font-bold text-lg tracking-tight text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">inv.labs</span>
                        </Link>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1.5 font-syne">Start Investing</h1>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Join thousands of investors. Start with <span className="text-primary font-bold">GH₵10,000</span> virtual funds — free.
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

                        {/* OAuth Group */}
                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={() => handleOAuth('google')}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold text-foreground hover:bg-secondary/50 hover:border-border transition-all duration-200 shadow-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>
                            <button
                                onClick={() => handleOAuth('apple')}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-sm font-bold text-white hover:bg-black transition-all duration-200 shadow-md"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.96.95-2.04 2.22-3.66 2.22-1.58 0-2.08-.96-3.88-.96-1.83 0-2.39.95-3.86.95-1.58 0-2.79-1.39-3.76-2.36-2-2-3.48-5.32-3.48-8.52 0-5.24 3.38-8.01 6.58-8.01 1.64 0 3.01.95 3.96.95.95 0 2.24-1.07 4.09-1.07.78 0 3.09.28 4.54 2.4-3.67 2.14-3.08 6.51.52 8-.74 1.84-2.2 4.01-4 6.4zM12.03 3.31c.12-2 .81-3.6 2.39-4.31-.05 1.96-.83 3.65-2.39 4.31z" />
                                </svg>
                                Sign up with Apple
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">or email</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="flex flex-col gap-5">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="fullName" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer">Full name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer">Email address</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="password" className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-12 py-3.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/5 transition-all font-medium shadow-sm"
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

                                {/* Password strength */}
                                {password && (
                                    <div className="flex items-center gap-3 mt-1 px-1">
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3, 4, 5].map((bar) => (
                                                <div
                                                    key={bar}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${bar <= passwordStrength.score ? passwordStrength.color : "bg-zinc-100"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-white bg-primary rounded-xl shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(40,114,161,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-deep to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                                <span className="relative z-10 uppercase tracking-widest text-xs">
                                    {loading ? "Creating account..." : "Create Free Account"}
                                </span>
                                {!loading && <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
                                {loading && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-sm text-zinc-500 font-medium mt-8">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-primary-deep transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </ThemeProvider>
    );
}
