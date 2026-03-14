"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0D0F12] flex flex-col relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />

            {/* Minimal nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        iL
                    </div>
                    <span className="font-bold text-base tracking-tight text-white">inv.labs</span>
                </Link>
                <Link
                    href="/dashboard"
                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    Go to Dashboard →
                </Link>
            </nav>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-lg"
                >
                    {/* Large 404 */}
                    <div className="text-[160px] md:text-[220px] font-bold text-white/[0.04] leading-none select-none mb-4 -mx-8">
                        404
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 -mt-8 md:-mt-12">
                        Page not found
                    </h1>
                    <p className="text-zinc-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
                        The page you're looking for doesn't exist or may have been moved.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <Home className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-white/[0.08] font-semibold text-sm rounded-xl transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go to Landing
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
