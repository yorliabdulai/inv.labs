"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const SolutionSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="mb-20 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-bold text-zinc-950 leading-[0.85] tracking-[-0.04em] text-balance mb-8"
          >
            Practice investing without <br />
            <span className="text-zinc-400">risking your capital.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl"
          >
            We recreate the Ghana Stock Exchange environment down to the exact SEC levies. If it happens in the real market, it happens here.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-center">

          {/* Left: Interactive/Layered Trade Ticket */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative w-full max-w-md mx-auto lg:mx-0 group perspective-1000"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] blur-2xl transition-all duration-500 group-hover:bg-blue-500/20" />

            <div className="relative bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-zinc-900/5 rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:ring-zinc-900/10">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

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
                  <span className="text-sm font-semibold text-zinc-500">Action</span>
                  <div className="flex gap-2 bg-zinc-200/50 p-1 rounded-lg">
                    <span className="text-xs font-bold bg-white text-zinc-900 px-4 py-1.5 rounded-md shadow-sm">BUY</span>
                    <span className="text-xs font-bold text-zinc-500 px-4 py-1.5 rounded-md">SELL</span>
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-500">Quantity</span>
                  <span className="font-bold text-zinc-900 text-lg">5,000</span>
                </div>
              </div>

              <div className="px-4 py-5 bg-zinc-900 rounded-xl text-white shadow-inner mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400 font-medium">Estimated Cost</span>
                  <span className="font-bold">GH₵ 9,100.00</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-500 font-medium border-t border-zinc-800 pt-3">
                  <span>Includes SEC/GSE Fees (GH₵ 40.95)</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                Submit Virtual Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Right: Feature Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex flex-col gap-12"
          >
            {[
              { icon: Zap, title: "Instant Execution", text: "Trades are executed using real-time market constraints, helping you understand liquidity and spread impact." },
              { icon: ShieldCheck, title: "Risk-Free Mechanics", text: "Experience the psychological aspects of seeing your portfolio swing, without the actual financial anxiety." },
              { icon: CheckCircle2, title: "Accurate Deductions", text: "We explicitly calculate the 0.3% SEC levy, GSE transaction fees, and standard broker charges on every trade." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                  <item.icon className="w-5 h-5 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-950 mb-3 tracking-[-0.03em]">{item.title}</h3>
                  <p className="text-zinc-500 leading-relaxed font-medium tracking-tight text-lg">{item.text}</p>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
