"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User, Award } from "lucide-react";

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
        <div>
            <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Profile</h1>

            <div className="card" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{
                    width: "80px", height: "80px",
                    backgroundColor: "var(--color-surface-hover)",
                    borderRadius: "50%",
                    margin: "0 auto 1rem",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <User size={40} color="var(--color-text-secondary)" />
                </div>
                <h2 className="font-bold">{user?.user_metadata?.full_name || "Investory User"}</h2>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{user?.email}</p>
            </div>

            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h3 className="font-bold" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Award className="text-primary" size={20} /> Achievements
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", textAlign: "center" }}>
                    <div style={{ opacity: 0.5 }}>
                        <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                        <span className="text-xs">First Trade</span>
                    </div>
                    <div style={{ opacity: 0.5 }}>
                        <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                        <span className="text-xs">Saver</span>
                    </div>
                    <div style={{ opacity: 0.5 }}>
                        <div style={{ background: "#333", width: "40px", height: "40px", borderRadius: "50%", margin: "0 auto 0.5rem" }}></div>
                        <span className="text-xs">Guru</span>
                    </div>
                </div>
            </div>

            <button className="btn btn-outline" style={{ width: "100%", borderColor: "var(--color-error)", color: "var(--color-error)" }} onClick={handleSignOut}>
                <LogOut size={20} style={{ marginRight: "0.5rem" }} /> Sign Out
            </button>
        </div>
    );
}
