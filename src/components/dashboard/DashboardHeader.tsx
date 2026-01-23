"use client";

import { Activity, Server, Globe, Bell, Search, Command } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader({ userInitial = "K" }: { userInitial?: string }) {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
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

    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="relative z-10 mb-8 w-full">
            {/* Upper Status Feed */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-4 bg-white/50 backdrop-blur-sm px-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Feed: Active</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-gray-400 text-[9px] font-bold uppercase tracking-wider border-l border-gray-100 pl-4">
                        <span className="flex items-center gap-1"><Server size={10} /> 42ms</span>
                        <span className="flex items-center gap-1"><Globe size={10} /> ACC-01</span>
                    </div>
                </div>
                <div className="bg-indigo-900 text-white px-2 py-0.5 rounded font-mono text-[10px] font-black">
                    {currentTime}
                </div>
            </div>

            {/* Main Title Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1A1C4E] tracking-tight">
                        Control Center
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">{dateStr}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative hidden lg:block group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Terminal query..."
                            className="bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-12 py-2 text-xs font-semibold w-56 focus:ring-2 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white px-1 py-0.5 rounded border border-gray-200 text-[8px] font-black text-gray-400">
                            <Command size={8} /> K
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-all group relative">
                            <Bell size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-9 h-9 rounded-lg bg-[#1A1C4E] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 ml-1">
                            {userInitial}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
