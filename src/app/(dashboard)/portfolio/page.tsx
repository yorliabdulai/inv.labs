"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStocks, Stock } from "@/lib/market-data";
import { PieChart } from "lucide-react";

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

    useEffect(() => {
        async function fetchData() {
            // 1. Fetch user transactions
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            if (!transactions || transactions.length === 0) {
                setHoldings([]);
                setLoading(false);
                return;
            }

            // 2. Fetch current market prices
            const stocks = await getStocks();
            const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));

            // 3. Aggregate holdings
            const holdingMap = new Map<string, { quantity: number; totalCost: number }>();

            transactions.forEach(tx => {
                const current = holdingMap.get(tx.symbol) || { quantity: 0, totalCost: 0 };
                if (tx.type === 'BUY') {
                    current.quantity += tx.quantity;
                    current.totalCost += tx.total_amount; // Using total amount (incl fees) for cost basis? 
                    // Usually cost basis is (price * qty) + fees.
                    // In my DB schema, total_amount IS that.
                } else {
                    // Sell logic: reduce quantity. Cost basis adjustment is tricky (FIFO/LIFO).
                    // Simplified: reduce cost proportionally
                    const avgCost = current.totalCost / current.quantity;
                    current.totalCost -= avgCost * tx.quantity;
                    current.quantity -= tx.quantity;
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

            setHoldings(calculatedHoldings);
            setTotalValue(portfolioSum);
            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) return <div className="text-center p-8">Loading portfolio...</div>;

    return (
        <div>
            <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>My Portfolio</h1>

            <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Total Asset Value</div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>GH₵{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>

            {holdings.length === 0 ? (
                <div className="text-center" style={{ color: "var(--color-text-secondary)", marginTop: "2rem" }}>
                    <PieChart size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                    <p>No holdings yet. Start trading in the Market!</p>
                </div>
            ) : (
                <div>
                    {holdings.map(holding => (
                        <div key={holding.symbol} className="card" style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <h3 className="font-bold">{holding.symbol}</h3>
                                <span className="font-bold">GH₵{holding.marketValue.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                <span>{holding.quantity} shares @ {holding.averageCost.toFixed(2)}</span>
                                <span style={{ color: holding.gain >= 0 ? "var(--color-success)" : "var(--color-error)" }}>
                                    {holding.gain >= 0 ? "+" : ""}{holding.gain.toFixed(2)} ({holding.gainPercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
