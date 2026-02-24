// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No counting animations — static display
// ✗ No gradient text on headlines
// ✗ No rounded cards

const stats = [
  { value: "68%", bar: 68, label: "of Ghanaians cannot explain how a stock works." },
  { value: "43%", bar: 43, label: "of Gen Z Ghanaians have never invested a single cedi." },
  { value: "1%", bar: 1, label: "of Ghanaians participate in the stock market." },
];

const ProblemSection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-paper text-ink">
      <div className="px-6 md:px-12 lg:px-20 max-w-5xl">
        {/* Section header — editorial newspaper style */}
        <div className="flex items-baseline gap-4 mb-12 border-b-2 border-ink/10 pb-4">
          <p className="section-label font-mono text-ink-muted">The Gap</p>
          <span className="text-ink-muted text-xs font-mono ml-auto">2025</span>
        </div>

        {/* Stats — newspaper data display, no animation */}
        <div className="space-y-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
              <div>
                <span className="font-mono text-5xl md:text-6xl font-medium text-terracotta leading-none">
                  {stat.value}
                </span>
              </div>
              <div>
                <p className="text-ink/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {stat.label}
                </p>
                {/* ASCII-style bar */}
                <div className="mt-3 flex items-center gap-2 font-mono text-xs text-ink-muted">
                  <div className="flex">
                    {Array.from({ length: 16 }, (_, j) => (
                      <span key={j} className={j < Math.round(stat.bar / 6.25) ? "text-terracotta" : "text-ink/10"}>
                        █
                      </span>
                    ))}
                  </div>
                  <span>{stat.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="editorial-rule mb-8" />

        {/* Body — left-aligned, never centered */}
        <p className="text-ink/70 text-base leading-relaxed max-w-lg mb-4">
          It's not that Ghanaians don't want to invest.
          It's that the only way to learn is by <span className="text-terracotta font-semibold">risking money they can't afford to lose.</span>
        </p>
        <p className="text-ink-muted text-sm italic max-w-lg mb-6">
          Workshops teach theory. Reality demands practice.
        </p>
        <p className="text-ink-muted/60 text-xs font-mono">
          [KPMG 2025 · Afrobarometer · Standard & Poor's]
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
