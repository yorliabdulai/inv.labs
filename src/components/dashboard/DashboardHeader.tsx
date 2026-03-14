"use client";

import { Activity, Globe, Bell, Search, Sun, Moon, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";

function getGreeting(hour: number): { text: string; icon: React.ElementType } {
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Sunset };
    return { text: "Good evening", icon: Moon };
}

function Clock() {
    const [currentTime, setCurrentTime] = useState("");
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
            }));
        };
        requestAnimationFrame(updateTime);
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);
    return <>{currentTime}</>;
}

export function DashboardHeader() {
    const { displayName, displayInitial, firstName, loading } = useUserProfile();
    const [dateStr, setDateStr] = useState("");
    const [greeting, setGreeting] = useState<{ text: string; icon: React.ElementType }>({ text: "Good morning", icon: Sun });

    useEffect(() => {
        const now = new Date();
        setDateStr(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
        setGreeting(getGreeting(now.getHours()));
    }, []);

    const GreetIcon = greeting.icon;
    const name = firstName || displayName || "Trader";
    const initial = displayInitial || name.charAt(0).toUpperCase() || "T";
    const showSkeleton = loading && name === "Trader";

    return (
        <header className="relative z-10 mb-8 w-full">
            {/* Status strip */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl mx-4 mb-6 md:mx-0 md:mb-8">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                            <Activity size={14} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                                </span>
                                <span className="text-xs font-semibold text-zinc-300">GSE Market</span>
                            </div>
                            <div className="text-[10px] text-zinc-600 mt-0.5">{dateStr}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-600">
                            <Globe size={11} className="text-blue-500/60" />
                            Session active
                        </span>
                        <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 font-mono text-xs text-zinc-400 tabular-nums">
                            <Clock />
                        </div>
                    </div>
                </div>
            </div>

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <GreetIcon size={13} className="text-blue-500/70 flex-shrink-0" />
                        {showSkeleton ? (
                            <span className="inline-block w-40 h-3 bg-white/[0.05] animate-pulse rounded" />
                        ) : (
                            <span>{greeting.text}, {name}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative hidden lg:flex">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            aria-label="Search markets"
                            className="bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm w-56 text-zinc-400 placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-white/[0.06] outline-none transition-all"
                        />
                    </div>

                    {/* Notification bell */}
                    <button
                        className="relative w-9 h-9 bg-white/[0.04] rounded-xl border border-white/[0.07] hover:bg-white/[0.08] transition-all flex items-center justify-center group"
                        aria-label="View notifications"
                    >
                        <Bell size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </button>

                    {/* Avatar */}
                    <button
                        className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-500 transition-all"
                        aria-label="User profile"
                    >
                        {initial}
                    </button>
                </div>
            </div>
        </header>
    );
}
