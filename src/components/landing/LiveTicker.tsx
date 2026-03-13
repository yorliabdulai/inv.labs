"use client";

import { useEffect, useState } from "react";
import { getStocks, Stock } from "@/lib/market-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";

// Fallback data bridging the gap while Live API fetches
const defaultStocks = [
  { name: "MTN Ghana", price: "GH₵1.82", change: "+2.3%", up: true },
  { name: "GCB Bank", price: "GH₵5.10", change: "-0.8%", up: false },
  { name: "Ecobank", price: "GH₵9.44", change: "+1.1%", up: true },
  { name: "CAL Bank", price: "GH₵0.85", change: "+0.6%", up: true },
  { name: "Fan Milk", price: "GH₵3.20", change: "-1.2%", up: false },
  { name: "Tullow Oil", price: "GH₵18.50", change: "+3.4%", up: true },
  { name: "AGA", price: "GH₵35.00", change: "0.0%", up: null },
  { name: "SIC Ins.", price: "GH₵0.08", change: "+5.0%", up: true },
  { name: "Enterprise", price: "GH₵1.95", change: "-0.5%", up: false },
  { name: "Total", price: "GH₵4.15", change: "+1.8%", up: true },
];

const LiveTicker = () => {
  const [marketData, setMarketData] = useState<typeof defaultStocks>(defaultStocks);
  const controls = useAnimationControls();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const stocks: Stock[] = await getStocks();
        if (stocks && stocks.length > 0) {
          const formatted = stocks.slice(0, 15).map(s => {
            const up = s.change > 0 ? true : s.change < 0 ? false : null;
            const sign = s.changePercent > 0 ? "+" : "";
            return {
              name: s.name,
              price: `GH₵${s.price.toFixed(2)}`,
              change: `${sign}${s.changePercent.toFixed(1)}%`,
              up
            };
          });
          setMarketData(formatted);
        }
      } catch (err) {
        console.error("Failed to load GSE stocks for LiveTicker", err);
      }
    }
    fetchMarketData();
  }, []);

  // Framer Motion continuous flawless marquee
  useEffect(() => {
    if (!isHovered) {
      controls.start({
        x: ["0%", "-50%"],
        transition: {
          ease: "linear",
          duration: 40,
          repeat: Infinity,
        }
      });
    } else {
      controls.stop();
    }
  }, [isHovered, controls, marketData]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* Light edge highlight for depth */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/50" />

      <div
        className="flex py-2 items-center will-change-transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={controls}
          className="flex whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {/* Render massive array for infinitely seamless scrolling */}
          {[...marketData, ...marketData, ...marketData, ...marketData].map((stock, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-4 py-1.5 mx-2 rounded-full border border-zinc-200/50 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,1),_0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] cursor-default shrink-0 backdrop-blur-md"
            >
              <span className="text-xs font-black tracking-tighter text-zinc-900 group-hover:text-blue-600 transition-colors">
                {stock.name}
              </span>
              <span className="text-xs font-semibold text-zinc-500 font-mono tracking-tight group-hover:text-zinc-800 transition-colors">
                {stock.price}
              </span>

              {/* Dynamic Badge for Change */}
              <span
                className={`flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black tracking-wide ${stock.up === true
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] group-hover:bg-emerald-500 group-hover:text-white"
                    : stock.up === false
                      ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] group-hover:bg-rose-500 group-hover:text-white"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] group-hover:bg-zinc-700 group-hover:text-white"
                  } transition-colors duration-300`}
              >
                {stock.up === true && <TrendingUp className="w-[14px] h-[14px]" />}
                {stock.up === false && <TrendingDown className="w-[14px] h-[14px]" />}
                {stock.up === null && <Minus className="w-[14px] h-[14px]" />}
                {stock.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LiveTicker;
