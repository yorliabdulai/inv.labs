// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No gradient text
// ✗ No glowing elements
// ✗ No rounded cards (max 2px)

import { motion } from "framer-motion";

const SolutionSection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-ink-950">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Big reveal — no mask reveal, just strong typography */}
        <div className="max-w-4xl mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-paper-text leading-[1.05]"
          >
            What if you could practice investing
            <br />
            <span className="text-terracotta">without risking a cedi?</span>
          </motion.h2>
        </div>

        {/* Trading ticket — paper card, monospaced, looks like a real brokerage form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="paper-card p-0 overflow-hidden">
            {/* Ticket header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-ink/10 bg-paper-dark">
              <span className="font-mono text-xs text-ink/60 uppercase tracking-wider">Trade Ticket — inv.labs Simulator</span>
              <span className="font-mono text-xs px-2 py-0.5 border border-ink/15 text-ink-muted">[SIM MODE]</span>
            </div>

            {/* Trade details */}
            <div className="px-6 py-5 font-mono text-sm">
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Stock:</span>
                  <span className="text-ink font-medium">MTN GHANA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Order Type:</span>
                  <span className="text-ink">MARKET</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Units:</span>
                  <span className="text-ink tabular-nums">500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Price:</span>
                  <span className="text-ink tabular-nums">GH₵ 1.82</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Value:</span>
                  <span className="text-ink tabular-nums">GH₵ 910.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Balance:</span>
                  <span className="text-ink tabular-nums">GH₵ 10,000.00</span>
                </div>
              </div>

              <div className="border-t border-ink/10 pt-4 mb-4">
                <p className="text-ink-muted text-xs uppercase tracking-wider mb-3">Fee Breakdown</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-ink/60">SEC Levy (0.3%)</span>
                    <span className="text-ink tabular-nums">GH₵ 2.73</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">GSE Transaction</span>
                    <span className="text-ink tabular-nums">GH₵ 1.82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/60">Broker Commission</span>
                    <span className="text-ink tabular-nums">GH₵ 4.55</span>
                  </div>
                  <div className="border-t border-ink/10 mt-2 pt-2 flex justify-between font-medium">
                    <span className="text-ink">Total Cost</span>
                    <span className="text-ink tabular-nums">GH₵ 919.10</span>
                  </div>
                </div>
              </div>

              {/* Execute button */}
              <div className="pt-2">
                <button className="w-full btn-editorial-fill text-center block">
                  Execute Trade
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature strip — not cards, just a ruled list */}
        <div className="mt-16 max-w-2xl">
          {[
            { title: "Real GSE Stocks", desc: "MTN, GCB, Ecobank & more" },
            { title: "All Mutual Fund Types", desc: "Real NAV data" },
            { title: "Ato AI Guide", desc: "Learn as you trade" },
            { title: "Realistic Fee Calc", desc: "SEC/GSE levies simulated" },
          ].map((f, i) => (
            <div key={i} className="flex items-baseline justify-between py-3 border-b border-border/10">
              <span className="text-paper-text font-medium text-sm">{f.title}</span>
              <span className="text-ink-muted text-xs font-mono">{f.desc}</span>
            </div>
          ))}
        </div>

        <p className="text-ink-muted text-base mt-10">
          This is <span className="text-terracotta font-serif italic">inv.labs</span>. Your financial future starts here.
        </p>
      </div>
    </section>
  );
};

export default SolutionSection;
