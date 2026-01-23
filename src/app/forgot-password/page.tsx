"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { TrendingUp, ShieldCheck, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import gsap from "gsap";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
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
        <div ref={containerRef} className="auth-container">
            {/* Background Decorative Element */}
            <div className="auth-bg-glow"></div>

            <div className="auth-card glass-card">
                <div className="auth-item auth-header">
                    <div className="auth-logo">
                        <TrendingUp className="logo-icon" size={32} />
                        <span className="logo-text">GSE<span className="logo-labs">.LABS</span></span>
                    </div>
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">
                        {success
                            ? "Check your email for the reset link."
                            : "Enter your email and we'll send you a reset link."
                        }
                    </p>
                </div>

                {error && (
                    <div className="auth-item error-banner">
                        <ShieldCheck size={18} /> {error}
                    </div>
                )}

                {success ? (
                    <div className="success-state">
                        <div className="success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="success-title">Email Sent!</h3>
                        <p className="success-text">
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link href="/login" className="btn-premium btn-premium-solid back-btn">
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <div className="auth-item form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="form-input with-icon"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-item btn-premium btn-premium-solid submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="spinner" size={18} />
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>

                        <div className="auth-item auth-footer">
                            <Link href="/login" className="back-link">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
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

                .input-with-icon {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-tertiary);
                    pointer-events: none;
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
                }

                .form-input.with-icon {
                    padding-left: 2.8rem;
                }

                .form-input:focus {
                    border-color: var(--brand-primary);
                    box-shadow: 0 0 0 4px rgba(55, 48, 163, 0.05);
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
                    margin-top: 2rem;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--brand-primary);
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .back-link:hover {
                    opacity: 0.8;
                }

                .success-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 1rem 0;
                }

                .success-icon {
                    color: var(--color-success);
                    margin-bottom: 1.5rem;
                }

                .success-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .success-text {
                    font-size: 0.9375rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    max-width: 360px;
                }

                .success-text strong {
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1.5rem;
                    text-decoration: none;
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

                    .success-title {
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

                    .form-input {
                        font-size: 0.9375rem;
                    }
                }
            `}</style>
        </div>
    );
}
