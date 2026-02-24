"use client";

import Link from "next/link";
import { MoveLeft, TrendingUp, Compass, AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function NotFound() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance animation for content
            gsap.from(".not-found-content > *", {
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 1,
                ease: "power4.out",
            });

            // Special animation for the central symbol
            gsap.from(".mark-symbol", {
                rotate: -180,
                scale: 0.5,
                opacity: 0,
                duration: 1.5,
                ease: "expo.out",
                delay: 0.3
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#121417] text-[#F9F9F9] font-instrument-sans selection:bg-[#C05E42] selection:text-white overflow-hidden relative"
        >
            {/* Ambient Background Vector */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C05E42]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#C05E42]/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

            {/* Minimal Top Nav */}
            <nav className="fixed top-0 left-0 right-0 p-8 flex items-center justify-between border-b border-white/5 bg-[#121417]/50 backdrop-blur-3xl z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-[#C05E42] p-2 rounded-[2px] shadow-2xl shadow-[#C05E42]/20">
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase font-instrument-serif text-[#F9F9F9]">INV.LABS</span>
                </Link>

                <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    <Link href="/dashboard/market" className="hover:text-[#C05E42] transition-colors">Market_Data</Link>
                    <Link href="/dashboard/learn" className="hover:text-[#C05E42] transition-colors">Intelligence</Link>
                    <Link href="/dashboard/leaderboard" className="hover:text-[#C05E42] transition-colors">Node_Ranking</Link>
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                    PROTOCOL_v4.2
                </div>
            </nav>

            <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-32 relative z-10">
                <div className="not-found-content text-center max-w-4xl w-full">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-[2px] mb-8 animate-pulse">
                        <AlertTriangle size={14} className="text-[#C05E42]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C05E42]">Signal_Lost: 404_Vector_Invalid</span>
                    </div>

                    <h2 className="text-sm md:text-base font-black text-white/20 mb-12 uppercase tracking-[0.5em] font-instrument-sans">
                        Target node could not be located in the grid
                    </h2>

                    <div className="relative flex items-center justify-center gap-4 md:gap-12 mb-16 select-none">
                        <span className="text-[180px] md:text-[350px] font-black leading-none tracking-tighter font-instrument-serif text-[#F9F9F9]">4</span>

                        <div className="mark-symbol relative w-[100px] h-[100px] md:w-[200px] md:h-[200px] flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#C05E42]">
                                <rect x="47" y="0" width="6" height="100" />
                                <rect x="0" y="47" width="100" height="6" />
                                <rect x="47" y="0" width="6" height="100" transform="rotate(45 50 50)" />
                                <rect x="47" y="0" width="6" height="100" transform="rotate(-45 50 50)" />
                                <circle cx="50" cy="50" r="12" className="fill-[#121417] stroke-[#C05E42] stroke-2" />
                                <circle cx="50" cy="50" r="4" className="fill-[#C05E42]" />
                            </svg>
                        </div>

                        <span className="text-[180px] md:text-[350px] font-black leading-none tracking-tighter font-instrument-serif text-[#F9F9F9]">4</span>
                    </div>

                    <div className="flex flex-col items-center gap-10">
                        <Link
                            href="/dashboard"
                            className="bg-[#C05E42] text-[#F9F9F9] px-16 py-6 rounded-[2px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#D16D4F] transition-all shadow-3xl shadow-[#C05E42]/20 group flex items-center gap-4"
                        >
                            <Compass size={18} className="group-hover:rotate-90 transition-transform duration-700" />
                            Recalibrate_to_Dashboard
                        </Link>

                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-[#C05E42] transition-colors flex items-center gap-3 group">
                            <MoveLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            System_Reauthentication
                        </Link>
                    </div>
                </div>

                {/* Institutional Footer */}
                <div className="absolute bottom-12 left-0 right-0 px-8">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10">
                        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Institutional Grade Node Infrastructure</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">© 2026 INV.LABS Terminal Core</div>
                        <div className="flex items-center gap-4">
                            <span className="h-[1px] w-12 bg-white/5" />
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C05E42]">Status: REROUTING_SESSION</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
