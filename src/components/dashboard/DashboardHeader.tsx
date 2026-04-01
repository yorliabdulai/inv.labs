"use client";

import { Search, Sun, Moon, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";
import { useTheme } from "next-themes";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function getGreeting(hour: number): { text: string; icon: React.ElementType } {
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Sunset };
    return { text: "Good evening", icon: Moon };
}

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-12 h-12 flex-shrink-0" />;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all active:scale-95 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-sm"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun size={20} className="text-zinc-700 dark:text-zinc-200 md:w-7 md:h-7" />
            ) : (
                <Moon size={20} className="text-zinc-700 dark:text-zinc-200 md:w-7 md:h-7" />
            )}
        </button>
    );
}

export function DashboardHeader() {
    const { displayName, displayInitial, firstName, profile, loading } = useUserProfile();
    const [greeting, setGreeting] = useState<{ text: string; icon: React.ElementType }>({ text: "Good morning", icon: Sun });

    useEffect(() => {
        setGreeting(getGreeting(new Date().getHours()));
    }, []);

    const GreetIcon = greeting.icon;
    const name = firstName || displayName || "Trader";
    const initial = displayInitial || name.charAt(0).toUpperCase() || "T";
    const showSkeleton = loading && name === "Trader";

    return (
        <header className="relative z-50 mb-8 w-full">
            {/*
             * Premium Layout: Single row on all devices.
             * On mobile, we hide the greeting to make room for the large action buttons.
             */}
            <div className="flex items-center justify-between gap-4 px-4 md:px-0">
                {/* Left: title + greeting */}
                <div className="min-w-0 flex-1">
                    {/* Greeting Title (replaces "Dashboard" on all screens) */}
                    <div className="flex items-center gap-2 min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate flex items-center gap-2">
                            {showSkeleton ? (
                                <span className="inline-block w-32 h-6 md:h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <GreetIcon className="text-primary flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                                    <span className="truncate max-w-[180px] xs:max-w-[250px] sm:max-w-none">
                                        <span className="hidden sm:inline">{greeting.text}, </span>
                                        <span className="sm:hidden">Hi, </span>
                                        {name.split(' ')[0]}
                                    </span>
                                </>
                            )}
                        </h1>
                    </div>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Search — desktop only */}
                    <div className="relative hidden lg:flex">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            aria-label="Search markets"
                            className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm w-56 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:bg-muted outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Avatar */}
                    <button
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex-shrink-0 relative overflow-hidden"
                        aria-label="User profile"
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            initial
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}