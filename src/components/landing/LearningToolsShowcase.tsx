"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TrendingUp, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// MOCKUP COMPONENTS (Enhanced for the Cinematic Showcase)
// ----------------------------------------------------------------------

const StockMasteryMockup = () => (
  <div className="w-full h-full p-6 flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selected Asset</p>
        <h4 className="text-2xl font-black text-white">MTN Ghana (MTNGH)</h4>
      </div>
      <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-xs font-black flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" /> +2.45%
      </div>
    </div>

    {/* Elegant Chart Visual */}
    <div className="flex-1 relative min-h-[150px] bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent" />
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,80 C10,75 20,85 30,60 C40,35 50,45 60,30 C70,15 80,25 90,10 L100,5 L100,100 L0,100 Z"
          fill="url(#chartGradient)"
        />
        <path
          d="M0,80 C10,75 20,85 30,60 C40,35 50,45 60,30 C70,15 80,25 90,10 L100,5"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* Interactive Point Marker */}
      <div className="absolute top-[10%] right-[10%] group">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
        <div className="w-3 h-3 bg-blue-500 rounded-full relative z-10" />
        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-white text-zinc-950 text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          GH₵ 1.82
        </div>
      </div>
    </div>

    {/* Fee Transparency */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/5">
        <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">GSE Levy</p>
        <p className="text-sm font-black text-white">0.3%</p>
      </div>
      <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/5">
        <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Risk Level</p>
        <p className="text-sm font-black text-blue-400">Moderate</p>
      </div>
    </div>
  </div>
);

const AIGuidanceMockup = () => (
  <div className="w-full h-full p-6 flex flex-col justify-end gap-4 overflow-hidden">
    <div className="absolute top-6 left-6 right-6 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-white tracking-widest uppercase">Ato AI</p>
          <p className="text-[10px] text-blue-400 font-bold">Analyzing GCB Financials...</p>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="self-end ml-auto bg-zinc-800 text-zinc-300 text-xs p-3 rounded-2xl rounded-br-none max-w-[80%]"
      >
        Is GCB a good buy right now?
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="self-start mr-auto bg-indigo-600 text-white text-xs p-4 rounded-2xl rounded-bl-none max-w-[90%] shadow-lg shadow-indigo-600/20"
      >
        GCB Bank has a P/E ratio of 3.2x, which is 40% lower than the sector average. However, their NPL ratio just ticked up. Let's look at their dividend yield first...
      </motion.div>
    </div>
  </div>
);

const DiversificationMockup = () => (
  <div className="w-full h-full p-6 flex flex-col gap-6">
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-xl font-black text-white tracking-tight">Portfolio Balanced</h4>
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-amber-500" />
      </div>
    </div>

    <div className="space-y-3">
      {[
        { label: "Databank Mfund", value: "GH₵4,200", color: "bg-amber-500", p: "42%" },
        { label: "NewGold ETF", value: "GH₵2,100", color: "bg-blue-500", p: "21%" },
        { label: "Cash (Reserve)", value: "GH₵3,700", color: "bg-zinc-700", p: "37%" },
      ].map((item, i) => (
        <div key={i} className="group">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-zinc-400">{item.label}</span>
            <span className="text-white">{item.p}</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: item.p }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={cn("h-full rounded-full", item.color)} 
            />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-auto p-4 bg-zinc-900/50 rounded-2xl border border-white/5 text-center">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Recommended Strategy</p>
      <p className="text-xs font-black text-amber-500">Income & Growth Preservation</p>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// MAIN SHOWCASE DATA
// ----------------------------------------------------------------------

const sections = [
  {
    id: "stocks",
    tag: "01. Stock Mastery",
    title: "Master the Real Market.",
    description: "Learn how the Ghana Stock Exchange works by trading MTNGH, GCB, and Tullow. We simulate the exact environment, including broker fees and SEC levies, so you're ready for the real thing.",
    features: ["Real-time GSE Prices", "Deep Fee Transparency", "No Financial Risk"],
    mockup: <StockMasteryMockup />,
    color: "blue"
  },
  {
    id: "ai",
    tag: "02. AI Guidance",
    title: "Your 24/7 Investment Coach.",
    description: "Ato doesn't just give data—he gives insights. Ask anything from 'How do dividends work?' to 'Analyze this bank statement'. No judgment, just pure financial intelligence.",
    features: ["Instant Contextual Help", "Sector Analysis", "Jargon Decoding"],
    mockup: <AIGuidanceMockup />,
    color: "indigo"
  },
  {
    id: "funds",
    tag: "03. Diversification",
    title: "Beyond Single Stocks.",
    description: "Learn why mutual funds and ETFs are the secret to long-term wealth in Ghana. Compare risk levels, track historic returns, and build a truly resilient portfolio.",
    features: ["Fund Comparison Engine", "Risk Filtering", "ETF Basics"],
    mockup: <DiversificationMockup />,
    color: "amber"
  }
];

const LearningToolsShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(sections[0].id);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track scroll position to update the active section
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const index = Math.min(
        Math.floor(latest * sections.length),
        sections.length - 1
      );
      setActiveId(sections[index].id);
    });
  }, [scrollYProgress]);

  return (
    <section id="features" ref={containerRef} className="relative bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        
        {/* Intro Header (Non-sticky) */}
        <div className="py-24 md:py-32 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 w-fit text-sm font-semibold mb-8 border border-blue-100"
          >
            <span>Platform Showcase</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black text-zinc-950 leading-[0.9] tracking-[-0.04em] mb-10">
            Professional tools. <br />
            <span className="text-blue-600">Human simplicity.</span>
          </h2>
          <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl leading-relaxed">
            We've stripped away the complexity of traditional finance tools to give you an interface that feels intuitive, powerful, and built for your growth.
          </p>
        </div>

        {/* Cinematic Split-Screen (Desktop Only) */}
        <div className="hidden lg:flex min-h-[300vh] relative">
          
          {/* Scrollable Content (Left) */}
          <div className="w-1/2 flex flex-col">
            {sections.map((section, i) => (
              <div key={section.id} className="h-screen flex flex-col justify-center pr-20">
                <div className="space-y-6">
                  <span className={cn(
                    "text-sm font-black uppercase tracking-widest",
                    section.color === "blue" ? "text-blue-600" : section.color === "indigo" ? "text-indigo-600" : "text-amber-600"
                  )}>
                    {section.tag}
                  </span>
                  <h3 className="text-5xl font-black text-zinc-950 tracking-tight leading-tight">
                    {section.title}
                  </h3>
                  <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                    {section.description}
                  </p>
                  <div className="py-4 space-y-4">
                    {section.features.map(f => (
                      <div key={f} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-zinc-700 font-bold">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Viewport (Right) */}
          <div className="w-1/2 h-screen sticky top-0 flex items-center justify-center py-20">
            <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden group">
              {/* Glassmorphic Ambient Mesh */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/10 pointer-events-none" />
              <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full" />
              <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-indigo-500/10 blur-[100px] rounded-full" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {sections.find(s => s.id === activeId)?.mockup}
                </motion.div>
              </AnimatePresence>

              {/* Status Bar */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-t from-zinc-950 to-transparent">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real GSE Feed Active
                </p>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fallback Layout */}
        <div className="lg:hidden space-y-24 pb-32">
          {sections.map((section) => (
            <div key={section.id} className="space-y-12">
              <div className="space-y-6">
                 <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  section.color === "blue" ? "text-blue-600" : section.color === "indigo" ? "text-indigo-600" : "text-amber-600"
                )}>
                  {section.tag}
                </span>
                <h3 className="text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                  {section.title}
                </h3>
                <p className="text-base text-zinc-500 font-medium leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 pointer-events-none" />
                {section.mockup}
              </div>

              <div className="space-y-4">
                {section.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-zinc-700 font-bold text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Wrap-up CTA (Optional/Transition) */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl pt-20 pb-32 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-zinc-50 p-10 md:p-16 rounded-[3rem] border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-colors group-hover:bg-blue-500/10" />
          
          <div className="relative z-10 max-w-xl">
             <h4 className="text-3xl md:text-4xl font-black text-zinc-950 tracking-tight mb-4">
               Ready to see it in action?
             </h4>
             <p className="text-lg text-zinc-500 font-medium">
               Join 487 Ghanaians who are already building their skills in a risk-free environment.
             </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            className="relative z-10 bg-zinc-950 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-3 shrink-0 whitespace-nowrap"
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default LearningToolsShowcase;
