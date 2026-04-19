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
    
    // For screenshot capture
    const captureRef = useRef<HTMLDivElement>(null);

    // Bolt Performance: Debounce search input to avoid expensive list filtering operations
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
                setRankings(data);
            } else {
                const result = await getTopUsers(page, PAGE_SIZE);

                // Client-side rank change detection using localStorage snapshot
                const SNAPSHOT_KEY = "inv_leaderboard_rank_snapshot";
                let prevSnapshot: Record<string, number> = {};
                try {
                    prevSnapshot = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "{}");
                } catch {}

                const annotated = result.users.map((user: any) => {
                    const prevRank = prevSnapshot[user.id];
                    let rankChange: 'up' | 'down' | 'same' = 'same';
                    if (prevRank !== undefined) {
                        if (user.globalRank < prevRank) rankChange = 'up';
                        else if (user.globalRank > prevRank) rankChange = 'down';
                    }
                    return { ...user, rankChange };
                });

                // Save new snapshot
                const newSnapshot = { ...prevSnapshot };
                annotated.forEach((u: any) => { newSnapshot[u.id] = u.globalRank; });
                localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(newSnapshot));

                setUserRankings(annotated);
                setUserTotal(result.total);
                setUserPage(result.page);
                setUserTotalPages(result.totalPages);
            }
        } catch (err) {
            console.error("Failed to load rankings", err);
            toast.error("Connectivity issue. Retrying...");
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
        if (viewMode === "users") {
            return userRankings.filter(u =>
                (u.full_name || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
        }
        return rankings.filter(r =>
            r.symbol.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            r.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
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
        const message = `The competition on InvLab is heating up! 📈 Check out this week's top traders on the GSE Investment Simulator. 🇬🇭 Join the network and see if you can make the top 10! \n\n🚀 Join here: ${referralLink}`;

        if (navigator.share) {
            try {
                if (viewMode === "users" && userRankings.length > 0) {
                    toast.info("Generating professional snapshot...");
                    await captureAndShareRankings(message, referralLink);
                } else {
                    await navigator.share({
                        title: "InvLab Leaderboard",
                        text: message,
                        url: referralLink,
                    });
                }
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
        }
    };

    const captureAndShareRankings = async (text: string, url: string) => {
        if (!captureRef.current) return;
        setSharing(true);
        try {
            await new Promise(r => setTimeout(r, 600)); // wait for renders
            const blob = await htmlToImage.toBlob(captureRef.current, {
                pixelRatio: 2,
                backgroundColor: '#09090b',
            });

            if (blob && navigator.share) {
                const file = new File([blob], "invlab-rankings.png", { type: "image/png" });
                await navigator.share({
                    files: [file],
                    title: "GSE Simulator Rankings",
                    text: text,
                });
            }
        } catch (err) {
            console.error("Capture failed", err);
            toast.error("Snapshot error. Sharing text instead.");
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-sans">
            <DashboardHeader />

            {/* ── Virtual Viral Card (Hidden from View, Used for Screenshot) ── */}
            <div className="fixed -left-[2000px] top-0 pointer-events-none">
                <div 
                    ref={captureRef}
                    className="w-[500px] p-8 bg-[#09090b] text-white border-2 border-primary/20 rounded-3xl space-y-8"
                    style={{ fontStyle: 'normal' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl text-white">I</div>
                            <span className="text-2xl font-black font-syne uppercase tracking-tighter text-white">Inv<span className="text-primary">Lab</span></span>
                        </div>
                        <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest text-white">Global Live</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-syne uppercase tracking-tight text-white">Elite Leaderboard</h2>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest text-white/70">GSE Investment Simulator Rankings</p>
                    </div>

                    <div className="space-y-4">
                        {userRankings.slice(0, 5).map((user, idx) => (
                            <div key={user.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <span className={`text-2xl font-black tabular-nums ${idx === 0 ? "text-primary" : "text-zinc-500"}`}>
                                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="text-sm font-bold truncate text-white">{user.full_name || "Anonymous Trader"}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-white/50">Level {user.accreditation_level || 1}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-emerald-500 tabular-nums">{(user.knowledge_xp || 0).toLocaleString()} XP</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-zinc-800/50">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/register" + (partnerCode ? `?ref=${partnerCode}` : ""))}`}
                            alt="QR Code"
                            className="w-20 h-20 rounded-xl bg-white p-1"
                        />
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1 text-white">Join the challenge</div>
                            <div className="text-[9px] text-zinc-500 font-medium leading-relaxed max-w-[200px] text-white/60">
                                Scan to start building your GH₵10,000 portfolio on the GSE Investment Simulator.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main UI Banner ── */}
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
                        <button
                            onClick={handleShareLeaderboard}
                            disabled={sharing}
                            className="group flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {sharing ? (
                                <RefreshCcw size={16} className="animate-spin" />
                            ) : (
                                <ImageIcon size={16} className="transition-transform group-hover:rotate-12" />
                            )}
                            {sharing ? "Capturing..." : "Invite & Share"}
                        </button>
                        
                        <button
                            onClick={() => loadRankings(true)}
                            disabled={refreshing}
                            className="group flex items-center gap-4 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-30 shadow-xl"
                        >
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : "transition-transform duration-700 group-hover:rotate-180"} />
                            {refreshing ? "SYNCING..." : "Refresh Feed"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── View Toggle ── */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setViewMode("market")}
                    className={`px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${viewMode === "market" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                    Market Assets
                </button>
                <button
                    onClick={() => setViewMode("users")}
                    className={`px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${viewMode === "users" ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                    <Users size={14} /> Top Traders
                </button>
            </div>

            {/* ── Control Row ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Filter Dropdown */}
                {viewMode === "market" && (
                    <div className="flex items-center gap-4">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group font-bold text-[10px] uppercase tracking-widest text-foreground outline-none active:scale-95 shadow-sm">
                                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Filter size={16} />
                                    </div>
                                    <span>Ranking Strategy</span>
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <span className="bg-muted px-2 py-0.5 rounded-md text-muted-foreground group-hover:text-foreground transition-all">
                                            {selectedCategories.length} Selected
                                        </span>
                                        <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-all" />
                                    </div>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Content
                                align="start"
                                sideOffset={8}
                                className="z-[100] w-72 bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200"
                            >
                                <DropdownMenu.Label className="px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-2">
                                    Multi-Selection Engine
                                </DropdownMenu.Label>
                                {categories.map((cat) => (
                                    <DropdownMenu.CheckboxItem
                                        key={cat.key}
                                        className="flex items-center justify-between px-3 py-3.5 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer hover:bg-muted/50 transition-all data-[state=checked]:text-primary data-[state=checked]:bg-primary/5 mb-1 group"
                                        checked={selectedCategories.includes(cat.key)}
                                        onCheckedChange={() => toggleCategory(cat.key)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted/50 rounded-lg text-muted-foreground group-hover:text-primary transition-all">
                                                <cat.icon size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{cat.label}</span>
                                                <span className="text-[9px] text-muted-foreground font-medium group-hover:text-primary/70">{cat.description}</span>
                                            </div>
                                        </div>
                                        <DropdownMenu.ItemIndicator>
                                            <Check size={18} className="text-primary" />
                                        </DropdownMenu.ItemIndicator>
                                    </DropdownMenu.CheckboxItem>
                                ))}
                                <div className="mt-2 pt-3 border-t border-border/50 px-3 pb-2">
                                    <div className="flex items-start gap-2">
                                        <Sparkles size={12} className="text-primary mt-0.5" />
                                        <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                                            Selecting multiple strategies uses our composite ranking engine to find balanced performers.
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
                )}

                {/* Search */}
                <div className="relative w-full lg:max-w-md">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={viewMode === "market" ? "Filter by asset symbol or name..." : "Search for traders in the network..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-widest focus:bg-muted/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
                    />
                </div>
            </div>

            {/* ── Table Area ── */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-premium backdrop-blur-md">
                {loading ? (
                    <div className="py-48 flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregating Market Data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                {viewMode === "market" ? (
                                    <tr className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <th className="px-8 py-6">Rank</th>
                                        <th className="px-8 py-6">Asset Specification</th>
                                        <th className="px-6 py-6 text-right">Price (GH₵)</th>
                                        <th className="px-6 py-6 text-right">Performance</th>
                                        <th className="px-6 py-6 text-right">Intensity Score</th>
                                        <th className="px-8 py-6 text-right">Vector</th>
                                    </tr>
                                ) : (
                                    <tr className="bg-muted/10 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <th className="px-12 py-6 text-center w-32">Rank</th>
                                        <th className="px-8 py-6 text-left">Trader Network Profile</th>
                                        <th className="px-8 py-6 text-right">Accreditation XP</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-border">
                                {viewMode === "market" ? filteredRankings.map((asset) => {
                                    const scoreValue = selectedCategories.length === 1 ? (
                                        selectedCategories[0] === 'stability' ? asset.stabilityScore :
                                        selectedCategories[0] === 'momentum' ? asset.momentumScore :
                                        selectedCategories[0] === 'volume' ? (asset.volume / 1000) : asset.changePercent
                                    ) : asset.changePercent;

                                    const isUp = asset.changePercent >= 0;
                                    const rankRising = (asset.prevRank ?? asset.rank) > asset.rank;

                                    return (
                                        <tr key={asset.symbol} className="group hover:bg-muted/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <span className={`text-xl font-black w-8 tabular-nums tracking-tighter ${asset.rank <= 3 ? "text-primary" : "text-zinc-500"}`}>
                                                        {asset.rank < 10 ? `0${asset.rank}` : asset.rank}
                                                    </span>
                                                    {(asset.prevRank ?? asset.rank) !== asset.rank && (
                                                        <div className={`p-1.5 rounded-lg ${rankRising ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                                                            {rankRising ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-bold text-muted-foreground text-xs border border-border group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:text-primary transition-all uppercase tracking-widest leading-none">
                                                        {asset.symbol.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-foreground leading-tight uppercase tracking-tight">{asset.symbol}</div>
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{asset.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="text-sm font-bold text-foreground tabular-nums tracking-tight">{asset.price.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className={`text-sm font-bold tabular-nums tracking-tight ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                                                    {isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-5">
                                                    <div className="flex-1 max-w-[100px] h-2 bg-muted/20 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${isUp ? "bg-emerald-500" : "bg-primary"}`}
                                                            style={{ width: `${Math.min(100, Math.abs(scoreValue) * (selectedCategories.length > 1 ? 5 : 1))}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-black text-foreground tabular-nums tracking-tight w-10 text-right uppercase">
                                                        {Math.abs(scoreValue).toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                                    asset.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                    asset.trend === 'down' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                    "bg-muted/30 text-muted-foreground border border-border"
                                                }`}>
                                                    {asset.trend === 'up' ? <TrendingUp size={12} /> : asset.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                                                    {asset.trend}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : filteredRankings.map((user, idx) => {
                                    const rank = user.globalRank ?? (((userPage - 1) * PAGE_SIZE) + idx + 1);
                                    const isTopThree = rank <= 3;
                                    return (
                                        <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                                            <td className="px-12 py-8 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${isTopThree ? "text-primary" : "text-zinc-500"}`}>
                                                        {rank < 10 ? `0${rank}` : rank}
                                                    </span>
                                                    {user.rankChange === 'up' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                            <ArrowUp size={10} /> Up
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center font-bold text-muted-foreground text-base border-2 border-border group-hover:border-primary/40 transition-all uppercase tracking-widest shadow-premium relative overflow-hidden shrink-0">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.full_name ? user.full_name.charAt(0) : "T"
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-lg font-bold text-foreground leading-tight flex items-center gap-3 truncate">
                                                            {user.full_name || "Anonymous Trader"}
                                                            {rank === 1 && <Crown size={18} className="text-primary shrink-0" />}
                                                        </div>
                                                        <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-3 mt-2 uppercase tracking-widest">
                                                            <span>Level {user.accreditation_level || 1}</span>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <span className="text-primary">Status: Professional</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="text-xl font-black text-emerald-500 tabular-nums tracking-tight">
                                                    {(user.knowledge_xp || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">XP</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && viewMode === "users" && userTotalPages > 0 && (
                    <div className="px-12 py-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 bg-muted/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Global Network: <span className="text-foreground">{userTotal.toLocaleString()}</span> Active Traders
                            &nbsp;·&nbsp;
                            Viewing Page {userPage}
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleUserPageChange(userPage - 1)}
                                disabled={userPage <= 1}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 active:scale-95"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(userTotalPages, 5) }).map((_, i) => {
                                    const p = Math.max(1, Math.min(userTotalPages - 4, userPage - 2)) + i;
                                    if (p < 1 || p > userTotalPages) return null;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handleUserPageChange(p)}
                                            className={`w-10 h-10 rounded-xl text-[11px] font-bold transition-all ${
                                                p === userPage
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handleUserPageChange(userPage + 1)}
                                disabled={userPage >= userTotalPages}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 active:scale-95"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}