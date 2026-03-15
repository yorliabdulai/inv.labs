"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const SolutionSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="mb-20 max-w-4xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-primary w-fit text-sm font-semibold mb-6"
          >
            <span>What If There Was a Better Way?</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold text-zinc-950 leading-[0.9] tracking-[-0.04em] text-balance mb-8 break-words"
          >
            Practice First. Build Confidence. <br />
            <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Invest When Ready.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-center">

          {/* Left: Interactive Trade Ticket (The Simulator) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative w-full max-w-md mx-auto lg:mx-0 group perspective-1000"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] blur-2xl transition-all duration-500 group-hover:bg-blue-500/20" />

            <div className="relative bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-zinc-900/5 rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:ring-zinc-900/10">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-deep via-primary to-primary-light" />

              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-700">MTN</div>
                  <div>
                    <h4 className="font-bold text-zinc-900 leading-none">Scancom PLC</h4>
                    <span className="text-xs text-zinc-500 font-medium tracking-wide">MTNGH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-950 text-xl tracking-tighter leading-none">GH₵ 1.82</p>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mt-1 block">Gain: 2.3%</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-500">Virtual Capital</span>
                  <span className="font-bold text-zinc-900">GH₵ 10,000.00</span>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-500">Practice Quantity</span>
                  <span className="font-bold text-zinc-900 text-lg">5,000</span>
                </div>
              </div>

              <div className="px-4 py-5 bg-zinc-900 rounded-xl text-white shadow-inner mb-6 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400 font-medium tracking-tight">Simulator Cost</span>
                  <span className="font-bold tabular-nums">GH₵ 9,100.00</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-500 font-medium border-t border-zinc-800/50 pt-3">
                  <span>Realistic Fee Est. (GH₵ 40.95)</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              <button className="w-full bg-primary-deep hover:bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                Submit Practice Trade
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right: Feature Narrative (The "Flight Simulator" Pitch) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-col gap-10"
          >
            <div className="space-y-6">
              <p className="text-2xl text-zinc-950 font-bold leading-tight">
                inv.labs is like a <span className="text-primary">flight simulator</span>. <br />
                But for investing.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, title: "No risk. Just learning.", text: "You get GH₵10,000 in virtual money to trade real Ghana Stock Exchange stocks and learn how mutual funds work." },
                  { icon: ShieldCheck, title: "Mistakes without consequences.", text: "Bought a stock and it crashed? Learn why. Panic sold at the wrong time? Now you know. It costs you nothing." },
                  { icon: CheckCircle2, title: "When you're confident? Invest.", text: "After weeks of practice, you'll know how to pick stocks, diversify, and manage fees. That's when you invest for real." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-zinc-950 mb-1 tracking-tight">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed font-medium tracking-tight text-base">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-white bg-zinc-950 rounded-full transition-all shadow-xl hover:-translate-y-1 w-full sm:w-fit">
              <span>Try It Free - No Card Required</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
