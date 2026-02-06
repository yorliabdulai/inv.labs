"use client";

import Link from "next/link";
import { ArrowRight, MoveLeft, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function NotFound() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance animation for content
            gsap.from(".not-found-content > *", {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out",
            });

            // Special animation for the central 4*4
            gsap.from(".mark-symbol", {
                rotate: -180,
                scale: 0.5,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out",
                delay: 0.2
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#F0F2F5] text-[#0F172A] font-sans selection:bg-[#0F172A] selection:text-white"
        >
            {/* Minimal Top Nav */}
            <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-[#0F172A] p-2 rounded-lg">
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">GSE.Labs</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <Link href="/market" className="hover:text-[#0F172A] transition-colors">Market</Link>
                    <Link href="/learn" className="hover:text-[#0F172A] transition-colors">Learn</Link>
                    <Link href="/portfolio" className="hover:text-[#0F172A] transition-colors">Portfolio</Link>
                    <Link href="/support" className="hover:text-[#0F172A] transition-colors">Support</Link>
                </div>

                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    EN / FR
                </div>
            </nav>

            <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24">
                <div className="not-found-content text-center max-w-4xl w-full">

                    <p className="text-sm md:text-base font-bold text-gray-500 mb-8 tracking-tight">
                        The page you are looking for does not exist
                    </p>

                    <div className="relative flex items-center justify-center gap-4 md:gap-8 mb-12 select-none">
                        <span className="text-[150px] md:text-[300px] font-black leading-none tracking-tighter">4</span>

                        <div className="mark-symbol relative w-[80px] h-[80px] md:w-[160px] md:h-[160px] flex items-center justify-center">
                            {/* Custom Asterisk/Star Symbol inspired by the provided image */}
                            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#0F172A]">
                                <rect x="45" y="0" width="10" height="100" />
                                <rect x="0" y="45" width="100" height="10" />
                                <rect x="45" y="0" width="10" height="100" transform="rotate(45 50 50)" />
                                <rect x="45" y="0" width="10" height="100" transform="rotate(-45 50 50)" />
                                {/* Tiny triangle in the middle as per image */}
                                <polygon points="50,40 60,55 40,55" className="fill-white" />
                            </svg>
                        </div>

                        <span className="text-[150px] md:text-[300px] font-black leading-none tracking-tighter">4</span>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        <Link
                            href="/dashboard"
                            className="bg-[#0F172A] text-white px-12 py-5 rounded-sm text-xs font-black uppercase tracking-[0.3em] hover:bg-[#1E293B] transition-all relative overflow-hidden group shadow-2xl shadow-black/10"
                        >
                            <div className="absolute top-0 right-0 w-2 h-2 bg-white/20 origin-top-right scale-0 group-hover:scale-100 transition-transform" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/20 origin-bottom-left scale-0 group-hover:scale-100 transition-transform" />
                            Go to Terminal
                        </Link>

                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#0F172A] transition-colors flex items-center gap-2">
                            <MoveLeft size={12} />
                            Session Authentication
                        </Link>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full text-center px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-8 opacity-40">
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em]">Institutional Grade Simulation</div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em]">© 2026 GSE.LABS Infrastructure</div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em]">System.04 // Status: Re-route</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
