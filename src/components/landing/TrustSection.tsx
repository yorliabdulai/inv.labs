"use client";

import { motion } from "framer-motion";

const metrics = [
  { label: "Users Practicing", value: "487" },
  { label: "Virtual GH₵ Invested", value: "GH₵ 4.2M" },
  { label: "Simulated Trades", value: "2,481" },
  { label: "Access Fee", value: "Free Forever" },
];

const testimonials = [
  {
    quote: "I was always afraid of the stock market. I thought I'd lose everything. Practicing on inv.labs for two weeks gave me the confidence to finally open a real account with a broker. I'm already up 5%!",
    author: "Ama K.",
    location: "Accra"
  },
  {
    quote: "Ato AI is a game changer. I asked it a dozen 'stupid' questions I was too embarrassed to ask a human. Now I actually understand what I'm buying.",
    author: "Kwame D.",
    location: "Kumasi"
  },
  {
    quote: "The fee breakdown is eye-opening. I never knew how much brokers were taking. inv.labs taught me how to calculate my real returns.",
    author: "Kofi A.",
    location: "Tema"
  }
];

const TrustSection = () => {
  return (
    <section id="trust" className="relative py-24 md:py-32 bg-zinc-950 text-white overflow-hidden">
      {/* Abstract dark gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Light border top for separation */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl relative z-10">
        <div className="flex flex-col mb-20 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold text-white leading-[0.85] tracking-[-0.04em] mb-8 text-balance break-words"
          >
            Ghanaians Are <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-deep via-primary to-primary-light">Already Learning.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl"
          >
            We're building the infrastructure for financial literacy in Ghana. From Accra to Kumasi, we're helping people bridge the gap between theory and reality.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800/50 rounded-[2rem] overflow-hidden border border-zinc-800 backdrop-blur-sm mb-20"
        >
          {metrics.map((m, i) => (
            <div key={i} className="bg-zinc-950 p-6 sm:p-8 md:p-10 hover:bg-zinc-900/80 transition-colors duration-500 group overflow-hidden max-w-full text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-zinc-500 transition-all text-balance break-words">{m.value}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: [0.16, 1, 0.3, 1] as const }}
              className="relative p-8 rounded-[2rem] bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-colors group"
            >
              <div className="absolute top-6 left-6 text-6xl font-syne text-white/5 group-hover:text-primary/10 pointer-events-none transition-colors">"</div>
              <p className="text-lg text-zinc-300 font-medium leading-relaxed italic mb-8 relative z-10">
                {t.quote}
              </p>
              <div className="mt-auto">
                <p className="font-bold text-white">{t.author}</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
