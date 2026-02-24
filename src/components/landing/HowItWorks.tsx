// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No rounded cards
// ✗ No glowing elements
// ✗ No gradient text
// ✗ No pulse animations

const steps = [
  { num: "01", title: "Sign Up in 30 Seconds", desc: "No bank account needed." },
  { num: "02", title: "Get GH₵10,000 Virtual Cash", desc: "Start immediately." },
  { num: "03", title: "Trade Stocks & Mutual Funds", desc: "Real companies, real prices." },
  { num: "04", title: "Learn with Ato AI", desc: "Ask anything, get guidance." },
  { num: "05", title: "Invest for Real When Ready", desc: "Connect to licensed brokers." },
];

const HowItWorks = () => {
  return (
    <section className="relative py-20 md:py-28 bg-paper text-ink">
      <div className="px-6 md:px-12 lg:px-20 max-w-4xl">
        <div className="flex items-baseline gap-4 mb-6 border-b-2 border-ink/10 pb-4">
          <p className="section-label font-mono text-ink-muted">How It Works</p>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-14 leading-tight">
          From Zero to <span className="text-terracotta">Investor</span>
        </h2>

        {/* Steps — editorial numbered list with ruled dividers */}
        <div>
          {steps.map((step, i) => (
            <div key={i} className="grid grid-cols-[60px_1fr] gap-6 py-5 border-t border-ink/8 items-baseline">
              <span className="font-mono text-3xl text-terracotta/40 font-medium tabular-nums">
                {step.num}
              </span>
              <div>
                <h3 className="text-ink font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-ink-muted text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Path to reality */}
        <div className="mt-12 pt-6 border-t-2 border-ink/10">
          <div className="flex items-center gap-3 font-mono text-xs text-ink-muted uppercase tracking-wider">
            <span className="px-3 py-1.5 border border-ink/15">Simulation</span>
            <span>→</span>
            <span className="px-3 py-1.5 border border-ink/15">Confidence</span>
            <span>→</span>
            <span className="px-3 py-1.5 border border-terracotta text-terracotta">Licensed Broker</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
