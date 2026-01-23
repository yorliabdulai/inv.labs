"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        <div ref={containerRef} className="auth-container">
            {/* Background Decorative Element */}
            <div className="auth-bg-glow"></div>

            <div className="auth-card glass-card">
                <div className="auth-item auth-header">
                    <div className="auth-logo">
                        <TrendingUp className="logo-icon" size={32} />
                        <span className="logo-text">GSE<span className="logo-labs">.LABS</span></span>
                    </div>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Enter your credentials to access your sandbox.</p>
                </div>

                {error && (
                    <div className="auth-item error-banner">
                        <ShieldCheck size={18} /> {error}
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
                        Continue with Google
                    </button>
                    <button
                        onClick={() => handleOAuth('apple')}
                        className="oauth-btn oauth-btn-apple"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M17.05 20.28c-.96.95-2.04 2.22-3.66 2.22-1.58 0-2.08-.96-3.88-.96-1.83 0-2.39.95-3.86.95-1.58 0-2.79-1.39-3.76-2.36-2-2-3.48-5.32-3.48-8.52 0-5.24 3.38-8.01 6.58-8.01 1.64 0 3.01.95 3.96.95.95 0 2.24-1.07 4.09-1.07.78 0 3.09.28 4.54 2.4-3.67 2.14-3.08 6.51.52 8-.74 1.84-2.2 4.01-4 6.4zM12.03 3.31c.12-2 .81-3.6 2.39-4.31-.05 1.96-.83 3.65-2.39 4.31z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                <div className="auth-item auth-divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">Or email</span>
                    <div className="divider-line"></div>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Work Email</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="form-label-row">
                            <label className="form-label">Password</label>
                            <Link href="/forgot-password" className="forgot-link">Forgot?</Link>
                        </div>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                    </div>

                    <button
                        type="submit"
                        className="btn-premium btn-premium-solid submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                Verifying...
                            </>
                        ) : (
                            "Sign in to Dashboard"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="footer-text">
                        New to GSE Labs? <Link href="/register" className="footer-link">Create institutional account</Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--bg-page);
                    position: relative;
                    overflow: hidden;
                    padding: 1rem;
                }

                .auth-bg-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(55, 48, 163, 0.05) 0%, transparent 70%);
                    z-index: 0;
                }

                .auth-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 2rem;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .logo-icon {
                    color: var(--brand-primary);
                }

                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: var(--text-primary);
                    letter-spacing: -0.04em;
                }

                .logo-labs {
                    opacity: 0.4;
                }

                .auth-title {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    color: var(--text-primary);
                    font-weight: 800;
                }

                .auth-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .error-banner {
                    background-color: #FEF2F2;
                    border: 1px solid #FEE2E2;
                    color: #B91C1C;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    gap: 10px;
                    padding: 0.875rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    text-decoration: none;
                    border: 1px solid var(--border-default);
                    background: #FFFFFF;
                    color: var(--text-primary);
                }

                .oauth-btn:hover {
                    background: #F9FAFB;
                    border-color: var(--text-primary);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .oauth-btn-apple {
                    background: #000000 !important;
                    color: #FFFFFF !important;
                    border-color: #000000 !important;
                }

                .oauth-btn-apple:hover {
                    background: #1a1a1a !important;
                    border-color: #1a1a1a !important;
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
                    background: var(--border-default);
                }

                .divider-text {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .form-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .forgot-link {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: var(--brand-primary);
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .forgot-link:hover {
                    opacity: 0.8;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border-radius: 10px;
                    border: 1px solid var(--border-default);
                    outline: none;
                    font-size: 1rem;
                    transition: all 0.2s;
                    background: var(--bg-surface);
                    color: var(--text-primary);
                    box-sizing: border-box;
                }

                .form-input:focus {
                    border-color: var(--brand-primary);
                    box-shadow: 0 0 0 4px rgba(55, 48, 163, 0.05);
                }

                .password-input-wrapper {
                    position: relative;
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-tertiary);
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: var(--text-secondary);
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1rem;
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 2.5rem;
                }

                .footer-text {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .footer-link {
                    font-weight: 700;
                    color: var(--brand-primary);
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .footer-link:hover {
                    opacity: 0.8;
                }

                /* Responsive Design */
                @media (max-width: 640px) {
                    .auth-card {
                        padding: 1.5rem;
                    }

                    .auth-title {
                        font-size: 1.75rem;
                    }

                    .auth-subtitle {
                        font-size: 0.9375rem;
                    }

                    .logo-text {
                        font-size: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .auth-container {
                        padding: 0.5rem;
                    }

                    .auth-card {
                        padding: 1.25rem;
                    }

                    .auth-title {
                        font-size: 1.5rem;
                    }

                    .oauth-btn {
                        font-size: 0.8125rem;
                        padding: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}
