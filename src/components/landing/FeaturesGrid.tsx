// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No float animations
// ✗ No glowing cards
// ✗ No rounded corners above 2px
// ✗ No gradient text

const features = [
  { title: "Portfolio Tracking", desc: "Real-time analytics on your virtual positions. Watch what works.", span: "col-span-1 md:col-span-2" },
  { title: "40+ GSE Stocks", desc: "Every listed company. Live prices. Zero risk." },
  { title: "Mutual Funds", desc: "Filter by risk level, fund type, and historical returns." },
  { title: "Ato AI Guide", desc: "GPT-4 powered. Explains investing in plain language.", span: "col-span-1 md:col-span-2" },
  { title: "Realistic Fees", desc: "SEC & GSE levies simulated exactly." },
  { title: "Leaderboard", desc: "Compete with other learners across Ghana." },
  { title: "Works Offline", desc: "PWA — no stable internet needed." },
  { title: "Secure Practice", desc: "Zero real money at risk. Ever." },
];

const FeaturesGrid = () => {
  return (
    <section className="relative py-20 md:py-28 bg-ink-950">
      <div className="px-6 md:px-12 lg:px-20 max-w-5xl">
        <div className="flex items-baseline gap-4 mb-6 border-b border-border/10 pb-4">
          <p className="section-label font-mono text-ink-muted">Features</p>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-paper-text mb-12 leading-tight">
          <span className="text-white-900">Everything You Need </span> <span className="text-terracotta">to Start</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border/10">
          {features.map((item, i) => (
            <div
              key={i}
              className={`${item.span || 'col-span-1'} bg-ink-900 p-6 hover:bg-ink-800 transition-colors duration-200`}
            >
              <h3 className="text-paper-text font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-ink-muted text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
