"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

const LifetimeBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-3rem)] max-w-2xl">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-zinc-950 text-white p-4 md:p-5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                        <span className="text-[10px] font-black tracking-tighter">HOT</span>
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight leading-none mb-1">
                            Lifetime Free Access Teaser
                        </p>
                        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
                            Only 513 spots remaining for lifetime free access.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="hidden sm:block bg-white text-zinc-950 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                        Sign Up Now
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LifetimeBanner;
