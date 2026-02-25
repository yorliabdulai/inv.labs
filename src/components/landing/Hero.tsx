// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No border-radius above 4px
// ✗ No box-shadow with color
// ✗ No gradient text on headlines
// ✗ No centered layout containers
// ✗ No floating animations

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStocks, Stock } from "@/lib/market-data";

const defaultStocks = [
  { name: "MTN Ghana", price: "1.82", change: "+2.3%", up: true },
  { name: "GCB Bank", price: "5.10", change: "-0.8%", up: false },
  { name: "Ecobank", price: "9.44", change: "+1.1%", up: true },
  { name: "CAL Bank", price: "0.85", change: "+0.6%", up: true },
  { name: "Tullow Oil", price: "18.50", change: "+3.4%", up: true },
  { name: "Fan Milk", price: "3.20", change: "-1.2%", up: false },
  { name: "Enterprise", price: "1.95", change: "-0.5%", up: false },
  { name: "AGA", price: "35.00", change: "0.0%", up: null },
];

const Hero = () => {
  const [marketData, setMarketData] = useState<typeof defaultStocks>(defaultStocks);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const stocks: Stock[] = await getStocks();
        if (stocks && stocks.length > 0) {
          const formatted = stocks.slice(0, 8).map(s => {
            const up = s.change > 0 ? true : s.change < 0 ? false : null;
            const sign = s.changePercent > 0 ? "+" : "";
            return {
              name: s.name,
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
    <section className="relative min-h-screen flex items-end pb-16 md:pb-24 pt-20 overflow-hidden bg-ink-950">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6">
          {/* Left strip — 60% */}
          <div className="lg:col-span-3 relative">
            {/* Animation ① — The Unlock: terracotta rule extends on load */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
              className="origin-left mb-8"
            >
              <div className="editorial-rule-strong" />
            </motion.div>

            {/* Section label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              className="section-label mb-6 font-mono"
            >
              ACCRA · GSE · SINCE 2025
            </motion.p>

            {/* Headline — falls into place after the line completes */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-bold text-paper-text leading-[0.9] tracking-tight"
            >
              <span className="block overflow-hidden">
                Practice the
              </span>
              <span className="block overflow-hidden">
                Market.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-terracotta leading-[0.95] mt-2"
            >
              Without Losing a Cedi.
            </motion.p>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.5 }}
              className="text-ink-muted text-base md:text-lg max-w-md mt-8 leading-relaxed"
            >
              Ghana's first AI-powered investment simulator.
              Learn to trade GSE stocks and mutual funds with virtual money
              before risking a single cedi.
            </motion.p>

            {/* CTA — hard edge, no rounding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4"
            >
              <Link href="/register">
                <button className="btn-editorial-fill">
                  Start with GH₵10,000 Virtual Capital
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-editorial">
                  Sign In
                </button>
              </Link>
              <div className="flex items-center gap-4">
                <button className="btn-editorial bg-transparent border-transparent hover:bg-ink-900 text-paper-text/60 hover:text-paper-text transition-colors">
                  Watch 60s Demo
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right strip — 40% — vertical ticker + data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.6 }}
            className="lg:col-span-2 mt-12 lg:mt-0 border-l border-rule lg:pl-6"
          >
            {/* Vertical ticker snippet */}
            <div className="space-y-0 min-h-[300px]">
              {marketData.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/10 font-mono text-sm">
                  <span className="text-paper-text/60 truncate max-w-[130px]" title={s.name}>{s.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-paper-text/80 tabular-nums">GH₵{s.price}</span>
                    <span className={`tabular-nums ${s.up === true ? "text-emerald-gain" :
                      s.up === false ? "text-loss-red" :
                        "text-ink-muted"
                      }`}>
                      {s.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom-right anchor */}
            <div className="mt-auto pt-8">
              <p className="font-mono text-gold-data text-2xl tabular-nums">GH₵10,000</p>
              <p className="text-ink-muted text-xs mt-1">to start practicing</p>
            </div>
          </motion.div>
        </div>

        {/* Social proof — bottom left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.4 }}
          className="mt-12 flex items-center gap-3"
        >
          <span className="text-ink-muted text-sm">
            Join <span className="text-terracotta font-semibold">400+</span> Ghanaians already learning
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
