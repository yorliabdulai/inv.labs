"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
    Award, Trophy, Medal, ArrowUp, Crown, TrendingUp, TrendingDown,
    Minus, Filter, BarChart3, Activity, Zap, Shield, Search,
    ArrowUpRight, ArrowDownRight, Info, RefreshCcw, Users,
    ChevronLeft, ChevronRight, Share2, Check, ChevronDown, 
    Download, Image as ImageIcon, Sparkles
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getMarketRankings, type RankedAsset, type RankingCategory } from "@/app/actions/leaderboard";
import { getTopUsers } from "@/app/actions/gamification";
import { useUserProfile } from "@/lib/useUserProfile";
import { useDebounce } from "@/hooks/use-debounce";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

export default function LeaderboardPage() {
    const [viewMode, setViewMode] = useState<"market" | "users">("market");
    const [selectedCategories, setSelectedCategories] = useState<RankingCategory[]>(["gainers"]);
    const [rankings, setRankings] = useState<RankedAsset[]>([]);
    const [userRankings, setUserRankings] = useState<any[]>([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { partnerCode } = useUserProfile();
    
    const captureRef = useRef<HTMLDivElement>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const categories: { key: RankingCategory; label: string; icon: any; description: string }[] = [
        { key: 'gainers', label: 'Top Gainers', icon: TrendingUp, description: 'Highest price appreciation.' },
        { key: 'momentum', label: 'Momentum', icon: Zap, description: 'High-speed movers based on velocity.' },
        { key: 'stability', label: 'Stability', icon: Shield, description: 'Consistent low-volatility performers.' },
        { key: 'volume', label: 'Volume', icon: Activity, description: 'Most actively traded symbols.' },
    ];

    async function loadRankings(isRefresh = false, page = userPage) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (viewMode === "market") {
                const data = await getMarketRankings(selectedCategories);
                setRankings(data || []);
            } else {
                const result = await getTopUsers(page, PAGE_SIZE);
                const annotated = result.users.map((user: any) => ({ ...user, rankChange: 'same' }));
                setUserRankings(annotated);
                setUserTotal(result.total);
                setUserPage(result.page);
                setUserTotalPages(result.totalPages);
            }
        } catch (err) {
            console.error("Failed to load rankings", err);
            toast.error("Connectivity issue.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        setUserPage(1); 
        loadRankings(false, 1);
    }, [selectedCategories, viewMode]);

    const filteredRankings = useMemo(() => {
        const query = debouncedSearchQuery?.toLowerCase() || "";
        if (viewMode === "users") {
            return (userRankings || []).filter(u =>
                (u.full_name || "").toLowerCase().includes(query)
            );
        }
        return (rankings || []).filter(r =>
            (r?.symbol?.toLowerCase() || "").includes(query) ||
            (r?.name?.toLowerCase() || "").includes(query)
        );
    }, [rankings, userRankings, debouncedSearchQuery, viewMode]);

    const handleUserPageChange = (newPage: number) => {
        if (newPage < 1 || newPage > userTotalPages) return;
        setUserPage(newPage);
        loadRankings(false, newPage);
    };

    const toggleCategory = (cat: RankingCategory) => {
        setSelectedCategories(prev => {
            if (prev.includes(cat)) {
                if (prev.length === 1) return prev; 
                return prev.filter(c => c !== cat);
            }
            return [...prev, cat];
        });
    };

    const handleShareLeaderboard = async () => {
        const referralLink = `${window.location.origin}/register${partnerCode ? `?ref=${partnerCode}` : ""}`;
        const message = `Check out the Leaderboard on InvLab! Join here: ${referralLink}`;
        if (navigator.share) {
            await navigator.share({ title: "InvLab Leaderboard", text: message, url: referralLink });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-sans">
            <DashboardHeader />

            {/* Main Header Banner */}
            <div className="relative rounded-2xl p-8 md:p-16 bg-card text-foreground border border-border shadow-premium overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-muted/30 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                            <Activity size={12} /> Global Rankings
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-syne text-foreground">Leaderboards</h1>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest max-w-lg leading-relaxed">
                            Assess top performing assets in the market and benchmark your performance against top traders in the network.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={handleShareLeaderboard} className="group flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                            <Share2 size={16} /> Invite & Share
                        </button>
                        <button onClick={() => loadRankings(true)} disabled={refreshing} className="group flex items-center gap-4 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-30 shadow-xl">
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "SYNCING..." : "Refresh Feed"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button onClick={() => setViewMode("market")} className={`px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${viewMode === "market" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}>Market Assets</button>
                <button onClick={() => setViewMode("users")} className={`px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${viewMode === "users" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}><Users size={14} /> Top Traders</button>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {viewMode === "market" && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group font-bold text-[10px] uppercase tracking-widest text-foreground outline-none shadow-sm">
                                <Filter size={16} className="text-primary" />
                                <span>Ranking Strategy</span>
                                <span className="bg-muted px-2 py-0.5 rounded-md text-muted-foreground">{selectedCategories.length} Selected</span>
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="start" sideOffset={8} className="z-[100] w-72 bg-card border border-border rounded-2xl shadow-2xl p-2">
                            {categories.map((cat) => (
                                <DropdownMenu.CheckboxItem key={cat.key} className="flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-muted/50 data-[state=checked]:text-primary" checked={selectedCategories.includes(cat.key)} onCheckedChange={() => toggleCategory(cat.key)}>
                                    <div className="flex items-center gap-3">
                                        <cat.icon size={16} />
                                        <span>{cat.label}</span>
                                    </div>
                                    <DropdownMenu.ItemIndicator><Check size={18} /></DropdownMenu.ItemIndicator>
                                </DropdownMenu.CheckboxItem>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                )}
                <div className="relative w-full lg:max-w-md">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-widest focus:border-primary/50 outline-none transition-all" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-premium">
                {loading ? (
                    <div className="py-48 flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregating Market Data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <tr>
                                    {viewMode === "market" ? (
                                        <>
                                            <th className="px-8 py-6">Rank</th>
                                            <th className="px-8 py-6">Asset Specification</th>
                                            <th className="px-6 py-6 text-right">Price (GH₵)</th>
                                            <th className="px-6 py-6 text-right">Performance</th>
                                            <th className="px-6 py-6 text-right">Intensity</th>
                                            <th className="px-8 py-6 text-right">Vector</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-12 py-6 text-center w-32">Rank</th>
                                            <th className="px-8 py-6 text-left">Trader Network Profile</th>
                                            <th className="px-8 py-6 text-right">Accreditation XP</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredRankings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-32 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <div className="flex flex-col items-center gap-4">
                                                <Info size={32} className="text-primary/40" />
                                                <p>No {viewMode === "market" ? "market data" : "traders"} available</p>
                                                {viewMode === "market" && <p className="normal-case font-medium text-xs">The Ghana Stock Exchange data feed might be unavailable.</p>}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRankings.map((item, idx) => {
                                        if (viewMode === "market") {
                                            const asset = item as RankedAsset;
                                            const isUp = asset.changePercent >= 0;
                                            return (
                                                <tr key={asset.symbol} className="group hover:bg-muted/20 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <span className={`text-xl font-black tabular-nums ${asset.rank <= 3 ? "text-primary" : "text-zinc-500"}`}>{asset.rank < 10 ? `0${asset.rank}` : asset.rank}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center font-bold text-xs border border-border">{asset.symbol.slice(0, 2)}</div>
                                                            <div>
                                                                <div className="text-sm font-bold uppercase tracking-tight">{asset.symbol}</div>
                                                                <div className="text-[10px] text-muted-foreground uppercase opacity-60 font-bold">{asset.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-right font-bold tabular-nums text-sm">GH₵{asset.price.toFixed(2)}</td>
                                                    <td className={`px-6 py-6 text-right font-bold tabular-nums text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>{isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%</td>
                                                    <td className="px-6 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <div className="w-20 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                                                                <div className={`h-full ${isUp ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(100, Math.abs(asset.changePercent) * 5)}%` }} />
                                                            </div>
                                                            <span className="text-[11px] font-black">{Math.abs(asset.changePercent).toFixed(1)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {asset.trend}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        } else {
                                            const user = item as any;
                                            return (
                                                <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                                                    <td className="px-12 py-8 text-center text-3xl font-black">{user.globalRank || idx + 1}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center font-bold border-2 border-border">{user.full_name?.charAt(0)}</div>
                                                            <div><div className="text-lg font-bold">{user.full_name}</div><div className="text-[10px] font-bold text-muted-foreground uppercase">Level {user.accreditation_level || 1}</div></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-emerald-500">{(user.knowledge_xp || 0).toLocaleString()} XP</td>
                                                </tr>
                                            );
                                        }
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}