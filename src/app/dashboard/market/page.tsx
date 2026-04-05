"use client";

import { useEffect, useState, useMemo } from "react";
import { type Stock, GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { getMarketData, getBookmarks } from "@/app/actions/market";
import { StockRow, type StockHolding } from "@/components/market/StockRow";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
    Search, RefreshCw, Grid3X3, List, TrendingUp, TrendingDown,
    Activity, ArrowUpRight, ArrowDownRight, Zap
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { supabase } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { WatchlistPanel } from "@/components/market/WatchlistPanel";
import { Star } from "lucide-react";

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
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Bolt Performance: Debounce search input to prevent expensive filtering/sorting on every keystroke
    const debouncedSearch = useDebounce(search, 300);

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

    const fetchBookmarks = async () => {
        const b = await getBookmarks();
        setBookmarks(b);
    };

    useEffect(() => {
        if (profileLoading) return;

        (async () => {
            const fetched = await fetchStocks(true);
            const priceMap: Record<string, number> = {};
            fetched.forEach((s) => { priceMap[s.symbol] = s.price; });

            if (user) {
                await Promise.all([
                    fetchHoldings(user.id, priceMap),
                    fetchBookmarks()
                ]);
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

    // ⚡ BOLT OPTIMIZATION: Hoisted debouncedSearch.toLowerCase() outside the filter loop
    // to prevent redundant string transformations on every iteration.
    const sorted = useMemo(() => {
        const searchLower = debouncedSearch.toLowerCase();
        const filtered = stocks.filter((s) => {
            const matchSearch = s.symbol.toLowerCase().includes(searchLower) ||
                s.name.toLowerCase().includes(searchLower);
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
    }, [stocks, debouncedSearch, sectorFilter, sortKey, sortDir]);

    // Bolt Performance: O(N) single-pass computation for market pulse strip instead of multiple O(N log N) sorts
    const { topGainer, topLoser, topVolume } = useMemo(() => {
        let maxGain: Stock | null = null;
        let maxLoss: Stock | null = null;
        let maxVol: Stock | null = null;

        for (const s of stocks) {
            if (s.change > 0 && (!maxGain || s.changePercent > maxGain.changePercent)) maxGain = s;
            if (s.change < 0 && (!maxLoss || s.changePercent < maxLoss.changePercent)) maxLoss = s;
            if (!maxVol || s.volume > maxVol.volume) maxVol = s;
        }

        return { topGainer: maxGain, topLoser: maxLoss, topVolume: maxVol };
    }, [stocks]);

    const ownedCount = Object.keys(holdings).length;

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    }

    return (
        <div className="space-y-8 pb-24 md:pb-12 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Market Scanner</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-3">
                        GSE Live Quotes
                        {lastUpdated && (
                            <span className="text-muted-foreground opacity-60">Sync: {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {ownedCount > 0 && (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                            <Activity size={14} className="text-primary" />
                            <span className="text-xs font-semibold text-primary">Total Exposure: {ownedCount} assets</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsWatchlistOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border hover:bg-muted transition-colors shadow-sm group"
                        title="Open Watchlist"
                    >
                        <Star size={16} className={`group-hover:text-yellow-500 transition-colors ${bookmarks.length > 0 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                        <span className="text-xs font-bold text-foreground">Watchlist</span>
                        {bookmarks.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-md text-[10px]">
                                {bookmarks.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => fetchStocks(false)}
                        className="p-2.5 bg-card rounded-lg border border-border hover:bg-muted transition-colors group"
                        title="Force Refresh Sync"
                        aria-label="Refresh Market Data"
                    >
                        <RefreshCw size={16} className="text-muted-foreground group-hover:text-foreground transition-colors group-active:rotate-180" />
                    </button>
                </div>
            </div>

            {/* ── Market Pulse Strip ──────────────────────────────────────── */}
            {!loading && stocks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 md:px-0">
                    {/* Top Gainer */}
                    {topGainer && (
                        <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 hover:border-emerald-500/30 transition-all group shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <ArrowUpRight size={20} className="text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Top Gainer</div>
                                <div className="font-bold text-foreground text-lg tracking-tight leading-tight">{topGainer.symbol}</div>
                                <div className="text-xs font-semibold text-emerald-500 tabular-nums">+{topGainer.changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Top Loser */}
                    {topLoser && (
                        <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 hover:border-red-500/30 transition-all group shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <ArrowDownRight size={20} className="text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Top Loser</div>
                                <div className="font-bold text-foreground text-lg tracking-tight leading-tight">{topLoser.symbol}</div>
                                <div className="text-xs font-semibold text-red-500 tabular-nums">{topLoser.changePercent.toFixed(2)}%</div>
                            </div>
                        </div>
                    )}
                    {/* Most Traded */}
                    {topVolume && (
                        <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 hover:border-blue-500/30 transition-all group shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Zap size={20} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Most Active</div>
                                <div className="font-bold text-foreground text-lg tracking-tight leading-tight">{topVolume.symbol}</div>
                                <div className="text-xs font-semibold text-primary tabular-nums">{(topVolume.volume / 1000).toFixed(1)}K Vol</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Search & Controls ───────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6 mx-4 md:mx-0 shadow-sm">
                {/* Search bar */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search symbols or company names..."
                        aria-label="Search global equities"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 text-sm font-semibold bg-muted/30 border border-border rounded-xl focus:bg-muted/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-inner shadow-black/5"
                    />
                </div>

                {/* Sector filter - Pills on desktop, Select on mobile */}
                <div className="border-b border-border pb-6">
                    <div className="hidden md:flex flex-wrap gap-2">
                        {sectors.map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setSectorFilter(sec)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${sectorFilter === sec
                                    ? "bg-primary text-white shadow-primary/20"
                                    : "bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>
                    <div className="md:hidden">
                        <label htmlFor="sector-filter" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Filter by Sector</label>
                        <select
                            id="sector-filter"
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-sm font-semibold text-foreground outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                        >
                            {sectors.map((sec) => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sort & view controls */}
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground mr-2">Sort by</span>
                        {(["symbol", "price", "change", "volume"] as SortKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => toggleSort(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortKey === key
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                {sortKey === key && (
                                    <span className="text-[10px] opacity-80">{sortDir === "asc" ? "↑" : "↓"}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    {/* View toggle */}
                    <div className="flex gap-1 bg-muted/20 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            aria-label="Grid View"
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            aria-label="List View"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Results count ───────────────────────────────────────────── */}
            {!loading && (
                <div className="text-xs font-medium text-muted-foreground px-4 md:px-1">
                    Showing {sorted.length} assets {sectorFilter !== "All" ? `in ${sectorFilter}` : ""}
                    {search && ` matching "${search}"`}
                </div>
            )}

            {/* ── Stock List ──────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.05] animate-pulse h-[280px]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-white/[0.05] rounded-md w-3/4" />
                                    <div className="h-3 bg-white/[0.05] rounded-md w-1/2" />
                                </div>
                            </div>
                            <div className="h-8 bg-white/[0.05] rounded-md w-1/2 mb-6" />
                            <div className="h-12 bg-white/[0.05] rounded-md mb-6" />
                            <div className="h-10 bg-blue-500/10 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border py-24 text-center mx-4 md:mx-0 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-6 border border-border">
                        <Search size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">No assets found</h3>
                    <p className="text-xs text-muted-foreground font-medium">Try adjusting your search or filters.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
                    {sorted.map((stock) => (
                        <StockRow
                            key={stock.symbol}
                            stock={stock}
                            holding={holdings[stock.symbol]}
                            initialIsBookmarked={bookmarks.includes(stock.symbol)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden mx-4 md:mx-0 shadow-sm">
                    {/* List header */}
                    <div className="grid grid-cols-[auto_1fr_120px_120px_120px] gap-6 px-8 py-3.5 border-b border-border bg-muted/10">
                        {["Symbol", "Asset", "Trend", "Price", "Action"].map((h, i) => (
                            <div key={i} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{h}</div>
                        ))}
                    </div>
                    {sorted.map((stock) => (
                        <StockRow
                            key={stock.symbol}
                            stock={stock}
                            holding={holdings[stock.symbol]}
                            initialIsBookmarked={bookmarks.includes(stock.symbol)}
                            compact
                        />
                    ))}
                </div>
            )}

            {/* Watchlist Panel (Sidebar) */}
            <WatchlistPanel isOpen={isWatchlistOpen} onClose={() => setIsWatchlistOpen(false)} />
        </div>
    );
}
