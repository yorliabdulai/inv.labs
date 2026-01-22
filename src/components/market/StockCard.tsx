"use client";

import type { Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { TradeModal } from "@/components/trade/TradeModal";

interface StockCardProps {
    stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
    const isPositive = stock.change >= 0;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", cursor: "pointer" }}
                onClick={() => setIsModalOpen(true)}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h3 className="font-bold">{stock.symbol}</h3>
                        <span className="text-xs" style={{
                            backgroundColor: "var(--color-surface-hover)",
                            padding: "2px 6px",
                            borderRadius: "4px"
                        }}>
                            {stock.sector}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{stock.name}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div className="font-bold">GH₵{stock.price.toFixed(2)}</div>
                    <div
                        className="text-sm"
                        style={{
                            color: isPositive ? "var(--color-success)" : "var(--color-error)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "2px"
                        }}
                    >
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                </div>
            </div>

            <TradeModal
                stock={stock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userBalance={10000} // Mock balance, arguably should come from a context
            />
        </>
    );
}
