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
      <div className="absolute top-[-10%] left-[10%] w-[60%] h-[50%] bg-blue-200/40 rounded-[100%] blur-[160px] opacity-80 pointer-events-none mix-blend-multiply -z-10" />
      <div className="absolute top-[20%] right-[-5%] w-[45%] h-[45%] bg-indigo-200/40 rounded-[100%] blur-[160px] opacity-80 pointer-events-none mix-blend-multiply -z-10" />

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
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200/50 shadow-sm text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Ghana Stock Exchange Protocol
            </motion.div>

            {/* V4 Clamped Typography: Stable Scale */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold tracking-tight text-zinc-950 leading-[0.9] text-balance mb-10 w-full overflow-hidden">
              Trade without<br />
              <span className="relative inline-block pb-4">
                <span className="absolute inset-x-0 bottom-4 h-[30%] bg-blue-200/50 -rotate-2 -z-10" />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-500">consequence.</span>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto mb-12 text-balance">
              An institutional-grade sandboxed environment. Deploy GH₵10,000 in virtual capital into live GSE equities and master the market mechanics.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-sm font-bold text-white bg-zinc-950 rounded-full transition-all shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 overflow-hidden w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                <span className="relative z-10 uppercase tracking-wider text-xs">Initialize Portfolio</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-sm font-bold text-zinc-900 bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-full hover:bg-white transition-all shadow-sm hover:shadow-lg w-full sm:w-auto">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </div>
                <span className="uppercase tracking-wider text-xs">View Mechanics</span>
              </button>
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
          <div className="relative rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-4 md:p-6 overflow-hidden ring-1 ring-inset ring-white/50 backdrop-saturate-150">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent pointer-events-none rounded-[2.5rem]" />

            {/* Fake macOS Chrome */}
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner"></div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted Session</span>
                <span className="hidden sm:inline-block">inv.labs / terminal</span>
              </div>
            </div>

            {/* Inside the Mockup: Complex Asymmetric Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_320px] gap-6 h-[600px]">

              {/* Left Nav Pane (Hidden on smaller screens, giving it an app feel) */}
              <div className="hidden lg:flex flex-col gap-4">
                <div className="bg-white/80 rounded-2xl p-5 border border-zinc-100 shadow-sm backdrop-blur-sm h-full flex flex-col">
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Command Center</p>
                    <div className="space-y-2">
                      {['Portfolio', 'Market Scanner', 'Ato AI', 'Ledger', 'Settings'].map((item, i) => (
                        <div key={i} className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${i === 0 ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
                          {i === 0 ? <PieChart className="w-4 h-4" /> : <Activity className="w-4 h-4 opacity-50" />}
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">System Status</p>
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Live connection
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Main Data Pane */}
              <div className="flex flex-col gap-6 h-full">

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-6 h-32">
                  <div className="bg-white/90 rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PieChart className="w-16 h-16 text-zinc-900" /></div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest relative z-10">Net Liquidation</p>
                    <h3 className="text-3xl font-bold tracking-tighter text-zinc-900 relative z-10">GH₵ 12,450.00</h3>
                  </div>
                  <div className="bg-blue-600 rounded-2xl border border-blue-500 p-6 shadow-xl shadow-blue-600/20 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-white/20 to-transparent rotate-12 blur-2xl pointer-events-none" />
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest relative z-10">Daily P&L</p>
                    <div className="flex items-center gap-3 relative z-10">
                      <h3 className="text-3xl font-bold tracking-tighter text-white">+GH₵ 342.50</h3>
                      <div className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm text-xs font-black flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 2.8%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Infinite Chart Zone */}
                <div className="bg-white/80 rounded-2xl border border-zinc-100 p-6 shadow-sm flex-1 flex flex-col relative overflow-hidden backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                      <span className="text-xs font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1">1D</span>
                      <span className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors pb-1 cursor-pointer">1W</span>
                      <span className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors pb-1 cursor-pointer">1M</span>
                      <span className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors pb-1 cursor-pointer">YTD</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> GSE Market Open
                    </div>
                  </div>

                  {/* Complex CSS Graph Drawing */}
                  <div className="absolute inset-x-0 bottom-0 h-[70%]">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-px bg-zinc-100" />
                      ))}
                    </div>
                    {/* Graph Path */}
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="heroChartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 C10,70 20,85 30,60 C40,35 50,55 60,30 C70,5 80,45 90,20 C95,10 100,10 100,10 L100,100 L0,100 Z"
                        fill="url(#heroChartGradient)"
                      />
                      <path
                        d="M0,80 C10,70 20,85 30,60 C40,35 50,55 60,30 C70,5 80,45 90,20 C95,10 100,10 100,10"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="text-blue-600 drop-shadow-[0_8px_12px_rgba(37,99,235,0.4)]"
                      />
                      <circle cx="100" cy="10" r="4" className="fill-blue-600 animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Context Pane */}
              <div className="hidden md:flex flex-col gap-6 h-full">

                {/* Simulated Order Ticket */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-6 shadow-xl text-white h-[60%] flex flex-col relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Rapid Execution</p>

                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 mb-4 flex justify-between items-center cursor-pointer hover:bg-zinc-800 transition-colors">
                    <span className="text-xs font-bold text-zinc-400">Ticker</span>
                    <span className="text-sm font-black tracking-wider text-white flex items-center gap-2">MTNGH <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded">1.82</span></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-auto">
                    <button className="bg-white text-zinc-900 py-3 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">Buy</button>
                    <button className="bg-zinc-900 text-white py-3 rounded-xl border border-zinc-800 text-xs font-black tracking-widest uppercase hover:bg-zinc-800 transition-colors">Sell</button>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Est. Cost</p>
                      <p className="text-sm font-black text-white">GH₵ 18,200.00</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] cursor-pointer hover:bg-blue-500 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Top Movers Snippet */}
                <div className="bg-white/90 rounded-2xl border border-zinc-100 p-5 shadow-sm backdrop-blur-md h-[40%] flex flex-col">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Volume Leaders</p>
                  <div className="space-y-4 overflow-hidden">
                    {marketData.map((s, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center font-bold text-[8px] text-zinc-500 border border-zinc-200">
                            {s.name.substring(0, 2)}
                          </div>
                          <span className="font-bold text-zinc-900 text-xs tracking-tight">{s.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-900 font-bold text-xs">{s.price}</span>
                          <span className={`text-[9px] font-black tracking-wider ${s.up === true ? "text-emerald-500" : s.up === false ? "text-red-500" : "text-zinc-400"}`}>{s.change}</span>
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
