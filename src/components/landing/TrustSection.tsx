"use client";

import { motion } from "framer-motion";

const metrics = [
  { label: "Simulated Volume", value: "GH₵42M+" },
  { label: "Active Portfolios", value: "12,500+" },
  { label: "GSE Equities", value: "100%" },
  { label: "Average Retention", value: "89%" },
];

const TrustSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-zinc-950 text-white overflow-hidden">
      {/* Abstract dark gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Light border top for separation */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold text-white leading-[0.85] tracking-[-0.04em] mb-8 text-balance">
              Trusted by the next generation of <br className="hidden break-words md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-300">African investors.</span>
            </h2>
            <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-8">
              We're building the infrastructure for financial literacy in Ghana. The numbers speak for themselves.
            </p>
            <div className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer">
              Read the KPMG 2025 Report
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="grid grid-cols-2 gap-px bg-zinc-800/50 rounded-[2rem] overflow-hidden border border-zinc-800 backdrop-blur-sm"
          >
            {metrics.map((m, i) => (
              <div key={i} className="bg-zinc-950 p-6 sm:p-8 md:p-12 hover:bg-zinc-900/80 transition-colors duration-500 group overflow-hidden max-w-full">
                <p className="text-4xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-zinc-500 transition-all text-balance break-words">{m.value}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">{m.label}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
