"use client";

import { useEffect, useState } from "react";
// import { getStocks, type Stock } from "@/lib/market-data"; // REMOVED
import { type Stock } from "@/lib/market-data";
import { getMarketData } from "@/app/actions/market"; // NEW
import { StockRow } from "@/components/market/StockRow";
import { Search, SlidersHorizontal, ArrowUpRight, TrendingDown } from "lucide-react";

export default function MarketPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        async function fetchStocks() {
            try {
                const data = await getMarketData(); // Using Server Action
                setStocks(data);
            } catch (err) {
                console.error("Failed to load market data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStocks();

        const interval = setInterval(fetchStocks, 60000);
        return () => clearInterval(interval);
    }, []);

    // ... rest of component


    const filteredStocks = stocks.filter(stock => {
        const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
            stock.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || stock.sector === filter;
        return matchesSearch && matchesFilter;
    });

    const sectors = ["All", ...Array.from(new Set(stocks.map(s => s.sector)))];

    // Market Summary Metrics (Calculated from list)
    const marketTrend = stocks.length > 0 ? stocks.reduce((acc, s) => acc + s.changePercent, 0) / stocks.length : 0;
    const isMarketUp = marketTrend >= 0;

    return (
        <div style={{ paddingBottom: "2rem" }}>

            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                marginBottom: "2rem", borderBottom: "1px solid var(--border-default)", paddingBottom: "1rem"
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "2rem", margin: 0 }}>Market Data</h1>
                        <span style={{
                            backgroundColor: "rgba(52, 211, 153, 0.1)",
                            color: "var(--color-success)",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            display: "flex", alignItems: "center", gap: "4px"
                        }}>
                            <span style={{ width: 6, height: 6, background: "currentColor", borderRadius: "50%", display: "inline-block" }} className="animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                    <p style={{ margin: 0 }}>Real-time feed from Ghana Stock Exchange</p>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Market Trend</div>
                    <div style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: isMarketUp ? "var(--color-success)" : "var(--color-error)",
                        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem"
                    }}>
                        {isMarketUp ? <ArrowUpRight size={24} /> : <TrendingDown size={24} />}
                        {marketTrend.toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        type="text"
                        placeholder="Search symbol or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.875rem 1rem 0.875rem 3rem",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "6px",
                            color: "var(--text-primary)",
                            fontSize: "1rem",
                            outline: "none"
                        }}
                    />
                </div>
                <button className="btn btn-outline" style={{ display: "flex", gap: "0.5rem" }}>
                    <SlidersHorizontal size={18} /> Filters
                </button>
            </div>

            {/* Sector Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
                {sectors.map(sector => (
                    <button
                        key={sector}
                        onClick={() => setFilter(sector)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            border: filter === sector ? "1px solid var(--text-primary)" : "1px solid transparent",
                            background: filter === sector ? "var(--bg-surface-elevated)" : "transparent",
                            color: filter === sector ? "var(--text-primary)" : "var(--text-secondary)",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            transition: "all 0.2s"
                        }}
                    >
                        {sector}
                    </button>
                ))}
            </div>

            {/* Table Header (Visual) */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.5fr",
                padding: "0 1.5rem",
                marginBottom: "0.5rem",
                color: "var(--text-tertiary)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 600
            }}>
                <div>Symbol</div>
                <div>Price</div>
                <div>Change</div>
                <div>Volume</div>
                <div style={{ textAlign: "right" }}>Trade</div>
            </div>

            {loading ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid var(--border-active)", borderTopColor: "var(--text-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <div style={{ marginTop: "1rem" }}>Connecting to GSE...</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {filteredStocks.map(stock => (
                        <StockRow key={stock.symbol} stock={stock} />
                    ))}
                    {filteredStocks.length === 0 && (
                        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)", background: "var(--bg-surface)", borderRadius: "8px" }}>
                            No stocks found.
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
        </div>
    );
}
