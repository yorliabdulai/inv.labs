// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No border-radius above 4px
// ✗ No box-shadow with color
// ✗ No gradient text on headlines
// ✗ No backdrop-filter blur on more than ONE element per page

import { useEffect, useState } from "react";
import { getStocks, Stock } from "@/lib/market-data";

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-ink-950/95 border-b border-border/20">
      <div className="overflow-hidden h-9 flex items-center">
        <div className="ticker-scroll flex whitespace-nowrap">
          {[...marketData, ...marketData, ...marketData].map((stock, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-5 text-xs font-mono">
              <span className="text-paper-text/50">{stock.name}</span>
              <span className="text-paper-text/80">{stock.price}</span>
              <span className={
                stock.up === true ? "text-emerald-gain" :
                  stock.up === false ? "text-loss-red" :
                    "text-ink-muted"
              }>
                {stock.change}
              </span>
              <span className="text-border/30 mx-1">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
