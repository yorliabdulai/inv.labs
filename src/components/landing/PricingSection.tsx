// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No rounded cards
// ✗ No gradient text
// ✗ No glowing / pulsing effects
// ✗ No floating animations

const included = [
  "Unlimited practice trades",
  "All 40+ GSE stocks",
  "All mutual fund types",
  "Portfolio tracking & analytics",
  "Ato AI (20 conversations/day)",
  "Educational content library",
];

const PricingSection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-ink-950">
      <div className="px-6 md:px-12 lg:px-20 max-w-3xl">
        <div className="flex items-baseline gap-4 mb-6 border-b border-border/10 pb-4">
          <p className="section-label font-mono text-ink-muted">Pricing</p>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-paper-text mb-12 leading-tight">
          Start Learning for Free. <span className="text-terracotta">Forever.</span>
        </h2>

        {/* Pricing card — paper style on dark bg */}
        <div className="paper-card p-8 md:p-10 max-w-lg">
          <div className="border-b border-ink/10 pb-4 mb-6">
            <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">Free Forever</span>
            <p className="font-serif text-5xl text-ink mt-2">
              GH₵<span className="font-mono text-terracotta tabular-nums">0</span>
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-terracotta font-mono text-sm">■</span>
                <span className="text-ink/80 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <button className="w-full btn-editorial-fill text-center block">
            Start Investing with GH₵10,000
          </button>

          {/* Premium teaser */}
          <div className="mt-8 pt-5 border-t border-ink/10">
            <p className="text-ink/60 text-xs font-mono uppercase tracking-wider mb-1">Coming Soon: Premium</p>
            <p className="text-ink-muted text-sm">
              From GH₵20/month — Unlimited Ato · Advanced analytics · Priority support
            </p>
          </div>

          <p className="text-ink-muted/50 text-xs mt-6 font-mono">
            No credit card. No hidden fees. Works on any device.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
