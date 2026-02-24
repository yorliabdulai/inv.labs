// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No gradient text
// ✗ No glowing elements
// ✗ No animated row reveals

const features = [
  "Hands-on practice",
  "Ghana Stock Exchange",
  "Ghanaian mutual funds",
  "AI personal guide",
  "Local currency (GH₵)",
  "Realistic fee structure",
  "No bank account needed",
  "Mobile-first PWA",
  "Free to start",
];

const columns = [
  { name: "Workshops", data: [false, false, false, false, true, false, false, false, false] },
  { name: "Foreign Sims", data: [true, false, false, false, false, false, false, true, true] },
  { name: "inv.labs", data: [true, true, true, true, true, true, true, true, true], highlight: true },
];

const ComparisonTable = () => {
  return (
    <section className="relative py-20 md:py-28 bg-paper text-ink">
      <div className="px-6 md:px-12 lg:px-20 max-w-4xl">
        <div className="flex items-baseline gap-4 mb-6 border-b-2 border-ink/10 pb-4">
          <p className="section-label font-mono text-ink-muted">Comparison</p>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-12 leading-tight">
          Nothing Else <span className="text-terracotta">Compares</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-ink/15">
                <th className="text-left p-3 text-ink-muted text-xs uppercase tracking-wider">Feature</th>
                {columns.map((col, i) => (
                  <th key={i} className={`p-3 text-center text-xs uppercase tracking-wider ${
                    col.highlight ? "text-terracotta" : "text-ink-muted"
                  }`}>
                    {col.name}
                    {col.highlight && <div className="h-0.5 bg-terracotta mt-1" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i} className="border-b border-ink/6">
                  <td className="p-3 text-ink/70 text-xs">{feature}</td>
                  {columns.map((col, j) => (
                    <td key={j} className="p-3 text-center">
                      <span className={`text-sm ${
                        col.data[i]
                          ? col.highlight ? "text-terracotta" : "text-ink/40"
                          : "text-ink/10"
                      }`}>
                        {col.data[i] ? "■" : "□"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
