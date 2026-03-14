"use client";

import Link from "next/link";
import { RefreshCcw, AlertOctagon, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[160px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 text-center max-w-lg w-full"
            >
                {/* Error badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold mb-8">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Something went wrong
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-none mb-4">
                    Error
                </h1>
                <p className="text-zinc-500 text-base leading-relaxed mb-4 max-w-sm mx-auto">
                    An unexpected error occurred. This has been logged and we're looking into it.
                </p>

                {/* Error digest */}
                {error.digest && (
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 mb-8 font-mono text-xs text-zinc-600 text-left">
                        <span className="text-zinc-700">Error ID: </span>
                        <span className="text-zinc-500">{error.digest}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.08] font-semibold text-sm rounded-xl transition-all duration-200"
                    >
                        <Home className="w-4 h-4" />
                        Go home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
