"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "68%", label: "of Ghanaians cannot explain how a stock works." },
  { value: "43%", label: "of Gen Z Ghanaians have never invested a single cedi." },
  { value: "1%", label: "of Ghanaians participate in the stock exchange." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

const ProblemSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600 w-fit text-sm font-semibold mb-6">
              <span>The Financial Gap</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight tracking-tight">
              Learning by losing money <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">is broken.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mb-8 font-medium">
              It's not that Ghanaians don't want to invest. It's that the only way to learn is by risking money they can't afford to lose. Workshops teach theory, but reality demands practice.
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Source: KPMG 2025 · Afrobarometer
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-border/50 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 md:gap-8 group cursor-default"
              >
                <div className="w-28 shrink-0 border-r border-border/50 pr-6 group-hover:border-primary/30 transition-colors">
                  <span className="text-5xl md:text-6xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{stat.value}</span>
                </div>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
