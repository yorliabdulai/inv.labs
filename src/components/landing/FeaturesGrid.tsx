"use client";

import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Plus, Wallet, ShieldCheck, PieChart } from "lucide-react";

// ----------------------------------------------------------------------
// MINI UI COMPONENTS (Replacing generic icons)
// ----------------------------------------------------------------------

const MiniChart = () => (
  <div className="w-full h-full bg-white rounded-xl border border-zinc-100 shadow-sm p-3 flex flex-col justify-between overflow-hidden relative group-hover:border-blue-200 transition-colors">
    <div className="flex justify-between items-start z-10">
      <div>
        <div className="w-8 h-2 bg-zinc-200 rounded-full mb-1"></div>
        <div className="w-12 h-3 bg-zinc-900 rounded-full"></div>
      </div>
      <div className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-bold flex items-center gap-0.5">
        <TrendingUp className="w-2 h-2" /> 2.4%
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
  <div className="w-full h-full relative flex flex-col justify-end p-2 gap-2">
    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10" />
    <div className="self-end bg-zinc-800 text-zinc-300 text-[8px] p-2 rounded-xl rounded-br-none max-w-[80%] border border-zinc-700 shadow-sm">
      Explain SEC levies.
    </div>
    <div className="self-start bg-indigo-500 text-white text-[8px] p-2 rounded-xl rounded-bl-none max-w-[85%] shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-start gap-1 relative z-20">
      <Sparkles className="w-3 h-3 shrink-0" />
      SEC levies are exactly 0.3% on all GSE trades. Wait, let me calculate that for your GH₵5,000 order...
    </div>
  </div>
);

const MiniStockList = () => (
  <div className="w-full h-full bg-white rounded-xl border border-zinc-100 shadow-sm p-2 flex flex-col gap-1.5">
    {[
      { s: "MTNGH", p: "1.82", c: "+2.3%", up: true },
      { s: "GCB", p: "5.10", c: "-0.8%", up: false },
      { s: "EGH", p: "9.44", c: "+1.1%", up: true }
    ].map((stock, i) => (
      <div key={i} className="flex justify-between items-center p-1.5 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center text-[6px] font-black text-zinc-500">{stock.s.substring(0, 2)}</div>
          <span className="text-[9px] font-bold text-zinc-900">{stock.s}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-zinc-900">{stock.p}</span>
          <span className={`text-[7px] font-black ${stock.up ? "text-emerald-500" : "text-red-500"}`}>{stock.c}</span>
        </div>
      </div>
    ))}
  </div>
);

const MiniSafe = () => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl" />
    <div className="w-16 h-16 rounded-2xl bg-white border border-rose-100 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.3)] flex items-center justify-center relative z-10">
      <ShieldCheck className="w-8 h-8 text-rose-500" />
    </div>
  </div>
);

const MiniFundCompare = () => (
  <div className="w-full h-full flex items-center justify-center gap-3">
    <div className="w-1/2 h-full bg-white rounded-xl border border-amber-100 shadow-sm p-3 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1 transition-transform">
      <p className="text-[8px] font-black text-amber-600/50 uppercase tracking-widest">Fixed Inv.</p>
      <h4 className="text-xl font-black text-amber-950 mt-1">21.5%</h4>
    </div>
    <div className="flex flex-col gap-1 items-center justify-center text-amber-300">
      <div className="w-1 h-1 rounded-full bg-amber-400" />
      <span className="text-[8px] font-black uppercase tracking-widest">VS</span>
      <div className="w-1 h-1 rounded-full bg-amber-400" />
    </div>
    <div className="w-1/2 h-full bg-white rounded-xl border border-amber-100 shadow-sm p-3 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1 transition-transform delay-75">
      <p className="text-[8px] font-black text-amber-600/50 uppercase tracking-widest">Index</p>
      <h4 className="text-xl font-black text-amber-950 mt-1">14.2%</h4>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// BENTO CONFIGURATION
// ----------------------------------------------------------------------

const bentoFeatures = [
  {
    title: "Market Mechanics",
    desc: "Monitor your virtual positions instantly. Watch how your strategies perform against live market data across the entire Ghana Stock Exchange.",
    uiSnippet: <MiniChart />,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 lg:min-h-[400px]",
    titleClass: "text-3xl md:text-5xl font-black mb-4 tracking-[-0.04em]",
    glowColor: "group-hover:bg-blue-500/5",
    uiContainerClass: "h-32 md:h-48 w-[80%] mb-8"
  },
  {
    title: "AI Copilot: Ato",
    desc: "Unsure about SEC Levies? Ask Ato. He explains complex financial concepts in plain language directly within the dashboard.",
    uiSnippet: <MiniAIChat />,
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 lg:min-h-[350px] bg-zinc-950 border-zinc-800",
    titleClass: "text-2xl font-black text-white mb-3 tracking-tight",
    descClass: "text-zinc-400",
    glowColor: "group-hover:bg-indigo-500/10",
    dark: true,
    uiContainerClass: "h-32 w-full mb-6 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative"
  },
  {
    title: "40+ GSE Equities",
    desc: "Trade MTN, GCB, and Ecobank with absolute zero risk.",
    uiSnippet: <MiniStockList />,
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 lg:min-h-[350px]",
    titleClass: "text-2xl font-black mb-3 tracking-tight",
    glowColor: "group-hover:bg-emerald-500/5",
    uiContainerClass: "h-32 w-full mb-6 bg-zinc-50 rounded-xl p-2 border border-zinc-100 inset-shadow-sm"
  },
  {
    title: "Zero Risk",
    desc: "Every trade is sandboxed. Protect your wealth while you learn.",
    uiSnippet: <MiniSafe />,
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 lg:min-h-[300px]",
    titleClass: "text-2xl font-black mb-3 tracking-tight",
    glowColor: "group-hover:bg-rose-500/5",
    uiContainerClass: "h-24 w-full mb-6"
  },
  {
    title: "Mutual Funds & Fixed Income",
    desc: "Diversify beyond stocks. Compare and invest in top-performing Ghanaian mutual funds and T-Bills based on historical NAV paths.",
    uiSnippet: <MiniFundCompare />,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-gradient-to-br from-amber-50/80 to-orange-50/40 border-amber-200/50 lg:min-h-[300px]",
    titleClass: "text-3xl font-black mb-3 text-amber-950 tracking-tight",
    descClass: "text-amber-900/80",
    glowColor: "group-hover:bg-amber-500/10",
    uiContainerClass: "h-24 w-[70%] mb-6"
  },
  {
    title: "Realistic Yields",
    desc: "Learn to project dividends and capital gains accurately.",
    uiSnippet: (
      <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform">
        <PieChart className="w-8 h-8 text-teal-600" />
      </div>
    ),
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 lg:min-h-[300px]",
    titleClass: "text-2xl font-black mb-3 tracking-tight",
    glowColor: "group-hover:bg-teal-500/5",
    uiContainerClass: "h-20 w-full mb-6 flex items-center justify-start"
  },
];

const FeaturesGrid = () => {
  return (
    <section className="relative py-24 md:py-32 z-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col mb-20 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 leading-[0.9] tracking-[-0.04em] mb-8"
          >
            A true arsenal for <br className="hidden md:block" />
            <span className="text-zinc-400">the modern investor.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed tracking-tight"
          >
            We abstracted away the complex spreadsheets. Everything you need to track, query, and analyze your simulated portfolio is engineered into a seamless interface.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {bentoFeatures.map((item, i) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
              }}
              key={i}
              className={`group overflow-hidden relative rounded-[2.5rem] p-10 lg:p-12 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] shadow-[0_8px_30px_-15px_rgba(0,0,0,0.08)] ring-1 ring-inset ${item.dark ? "bg-zinc-950 ring-white/10" : "bg-white/80 backdrop-blur-xl ring-zinc-900/5 hover:ring-zinc-900/10"
                } ${item.className}`}
            >
              {/* Subtle hover glow mesh */}
              <div className={`absolute inset-0 transition-colors duration-700 ${item.glowColor} pointer-events-none`} />

              {/* Real UI Snippet Container */}
              <div className={item.uiContainerClass}>
                {item.uiSnippet}
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className={`leading-none ${item.titleClass} ${item.dark ? "text-white" : "text-zinc-950"}`}>
                  {item.title}
                </h3>
                <p className={`text-base md:text-lg leading-relaxed font-medium tracking-tight ${item.descClass || (item.dark ? "text-zinc-400" : "text-zinc-500")}`}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
