"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

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
    <section className="relative py-24 md:py-32 bg-slate-50/50 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-600 w-fit text-sm font-semibold mb-6 shadow-sm border border-emerald-200">
          <span>Straightforward Pricing</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight tracking-tight max-w-2xl mx-auto">
          Start Learning for Free. <br />
          <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Forever.</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-16 font-medium">
          No credit card required. No hidden fees. Just powerful tools to help you master the stock market.
        </p>

        {/* Pricing card — Modern Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-8 md:p-12 max-w-lg w-full rounded-[2.5rem] shadow-xl border border-white/80 relative text-left"
        >
          {/* Badge */}
          <div className="absolute -top-4 right-8 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </div>

          <div className="border-b border-slate-100 pb-8 mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Basic Simulator</h3>
            <p className="font-black text-6xl text-foreground tracking-tighter">
              GH₵0<span className="text-xl text-muted-foreground font-medium tracking-normal">/mo</span>
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {included.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-slate-600 font-medium text-[15px]">{item}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-foreground text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 transition-colors text-lg mb-6">
            Get Started Free
          </button>

          {/* Premium teaser */}
          <div className="pt-6 border-t border-slate-100/80 text-center">
            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Coming Soon: Pro</p>
            <p className="text-slate-500 text-sm font-medium">
              Unlimited AI · Advanced analytics
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
