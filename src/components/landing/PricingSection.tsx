"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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
    <section id="pricing" className="relative py-24 md:py-32 bg-secondary/50 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary w-fit text-sm font-semibold mb-6 shadow-sm border border-primary/20">
          <span>Pricing</span>
        </div>

        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.85] tracking-[-0.04em] mb-10 text-balance">
          Start Free. <br />
          <span className="text-primary">Stay Free.</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-md mx-auto mb-16">
          No hidden fees. No subscription. Just pure learning for the next generation of Ghanaian investors.
        </p>

        {/* Pricing card — Modern Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="bg-card p-10 md:p-14 max-w-xl w-full rounded-[3rem] shadow-[0_20px_100px_-20px_rgba(0,0,0,0.1)] border border-border relative text-left group"
        >
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-deep via-primary to-primary-light" />

          {/* Badge */}
          <div className="absolute -top-4 right-10 bg-foreground text-background text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Join 487 Ghanaians
          </div>

          <div className="border-b border-border pb-10 mb-10">
            <h3 className="text-2xl font-black text-foreground uppercase tracking-widest mb-2">The Lifetime Plan</h3>
            <p className="text-muted-foreground font-medium">Master the market at your own pace.</p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-6xl md:text-7xl font-black text-foreground tracking-tighter tabular-nums">GH₵ 0</span>
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-sm">/ year</span>
            </div>
          </div>

          <div className="space-y-5 mb-12">
            {[
              "Real-time GSE simulation",
              "Ato AI Financial Guide",
              "Unlimited Virtual Cash",
              "Dividend & Bonus simulations",
              "Broker Fee transparency",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-foreground font-bold">{item}</span>
              </div>
            ))}
          </div>

          <Link 
            href="/register"
            className="w-full bg-foreground hover:bg-foreground/90 text-background font-black py-6 rounded-2xl shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
          >
            <span className="uppercase tracking-widest text-xs">Start Practicing Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link href="/waitlist" className="w-full mt-4 bg-muted/50 hover:bg-muted text-foreground font-bold py-4 rounded-2xl border border-border transition-all flex items-center justify-center gap-3 group text-[10px] uppercase tracking-widest">
            <span>Join Beta Waitlist</span>
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </Link>

          {/* Premium teaser */}
          <div className="pt-10 mt-6 border-t border-border/50 text-center">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">Coming Soon: Pro Tier</p>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Connect a real broker, advanced analysis tools, and 1-on-1 coaching for <span className="text-foreground font-bold">GH₵20 / month</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
