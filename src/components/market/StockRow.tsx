"use client";

import type { Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown, MoreHorizontal, Activity } from "lucide-react";
import { useState } from "react";
import { TradeModal } from "@/components/trade/TradeModal";

interface StockRowProps {
    stock: Stock;
}

export function StockRow({ stock }: StockRowProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div
                className="feature-panel"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr",
                    alignItems: "center",
                    padding: "1rem 1.5rem",
                    marginBottom: "0.5rem",
                    cursor: "pointer",
                    borderRadius: "8px",
                    transition: "background-color 0.2s"
                }}
                onClick={() => setIsModalOpen(true)}
            >
                {/* Symbol & Name */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1rem" }}>{stock.symbol}</h3>
                        {stock.sector === "Finance" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-primary)" }}></span>}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>{stock.name}</p>
                </div>

                {/* Price */}
                <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 600 }}>
                    GH₵{stock.price.toFixed(2)}
                </div>

                {/* Change */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: isPositive ? "var(--color-success)" : "var(--color-error)",
                    fontWeight: 500,
                    fontSize: "0.9rem"
                }}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </div>

                {/* Volume / Sparkline Sim */}
                <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Activity size={14} style={{ opacity: 0.5 }} />
                    <span>{stock.volume.toLocaleString()}</span>
                </div>

                {/* Action */}
                <div style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                    <MoreHorizontal size={20} />
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={10000}
            />
        </>
    );
}
