"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

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
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Welcome Back</h1>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Log in to your investment simulator</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                    </p>
                </div>

                {/* Placeholder for OAuth */}
                {/* <div className="mt-4">
             <button onClick={() => handleOAuth('google')}>Sign in with Google</button>
        </div> */}
            </div>
        </div>
    );
}
