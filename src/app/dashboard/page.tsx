"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
    // Mock User Data for now
    const user = {
        name: "Kwame",
        balance: 10000.00,
        portfolioValue: 10000.00,
        dayChange: 0.00,
    };

    return (
        <div>
            <header style={{ marginBottom: "1.5rem" }}>
                <h1 className="font-bold" style={{ fontSize: "1.25rem" }}>Hello, {user.name}</h1>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Here's your portfolio overview</p>
            </header>

            <div className="card" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #900 100%)", color: "white", marginBottom: "1.5rem" }}>
                <div className="text-sm" style={{ opacity: 0.9 }}>Total Portfolio Value</div>
                <div className="font-bold" style={{ fontSize: "2rem", margin: "0.5rem 0" }}>GH₵{user.portfolioValue.toLocaleString()}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span>Cash: GH₵{user.balance.toLocaleString()}</span>
                    <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px" }}>+0.00% Today</span>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 className="font-bold">Market Movers</h2>
                <Link href="/dashboard/market" className="text-primary text-sm flex items-center gap-1">
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            {/* Simplified Market Mover Preview */}
            <div className="card" style={{ padding: "1rem" }}>
                <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Market data is loading...
                </p>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <h2 className="font-bold" style={{ marginBottom: "1rem" }}>Quick Actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <Link href="/dashboard/market" className="card" style={{ textAlign: "center", padding: "1rem" }}>
                        Buy Stock
                    </Link>
                    <Link href="/dashboard/learn" className="card" style={{ textAlign: "center", padding: "1rem" }}>
                        Learn
                    </Link>
                </div>
            </div>
        </div>
    );
}
