"use client";

import { Award } from "lucide-react";

export default function LeaderboardPage() {
    const leaders = [
        { rank: 1, name: "Kofi A.", return: 45.3, badges: 5 },
        { rank: 2, name: "Ama S.", return: 38.2, badges: 4 },
        { rank: 3, name: "Yaw B.", return: 32.1, badges: 3 },
        { rank: 4, name: "You", return: 0.0, badges: 0, isUser: true },
        { rank: 5, name: "Adwoa M.", return: -1.2, badges: 2 },
    ];

    return (
        <div>
            <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Leaderboard</h1>

            <div className="card" style={{ marginBottom: "1rem", backgroundColor: "var(--color-secondary)", color: "var(--color-surface)" }}>
                <p className="text-center font-bold">Weekly Challenge: Best Tech Portfolio</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {leaders.map((leader) => (
                    <div
                        key={leader.rank}
                        className="card"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "1rem",
                            border: leader.isUser ? "1px solid var(--color-primary)" : "none",
                            backgroundColor: leader.isUser ? "rgba(206, 17, 38, 0.05)" : "var(--color-surface)"
                        }}
                    >
                        <div style={{
                            width: "32px",
                            fontSize: "1.25rem",
                            fontWeight: "bold",
                            color: leader.rank <= 3 ? "var(--color-secondary)" : "var(--color-text-secondary)"
                        }}>
                            #{leader.rank}
                        </div>

                        <div style={{ flex: 1, marginLeft: "1rem" }}>
                            <div className="font-bold">{leader.name}</div>
                            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                {leader.badges} Badges
                            </div>
                        </div>

                        <div style={{ textAlign: "right", color: "var(--color-success)", fontWeight: "bold" }}>
                            +{leader.return}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
