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
        <div className="space-y-5 pb-24 md:pb-12">
            <DashboardHeader />

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Stocks</h2>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                        Ghana Stock Exchange — live prices
                        {lastUpdated && (
                            <span className="ml-2 text-xs text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {ownedCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                            <Activity size={13} className="text-indigo-600" />
                            <span className="text-xs font-black text-indigo-700">You own {ownedCount} stock{ownedCount !== 1 ? "s" : ""}</span>
                        </div>
                    )}
                    <button
                        onClick={() => fetchStocks(false)}
                        className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
                        title="Refresh"
                    >
                        <RefreshCw size={15} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* ── Market Pulse Strip ──────────────────────────────────────── */}
            {!loading && stocks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Top Gainer */}
                    {gainers[0] && (
                        <div className="bg-white rounded-2xl p-4 border border-emerald-100 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <ArrowUpRight size={18} className="text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Top Gainer</div>
                                <div className="font-black text-gray-900">{gainers[0].symbol}</div>
                                <div className="text-xs font-black text-emerald-600">+{gainers[0].changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Top Loser */}
                    {losers[0] && (
                        <div className="bg-white rounded-2xl p-4 border border-red-100 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <ArrowDownRight size={18} className="text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Top Loser</div>
                                <div className="font-black text-gray-900">{losers[0].symbol}</div>
                                <div className="text-xs font-black text-red-600">{losers[0].changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Most Traded */}
                    {topVolume && (
                        <div className="bg-white rounded-2xl p-4 border border-amber-100 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Zap size={18} className="text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Most Traded</div>
                                <div className="font-black text-gray-900">{topVolume.symbol}</div>
                                <div className="text-xs font-black text-amber-700">{(topVolume.volume / 1000).toFixed(1)}K vol</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Search & Controls ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                {/* Search bar */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search stocks, companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Sector filter chips */}
                <div className="flex gap-2 flex-wrap">
                    {sectors.map((sec) => (
                        <button
                            key={sec}
                            onClick={() => setSectorFilter(sec)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sectorFilter === sec
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {sec}
                        </button>
                    ))}
                </div>

                {/* Sort & view controls */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sort:</span>
                        {(["symbol", "price", "change", "volume"] as SortKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => toggleSort(key)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${sortKey === key
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent"
                                    }`}
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                {sortKey === key && (
                                    <span className="text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {/* View toggle */}
                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Grid3X3 size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Results count ───────────────────────────────────────────── */}
            {!loading && (
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                    {sorted.length} stock{sorted.length !== 1 ? "s" : ""} {sectorFilter !== "All" ? `in ${sectorFilter}` : ""}
                    {search && ` matching "${search}"`}
                </div>
            )}

            {/* ── Stock List ──────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-gray-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-6 bg-gray-100 rounded w-1/2 mb-2" />
                            <div className="h-10 bg-gray-50 rounded-xl mb-3" />
                            <div className="h-9 bg-gray-100 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-black text-gray-700 mb-2">No stocks found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sorted.map((stock) => (
                        <StockRow
                            key={stock.symbol}
                            stock={stock}
                            holding={holdings[stock.symbol]}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* List header */}
                    <div className="grid grid-cols-[auto_1fr_80px_90px_80px] gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                        {["", "Company", "Sparkline", "Price / Chg", "Action"].map((h, i) => (
                            <div key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</div>
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
