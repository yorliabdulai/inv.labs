"use client";

import { Activity, Globe, Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader({ userInitial = "K" }: { userInitial?: string }) {
    const [currentTime, setCurrentTime] = useState("");

    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        // Set date string on client side only
        setDateStr(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));

        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setCurrentTime(timeStr);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="relative z-10 mb-8 w-full">
            {/* Mobile-First Status Bar */}
            <div className="bg-background-surface/80 backdrop-blur-sm border-b border-border/50 rounded-b-2xl mx-4 mb-6 shadow-sm md:mx-0 md:rounded-lg md:border md:mb-8 transition-all duration-300">
                <div className="flex items-center justify-between p-3 md:p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                            <Activity size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                                </span>
                                <span className="text-xs font-black text-brand uppercase tracking-wider">Live Feed</span>
                            </div>
                            <div className="text-[10px] md:text-xs text-text-tertiary font-bold uppercase">{dateStr}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-text-tertiary font-medium">
                            <span className="flex items-center gap-1">
                                <Globe size={12} />
                                ACC-01
                            </span>
                            <span className="text-text-tertiary/30">•</span>
                            <span>42ms</span>
                        </div>
                        <div className="bg-text-primary text-white px-3 py-1 rounded-lg font-mono text-xs font-black shadow-lg shadow-text-primary/20">
                            {currentTime}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Title Area - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 md:px-0">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight mb-2">
                        Control Center
                    </h1>
                    <p className="text-sm text-text-secondary font-medium">
                        Welcome back, {userInitial}. Here's your market overview.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mobile Search - Compact */}
                    <div className="relative md:hidden">
                        <button className="p-3 bg-background-surface rounded-xl border border-border hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] touch-manipulation active:scale-95">
                            <Search size={18} className="text-text-tertiary" />
                        </button>
                    </div>

                    {/* Desktop Search */}
                    <div className="relative hidden lg:flex group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand transition-colors" />
                        <input
                            type="text"
                            placeholder="Search markets, stocks..."
                            className="bg-background-surface border border-border rounded-xl pl-12 pr-4 py-3 text-sm font-medium w-72 focus:ring-2 focus:ring-brand/10 focus:border-brand-accent transition-all outline-none shadow-sm placeholder:text-text-tertiary/70"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-3 bg-background-surface rounded-xl border border-border hover:bg-brand/5 hover:border-brand/30 transition-all group min-h-[44px] min-w-[44px] touch-manipulation active:scale-95">
                            <Bell size={18} className="text-text-tertiary group-hover:text-brand transition-colors" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-status-error rounded-full border-2 border-white animate-pulse"></span>
                        </button>

                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand to-brand-accent text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand/30 hover:shadow-xl transition-all cursor-pointer touch-manipulation active:scale-95 ring-2 ring-transparent hover:ring-brand/20">
                            {userInitial}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
