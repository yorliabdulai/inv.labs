"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            // Logic for email confirmation notification or auto login if disabled
            // For now, redirect to login or dashboard
            router.push("/login?message=Check your email to confirm your account");
        }
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Create Account</h1>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Start your journey with virtual GH₵10,000</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-error)", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label className="label" htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            className="input"
                            placeholder="Kwame Nkrumah"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
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
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
