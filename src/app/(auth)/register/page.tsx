"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, AlertCircle, User, AtSign, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.from(".auth-card", {
                opacity: 0,
                y: 40,
                duration: 1,
                ease: "expo.out"
            })
                .from(".auth-item", {
                    opacity: 0,
                    y: 20,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "-=0.6");
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Password strength calculation
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: "", color: "" };

        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 2) return { score, label: "Weak", color: "#EF4444" };
        if (score <= 3) return { score, label: "Fair", color: "#F59E0B" };
        if (score <= 4) return { score, label: "Good", color: "#10B981" };
        return { score, label: "Strong", color: "#059669" };
    };

    const passwordStrength = getPasswordStrength(password);

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
            router.push("/login?message=Account created. Check your email to confirm.");
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
        <div ref={containerRef} className="auth-container">
            {/* Animated background */}
            <div className="auth-bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <div className="auth-card glass-card">
                <div className="auth-item auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon-wrap">
                            <TrendingUp size={22} className="logo-icon" />
                        </div>
                        <span className="logo-text">GSE<span className="logo-highlight">.LABS</span></span>
                    </div>
                    <h1 className="auth-title">Start Investing</h1>
                    <p className="auth-subtitle">Join thousands of investors. Start with <strong className="text-emerald-600">GH₵10,000</strong> simulated funds — free.</p>
                </div>

                {error && (
                    <div className="auth-item error-banner">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="auth-item oauth-buttons">
                    <button
                        onClick={() => handleOAuth('google')}
                        className="oauth-btn oauth-btn-google"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </button>
                    <button
                        onClick={() => handleOAuth('apple')}
                        className="oauth-btn oauth-btn-apple"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M17.05 20.28c-.96.95-2.04 2.22-3.66 2.22-1.58 0-2.08-.96-3.88-.96-1.83 0-2.39.95-3.86.95-1.58 0-2.79-1.39-3.76-2.36-2-2-3.48-5.32-3.48-8.52 0-5.24 3.38-8.01 6.58-8.01 1.64 0 3.01.95 3.96.95.95 0 2.24-1.07 4.09-1.07.78 0 3.09.28 4.54 2.4-3.67 2.14-3.08 6.51.52 8-.74 1.84-2.2 4.01-4 6.4zM12.03 3.31c.12-2 .81-3.6 2.39-4.31-.05 1.96-.83 3.65-2.39 4.31z" />
                        </svg>
                        Sign up with Apple
                    </button>
                </div>

                <div className="auth-item auth-divider">
                    <div className="divider-line" />
                    <span className="divider-text">or sign up with email</span>
                    <div className="divider-line" />
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Your full name"
                                className="form-input with-icon"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-with-icon">
                            <AtSign size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="form-input with-icon"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="form-input with-icon"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4, 5].map((bar) => (
                                        <div
                                            key={bar}
                                            className="strength-bar"
                                            style={{
                                                backgroundColor: bar <= passwordStrength.score
                                                    ? passwordStrength.color
                                                    : "#E2E8F0"
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                Creating account...
                            </>
                        ) : (
                            "Create Free Account"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="footer-text">
                        Already have an account? <Link href="/login" className="footer-link">Sign in</Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #121417;
                    position: relative;
                    overflow: hidden;
                    padding: 1rem;
                    font-family: var(--font-geist-sans), sans-serif;
                }

                .auth-bg-orbs {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.1;
                }

                .orb-1 {
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, #C05E42, transparent);
                    top: -200px;
                    left: -200px;
                }

                .orb-2 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #F9F9F9, transparent);
                    bottom: -150px;
                    right: -150px;
                }

                .auth-card {
                    width: 100%;
                    max-width: 480px;
                    padding: 3rem 2.5rem;
                    position: relative;
                    z-index: 1;
                    background: rgba(18, 20, 23, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 2px;
                    border: 1px solid rgba(192, 94, 66, 0.2);
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
                }

                .auth-header {
                    text-align: left;
                    margin-bottom: 2.5rem;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .logo-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 2px;
                    background: #C05E42;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-icon {
                    color: #F9F9F9;
                }

                .logo-text {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #F9F9F9;
                    letter-spacing: -0.02em;
                    font-family: var(--font-instrument-sans), sans-serif;
                }

                .logo-highlight {
                    color: #C05E42;
                }

                .auth-title {
                    font-size: 2.25rem;
                    margin-bottom: 0.75rem;
                    color: #F9F9F9;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    font-family: var(--font-instrument-serif), serif;
                }

                .auth-subtitle {
                    font-size: 0.875rem;
                    color: rgba(249, 249, 249, 0.7);
                    line-height: 1.6;
                }

                .error-banner {
                    background: rgba(185, 28, 28, 0.1);
                    border: 1px solid rgba(185, 28, 28, 0.2);
                    color: #FCA5A5;
                    padding: 1rem;
                    border-radius: 2px;
                    margin-bottom: 2rem;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .oauth-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .oauth-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    gap: 12px;
                    padding: 0.875rem;
                    border-radius: 2px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    text-decoration: none;
                    border: 1px solid rgba(249, 249, 249, 0.1);
                    background: rgba(249, 249, 249, 0.05);
                    color: #F9F9F9;
                }

                .oauth-btn:hover {
                    background: rgba(249, 249, 249, 0.1);
                    border-color: rgba(249, 249, 249, 0.2);
                }

                .oauth-btn-apple {
                    background: #F9F9F9 !important;
                    color: #121417 !important;
                }

                .auth-divider {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(249, 249, 249, 0.1);
                }

                .divider-text {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: rgba(249, 249, 249, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                }

                .form-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: rgba(249, 249, 249, 0.85);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-with-icon {
                    position: relative;
                    width: 100%;
                }

                :global(.input-icon) {
                    position: absolute !important;
                    left: 1rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    color: rgba(249, 249, 249, 0.3) !important;
                    pointer-events: none !important;
                    z-index: 10 !important;
                }

                .form-input {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 2px;
                    border: 1px solid rgba(249, 249, 249, 0.1);
                    outline: none;
                    font-size: 0.9375rem;
                    transition: all 0.2s;
                    background: rgba(18, 20, 23, 0.5);
                    color: #F9F9F9;
                    box-sizing: border-box;
                    font-family: var(--font-geist-sans), sans-serif;
                }

                .form-input.with-icon {
                    padding-left: 2.75rem;
                }

                .form-input:focus {
                    border-color: #C05E42;
                    background: rgba(18, 20, 23, 0.8);
                }

                .form-input::placeholder {
                    color: rgba(249, 249, 249, 0.2);
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: rgba(249, 249, 249, 0.3);
                    z-index: 1;
                }

                .password-strength {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 0.25rem;
                }

                .strength-bars {
                    display: flex;
                    gap: 4px;
                    flex: 1;
                }

                .strength-bar {
                    height: 3px;
                    flex: 1;
                    border-radius: 1px;
                    transition: background-color 0.3s;
                }

                .strength-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1rem;
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    background: #C05E42;
                    color: #F9F9F9;
                    border: none;
                    border-radius: 2px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #D16D4F;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 20px rgba(192, 94, 66, 0.2);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 2.5rem;
                }

                .footer-text {
                    font-size: 0.875rem;
                    color: rgba(249, 249, 249, 0.5);
                }

                .footer-link {
                    font-weight: 700;
                    color: #F9F9F9;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    text-decoration-color: rgba(192, 94, 66, 0.4);
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 2.5rem 1.5rem;
                    }

                    .auth-title {
                        font-size: 1.875rem;
                    }

                    .oauth-btn {
                        font-size: 0.875rem;
                        padding: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}
