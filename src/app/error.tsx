"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { RefreshCcw, AlertOctagon, Home, MonitorX } from "lucide-react";
import gsap from "gsap";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.error(error);
        const ctx = gsap.context(() => {
            gsap.from(".error-content > *", {
                opacity: 0,
                y: 40,
                stagger: 0.15,
                duration: 1.2,
                ease: "power4.out",
            });

            gsap.to(".glitch-overlay", {
                opacity: 0.05,
                duration: 0.1,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        }, containerRef);

        return () => ctx.revert();
    }, [error]);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#121417] text-[#F9F9F9] font-instrument-sans selection:bg-[#C05E42] selection:text-white overflow-hidden relative flex flex-col items-center justify-center p-6"
        >
            {/* Glitch Overlay Effect */}
            <div className="glitch-overlay absolute inset-0 bg-white opacity-0 pointer-events-none z-0" />

            {/* Ambient Noise / Background Vector */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-[#C05E42]/20 animate-scan" style={{ animation: 'scan 4s linear infinite' }} />

            <div className="error-content relative z-10 text-center max-w-2xl w-full">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[2px] mb-12">
                    <AlertOctagon size={18} className="text-[#EF4444]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#EF4444]">System_Exception // Runtime_Fatal</span>
                </div>

                <div className="mb-16 relative">
                    <MonitorX size={80} className="mx-auto text-white/5 mb-6" />
                    <h1 className="text-5xl md:text-7xl font-black font-instrument-serif tracking-tighter uppercase mb-4 leading-none">
                        Kernel Panic
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <span className="h-[1px] w-8 bg-white/10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
                            Protocol execution interrupted
                        </p>
                        <span className="h-[1px] w-8 bg-white/10" />
                    </div>
                </div>

                {/* Error Log Mockup */}
                <div className="bg-black/40 border border-white/5 rounded-[2px] p-6 mb-16 text-left font-mono text-[10px] text-white/40 overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <span className="uppercase tracking-widest text-white/20">Error_Stack_Digest</span>
                        <span className="text-[#C05E42]">{error.digest || 'SIG_UNKNOWN_BLOCK'}</span>
                    </div>
                    <div className="space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <p>{`> FATAL: ${error.message}`}</p>
                        <p className="flex items-center gap-2">
                            <span className="text-[#C05E42] animate-pulse">_</span>
                            Executing emergency recovery protocols...
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto bg-[#C05E42] text-[#F9F9F9] px-12 py-6 rounded-[2px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#D16D4F] transition-all shadow-3xl shadow-[#C05E42]/20 flex items-center justify-center gap-4 active:scale-95 group"
                    >
                        <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                        Reset_Terminal
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto bg-white/5 border border-white/10 text-[#F9F9F9] px-12 py-6 rounded-[2px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-4 active:scale-95"
                    >
                        <Home size={18} />
                        Abort_To_Baseline
                    </Link>
                </div>
            </div>

            {/* Terminal Metadata Footer */}
            <div className="absolute bottom-12 left-0 right-0 px-8 opacity-20 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-[8px] font-black uppercase tracking-[0.6em]">
                    <span>MEM_DUMP: 0xFD21A...</span>
                    <span>TRACING_ENABLED: TRUE</span>
                    <span>NODE_IDENTITY: {error.digest || 'ANONYMOUS'}</span>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100vh); }
                }
            `}</style>
        </div>
    );
}
