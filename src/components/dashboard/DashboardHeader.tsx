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

import { useTheme } from "next-themes";

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-9 h-9" />;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center hover:bg-muted transition-all active:scale-95 shadow-sm"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun size={16} className="text-[--text-dark-primary]" />
            ) : (
                <Moon size={16} className="text-[--text-primary]" />
            )}
        </button>
    );
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
            {/* Status strip - Hidden on mobile/tablet to prioritize logo/title */}
            <div className="hidden md:flex bg-card border border-border rounded-xl mx-4 mb-6 md:mx-0 md:mb-8 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Activity size={14} className="text-primary dark:text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary dark:bg-primary" />
                                </span>
                                <span className="text-xs font-semibold text-foreground tracking-tight">GSE Market</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{dateStr}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Globe size={11} className="text-primary/60" />
                            Session active
                        </span>
                        <div className="bg-muted border border-border rounded-lg px-3 py-1.5 font-mono text-xs text-muted-foreground tabular-nums">
                            <Clock />
                        </div>
                    </div>
                </div>
            </div>

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GreetIcon size={13} className="text-primary dark:text-primary flex-shrink-0" />
                        {showSkeleton ? (
                            <span className="inline-block w-40 h-3 bg-muted animate-pulse rounded" />
                        ) : (
                            <span>{greeting.text}, {name}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative hidden lg:flex">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            aria-label="Search markets"
                            className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm w-56 text-foreground placeholder:text-muted-foreground focus:border-blue-500/40 focus:bg-muted outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification bell */}
                    <button
                        className="relative w-9 h-9 bg-card rounded-xl border border-border hover:bg-muted transition-all flex items-center justify-center group shadow-sm"
                        aria-label="View notifications"
                    >
                        <Bell size={16} className="text-[--text-primary] dark:text-[--text-dark-primary] group-hover:text-foreground transition-colors" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                    </button>

                    {/* Avatar */}
                    <button
                        className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                        aria-label="User profile"
                    >
                        {initial}
                    </button>
                </div>
            </div>
        </header>
    );
}
