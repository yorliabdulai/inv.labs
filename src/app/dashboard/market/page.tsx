"use client";

import { useEffect, useState, useMemo } from "react";
import { type Stock, GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { getMarketData } from "@/app/actions/market";
import { StockRow, type StockHolding } from "@/components/market/StockRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
    Search, RefreshCw, Grid3X3, List, TrendingUp, TrendingDown,
    Activity, ArrowUpRight, ArrowDownRight, Zap
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = "symbol" | "price" | "change" | "volume";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "list";

interface RawTransaction {
    symbol: string;
    type: "BUY" | "SELL";
    quantity: number;
    price_per_share: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildHoldingsMap(txns: RawTransaction[], priceMap: Record<string, number>): Record<string, StockHolding> {
    const map: Record<string, { qty: number; cost: number }> = {};
    for (const t of txns) {
        if (!map[t.symbol]) map[t.symbol] = { qty: 0, cost: 0 };
        if (t.type === "BUY") {
            map[t.symbol].qty += t.quantity;
            map[t.symbol].cost += t.quantity * t.price_per_share;
        } else {
            map[t.symbol].qty -= t.quantity;
            map[t.symbol].cost -= t.quantity * t.price_per_share;
        }
    }
    const result: Record<string, StockHolding> = {};
    for (const [sym, agg] of Object.entries(map)) {
        if (agg.qty <= 0) continue;
        const currentPrice = priceMap[sym] ?? 0;
        const avgCost = agg.qty > 0 ? agg.cost / agg.qty : 0;
        const currentValue = agg.qty * currentPrice;
        const pnl = currentValue - agg.cost;
        const pnlPct = agg.cost > 0 ? (pnl / agg.cost) * 100 : 0;
        result[sym] = { qty: agg.qty, avgCost, currentValue, pnl, pnlPct };
    }
    return result;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StocksPage() {
    const { user, profile, loading: profileLoading } = useUserProfile();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sectorFilter, setSectorFilter] = useState("All");
    const [sortKey, setSortKey] = useState<SortKey>("symbol");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [holdings, setHoldings] = useState<Record<string, StockHolding>>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch live stock data
    const fetchStocks = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const response = await fetch(`${GSE_API_BASE}/live`, { cache: "no-store", mode: "cors" });
            if (response.ok) {
                const raw = await response.json();
                const mapped: Stock[] = raw.map((q: any) => {
                    const meta = KNOWN_METADATA[q.name] ?? { name: q.name, sector: "Other" };
                    const prev = q.price - q.change;
                    return {
                        symbol: q.name,
                        name: meta.name,
                        sector: meta.sector,
                        price: q.price,
                        change: q.change,
                        changePercent: prev !== 0 ? (q.change / prev) * 100 : 0,
                        volume: q.volume,
                    };
                });
                setStocks(mapped);
                setLastUpdated(new Date());
                return mapped;
            }
            const fallback = await getMarketData();
            setStocks(fallback ?? []);
            setLastUpdated(new Date());
            return fallback ?? [];
        } catch {
            const fallback = await getMarketData();
            if (fallback?.length) setStocks(fallback);
            setLastUpdated(new Date());
            return fallback ?? [];
        } finally {
            setLoading(false);
        }
    };

    // Fetch user holdings from Supabase
    const fetchHoldings = async (userId: string, priceMap: Record<string, number>) => {
        const { data: txns } = await supabase
            .from("transactions")
            .select("symbol, type, quantity, price_per_share")
            .eq("user_id", userId);
        if (txns && txns.length > 0) {
            setHoldings(buildHoldingsMap(txns as RawTransaction[], priceMap));
        }
    };

    useEffect(() => {
        if (profileLoading) return;

        (async () => {
            const fetched = await fetchStocks(true);
            const priceMap: Record<string, number> = {};
            fetched.forEach((s) => { priceMap[s.symbol] = s.price; });

            if (user) {
                await fetchHoldings(user.id, priceMap);
            }
        })();

        const interval = setInterval(() => fetchStocks(false), 60000);
        return () => clearInterval(interval);
    }, [user, profileLoading]);

    // ─── Derived data ─────────────────────────────────────────────────────────
    const sectors = useMemo(() => {
        const s = new Set(stocks.map((s) => s.sector));
        return ["All", ...Array.from(s).sort()];
    }, [stocks]);

    const sorted = useMemo(() => {
        const filtered = stocks.filter((s) => {
            const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
                s.name.toLowerCase().includes(search.toLowerCase());
            const matchSector = sectorFilter === "All" || s.sector === sectorFilter;
            return matchSearch && matchSector;
        });
        return [...filtered].sort((a, b) => {
            let av = 0, bv = 0;
            if (sortKey === "symbol") return sortDir === "asc"
                ? a.symbol.localeCompare(b.symbol)
                : b.symbol.localeCompare(a.symbol);
            if (sortKey === "price") { av = a.price; bv = b.price; }
            if (sortKey === "change") { av = a.changePercent; bv = b.changePercent; }
            if (sortKey === "volume") { av = a.volume; bv = b.volume; }
            return sortDir === "asc" ? av - bv : bv - av;
        });
    }, [stocks, search, sectorFilter, sortKey, sortDir]);

    const gainers = useMemo(() => [...stocks].filter(s => s.change > 0).sort((a, b) => b.changePercent - a.changePercent), [stocks]);
    const losers = useMemo(() => [...stocks].filter(s => s.change < 0).sort((a, b) => a.changePercent - b.changePercent), [stocks]);
    const topVolume = useMemo(() => [...stocks].sort((a, b) => b.volume - a.volume)[0], [stocks]);
    const ownedCount = Object.keys(holdings).length;

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    }

    return (
        <div className="space-y-8 pb-24 md:pb-12 font-instrument-sans">
            <DashboardHeader />

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-0">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#F9F9F9] tracking-tighter uppercase font-instrument-serif">Global Equities</h2>
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em] mt-2">
                        GSE_REPLICA — LATENCY_OPTIMIZED
                        {lastUpdated && (
                            <span className="ml-3 text-white/20">SYNC_TIME: {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {ownedCount > 0 && (
                        <div className="flex items-center gap-2 bg-[#C05E42]/10 px-4 py-2 rounded-[2px] border border-[#C05E42]/20">
                            <Activity size={14} className="text-[#C05E42]" />
                            <span className="text-[10px] font-black text-[#C05E42] uppercase tracking-widest">EXPOSURE: {ownedCount} ASSETS</span>
                        </div>
                    )}
                    <button
                        onClick={() => fetchStocks(false)}
                        className="p-3 bg-white/5 rounded-[2px] border border-white/10 hover:bg-white/10 transition-colors touch-manipulation group"
                        title="Force Refresh Sync"
                    >
                        <RefreshCw size={16} className="text-white/40 group-hover:text-[#F9F9F9] transition-colors" />
                    </button>
                </div>
            </div>

            {/* ── Market Pulse Strip ──────────────────────────────────────── */}
            {!loading && stocks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 md:px-0">
                    {/* Top Gainer */}
                    {gainers[0] && (
                        <div className="bg-[#10B981]/5 rounded-[2px] p-5 border border-[#10B981]/20 flex items-center gap-4 shadow-2xl">
                            <div className="w-12 h-12 rounded-[2px] bg-[#10B981]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <ArrowUpRight size={20} className="text-[#10B981]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.2em]">Momentum_Lead</div>
                                <div className="font-black text-[#F9F9F9] text-lg uppercase tracking-widest leading-tight">{gainers[0].symbol}</div>
                                <div className="text-[11px] font-black text-[#10B981] tabular-nums">+{gainers[0].changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Top Loser */}
                    {losers[0] && (
                        <div className="bg-red-500/5 rounded-[2px] p-5 border border-red-500/20 flex items-center gap-4 shadow-2xl">
                            <div className="w-12 h-12 rounded-[2px] bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <ArrowDownRight size={20} className="text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Volatility_Risk</div>
                                <div className="font-black text-[#F9F9F9] text-lg uppercase tracking-widest leading-tight">{losers[0].symbol}</div>
                                <div className="text-[11px] font-black text-red-500 tabular-nums">{losers[0].changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Most Traded */}
                    {topVolume && (
                        <div className="bg-[#C05E42]/5 rounded-[2px] p-5 border border-[#C05E42]/20 flex items-center gap-4 shadow-2xl">
                            <div className="w-12 h-12 rounded-[2px] bg-[#C05E42]/10 flex items-center justify-center flex-shrink-0">
                                <Zap size={20} className="text-[#C05E42]" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Liquidity_Peak</div>
                                <div className="font-black text-[#F9F9F9] text-lg uppercase tracking-widest leading-tight">{topVolume.symbol}</div>
                                <div className="text-[11px] font-black text-[#C05E42] uppercase tracking-widest">{(topVolume.volume / 1000).toFixed(1)}K Units</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Search & Controls ───────────────────────────────────────── */}
            <div className="bg-white/5 rounded-[2px] border border-white/10 p-6 shadow-2xl space-y-6 mx-4 md:mx-0">
                {/* Search bar */}
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                        type="text"
                        placeholder="IDENTIFY MARKET SYMBOLS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-[11px] font-black bg-white/5 border border-white/10 rounded-[2px] focus:bg-white/10 focus:border-[#C05E42]/50 outline-none transition-all placeholder:text-white/20 text-[#F9F9F9] uppercase tracking-widest"
                    />
                </div>

                {/* Sector filter chips */}
                <div className="flex gap-2 flex-wrap pb-2 border-b border-white/5">
                    {sectors.map((sec) => (
                        <button
                            key={sec}
                            onClick={() => setSectorFilter(sec)}
                            className={`px-4 py-2 rounded-[1px] text-[10px] font-black transition-all uppercase tracking-widest border ${sectorFilter === sec
                                ? "bg-[#C05E42] text-[#F9F9F9] border-[#C05E42] shadow-xl shadow-[#C05E42]/20"
                                : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-[#F9F9F9]"
                                } font-instrument-sans`}
                        >
                            {sec}
                        </button>
                    ))}
                </div>

                {/* Sort & view controls */}
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Sort_By:</span>
                        {(["symbol", "price", "change", "volume"] as SortKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => toggleSort(key)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-[1px] text-[10px] font-black transition-all uppercase tracking-widest ${sortKey === key
                                    ? "bg-[#C05E42]/10 text-[#C05E42] border border-[#C05E42]/30"
                                    : "bg-white/5 text-white/30 hover:text-white/60 border border-white/10"
                                    }`}
                            >
                                {key}
                                {sortKey === key && (
                                    <span className="text-[10px] tabular-nums font-black opacity-60">{sortDir === "asc" ? "↑" : "↓"}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {/* View toggle */}
                    <div className="flex gap-1.5 bg-white/5 p-1 rounded-[1px] border border-white/10">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-[1px] transition-all ${viewMode === "grid" ? "bg-[#C05E42]/20 text-[#C05E42] border border-[#C05E42]/30" : "text-white/20 hover:text-[#F9F9F9]"}`}
                        >
                            <Grid3X3 size={15} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-[1px] transition-all ${viewMode === "list" ? "bg-[#C05E42]/20 text-[#C05E42] border border-[#C05E42]/30" : "text-white/20 hover:text-[#F9F9F9]"}`}
                        >
                            <List size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Results count ───────────────────────────────────────────── */}
            {!loading && (
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-4 md:px-1">
                    INDEX_QUERY_MATCH: {sorted.length} ASSETS {sectorFilter !== "All" ? `IN ${sectorFilter.toUpperCase()}` : ""}
                    {search && ` / TERM: "${search.toUpperCase()}"`}
                </div>
            )}

            {/* ── Stock List ──────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-[2px] p-6 border border-white/10 animate-pulse h-[280px]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-[2px] bg-white/10" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-white/10 rounded-[1px] w-3/4" />
                                    <div className="h-3 bg-white/10 rounded-[1px] w-1/2" />
                                </div>
                            </div>
                            <div className="h-8 bg-white/10 rounded-[1px] w-1/2 mb-6" />
                            <div className="h-12 bg-white/10 rounded-[1px] mb-6" />
                            <div className="h-10 bg-[#C05E42]/10 rounded-[1px]" />
                        </div>
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="bg-white/5 rounded-[2px] border border-white/10 py-24 text-center shadow-2xl mx-4 md:mx-0">
                    <div className="w-20 h-20 rounded-[2px] bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-white/10" />
                    </div>
                    <h3 className="text-xl font-black text-[#F9F9F9] mb-2 uppercase tracking-[0.2em] font-instrument-serif">Null Response</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Adjust query parameters for asset discovery.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
                    {sorted.map((stock) => (
                        <StockRow
                            key={stock.symbol}
                            stock={stock}
                            holding={holdings[stock.symbol]}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 rounded-[2px] border border-white/10 shadow-2xl overflow-hidden mx-4 md:mx-0">
                    {/* List header */}
                    <div className="grid grid-cols-[auto_1fr_120px_120px_120px] gap-6 px-8 py-4 border-b border-white/10 bg-white/5">
                        {["ID", "Asset_Identifier", "Performance_Vector", "Val_Per_Unit", "Exec_Control"].map((h, i) => (
                            <div key={i} className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">{h}</div>
                        ))}
                    </div>
                    {sorted.map((stock) => (
                        <StockRow
                            key={stock.symbol}
                            stock={stock}
                            holding={holdings[stock.symbol]}
                            compact
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
