"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStocks, GSE_API_BASE, type Stock } from "@/lib/market-data";
import {
    TrendingUp, TrendingDown, RefreshCcw, Briefcase, Plus,
    Wallet, ShieldCheck, ArrowUpRight, BarChart3, PieChart,
    Activity, Eye, Layers, Target, Zap, AlertTriangle, CheckCircle2
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useUserProfile } from "@/lib/useUserProfile";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { PortfolioChart, type PortfolioDataPoint } from "@/components/dashboard/PortfolioChart";
import Link from "next/link";
import { getPortfolioData, type PortfolioData, type Holding } from "@/app/actions/portfolio";

// Local types moved to actions/portfolio.ts or reused
interface RawTransaction {
    id: string;
    type: "BUY" | "SELL";
    symbol: string;
    quantity: number;
    price_per_share: number;
    total_amount: number;
    created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SECTOR_COLORS: Record<string, string> = {
    Finance: "#C05E42", Telecom: "#2B59FF", Mining: "#F59E0B",
    Energy: "#EF4444", Consumer: "#EC4899", Agriculture: "#10B981",
    Technology: "#06B6D4", "Mutual Funds": "#8B5CF6", Cash: "#94A3B8", Other: "#475569",
};

function hhi(weights: number[]): number {
    return weights.reduce((s, w) => s + w * w, 0);
}

/** Compute a 0-100 risk score from sector concentration + cash drag + asset mix */
function computeRiskScore(
    sectorWeights: number[],   // fraction per sector (stocks only)
    cashFraction: number,
    mfFraction: number,
    stockFraction: number,
): { score: number; label: string; color: string } {
    const concentration = hhi(sectorWeights);         // 0-1; 1 = one sector
    const concentrationScore = concentration * 60;    // up to 60 pts
    const cashScore = Math.max(0, 10 - cashFraction * 100);   // low cash = lower risk buffer
    const mixScore = stockFraction > 0.85 ? 20 : stockFraction > 0.6 ? 12 : 6; // asset mix
    const raw = Math.min(100, concentrationScore + cashScore + mixScore);
    const score = Math.round(raw);
    const label = score < 30 ? "Conservative" : score < 55 ? "Moderate" : score < 75 ? "Aggressive" : "Very High";
    const color = score < 30 ? "#10B981" : score < 55 ? "#F59E0B" : score < 75 ? "#F97316" : "#EF4444";
    return { score, label, color };
}

/** Build portfolio value timeline from sorted transactions */
function buildTimeline(
    transactions: RawTransaction[],
    priceMap: Map<string, number>,
    startBalance: number,
): PortfolioDataPoint[] {
    const sorted = [...transactions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    if (sorted.length === 0) return [];

    let cash = startBalance;
    const holdingQty = new Map<string, number>();
    const holdingCost = new Map<string, number>();
    const points: PortfolioDataPoint[] = [];

    // Opening snapshot
    const firstDate = new Date(sorted[0].created_at);
    points.push({
        label: firstDate.toLocaleDateString("en-GH", { month: "short", day: "numeric" }),
        value: startBalance,
        date: sorted[0].created_at,
        open: startBalance,
        high: startBalance,
        low: startBalance,
        close: startBalance
    });

    sorted.forEach((tx, i) => {
        const qty = holdingQty.get(tx.symbol) ?? 0;
        const cost = holdingCost.get(tx.symbol) ?? 0;
        if (tx.type === "BUY") {
            holdingQty.set(tx.symbol, qty + tx.quantity);
            holdingCost.set(tx.symbol, cost + tx.total_amount);
            cash -= tx.total_amount;
        } else {
            holdingQty.set(tx.symbol, Math.max(0, qty - tx.quantity));
            const avgCost = qty > 0 ? cost / qty : 0;
            holdingCost.set(tx.symbol, Math.max(0, cost - avgCost * tx.quantity));
            cash += tx.total_amount;
        }

        let stocksValue = 0;
        holdingQty.forEach((q, sym) => {
            stocksValue += q * (priceMap.get(sym) ?? 0);
        });

        const currentValue = Math.max(0, cash + stocksValue);
        const date = new Date(tx.created_at);
        const label = date.toLocaleDateString("en-GH", { month: "short", day: "numeric" });

        // Generate simulated OHLC based on the current value and a bit of noise
        const lastValue = points.length > 0 ? points[points.length - 1].value : startBalance;
        const range = Math.max(currentValue, lastValue) * 0.02; // 2% range for simulation
        const open = lastValue;
        const close = currentValue;
        const high = Math.max(open, close) + (Math.random() * range);
        const low = Math.max(0, Math.min(open, close) - (Math.random() * range));

        points.push({
            label,
            value: currentValue,
            date: tx.created_at,
            open,
            high,
            low,
            close
        });
    });

    return points;
}

/** Slice timeline by period */
function sliceByPeriod(points: PortfolioDataPoint[], period: string): PortfolioDataPoint[] {
    if (period === "ALL" || points.length === 0) return points;
    const now = Date.now();
    const dayMs = 86_400_000;
    const cutoffs: Record<string, number> = {
        "1W": 7, "1M": 30, "3M": 90, "1Y": 365,
    };
    const days = cutoffs[period];
    if (!days) return points;
    const cutoff = now - days * dayMs;
    const filtered = points.filter(p => new Date(p.date).getTime() >= cutoff);
    return filtered.length > 1 ? filtered : points.slice(-2);
}

// ─── Component ───────────────────────────────────────────────────────────────
const PERIODS = ["1W", "1M", "3M", "1Y", "ALL"] as const;
type Period = typeof PERIODS[number];

export default function PortfolioPage() {
    const { user, loading: profileLoading } = useUserProfile();
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [mutualFundHoldings, setMutualFundHoldings] = useState<any[]>([]);
    const [allTransactions, setAllTransactions] = useState<RawTransaction[]>([]);
    const [priceMapState, setPriceMapState] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    const [mutualFundsValue, setMutualFundsValue] = useState(0);
    const [cashBalance, setCashBalance] = useState(10000);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("1M");
    const [chartType, setChartType] = useState<'area' | 'bar' | 'candle'>('area');
    const [holdingsTab, setHoldingsTab] = useState<"all" | "stocks" | "funds">("all");

    const STARTING_BALANCE = 10000;

    async function fetchData(isRefresh = false, userId?: string) {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        if (!userId) { setLoading(false); setRefreshing(false); return; }

        try {
            const data = await getPortfolioData();
            if (data) {
                setHoldings(data.holdings);
                setMutualFundHoldings(data.mutualFundHoldings);
                setCashBalance(data.cashBalance);
                setTotalValue(data.totalValue);
                setMutualFundsValue(data.mutualFundsValue);

                // Fetch transactions for the chart
                const { data: txData } = await supabase
                    .from("transactions").select("*").eq("user_id", userId);
                setAllTransactions(txData ?? []);

                // Set price map for the chart logic if needed
                const priceMap = new Map(data.holdings.map(h => [h.symbol, h.currentPrice]));
                setPriceMapState(priceMap);
            }
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (!profileLoading) {
            fetchData(false, user?.id);
        }
    }, [user, profileLoading]);

    // ─── Derived Metrics ──────────────────────────────────────────────────────
    const totalEquity = totalValue + mutualFundsValue + cashBalance;
    const totalGain = totalEquity - STARTING_BALANCE;
    const totalGainPercent = (totalGain / STARTING_BALANCE) * 100;
    const isPositive = totalGain >= 0;

    // Allocation data for donut chart
    const sectorData = useMemo(() => {
        const acc: { name: string; value: number; color: string }[] = [];
        holdings.forEach(h => {
            const ex = acc.find(a => a.name === h.sector);
            if (ex) { ex.value += h.marketValue; }
            else { acc.push({ name: h.sector, value: h.marketValue, color: SECTOR_COLORS[h.sector] ?? "#64748B" }); }
        });
        if (mutualFundsValue > 0) acc.push({ name: "Mutual Funds", value: mutualFundsValue, color: SECTOR_COLORS["Mutual Funds"] });
        if (cashBalance > 0) acc.push({ name: "Cash", value: cashBalance, color: SECTOR_COLORS["Cash"] });
        return acc;
    }, [holdings, mutualFundsValue, cashBalance]);

    // Risk score (real)
    const riskAssessment = useMemo(() => {
        const invTotal = totalValue + mutualFundsValue;
        if (invTotal === 0 && cashBalance === 0) return { score: 0, label: "No Portfolio", color: "#9CA3AF" };
        const grand = totalEquity;
        const sectorWeights = sectorData
            .filter(s => s.name !== "Cash" && s.name !== "Mutual Funds")
            .map(s => s.value / (invTotal || 1));
        const cashFraction = cashBalance / (grand || 1);
        const mfFraction = mutualFundsValue / (grand || 1);
        const stockFraction = totalValue / (grand || 1);
        return computeRiskScore(sectorWeights, cashFraction, mfFraction, stockFraction);
    }, [sectorData, totalValue, mutualFundsValue, cashBalance, totalEquity]);

    // Portfolio health indicators
    const numAssetClasses = [totalValue > 0, mutualFundsValue > 0, cashBalance > 0].filter(Boolean).length;
    const numSectors = new Set(holdings.map(h => h.sector)).size;
    const diversificationScore = Math.min(100, (numSectors * 20) + (numAssetClasses * 15));
    const winRate = holdings.length > 0 ? Math.round((holdings.filter(h => h.gain > 0).length / holdings.length) * 100) : 0;

    // Key metrics (real)
    // ⚡ BOLT OPTIMIZATION: Memoize O(n) array reduction computations to prevent running
    // them synchronously on every re-render (e.g. tab switches, hover states).
    const { bestPosition, worstPosition, totalInvested, avgPositionSize } = useMemo(() => {
        const best = holdings.length > 0 ? holdings.reduce((b, h) => h.gainPercent > b.gainPercent ? h : b, holdings[0]) : null;
        const worst = holdings.length > 0 ? holdings.reduce((w, h) => h.gainPercent < w.gainPercent ? h : w, holdings[0]) : null;
        const invested = holdings.reduce((s, h) => s + h.totalCost, 0) + mutualFundHoldings.reduce((s: number, h: any) => s + (h.total_invested ?? 0), 0);
        const avgSize = holdings.length > 0 ? totalValue / holdings.length : 0;
        return { bestPosition: best, worstPosition: worst, totalInvested: invested, avgPositionSize: avgSize };
    }, [holdings, mutualFundHoldings, totalValue]);

    // Sector performance (real)
    const sectorPerformance = useMemo(() => {
        const map = new Map<string, { invested: number; current: number }>();
        holdings.forEach(h => {
            const ex = map.get(h.sector) ?? { invested: 0, current: 0 };
            ex.invested += h.totalCost;
            ex.current += h.marketValue;
            map.set(h.sector, ex);
        });
        if (mutualFundsValue > 0) {
            const mfInvested = mutualFundHoldings.reduce((s: number, h: any) => s + (h.total_invested ?? 0), 0);
            map.set("Mutual Funds", { invested: mfInvested, current: mutualFundsValue });
        }
        return Array.from(map.entries())
            .map(([name, { invested, current }]) => ({
                name,
                gain: current - invested,
                gainPct: invested > 0 ? ((current - invested) / invested) * 100 : 0,
                allocation: totalEquity > 0 ? ((current / totalEquity) * 100).toFixed(1) : "0",
                color: SECTOR_COLORS[name] ?? "#64748B",
            }))
            .sort((a, b) => b.gainPct - a.gainPct);
    }, [holdings, mutualFundHoldings, mutualFundsValue, totalEquity]);

    // Performance timeline
    const fullTimeline = useMemo(() =>
        buildTimeline(allTransactions, priceMapState, STARTING_BALANCE),
        [allTransactions, priceMapState]
    );
    const chartData = useMemo(() =>
        sliceByPeriod(fullTimeline, selectedPeriod),
        [fullTimeline, selectedPeriod]
    );

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/20 font-sans">
            <RefreshCcw size={40} className="animate-spin mb-6 text-primary opacity-50" />
            <p className="text-xs font-semibold uppercase tracking-widest">Aggregating Asset Data...</p>
        </div>
    );

    const hasAnyAssets = holdings.length > 0 || mutualFundHoldings.length > 0;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="pb-24 space-y-8 md:space-y-12 font-sans">
            <DashboardHeader />

            {/* ── Header ── */}
            <div className="relative rounded-2xl p-8 md:p-12 bg-card border border-border shadow-premium overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />

                <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-xl bg-muted/30 border border-border flex items-center justify-center flex-shrink-0">
                                <Briefcase size={24} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight uppercase font-syne">Strategic Portfolio</h1>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mt-2">Asset Concentration & Risk Vectors</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                    GH₵{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-2">Active Equity Value</div>
                                <div className={`text-xs font-semibold mt-3 flex items-center gap-2 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                    {isPositive ? "▲" : "▼"} {totalGain >= 0 ? "+" : ""}GH₵{Math.abs(totalGain).toFixed(2)} All-Time
                                </div>
                            </div>
                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <div className={`text-2xl font-bold tabular-nums tracking-tight ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                    {totalGain >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%
                                </div>
                                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-2">Composite Return</div>
                                <div className="text-[11px] font-semibold text-muted-foreground mt-3 uppercase tracking-widest">
                                    Base: GH₵{STARTING_BALANCE.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <div className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                                    GH₵{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-2">Available Liquidity</div>
                                <div className="text-[11px] font-bold text-muted-foreground mt-3 uppercase tracking-widest">
                                    {totalEquity > 0 ? ((cashBalance / totalEquity) * 100).toFixed(1) : 0}% Liquid Ratio
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard/market" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                            <Plus size={16} /> Asset Acquisition
                        </Link>
                        <button
                            onClick={() => fetchData(true, user?.id)}
                            disabled={refreshing}
                            className="px-6 py-4 bg-muted text-foreground border border-border font-semibold rounded-xl hover:bg-muted/80 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest disabled:opacity-30"
                            aria-label="Refresh Portfolio"
                        >
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Analytics Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Performance Chart */}
                <div className="lg:col-span-8">
                    <div className="bg-card rounded-2xl border border-border shadow-premium overflow-hidden flex flex-col group h-full">
                        <div className="p-8 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-muted/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted/30 rounded-xl border border-border flex items-center justify-center text-primary">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Equity Timeline</h3>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">Performance Vector Analysis</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Chart Type Toggle */}
                                <div className="flex flex-wrap gap-1 p-1 bg-muted/30 border border-border rounded-xl max-w-full">
                                    {(['area', 'bar', 'candle'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${chartType === type ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                {/* Period Toggle */}
                                <div className="flex flex-wrap gap-1 p-1 bg-muted/30 border border-border rounded-xl max-w-full no-scrollbar">
                                    {PERIODS.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedPeriod(p)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 uppercase tracking-widest ${selectedPeriod === p
                                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground border border-transparent'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col min-h-[440px]">
                            <PortfolioChart
                                data={chartData}
                                period={selectedPeriod}
                                startingValue={STARTING_BALANCE}
                                chartType={chartType}
                            />
                            {chartData.length === 0 && (
                                <div className="mt-auto pb-8 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Trade History — Awaiting Execution</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Risk Assessment — real */}
                    <div className="bg-card border border-border rounded-2xl p-8 text-foreground relative overflow-hidden shadow-premium">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-6 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-primary" /> Risk Exposure
                            </div>
                            <div className="text-3xl font-bold mb-2 tracking-tight uppercase" style={{ color: riskAssessment.color }}>
                                {riskAssessment.label}
                            </div>
                            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-8">Intensity Index: {riskAssessment.score}/100</div>
                            <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden mb-10">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${riskAssessment.score}%`,
                                        background: riskAssessment.color
                                    }}
                                />
                            </div>
                            {/* Portfolio health indicators */}
                            <div className="space-y-3">
                                {[
                                    { label: "Stability Depth", val: `${diversificationScore}/100`, ok: diversificationScore >= 50 },
                                    { label: "Asset Diversity", val: `${numAssetClasses} CLASSES`, ok: numAssetClasses >= 2 },
                                    { label: "Sector Spread", val: `${numSectors} AREAS`, ok: numSectors >= 3 },
                                    { label: "Execution Accuracy", val: `${winRate}%`, ok: winRate >= 50 },
                                ].map(({ label, val, ok }) => (
                                    <div key={label} className="flex items-center justify-between bg-muted/20 border border-border rounded-xl px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${ok ? "text-emerald-500" : "text-red-500"}`}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Allocation donut */}
                    <div className="bg-card border border-border rounded-2xl shadow-premium p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center border border-border">
                                <PieChart size={18} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Concentration</h3>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Asset Distribution</p>
                            </div>
                        </div>
                        {sectorData.length > 0 ? (
                            <div className="h-[220px]">
                                <AllocationChart data={sectorData} />
                            </div>
                        ) : (
                            <div className="h-[140px] flex items-center justify-center text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                                No Asset Data
                            </div>
                        )}
                        {sectorData.length > 0 && <div className="border-t border-border my-6" />}
                        <div className="space-y-3">
                            {(() => {
                                // ⚡ BOLT OPTIMIZATION: Calculate total once outside the loop instead of O(n) inside every map iteration
                                const totalSectorValue = sectorData.reduce((a, b) => a + b.value, 0);
                                return sectorData.slice(0, 5).map(s => (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-foreground tabular-nums">GH₵{s.value.toFixed(0)}</span>
                                            <span className="text-[10px] font-black text-foreground w-12 text-right tabular-nums tracking-tighter">
                                                {totalSectorValue > 0 ? ((s.value / totalSectorValue) * 100).toFixed(1) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Metrics + Sector Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Key Metrics — real */}
                <div className="bg-card border border-border rounded-2xl shadow-premium p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center border border-border">
                            <Activity size={18} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Portfolio Efficiency</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Core Metric Aggregates</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                label: "Accuracy Ratio", value: `${winRate}%`,
                                sub: `${holdings.filter(h => h.gain > 0).length + mutualFundHoldings.filter((h: any) => (h.current_value ?? 0) > (h.total_invested ?? 0)).length} POSITIVE ASSETS`,
                                color: "text-emerald-500", bgColor: "bg-emerald-500/5 border-emerald-500/10"
                            },
                            {
                                label: "Deployed Capital", value: `GH₵${totalInvested.toFixed(0)}`,
                                sub: "AGGREGATE EXPOSURE", color: "text-primary", bgColor: "bg-primary/5 border-primary/10"
                            },
                            {
                                label: "Peak Momentum",
                                value: bestPosition ? `${bestPosition.gainPercent >= 0 ? "+" : ""}${bestPosition.gainPercent.toFixed(1)}%` : "—",
                                sub: bestPosition?.symbol ?? "NO ASSETS",
                                color: "text-emerald-500", bgColor: "bg-emerald-500/5 border-emerald-500/10"
                            },
                            {
                                label: "Volatility Drag",
                                value: worstPosition ? `${worstPosition.gainPercent >= 0 ? "+" : ""}${worstPosition.gainPercent.toFixed(1)}%` : "—",
                                sub: worstPosition?.symbol ?? "NO ASSETS",
                                color: worstPosition && worstPosition.gainPercent < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
                                bgColor: worstPosition && worstPosition.gainPercent < 0 ? "bg-red-500/10 border-red-500/20" : "bg-muted/30 border-border"
                            },
                            {
                                label: "Avg Position Size",
                                value: `GH₵${avgPositionSize.toFixed(0)}`,
                                sub: `${holdings.length} POSITIONS`,
                                color: "text-primary-foreground", bgColor: "bg-[--brand-primary] shadow-xl shadow-primary/20 border-primary"
                            },
                            {
                                label: "Infrastructure",
                                value: `${numAssetClasses}`,
                                sub: [totalValue > 0 && "EQUITY", mutualFundsValue > 0 && "FUNDS", cashBalance > 0 && "LIQUID"].filter(Boolean).join(" | ") || "NONE",
                                color: "text-primary", bgColor: "bg-primary/5 border-primary/10"
                            },
                        ].map(m => (
                            <div key={m.label} className={`${m.bgColor} rounded-xl p-5 border`}>
                                <div className={`text-xl font-bold tabular-nums tracking-tight font-syne ${m.color}`}>{m.value}</div>
                                <div className="text-[10px] font-bold text-[--text-primary] dark:text-[--text-dark-primary] uppercase tracking-widest mt-2">{m.label}</div>
                                <div className="text-[9px] font-semibold text-muted-foreground mt-1 uppercase tracking-widest truncate">{m.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sector Performance — real */}
                <div className="bg-card border border-border rounded-2xl shadow-premium p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center border border-border">
                            <Layers size={18} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Sector Dynamics</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Cross-Area Yield Analysis</p>
                        </div>
                    </div>
                    {sectorPerformance.length > 0 ? (
                        <div className="space-y-6">
                            {(() => {
                                // ⚡ BOLT OPTIMIZATION: Calculate maxAbs once instead of O(n) re-calculation inside every map iteration
                                const maxAbs = Math.max(...sectorPerformance.map(x => Math.abs(x.gainPct)), 1);
                                return sectorPerformance.map(s => (
                                    <div key={s.name} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                                                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{s.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{s.allocation}% EXPOSURE</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[11px] font-bold tabular-nums tracking-tight ${s.gainPct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                        {s.gainPct >= 0 ? "+" : ""}{s.gainPct.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-muted/30 rounded-[1px] overflow-hidden">
                                            <div
                                                className="h-full rounded-[1px] transition-all duration-700"
                                                style={{
                                                    width: `${(Math.abs(s.gainPct) / maxAbs) * 100}%`,
                                                    background: s.gainPct >= 0 ? "#10B981" : "#EF4444",
                                                    marginLeft: s.gainPct < 0 ? "auto" : undefined
                                                }}
                                            />
                                        </div>
                                        <div className={`text-[8px] mt-2 font-black uppercase tracking-[0.2em] ${s.gain >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                                            Net_Delta: {s.gain >= 0 ? "+" : ""}GH₵{s.gain.toFixed(2)}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-white/10">
                            <Target size={32} className="mb-4 opacity-50" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No Sector Data Available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Holdings Table ── */}
            <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
                <div className="px-8 py-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                            <Briefcase size={20} className="text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-foreground uppercase tracking-widest">Asset Registry</h3>
                            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-widest mt-1">
                                {holdings.length} EQUITIES · {mutualFundHoldings.length} FUNDS
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Holdings tabs - scrollable on mobile */}
                        <div className="flex gap-1 p-1 bg-muted/30 border border-border rounded-xl overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap lg:whitespace-normal max-w-[280px] sm:max-w-none pr-8">
                            {([["all", "ALL ASSETS"], ["stocks", "EQUITIES"], ["funds", "FUNDS"]] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setHoldingsTab(key)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest flex-shrink-0 ${holdingsTab === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >{label}</button>
                            ))}
                        </div>
                        <Link href="/dashboard/market" className="px-5 py-2.5 bg-muted text-foreground border border-border rounded-xl text-[10px] font-bold hover:bg-muted/80 transition-all uppercase tracking-widest flex items-center gap-2">
                            <Plus size={14} /> ACQUIRE
                        </Link>
                    </div>
                </div>

                {!hasAnyAssets ? (
                    <div className="py-32 text-center px-8">
                        <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-8 border border-border">
                            <Wallet size={32} className="text-muted-foreground/30" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-4 uppercase tracking-tight">No Active Assets</h4>
                        <p className="text-[11px] font-medium text-muted-foreground mb-10 uppercase tracking-widest">Execute initial market protocols to populate your portfolio.</p>
                        <Link href="/dashboard/market" className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest">
                            <Eye size={16} /> Market Discovery
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stock Holdings */}
                        {(holdingsTab === "all" || holdingsTab === "stocks") && holdings.length > 0 && (
                            <>
                                {holdingsTab === "all" && (
                                    <div className="px-8 py-4 bg-muted/30 border-b border-border">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">EQUITIES</span>
                                    </div>
                                )}
                                {/* Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <th className="px-8 py-5">Asset</th>
                                                <th className="px-6 py-5 text-right">Units</th>
                                                <th className="px-6 py-5 text-right">Avg Cost</th>
                                                <th className="px-6 py-5 text-right">Current Price</th>
                                                <th className="px-6 py-5 text-right">Total Value</th>
                                                <th className="px-8 py-5 text-right">Net P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {holdings.map(h => (
                                                <tr key={h.symbol} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs border transition-all tracking-widest ${h.gain >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                                                                {h.symbol.substring(0, 2)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-foreground uppercase tracking-widest text-sm group-hover:text-primary transition-colors">{h.symbol}</div>
                                                                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">{h.sector}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-right font-bold text-foreground tabular-nums tracking-collapse text-sm">{h.quantity.toLocaleString()}</td>
                                                    <td className="px-6 py-6 text-right font-semibold text-muted-foreground tabular-nums">GH₵{h.averageCost.toFixed(2)}</td>
                                                    <td className="px-6 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="font-bold text-foreground tabular-nums">GH₵{h.currentPrice.toFixed(2)}</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-right font-bold text-foreground tabular-nums">
                                                        GH₵{h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className={`font-bold text-sm tabular-nums tracking-loose ${h.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            {h.gain >= 0 ? "+" : ""}GH₵{Math.abs(h.gain).toFixed(2)}
                                                        </div>
                                                        <div className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${h.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            {h.gainPercent >= 0 ? "+" : ""}{h.gainPercent.toFixed(2)}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile */}
                                <div className="md:hidden space-y-4 p-6">
                                    {holdings.map(h => (
                                        <div key={h.symbol} className="bg-muted/10 rounded-xl p-6 border border-border">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs border flex-shrink-0 ${h.gain >= 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                        {h.symbol.substring(0, 2)}
                                                    </div>
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <div className="font-bold text-foreground uppercase tracking-widest truncate">{h.symbol}</div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 truncate">{h.sector}</div>
                                                    </div>
                                                </div>
                                                <div className={`text-right flex-shrink-0 ${h.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    <div className="font-bold tabular-nums tracking-tight">{h.gain >= 0 ? "+" : ""}GH₵{Math.abs(h.gain).toFixed(2)}</div>
                                                    <div className="text-[10px] font-semibold uppercase tracking-widest">{h.gainPercent >= 0 ? "+" : ""}{h.gainPercent.toFixed(2)}%</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border font-sans">
                                                {[
                                                    ["Units", h.quantity.toLocaleString()],
                                                    ["Avg Cost", `GH₵${h.averageCost.toFixed(2)}`],
                                                    ["Live Price", `GH₵${h.currentPrice.toFixed(2)}`],
                                                    ["Session Val", `GH₵${h.marketValue.toFixed(2)}`],
                                                ].map(([label, val]) => (
                                                    <div key={label}>
                                                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{label}</div>
                                                        <div className="text-xs font-bold text-foreground tabular-nums">{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Mutual Fund Holdings */}
                        {(holdingsTab === "all" || holdingsTab === "funds") && mutualFundHoldings.length > 0 && (
                            <>
                                {holdingsTab === "all" && (
                                    <div className="px-8 py-4 bg-primary/5 border-t border-b border-primary/10">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">MANAGED FUNDS</span>
                                    </div>
                                )}
                                {/* Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <th className="px-8 py-5">Fund Identifier</th>
                                                <th className="px-6 py-5 text-right">Units</th>
                                                <th className="px-6 py-5 text-right">Avg NAV</th>
                                                <th className="px-6 py-5 text-right">Live NAV</th>
                                                <th className="px-6 py-5 text-right">Current Val</th>
                                                <th className="px-8 py-5 text-right">Net P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.06]">
                                            {mutualFundHoldings.map((h: any) => {
                                                const gain = (h.current_value ?? 0) - (h.total_invested ?? 0);
                                                const gainPct = h.total_invested > 0 ? (gain / h.total_invested) * 100 : 0;
                                                return (
                                                    <tr key={h.fund_id} className="hover:bg-muted/10 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs tracking-widest">
                                                                    MF
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-[--text-primary] dark:text-[--text-dark-primary] uppercase tracking-widest text-sm">{h.fund_name ?? "Mutual Fund"}</div>
                                                                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">{h.fund_type ?? "Fund"}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-right font-bold text-[--text-primary] dark:text-[--text-dark-primary] tabular-nums tracking-tight text-sm">{(h.units_held ?? 0).toFixed(4)}</td>
                                                        <td className="px-6 py-6 text-right font-semibold text-muted-foreground tabular-nums">GH₵{(h.average_nav ?? 0).toFixed(4)}</td>
                                                        <td className="px-6 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="font-bold text-[--text-primary] dark:text-[--text-dark-primary] tabular-nums">GH₵{(h.current_nav ?? 0).toFixed(4)}</span>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-right font-bold text-[--text-primary] dark:text-[--text-dark-primary] tabular-nums">
                                                            GH₵{(h.current_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className={`font-bold text-sm tabular-nums tracking-tight ${gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                                {gain >= 0 ? "+" : ""}GH₵{Math.abs(gain).toFixed(2)}
                                                            </div>
                                                            <div className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                                {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile */}
                                <div className="md:hidden space-y-4 p-6">
                                    {mutualFundHoldings.map((h: any) => {
                                        const gain = (h.current_value ?? 0) - (h.total_invested ?? 0);
                                        const gainPct = h.total_invested > 0 ? (gain / h.total_invested) * 100 : 0;
                                        return (
                                            <div key={h.fund_id} className="bg-blue-600/5 rounded-xl p-6 border border-blue-500/10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/20 flex-shrink-0">MF</div>
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <div className="font-bold text-[--text-primary] dark:text-[--text-dark-primary] uppercase tracking-widest leading-tight truncate">{h.fund_name ?? "Mutual Fund"}</div>
                                                            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1 truncate">{h.fund_type ?? "Fund"}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-right flex-shrink-0 ml-4 ${gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                        <div className="font-bold tabular-nums tracking-tight">{gain >= 0 ? "+" : ""}GH₵{Math.abs(gain).toFixed(2)}</div>
                                                        <div className="text-[10px] font-semibold uppercase tracking-widest">{gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500/10">
                                                    {[
                                                        ["Units", (h.units_held ?? 0).toFixed(4)],
                                                        ["Avg NAV", `GH₵${(h.average_nav ?? 0).toFixed(4)}`],
                                                        ["Current NAV", `GH₵${(h.current_nav ?? 0).toFixed(4)}`],
                                                        ["Current Val", `GH₵${(h.current_value ?? 0).toFixed(2)}`],
                                                    ].map(([label, val]) => (
                                                        <div key={label}>
                                                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{label}</div>
                                                            <div className="text-xs font-bold text-[--text-primary] dark:text-[--text-dark-primary] tabular-nums">{val}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Empty state for filtered tab */}
                        {holdingsTab === "stocks" && holdings.length === 0 && (
                            <div className="py-24 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">No Equities Owned</div>
                        )}
                        {holdingsTab === "funds" && mutualFundHoldings.length === 0 && (
                            <div className="py-24 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">No Mutual Funds Owned</div>
                        )}

                        {/* Footer summary */}
                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/[0.06]">
                            <div className="flex flex-wrap gap-8 md:gap-16">
                                {[
                                    { label: "Total Assets", val: String(holdings.length + mutualFundHoldings.length), color: "text-blue-500" },
                                    { label: "Positive Holdings", val: String(holdings.filter(h => h.gain > 0).length + mutualFundHoldings.filter((h: any) => (h.current_value ?? 0) > (h.total_invested ?? 0)).length), color: "text-emerald-500" },
                                    { label: "Negative Holdings", val: String(holdings.filter(h => h.gain < 0).length + mutualFundHoldings.filter((h: any) => (h.current_value ?? 0) < (h.total_invested ?? 0)).length), color: "text-red-500" },
                                    { label: "Total Invested", val: `GH₵${totalInvested.toFixed(2)}`, color: "text-white" },
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="flex flex-col">
                                        <span className={`text-xl font-bold tabular-nums tracking-tight ${color}`}>{val}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
