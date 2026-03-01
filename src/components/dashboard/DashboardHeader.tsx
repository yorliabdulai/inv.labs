"use client";

import { Activity, Globe, Bell, Search, Sun, Moon, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";

function getGreeting(hour: number): { text: string; icon: React.ElementType } {
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Sunset };
    return { text: "Good evening", icon: Moon };
}

/**
 * DashboardHeader now pulls directly from UserProfileContext.
 * This ensures EVERY page shows the user's name correctly without needing props.
 */
export function DashboardHeader() {
    const { displayName, displayInitial, firstName, loading } = useUserProfile();
    const [currentTime, setCurrentTime] = useState("");
    const [dateStr, setDateStr] = useState("");
    const [greeting, setGreeting] = useState<{ text: string; icon: React.ElementType }>({ text: "Good morning", icon: Sun });

    useEffect(() => {
        const now = new Date();
        setDateStr(now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
        setGreeting(getGreeting(now.getHours()));

        const updateTime = () => {
            const n = new Date();
            setCurrentTime(n.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const GreetIcon = greeting.icon;

    // Resolve the display name — context has a "Trader" fallback already,
    // but we add one more guard here so the UI never shows a blank greeting.
    const name = firstName || displayName || "Trader";
    const initial = displayInitial || name.charAt(0).toUpperCase() || "T";
    // Show skeleton only while actively loading AND we genuinely have no name yet
    const showSkeleton = loading && name === "Trader";

    return (
        <header className="relative z-10 mb-8 w-full font-instrument-sans">
            {/* Minimalist Status Bar */}
            <div className="bg-[#121417] border-white/10 border rounded-[2px] mx-4 mb-6 shadow-2xl md:mx-0 md:mb-8 transition-all duration-300">
                <div className="flex items-center justify-between p-3 md:p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-[2px] bg-[#C05E42] flex items-center justify-center shadow-lg shadow-[#C05E42]/20">
                            <Activity size={16} className="text-[#F9F9F9]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C05E42] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C05E42]"></span>
                                </span>
                                <span className="text-[10px] font-black text-[#F9F9F9] uppercase tracking-[0.2em]">Kwayisi Terminal</span>
                            </div>
                            <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{dateStr}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#F9F9F9] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 opacity-40">
                                <Globe size={12} className="text-[#C05E42]" />
                                GSE_SESSION_ACTIVE
                            </span>
                        </div>
                        <div className="bg-white/5 text-[#F9F9F9] px-4 py-1.5 rounded-[1px] font-mono text-xs font-black border border-white/10 tabular-nums">
                            {currentTime}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Title & Ato Badge Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 md:px-0">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-4xl font-black text-[#F9F9F9] tracking-tighter font-instrument-serif uppercase">
                            Executive Console
                        </h1>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#C05E42]/10 border border-[#C05E42]/20 rounded-[2px] animate-in fade-in zoom-in duration-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C05E42]" />
                            <span className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Ato Investment Guide Active</span>
                        </div>
                    </div>
                    <div className="text-[11px] text-[#F9F9F9] font-black flex items-center gap-2 min-h-[20px] uppercase tracking-[0.15em] opacity-60">
                        <GreetIcon size={14} className="text-[#C05E42] flex-shrink-0" />
                        {showSkeleton ? (
                            <span className="inline-block w-32 h-3 bg-white/5 animate-pulse rounded-[1px]" />
                        ) : (
                            <span>{greeting.text}, {name}. Transaction readiness verified.</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Field */}
                    <div className="relative hidden lg:flex group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C05E42] transition-colors" />
                        <input
                            type="text"
                            placeholder="Query Market Indices..."
                            className="bg-white/5 border border-white/10 rounded-[2px] pl-12 pr-4 py-4 text-[11px] font-black w-64 focus:bg-white/10 focus:border-[#C05E42]/50 transition-all outline-none text-[#F9F9F9] uppercase tracking-widest placeholder:text-white/20"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            className="relative p-3.5 bg-white/5 rounded-[2px] border border-white/10 hover:bg-white/10 hover:border-[#C05E42]/30 transition-all group min-h-[44px] min-w-[44px] touch-manipulation active:scale-[0.98]"
                            aria-label="View notifications"
                        >
                            <Bell size={18} className="text-white/40 group-hover:text-[#F9F9F9] transition-colors" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C05E42] rounded-full shadow-lg shadow-[#C05E42]/40"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                            <button
                                className="w-10 h-10 md:w-12 md:h-12 rounded-[2px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-black text-xs shadow-xl shadow-[#C05E42]/10 hover:scale-[1.02] transition-all cursor-pointer touch-manipulation active:scale-[0.98] border border-white/10 uppercase tracking-widest"
                                aria-label="User Profile"
                            >
                                {initial}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
