"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const included = [
  "GH₵10,000 Virtual Capital",
  "40+ Real GSE Stocks",
  "Mutual Fund Practice",
  "Ato AI Guide",
  "Portfolio Tracking",
  "Learning Dashboard",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-secondary/50 overflow-hidden text-zinc-950">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary w-fit text-sm font-semibold mb-6 shadow-sm border border-primary/20">
          <span>Pricing</span>
        </div>

        <h2 className="text-4xl md:text-[5rem] lg:text-[6rem] font-bold text-zinc-950 mb-6 leading-[0.9] tracking-[-0.04em] max-w-3xl mx-auto text-balance">
          Start Free. <br />
          <span className="text-primary">Stay Free.</span>
        </h2>
        <p className="text-xl text-zinc-500 leading-relaxed max-w-xl mx-auto mb-16 font-medium">
          No hidden fees. No subscription. Just pure learning for the next generation of Ghanaian investors.
        </p>

        {/* Pricing card — Modern Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="bg-white p-10 md:p-14 max-w-xl w-full rounded-[3rem] shadow-[0_20px_100px_-20px_rgba(0,0,0,0.1)] border border-zinc-200 relative text-left group"
        >
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-indigo-600" />

          {/* Badge */}
          <div className="absolute -top-4 right-10 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
            Join 487 Ghanaians
          </div>

          <div className="border-b border-zinc-100 pb-10 mb-10">
            <h3 className="text-2xl font-black text-zinc-950 mb-4 tracking-tight">Free Forever</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-7xl font-black text-zinc-950 tracking-tighter tabular-nums">GH₵ 0</span>
              <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm">/ year</span>
            </div>
          </div>

          <div className="space-y-5 mb-12">
            {included.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-zinc-600 font-semibold text-[15px] tracking-tight">{item}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-black py-6 rounded-2xl shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group">
            <span className="uppercase tracking-widest text-xs">Start Practicing Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Premium teaser */}
          <div className="pt-10 mt-6 border-t border-zinc-100 text-center">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">Coming Soon: Pro Tier</p>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Connect a real broker, advanced analysis tools, and 1-on-1 coaching for <span className="text-zinc-950 font-bold">GH₵20 / month</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
