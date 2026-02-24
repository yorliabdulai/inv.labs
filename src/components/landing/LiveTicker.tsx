// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No border-radius above 4px
// ✗ No box-shadow with color
// ✗ No gradient text on headlines
// ✗ No backdrop-filter blur on more than ONE element per page

const stocks = [
  { name: "MTN Ghana", price: "GH₵1.82", change: "+2.3%", up: true, speed: 1.2 },
  { name: "GCB Bank", price: "GH₵5.10", change: "-0.8%", up: false, speed: 0.8 },
  { name: "Ecobank", price: "GH₵9.44", change: "+1.1%", up: true, speed: 1.0 },
  { name: "CAL Bank", price: "GH₵0.85", change: "+0.6%", up: true, speed: 0.7 },
  { name: "Fan Milk", price: "GH₵3.20", change: "-1.2%", up: false, speed: 0.9 },
  { name: "Tullow Oil", price: "GH₵18.50", change: "+3.4%", up: true, speed: 1.3 },
  { name: "AGA", price: "GH₵35.00", change: "0.0%", up: null, speed: 0.5 },
  { name: "SIC Ins.", price: "GH₵0.08", change: "+5.0%", up: true, speed: 1.4 },
  { name: "Enterprise", price: "GH₵1.95", change: "-0.5%", up: false, speed: 0.6 },
  { name: "Total", price: "GH₵4.15", change: "+1.8%", up: true, speed: 1.1 },
];

const LiveTicker = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-ink-950/95 border-b border-border/20">
      <div className="overflow-hidden h-9 flex items-center">
        <div className="ticker-scroll flex whitespace-nowrap">
          {[...stocks, ...stocks].map((stock, i) => (
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
