"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Award, Shield, Settings, CreditCard } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "4rem" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Account</h1>

            {/* User Identity Card */}
            <div className="feature-panel" style={{
                padding: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginBottom: "2rem"
            }}>
                <div style={{
                    width: "80px", height: "80px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--border-active)"
                }}>
                    <User size={32} color="var(--text-secondary)" />
                </div>
                <div>
                    <h2 style={{ fontSize: "1.5rem", margin: 0, marginBottom: "0.25rem" }}>
                        {user?.user_metadata?.full_name || "Investory User"}
                    </h2>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{user?.email}</div>
                    <div style={{ marginTop: "0.75rem" }}>
                        <span style={{
                            background: "var(--brand-primary)",
                            color: "white",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600
                        }}>PRO MEMBER</span>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Section: Badges */}
                <div className="feature-panel" style={{ padding: "0" }}>
                    <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Award size={18} color="var(--brand-primary)" />
                        <h3 style={{ margin: 0, fontSize: "1rem" }}>Achievements</h3>
                    </div>
                    <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", textAlign: "center" }}>
                        <div style={{ opacity: 1 }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--brand-primary)", borderRadius: "50%", margin: "0 auto 0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: "1.2rem" }}>🏆</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 500 }}>Early Bird</div>
                        </div>
                        <div style={{ opacity: 0.3 }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--bg-surface-elevated)", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                            <div style={{ fontSize: "0.75rem" }}>Trader</div>
                        </div>
                        <div style={{ opacity: 0.3 }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--bg-surface-elevated)", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                            <div style={{ fontSize: "0.75rem" }}>Whale</div>
                        </div>
                        <div style={{ opacity: 0.3 }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--bg-surface-elevated)", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                            <div style={{ fontSize: "0.75rem" }}>Guru</div>
                        </div>
                    </div>
                </div>

                {/* Section: General */}
                <div className="feature-panel" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface-elevated)" }}>
                        <h3 style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preferences</h3>
                    </div>

                    <button className="btn-ghost" style={{ width: "100%", textAlign: "left", padding: "1rem 1.5rem", borderRadius: 0, border: "none", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Settings size={20} color="var(--text-secondary)" />
                            <span>App Settings</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>&rarr;</div>
                    </button>

                    <button className="btn-ghost" style={{ width: "100%", textAlign: "left", padding: "1rem 1.5rem", borderRadius: 0, border: "none", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Shield size={20} color="var(--text-secondary)" />
                            <span>Security & Privacy</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>&rarr;</div>
                    </button>

                    <button className="btn-ghost" style={{ width: "100%", textAlign: "left", padding: "1rem 1.5rem", borderRadius: 0, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-primary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <CreditCard size={20} color="var(--text-secondary)" />
                            <span>Billing</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>&rarr;</div>
                    </button>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <button
                        onClick={handleSignOut}
                        className="btn btn-outline"
                        style={{ width: "100%", color: "var(--color-error)", borderColor: "var(--border-default)" }}
                    >
                        <LogOut size={18} style={{ marginRight: "0.5rem" }} /> Sign Out
                    </button>
                    <div style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
                        Version 1.0.0 (Premium)
                    </div>
                </div>
            </div>
        </div>
    );
}
