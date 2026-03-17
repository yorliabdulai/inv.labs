"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, BarChart3, TrendingUp, Activity, PieChart, Lock } from "lucide-react";
import { getStocks, Stock } from "@/lib/market-data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const defaultStocks = [
  { name: "MTN GHANA", price: "1.82", change: "+2.3%", up: true },
  { name: "GCB BANK", price: "5.10", change: "-0.8%", up: false },
  { name: "ECOBANK", price: "9.44", change: "+1.1%", up: true },
];

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [marketData, setMarketData] = useState<{ name: string, price: string, change: string, up: boolean | null }[]>(defaultStocks);

  // Scroll-linked animations for the ultimate premium feel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // The text group fades and moves up slightly
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // The product visual scales slightly, rotates in 3D, and gains opacity depth
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const visualRotateX = useTransform(scrollYProgress, [0, 1], [0, 5]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const stocks: Stock[] = await getStocks();
        if (stocks && stocks.length > 0) {
          const formatted = stocks.slice(0, 3).map(s => {
            const up = s.change > 0 ? true : s.change < 0 ? false : null;
            const sign = s.changePercent > 0 ? "+" : "";
            return {
              name: s.name.toUpperCase(),
              price: s.price.toFixed(2),
              change: `${sign}${s.changePercent.toFixed(1)}%`,
              up
            };
          });
          setMarketData(formatted);
        }
      } catch (err) {
        console.error("Failed to load GSE stocks for Hero", err);
      }
    }
    fetchMarketData();
  }, []);

  return (
    <section ref={containerRef} className="relative pt-40 pb-32 flex flex-col items-center justify-start min-h-[140vh] overflow-x-hidden">

      {/* Dynamic Grid & Ambient Light */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_30%,transparent_100%)] pointer-events-none -z-10" />
      <div className="absolute top-[-10%] left-[10%] w-[60%] h-[50%] bg-blue-200/40 dark:bg-blue-500/10 rounded-[100%] blur-[160px] opacity-80 pointer-events-none mix-blend-multiply dark:mix-blend-lighten -z-10" />
      <div className="absolute top-[20%] right-[-5%] w-[45%] h-[45%] bg-indigo-200/40 dark:bg-indigo-500/15 rounded-[100%] blur-[160px] opacity-80 pointer-events-none mix-blend-multiply dark:mix-blend-lighten -z-10" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl w-full">

        {/* TEXT LAYER */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="flex flex-col items-center text-center relative z-20 mb-24"
        >
          <motion.div
            initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col items-center max-w-5xl"
          >
            {/* Refined Clamped Typography: Stable Scale */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tight text-foreground leading-[0.85] text-balance mb-10 w-full overflow-hidden break-words">
              Learn to Invest<br />
              <span className="relative inline-block pb-4">
                <span className="absolute inset-x-0 bottom-4 h-[30%] bg-blue-200/40 dark:bg-primary/20 -rotate-2 -z-10" />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-deep via-primary to-primary-light">
                  Without Losing Money.
                </span>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-500 dark:text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto mb-12 text-balance">
              Practice trading real Ghana Stock Exchange stocks with virtual money. Build confidence. Then invest for real.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/register" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-sm font-bold text-white bg-zinc-950 rounded-full transition-all shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 overflow-hidden w-full sm:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                  <span className="relative z-10 uppercase tracking-wider text-xs">Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </Link>
                <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-sm font-bold bg-white dark:bg-zinc-900 border border-border rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto antialiased">

                  {/* Play Icon Container - Force high contrast */}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                    <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                  </div>

                  {/* Text - Fixed visibility and eliminated blur */}
                  <span className="uppercase tracking-widest text-[10px] text-slate-900 dark:text-zinc-100 opacity-100 transition-none">
                    Watch How It Works
                  </span>
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-2 text-zinc-400 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-widest">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                    </div>
                  ))}
                </div>
                <span>Join 487 Ghanaians already learning • 100% Free to start</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* SIGNATURE VISUAL CENTERPIECE: The Scroll-Linked Mock Dashboard */}
        <motion.div
          style={{ scale: visualScale, y: visualY, rotateX: visualRotateX }}
          className="w-full relative z-10 transform-origin-top max-w-[85rem] mx-auto"
        >
          {/* Intense core glow under the dashboard */}
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-blue-500/15 blur-[120px] rounded-[100%] pointer-events-none" />

          {/* The Dashboard Frame */}
          <div className="relative rounded-3xl border border-border bg-card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-4 md:p-6 overflow-hidden ring-1 ring-inset ring-border/20 backdrop-blur-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-3xl" />

            {/* Fake macOS Chrome */}
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-sm"></div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Secure Terminal</span>
                <span className="hidden sm:inline-block font-sans">inv.labs / system_kernel</span>
              </div>
            </div>

            {/* Inside the Mockup: Complex Asymmetric Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6 h-[600px]">

              {/* Left Nav Pane */}
              <div className="hidden lg:flex flex-col gap-4">
                <div className="bg-secondary/50 rounded-2xl p-6 border border-border h-full flex flex-col shadow-sm">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-premium">
                        <span className="text-background font-bold text-sm tracking-tighter">iL</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {['Dashboard', 'Market Scanner', 'Portfolio', 'Mutual Funds', 'Settings'].map((item, i) => (
                        <div key={i} className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${i === 0 ? 'bg-card text-foreground shadow-premium border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                          {i === 0 ? <Activity className="w-4 h-4 text-primary" /> : <PieChart className="w-4 h-4 opacity-50" />}
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto bg-card rounded-xl p-5 border border-border shadow-sm">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Protocol Health</p>
                    <p className="text-[10px] font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Live connection
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Main Data Pane */}
              <div className="flex flex-col gap-6 h-full">

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-6 h-36">
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-premium flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">Institutional Equity</p>
                    <h3 className="text-4xl font-bold tracking-tight text-foreground relative z-10 tabular-nums font-syne">12,450.00</h3>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-premium flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">Delta Variance</p>
                    <div className="flex flex-col relative z-10">
                      <h3 className="text-4xl font-bold tracking-tight text-emerald-600 tabular-nums font-syne">+342.50</h3>
                      <div className="inline-flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                          +2.8% Yield
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Curve Analytics */}
                <div className="bg-card rounded-2xl border border-border p-8 shadow-premium flex-1 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="flex gap-4 p-1 bg-secondary rounded-xl border border-border">
                      {['1D', '1W', '1M', 'YTD'].map((p, i) => (
                        <span key={p} className={`text-[9px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>{p}</span>
                      ))}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projection Series // GSE.MTN</div>
                  </div>

                  {/* Complex SVG Curve */}
                  <div className="absolute inset-x-0 bottom-0 h-[65%]">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-10 opacity-30">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-px bg-border" />
                      ))}
                    </div>
                    {/* Graph Path */}
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="heroChartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 C10,70 20,85 30,60 C40,35 50,55 60,30 C70,5 80,45 90,20 C95,10 100,10 100,10 L100,100 L0,100 Z"
                        fill="url(#heroChartGradient)"
                      />
                      <path
                        d="M0,80 C10,70 20,85 30,60 C40,35 50,55 60,30 C70,5 80,45 90,20 C95,10 100,10 100,10"
                        fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"
                        className="drop-shadow-[0_8px_16px_rgba(37,99,235,0.2)]"
                      />
                      <circle cx="100" cy="10" r="4" className="fill-primary drop-shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Context Pane */}
              <div className="hidden md:flex flex-col gap-6 h-full">

                {/* Simulated Order Ticket */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-white h-[65%] flex flex-col relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8 border-b border-zinc-800 pb-5">Rapid Execution</p>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Ticker</span>
                    <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                      MTNGH <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold">1.82</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-auto">
                    <button className="bg-primary text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-deep transition-all shadow-xl shadow-blue-500/20 active:scale-95">Buy</button>
                    <button className="bg-white/5 text-white py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">Sell</button>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Est. Ledger Cost</p>
                      <p className="text-lg font-bold text-white tabular-nums font-syne tracking-tight">GH₵ 18,200.00</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* GSE Movers */}
                <div className="bg-card rounded-2xl border border-border p-6 h-[35%] flex flex-col shadow-premium">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Volume Leaders</p>
                  <div className="space-y-5 overflow-hidden">
                    {marketData.map((s, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-[9px] text-foreground border border-border shadow-sm">
                            {s.name.substring(0, 2)}
                          </div>
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{s.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-foreground font-bold text-xs tabular-nums">{s.price}</span>
                          <span className={`text-[9px] font-bold ${s.up === true ? "text-emerald-600" : s.up === false ? "text-red-600" : "text-muted-foreground"}`}>{s.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
