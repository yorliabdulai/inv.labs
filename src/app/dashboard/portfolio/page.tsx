"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStocks } from "@/lib/market-data";
import { PieChart, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";

interface Holding {
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    gain: number;
    gainPercent: number;
}

export default function PortfolioPage() {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [cashBalance, setCashBalance] = useState(10000); // Mock cash for now until connected to DB

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            // Mock cash from basic calculation just for display if not in DB
            // In real app, cash would be in a 'portfolios' table
            let cash = 10000;

            if (!transactions || transactions.length === 0) {
                setHoldings([]);
                setLoading(false);
                return;
            }

            const stocks = await getStocks();
            const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));
            const holdingMap = new Map<string, { quantity: number; totalCost: number }>();

            transactions.forEach(tx => {
                const current = holdingMap.get(tx.symbol) || { quantity: 0, totalCost: 0 };
                if (tx.type === 'BUY') {
                    current.quantity += tx.quantity;
                    current.totalCost += tx.total_amount;
                    cash -= tx.total_amount;
                } else {
                    const avgCost = current.totalCost / current.quantity;
                    current.totalCost -= avgCost * tx.quantity;
                    current.quantity -= tx.quantity;
                    cash += tx.total_amount;
                }
                holdingMap.set(tx.symbol, current);
            });

            const calculatedHoldings: Holding[] = [];
            let portfolioSum = 0;

            holdingMap.forEach((data, symbol) => {
                if (data.quantity > 0) {
                    const currentPrice = priceMap.get(symbol) || 0;
                    const marketValue = data.quantity * currentPrice;
                    const gain = marketValue - data.totalCost;
                    const gainPercent = (gain / data.totalCost) * 100;

                    calculatedHoldings.push({
                        symbol,
                        quantity: data.quantity,
                        averageCost: data.totalCost / data.quantity,
                        currentPrice,
                        marketValue,
                        gain,
                        gainPercent
                    });
                    portfolioSum += marketValue;
                }
            });

            setCashBalance(cash);
            setHoldings(calculatedHoldings);
            setTotalValue(portfolioSum);
            setLoading(false);
        }

        fetchData();
    }, []);

    const totalEquity = totalValue + cashBalance;
    const totalGain = totalEquity - 10000;
    const totalGainPercent = (totalGain / 10000) * 100;
    const isPositive = totalGain >= 0;

    if (loading) return (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid var(--border-active)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
    );

    return (
        <div style={{ paddingBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Portfolio</h1>

            {/* Account Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>

                {/* Net Worth */}
                <div className="feature-panel" style={{ padding: "1.5rem" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Net Liquidation Value</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        GH₵{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        color: isPositive ? "var(--color-success)" : "var(--color-error)",
                        fontSize: "0.875rem", fontWeight: 500
                    }}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {totalGain >= 0 ? "+" : ""}{totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)
                        <span style={{ color: "var(--text-tertiary)", marginLeft: "auto" }}>Since Inception</span>
                    </div>
                </div>

                {/* Cash & Buying Power */}
                <div className="feature-panel" style={{ padding: "1.5rem" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Buying Power</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        GH₵{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
                        Available for immediate trade
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Holdings</h2>
                    <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", gap: "0.5rem" }} onClick={() => window.location.reload()}>
                        <RefreshCcw size={14} /> Refresh
                    </button>
                </div>

                {holdings.length === 0 ? (
                    <div className="feature-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                        <PieChart size={48} style={{ margin: "0 auto 1.5rem", color: "var(--text-tertiary)" }} />
                        <h3 style={{ marginBottom: "0.5rem" }}>No Open Positions</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                            Your portfolio is currently 100% cash. Head to the market to identify opportunities.
                        </p>
                        <a href="/market" className="btn btn-primary">Go to Market</a>
                    </div>
                ) : (
                    <div className="feature-panel" style={{ padding: 0, overflow: "hidden" }}>
                        {/* Table Header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                            padding: "1rem 1.5rem",
                            borderBottom: "1px solid var(--border-default)",
                            background: "var(--bg-surface-elevated)",
                            color: "var(--text-tertiary)",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontWeight: 600
                        }}>
                            <div>Symbol</div>
                            <div style={{ textAlign: "right" }}>Qty</div>
                            <div style={{ textAlign: "right" }}>Avg Cost</div>
                            <div style={{ textAlign: "right" }}>Current</div>
                            <div style={{ textAlign: "right" }}>P/L</div>
                        </div>

                        {/* Table Rows */}
                        {holdings.map(holding => (
                            <div key={holding.symbol} style={{
                                display: "grid",
                                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                                padding: "1rem 1.5rem",
                                borderBottom: "1px solid var(--border-default)",
                                alignItems: "center",
                                fontSize: "0.9rem"
                            }}>
                                <div style={{ fontWeight: 600 }}>{holding.symbol}</div>
                                <div style={{ textAlign: "right", fontFamily: "monospace" }}>{holding.quantity}</div>
                                <div style={{ textAlign: "right", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                                    {holding.averageCost.toFixed(2)}
                                </div>
                                <div style={{ textAlign: "right", fontFamily: "monospace" }}>
                                    {holding.currentPrice.toFixed(2)}
                                </div>
                                <div style={{
                                    textAlign: "right",
                                    fontFamily: "monospace",
                                    fontWeight: 600,
                                    color: holding.gain >= 0 ? "var(--color-success)" : "var(--color-error)"
                                }}>
                                    {holding.gain >= 0 ? "+" : ""}{holding.gain.toFixed(2)}
                                </div>
                            </div>
                        ))}

                        {/* Total Row */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                            padding: "1rem 1.5rem",
                            background: "var(--bg-surface-elevated)",
                            alignItems: "center",
                            fontSize: "0.9rem",
                            fontWeight: 700
                        }}>
                            <div>TOTAL</div>
                            <div></div>
                            <div></div>
                            <div style={{ textAlign: "right" }}>GH₵{totalValue.toFixed(2)}</div>
                            <div style={{ textAlign: "right" }}></div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
               @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
