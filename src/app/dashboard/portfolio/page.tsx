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
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { PortfolioChart, type PortfolioDataPoint } from "@/components/dashboard/PortfolioChart";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Holding {
    symbol: string;
    quantity: number;
    averageCost: number;
    totalCost: number;
    currentPrice: number;
    marketValue: number;
    gain: number;
    gainPercent: number;
    sector: string;
}

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
    Finance: "#4F46E5", Telecom: "#10B981", Mining: "#F59E0B",
    Energy: "#EF4444", Consumer: "#EC4899", Agriculture: "#8B5CF6",
    Technology: "#06B6D4", "Mutual Funds": "#A855F7", Cash: "#9CA3AF", Other: "#64748B",
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

        const date = new Date(tx.created_at);
        const label = date.toLocaleDateString("en-GH", { month: "short", day: "numeric" });
        points.push({ label, value: Math.max(0, cash + stocksValue), date: tx.created_at });
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
    const [holdingsTab, setHoldingsTab] = useState<"all" | "stocks" | "funds">("all");

    const STARTING_BALANCE = 10000;

    async function fetchData(isRefresh = false) {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // ── Stock transactions ─────────────
        const { data: txData } = await supabase
            .from("transactions").select("*").eq("user_id", user.id);
        const transactions: RawTransaction[] = txData ?? [];
        setAllTransactions(transactions);

        // ── Live prices ────────────────────
        let stocks: Stock[] = [];
        try {
            const r = await fetch(`${GSE_API_BASE}/live`, { cache: "no-store" });
            if (r.ok) {
                const raw = await r.json();
                stocks = raw.map((q: any) => {
                    const meta: Record<string, { name: string; sector: string }> = {
                        MTNGH: { name: "MTN Ghana", sector: "Telecom" },
                        GCB: { name: "GCB Bank", sector: "Finance" },
                        EGH: { name: "Ecobank Ghana", sector: "Finance" },
                        CAL: { name: "CAL Bank", sector: "Finance" },
                        GOIL: { name: "Ghana Oil Company", sector: "Energy" },
                    };
                    const m = meta[q.name] ?? { name: q.name, sector: "Other" };
                    const prev = q.price - q.change;
                    return { symbol: q.name, name: m.name, sector: m.sector, price: q.price, change: q.change, changePercent: prev !== 0 ? (q.change / prev) * 100 : 0, volume: q.volume };
                });
            } else { stocks = await getStocks(); }
        } catch { stocks = await getStocks(); }

        const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));
        const sectorMap = new Map(stocks.map(s => [s.symbol, s.sector ?? "Other"]));
        setPriceMapState(priceMap);

        // ── Aggregate holdings ─────────────
        let cash = STARTING_BALANCE;
        const holdingMap = new Map<string, { quantity: number; totalCost: number }>();

        transactions.forEach(tx => {
            const cur = holdingMap.get(tx.symbol) ?? { quantity: 0, totalCost: 0 };
            if (tx.type === "BUY") {
                cur.quantity += tx.quantity;
                cur.totalCost += tx.total_amount;
                cash -= tx.total_amount;
            } else {
                const avg = cur.quantity > 0 ? cur.totalCost / cur.quantity : 0;
                cur.totalCost = Math.max(0, cur.totalCost - avg * tx.quantity);
                cur.quantity = Math.max(0, cur.quantity - tx.quantity);
                cash += tx.total_amount;
            }
            holdingMap.set(tx.symbol, cur);
        });

        let portfolioSum = 0;
        const computed: Holding[] = [];
        holdingMap.forEach((d, sym) => {
            if (d.quantity > 0) {
                const price = priceMap.get(sym) ?? 0;
                const mv = d.quantity * price;
                const gain = mv - d.totalCost;
                computed.push({
                    symbol: sym, quantity: d.quantity,
                    averageCost: d.quantity > 0 ? d.totalCost / d.quantity : 0,
                    totalCost: d.totalCost, currentPrice: price, marketValue: mv,
                    gain, gainPercent: d.totalCost > 0 ? (gain / d.totalCost) * 100 : 0,
                    sector: sectorMap.get(sym) ?? "Other",
                });
                portfolioSum += mv;
            }
        });
        setHoldings(computed);
        setTotalValue(portfolioSum);

        // ── Mutual funds ────────────────────
        const { getUserMutualFundHoldings } = await import("@/app/actions/mutual-funds");
        const mfHoldings = await getUserMutualFundHoldings(user.id);
        setMutualFundHoldings(mfHoldings);
        const mfValue = mfHoldings.reduce((s: number, h: any) => s + (h.current_value ?? 0), 0);
        setMutualFundsValue(mfValue);

        const { data: mfTx } = await supabase
            .from("mutual_fund_transactions").select("*").eq("user_id", user.id);
        (mfTx ?? []).forEach((tx: any) => {
            if (tx.transaction_type === "buy") cash -= tx.net_amount;
            else cash += tx.net_amount;
        });

        setCashBalance(cash);
        setLoading(false);
        setRefreshing(false);
    }

    useEffect(() => { fetchData(); }, []);

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
    const bestPosition = holdings.length > 0 ? holdings.reduce((b, h) => h.gainPercent > b.gainPercent ? h : b, holdings[0]) : null;
    const worstPosition = holdings.length > 0 ? holdings.reduce((w, h) => h.gainPercent < w.gainPercent ? h : w, holdings[0]) : null;
    const totalInvested = holdings.reduce((s, h) => s + h.totalCost, 0) + mutualFundHoldings.reduce((s: number, h: any) => s + (h.total_invested ?? 0), 0);
    const avgPositionSize = holdings.length > 0 ? totalValue / holdings.length : 0;

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <RefreshCcw size={32} className="animate-spin mb-4 text-indigo-600" />
            <p className="text-sm font-bold uppercase tracking-widest">Aggregating Asset Data...</p>
        </div>
    );

    const hasAnyAssets = holdings.length > 0 || mutualFundHoldings.length > 0;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="pb-20 space-y-6 md:space-y-8">
            <DashboardHeader />

            {/* ── Header ── */}
            <div className="rounded-2xl p-5 md:p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 shadow-xl shadow-indigo-200">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                                <Briefcase size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Portfolio Command Center</h1>
                                <p className="text-indigo-200 text-sm font-medium">Detailed asset breakdown & oversight</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-black text-white">
                                    GH₵{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mt-1">Total Portfolio Value</div>
                                <div className={`text-sm font-black mt-2 ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
                                    {totalGain >= 0 ? "+" : ""}GH₵{Math.abs(totalGain).toFixed(2)} all time
                                </div>
                            </div>
                            <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                                <div className={`text-2xl font-black ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
                                    {totalGain >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%
                                </div>
                                <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mt-1">Total Return</div>
                                <div className="text-sm font-bold text-indigo-200 mt-2">
                                    From GH₵{STARTING_BALANCE.toLocaleString()} initial capital
                                </div>
                            </div>
                            <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-black text-white">
                                    GH₵{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mt-1">Buying Power</div>
                                <div className="text-sm font-bold text-indigo-200 mt-2">
                                    {totalEquity > 0 ? ((cashBalance / totalEquity) * 100).toFixed(1) : 0}% of portfolio in cash
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/market" className="px-5 py-3 bg-white text-indigo-700 font-black rounded-xl hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 text-sm">
                            <Plus size={16} /> Add Position
                        </Link>
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="px-4 py-3 bg-white/20 text-white border border-white/30 font-bold rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 text-sm backdrop-blur disabled:opacity-60"
                        >
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Analytics Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Performance Chart */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <BarChart3 size={16} className="text-emerald-600" />
                                </div>
                                <h3 className="text-base font-black text-gray-900">Performance Timeline</h3>
                            </div>
                            {/* Period filter */}
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                {PERIODS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPeriod(p)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedPeriod === p
                                            ? "bg-indigo-600 text-white shadow"
                                            : "text-gray-500 hover:text-indigo-600 hover:bg-white"
                                            }`}
                                    >{p}</button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[280px] md:h-[320px]">
                            <PortfolioChart
                                data={chartData}
                                period={selectedPeriod}
                                startingValue={STARTING_BALANCE}
                            />
                        </div>
                        {chartData.length === 0 && (
                            <p className="text-center text-sm text-gray-400 mt-4">No transactions yet in this period. Make your first trade to see performance.</p>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Risk Assessment — real */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-black uppercase tracking-widest">
                                <ShieldCheck size={14} /> Portfolio Risk
                            </div>
                            <div className="text-3xl font-black mb-1" style={{ color: riskAssessment.color }}>
                                {riskAssessment.label}
                            </div>
                            <div className="text-slate-400 text-xs mb-4">Score: {riskAssessment.score}/100</div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${riskAssessment.score}%`,
                                        background: `linear-gradient(90deg, #10B981, ${riskAssessment.color})`
                                    }}
                                />
                            </div>
                            {/* Portfolio health indicators */}
                            <div className="space-y-2.5">
                                {[
                                    { label: "Diversification", val: `${diversificationScore}/100`, ok: diversificationScore >= 50 },
                                    { label: "Asset Mix", val: `${numAssetClasses} class${numAssetClasses !== 1 ? "es" : ""}`, ok: numAssetClasses >= 2 },
                                    { label: "Sectors", val: `${numSectors} sector${numSectors !== 1 ? "s" : ""}`, ok: numSectors >= 3 },
                                    { label: "Win Rate", val: `${winRate}%`, ok: winRate >= 50 },
                                ].map(({ label, val, ok }) => (
                                    <div key={label} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            {ok
                                                ? <CheckCircle2 size={13} className="text-emerald-400" />
                                                : <AlertTriangle size={13} className="text-amber-400" />
                                            }
                                            <span className="text-xs font-bold text-slate-300">{label}</span>
                                        </div>
                                        <span className={`text-xs font-black ${ok ? "text-emerald-400" : "text-amber-400"}`}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Allocation donut */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <PieChart size={15} className="text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Allocation</h3>
                        </div>
                        {sectorData.length > 0 ? (
                            <div className="h-[200px]">
                                <AllocationChart data={sectorData} />
                            </div>
                        ) : (
                            <div className="h-[120px] flex items-center justify-center text-gray-400 text-sm">
                                No holdings yet
                            </div>
                        )}
                        {sectorData.length > 0 && <div className="border-t border-gray-100 my-3" />}
                        <div className="space-y-2.5">
                            {sectorData.slice(0, 5).map(s => {
                                const total = sectorData.reduce((a, b) => a + b.value, 0);
                                return (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                                            <span className="text-xs font-bold text-gray-600">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">GH₵{s.value.toFixed(0)}</span>
                                            <span className="text-xs font-black text-gray-800 w-10 text-right">
                                                {total > 0 ? ((s.value / total) * 100).toFixed(1) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Metrics + Sector Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Key Metrics — real */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Activity size={15} className="text-blue-600" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Key Metrics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: "Win Rate", value: `${winRate}%`,
                                sub: `${holdings.filter(h => h.gain > 0).length} of ${holdings.length} positions`,
                                color: winRate >= 50 ? "text-emerald-600" : "text-red-600", bgColor: winRate >= 50 ? "bg-emerald-50" : "bg-red-50"
                            },
                            {
                                label: "Total Invested", value: `GH₵${totalInvested.toFixed(0)}`,
                                sub: "Across all assets", color: "text-indigo-600", bgColor: "bg-indigo-50"
                            },
                            {
                                label: "Best Position",
                                value: bestPosition ? `${bestPosition.gainPercent >= 0 ? "+" : ""}${bestPosition.gainPercent.toFixed(1)}%` : "—",
                                sub: bestPosition?.symbol ?? "No positions",
                                color: "text-emerald-600", bgColor: "bg-emerald-50"
                            },
                            {
                                label: "Worst Position",
                                value: worstPosition ? `${worstPosition.gainPercent >= 0 ? "+" : ""}${worstPosition.gainPercent.toFixed(1)}%` : "—",
                                sub: worstPosition?.symbol ?? "No positions",
                                color: worstPosition && worstPosition.gainPercent < 0 ? "text-red-600" : "text-gray-800",
                                bgColor: worstPosition && worstPosition.gainPercent < 0 ? "bg-red-50" : "bg-gray-50"
                            },
                            {
                                label: "Avg Position Size",
                                value: `GH₵${avgPositionSize.toFixed(0)}`,
                                sub: `${holdings.length} stock position${holdings.length !== 1 ? "s" : ""}`,
                                color: "text-purple-600", bgColor: "bg-purple-50"
                            },
                            {
                                label: "Asset Classes",
                                value: `${numAssetClasses}`,
                                sub: [totalValue > 0 && "Stocks", mutualFundsValue > 0 && "Mutual Funds", cashBalance > 0 && "Cash"].filter(Boolean).join(", ") || "None",
                                color: "text-amber-600", bgColor: "bg-amber-50"
                            },
                        ].map(m => (
                            <div key={m.label} className={`${m.bgColor} rounded-xl p-4 border border-white`}>
                                <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{m.label}</div>
                                <div className="text-xs text-gray-400 mt-1 truncate">{m.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sector Performance — real */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Layers size={15} className="text-purple-600" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Sector Performance</h3>
                    </div>
                    {sectorPerformance.length > 0 ? (
                        <div className="space-y-3">
                            {sectorPerformance.map(s => {
                                const maxAbs = Math.max(...sectorPerformance.map(x => Math.abs(x.gainPct)), 1);
                                return (
                                    <div key={s.name} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                                                <span className="text-sm font-bold text-gray-800">{s.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">{s.allocation}% of portfolio</span>
                                                <div className="flex items-center gap-1">
                                                    {s.gainPct >= 0 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                                    <span className={`text-sm font-black ${s.gainPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                        {s.gainPct >= 0 ? "+" : ""}{s.gainPct.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${(Math.abs(s.gainPct) / maxAbs) * 100}%`,
                                                    background: s.gainPct >= 0 ? "#10B981" : "#EF4444",
                                                    marginLeft: s.gainPct < 0 ? "auto" : undefined
                                                }}
                                            />
                                        </div>
                                        <div className={`text-xs mt-1 font-medium ${s.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {s.gain >= 0 ? "+" : ""}GH₵{s.gain.toFixed(2)} unrealized
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <Target size={24} className="mb-2 opacity-40" />
                            <p className="text-sm">No sector data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Holdings Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 md:px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Briefcase size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-gray-900">Portfolio Holdings</h3>
                            <p className="text-indigo-600 text-xs font-medium">
                                {holdings.length} stock position{holdings.length !== 1 ? "s" : ""} · {mutualFundHoldings.length} fund{mutualFundHoldings.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Holdings tabs */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                            {([["all", "All"], ["stocks", "Stocks"], ["funds", "Funds"]] as const).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setHoldingsTab(key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${holdingsTab === key ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-indigo-600 hover:bg-white"}`}
                                >{label}</button>
                            ))}
                        </div>
                        <Link href="/dashboard/market" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow flex items-center gap-1.5">
                            <Plus size={14} /> Add
                        </Link>
                    </div>
                </div>

                {!hasAnyAssets ? (
                    <div className="py-24 text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Wallet size={28} className="text-gray-300" />
                        </div>
                        <h4 className="text-base font-black text-gray-800 mb-2">No Active Positions</h4>
                        <p className="text-sm text-gray-500 mb-6">Start building your portfolio by exploring market opportunities</p>
                        <Link href="/dashboard/market" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg">
                            <Eye size={16} /> Explore Markets
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stock Holdings */}
                        {(holdingsTab === "all" || holdingsTab === "stocks") && holdings.length > 0 && (
                            <>
                                {holdingsTab === "all" && (
                                    <div className="px-5 md:px-8 py-3 bg-gray-50 border-b border-gray-100">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Stocks &amp; Equities</span>
                                    </div>
                                )}
                                {/* Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                <th className="px-8 py-4">Security</th>
                                                <th className="px-6 py-4 text-right">Shares</th>
                                                <th className="px-6 py-4 text-right">Avg Cost</th>
                                                <th className="px-6 py-4 text-right">Live Price</th>
                                                <th className="px-6 py-4 text-right">Market Value</th>
                                                <th className="px-8 py-4 text-right">Unrealized P&amp;L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {holdings.map(h => (
                                                <tr key={h.symbol} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all ${h.gain >= 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white" : "bg-red-50 border-red-200 text-red-700 group-hover:bg-red-500 group-hover:text-white"}`}>
                                                                {h.symbol.substring(0, 2)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-gray-900">{h.symbol}</div>
                                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{h.sector}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-mono font-black text-gray-800">{h.quantity.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-right font-mono text-gray-500">GH₵{h.averageCost.toFixed(2)}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <span className="font-mono font-black text-gray-900">GH₵{h.currentPrice.toFixed(2)}</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-mono font-black text-gray-900">
                                                        GH₵{h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className={`font-mono font-black text-lg ${h.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                            {h.gain >= 0 ? "+" : ""}GH₵{Math.abs(h.gain).toFixed(2)}
                                                        </div>
                                                        <div className={`text-xs font-black ${h.gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            {h.gainPercent >= 0 ? "+" : ""}{h.gainPercent.toFixed(2)}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile */}
                                <div className="md:hidden space-y-3 p-4">
                                    {holdings.map(h => (
                                        <div key={h.symbol} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${h.gain >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                        {h.symbol.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900">{h.symbol}</div>
                                                        <div className="text-xs text-gray-400 uppercase tracking-wide">{h.sector}</div>
                                                    </div>
                                                </div>
                                                <div className={`text-right ${h.gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                    <div className="font-black">{h.gain >= 0 ? "+" : ""}GH₵{Math.abs(h.gain).toFixed(2)}</div>
                                                    <div className="text-xs font-bold">{h.gainPercent >= 0 ? "+" : ""}{h.gainPercent.toFixed(2)}%</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                                                {[
                                                    ["Shares", h.quantity.toLocaleString()],
                                                    ["Avg Cost", `GH₵${h.averageCost.toFixed(2)}`],
                                                    ["Market Price", `GH₵${h.currentPrice.toFixed(2)}`],
                                                    ["Market Value", `GH₵${h.marketValue.toFixed(2)}`],
                                                ].map(([label, val]) => (
                                                    <div key={label}>
                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">{label}</div>
                                                        <div className="text-sm font-black text-gray-800">{val}</div>
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
                                    <div className="px-5 md:px-8 py-3 bg-purple-50 border-t border-b border-purple-100">
                                        <span className="text-xs font-black text-purple-500 uppercase tracking-widest">Mutual Funds</span>
                                    </div>
                                )}
                                {/* Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                <th className="px-8 py-4">Fund</th>
                                                <th className="px-6 py-4 text-right">Units</th>
                                                <th className="px-6 py-4 text-right">Avg NAV</th>
                                                <th className="px-6 py-4 text-right">Current NAV</th>
                                                <th className="px-6 py-4 text-right">Current Value</th>
                                                <th className="px-8 py-4 text-right">Unrealized P&amp;L</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {mutualFundHoldings.map((h: any) => {
                                                const gain = (h.current_value ?? 0) - (h.total_invested ?? 0);
                                                const gainPct = h.total_invested > 0 ? (gain / h.total_invested) * 100 : 0;
                                                return (
                                                    <tr key={h.fund_id} className="hover:bg-purple-50/30 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-700 font-black text-xs">
                                                                    MF
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-gray-900">{h.fund_name ?? "Mutual Fund"}</div>
                                                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">{h.fund_type ?? "Fund"}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono font-black text-gray-800">{(h.units_held ?? 0).toFixed(4)}</td>
                                                        <td className="px-6 py-5 text-right font-mono text-gray-500">GH₵{(h.average_nav ?? 0).toFixed(4)}</td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <span className="font-mono font-black text-gray-900">GH₵{(h.current_nav ?? 0).toFixed(4)}</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono font-black text-gray-900">
                                                            GH₵{(h.current_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className={`font-mono font-black text-lg ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                                {gain >= 0 ? "+" : ""}GH₵{Math.abs(gain).toFixed(2)}
                                                            </div>
                                                            <div className={`text-xs font-black ${gain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
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
                                <div className="md:hidden space-y-3 p-4">
                                    {mutualFundHoldings.map((h: any) => {
                                        const gain = (h.current_value ?? 0) - (h.total_invested ?? 0);
                                        const gainPct = h.total_invested > 0 ? (gain / h.total_invested) * 100 : 0;
                                        return (
                                            <div key={h.fund_id} className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-700 flex items-center justify-center font-black text-xs">MF</div>
                                                        <div>
                                                            <div className="font-black text-gray-900">{h.fund_name ?? "Mutual Fund"}</div>
                                                            <div className="text-xs text-gray-400 uppercase">{h.fund_type ?? "Fund"}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-right ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                        <div className="font-black">{gain >= 0 ? "+" : ""}GH₵{Math.abs(gain).toFixed(2)}</div>
                                                        <div className="text-xs font-bold">{gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-purple-200">
                                                    {[
                                                        ["Units", (h.units_held ?? 0).toFixed(4)],
                                                        ["Avg NAV", `GH₵${(h.average_nav ?? 0).toFixed(4)}`],
                                                        ["Current NAV", `GH₵${(h.current_nav ?? 0).toFixed(4)}`],
                                                        ["Current Value", `GH₵${(h.current_value ?? 0).toFixed(2)}`],
                                                    ].map(([label, val]) => (
                                                        <div key={label}>
                                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">{label}</div>
                                                            <div className="text-sm font-black text-gray-800">{val}</div>
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
                            <div className="py-16 text-center text-gray-400 text-sm">No stock positions</div>
                        )}
                        {holdingsTab === "funds" && mutualFundHoldings.length === 0 && (
                            <div className="py-16 text-center text-gray-400 text-sm">No mutual fund holdings</div>
                        )}

                        {/* Footer summary */}
                        <div className="px-5 md:px-8 py-4 bg-gradient-to-r from-gray-50 to-indigo-50 border-t border-gray-100">
                            <div className="flex flex-wrap gap-4 md:gap-8">
                                {[
                                    { label: "Positions", val: String(holdings.length + mutualFundHoldings.length), color: "text-indigo-600" },
                                    { label: "Winners", val: String(holdings.filter(h => h.gain > 0).length + mutualFundHoldings.filter((h: any) => (h.current_value ?? 0) > (h.total_invested ?? 0)).length), color: "text-emerald-600" },
                                    { label: "Losers", val: String(holdings.filter(h => h.gain < 0).length + mutualFundHoldings.filter((h: any) => (h.current_value ?? 0) < (h.total_invested ?? 0)).length), color: "text-red-600" },
                                    { label: "Invested Capital", val: `GH₵${totalInvested.toFixed(2)}`, color: "text-gray-700" },
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="flex flex-col">
                                        <span className={`text-lg font-black ${color}`}>{val}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
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
