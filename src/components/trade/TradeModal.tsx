"use client";

import { useState, useEffect } from "react";
import { Stock } from "@/lib/market-data";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface TradeModalProps {
    stock: Stock;
    isOpen: boolean;
    onClose: () => void;
    userBalance: number; // In real app, fetch from context
}

export function TradeModal({ stock, isOpen, onClose, userBalance }: TradeModalProps) {
    const [type, setType] = useState<"BUY" | "SELL">("BUY");
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const price = stock.price;
    const subtotal = price * quantity;

    // Fees
    const brokerFee = subtotal * 0.015;
    const secLevy = subtotal * 0.004;
    const gseLevy = subtotal * 0.0014;
    const vat = brokerFee * 0.15; // VAT on Broker Commission
    const totalFees = brokerFee + secLevy + gseLevy + vat;

    const totalCost = type === "BUY" ? subtotal + totalFees : subtotal - totalFees;

    const handleTrade = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            if (type === "BUY" && totalCost > userBalance) {
                throw new Error("Insufficient funds");
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Insert transaction
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: user.id,
                symbol: stock.symbol,
                type,
                quantity,
                price_per_share: price,
                total_amount: totalCost,
                fees: totalFees
            });

            if (txError) throw txError;

            // In a real scenario, we would also update the Holdings table via RPC or trigger
            // For now, we assume the trigger or backend handles it, or we just record the transaction.
            // Ideally call an RPC function like `execute_trade` to ensure atomicity.

            onClose();
            alert(`Successfully ${type === "BUY" ? "bought" : "sold"} ${quantity} shares of ${stock.symbol}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
                <button onClick={onClose} style={{ position: "absolute", right: "1rem", top: "1rem", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                    <X size={24} />
                </button>

                <h2 className="font-bold" style={{ marginBottom: "1rem" }}>Trade {stock.symbol}</h2>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            backgroundColor: type === "BUY" ? "var(--color-success)" : "var(--color-surface-hover)",
                            color: type === "BUY" ? "white" : "var(--color-text-primary)"
                        }}
                        onClick={() => setType("BUY")}
                    >
                        Buy
                    </button>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            backgroundColor: type === "SELL" ? "var(--color-error)" : "var(--color-surface-hover)",
                            color: type === "SELL" ? "white" : "var(--color-text-primary)"
                        }}
                        onClick={() => setType("SELL")}
                    >
                        Sell
                    </button>
                </div>

                <div className="input-group">
                    <label className="label">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        className="input"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                </div>

                <div style={{ fontSize: "0.875rem", marginBottom: "1.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>Market Price</span>
                        <span>GH₵{price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>Fees (Est.)</span>
                        <span>GH₵{totalFees.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.125rem", marginTop: "0.5rem" }}>
                        <span>Total {type === "BUY" ? "Cost" : "Proceeds"}</span>
                        <span>GH₵{totalCost.toFixed(2)}</span>
                    </div>
                </div>

                {error && (
                    <div style={{ color: "var(--color-error)", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    onClick={handleTrade}
                    disabled={isSubmitting || quantity < 1}
                >
                    {isSubmitting ? "Processing..." : `Confirm ${type}`}
                </button>
            </div>
        </div>
    );
}
