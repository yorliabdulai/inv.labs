"use client";

import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Plus, Wallet, ShieldCheck, PieChart } from "lucide-react";

// ----------------------------------------------------------------------
// MINI UI COMPONENTS (Preserved from V3 for "Real Product" feel)
// ----------------------------------------------------------------------

const MiniChart = () => (
    <div className="w-full h-full bg-white rounded-xl border border-zinc-100 shadow-sm p-4 flex flex-col justify-between overflow-hidden relative group-hover:border-blue-200 transition-colors">
        <div className="flex justify-between items-start z-10 mb-8">
            <div>
                <div className="w-12 h-2.5 bg-zinc-200 rounded-full mb-2"></div>
                <div className="w-16 h-4 bg-zinc-900 rounded-full"></div>
            </div>
            <div className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 2.4%
            </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 C20,80 40,90 60,40 C80,-10 100,20 100,20" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500" />
            </svg>
        </div>
    </div>
);

const MiniAIChat = () => (
    <div className="w-full h-full relative flex flex-col justify-end p-4 gap-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10" />
        <div className="self-end bg-zinc-800 text-zinc-300 text-xs p-3 rounded-xl rounded-br-none max-w-[80%] border border-zinc-700 shadow-sm relative z-20">
            Explain SEC levies.
        </div>
        <div className="self-start bg-indigo-500 text-white text-xs p-3 rounded-xl rounded-bl-none max-w-[85%] shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-start gap-2 relative z-20">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            SEC levies are exactly 0.3% on all GSE trades. Wait, let me calculate that for your GH₵5,000 order...
        </div>
    </div>
);

const MiniStockList = () => (
    <div className="w-full h-full bg-white rounded-xl border border-zinc-100 shadow-sm p-3 flex flex-col gap-2">
        {[
            { s: "MTNGH", p: "1.82", c: "+2.3%", up: true },
            { s: "GCB", p: "5.10", c: "-0.8%", up: false },
            { s: "EGH", p: "9.44", c: "+1.1%", up: true }
        ].map((stock, i) => (
            <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500">{stock.s.substring(0, 2)}</div>
                    <span className="text-xs font-bold text-zinc-900">{stock.s}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-zinc-900">{stock.p}</span>
                    <span className={`text-[10px] font-black ${stock.up ? "text-emerald-500" : "text-red-500"}`}>{stock.c}</span>
                </div>
            </div>
        ))}
    </div>
);

// ----------------------------------------------------------------------
// ALTERNATING LAYOUT CONFIGURATION
// ----------------------------------------------------------------------

const features = [
    {
        title: "Market Mechanics",
        desc: "Monitor your virtual positions instantly. Watch how your strategies perform against live market data across the entire Ghana Stock Exchange.",
        visual: <MiniChart />,
        reverse: false,
        glow: "bg-blue-500/10"
    },
    {
        title: "AI Copilot: Ato",
        desc: "Unsure about SEC Levies or how mutual funds work? Ask Ato. He explains complex financial concepts in plain language directly within the dashboard.",
        visual: <MiniAIChat />,
        reverse: true,
        glow: "bg-indigo-500/10"
    },
    {
        title: "40+ Real Equities",
        desc: "Trade MTN, GCB, and Ecobank with absolute zero risk. Track your portfolio over weeks and months to understand dividends and capital gains.",
        visual: <MiniStockList />,
        reverse: false,
        glow: "bg-emerald-500/10"
    }
];

const AlternatingFeatures = () => {
    return (
        <section id="features" className="relative py-24 md:py-32 z-20 bg-zinc-50">
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">

                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-950 leading-tight tracking-tight text-balance mb-6">
                            A true arsenal for <br className="hidden md:block" />
                            <span className="text-zinc-400">the modern investor.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed tracking-tight max-w-2xl mx-auto">
                            We abstracted away the complex spreadsheets. Everything you need to track, query, and analyze your simulated portfolio is engineered into a seamless interface.
                        </p>
                    </motion.div>
                </div>

                {/* Alternating Panels */}
                <div className="flex flex-col gap-32">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24`}
                        >

                            {/* Text Side */}
                            <motion.div
                                initial={{ opacity: 0, x: feature.reverse ? 30 : -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                                className="w-full md:w-1/2 flex flex-col"
                            >
                                <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>
                                <h3 className="text-3xl lg:text-4xl font-bold text-zinc-950 leading-tight tracking-tight mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-zinc-500 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>

                            {/* Visual Side (Floating Panel) */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
                                className="w-full md:w-1/2 relative perspective-1000 group"
                            >
                                {/* Background ambient glow */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] ${feature.glow} blur-[80px] rounded-full pointer-events-none`} />

                                {/* The Floating Panel */}
                                <div className={`relative w-full aspect-[4/3] rounded-[2rem] p-6 lg:p-10 transition-all duration-700 bg-white/60 backdrop-blur-xl ring-1 ring-inset ring-white/50 border border-zinc-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden`}>

                                    {/* Visual Snippet Wrapper */}
                                    <div className="w-full max-w-sm aspect-video shadow-2xl rounded-2xl overflow-hidden ring-1 ring-inset ring-zinc-900/5 transform transition-transform duration-700 group-hover:scale-105">
                                        {feature.visual}
                                    </div>

                                </div>
                            </motion.div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AlternatingFeatures;
