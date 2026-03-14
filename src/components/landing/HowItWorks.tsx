"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Capital Injection",
    desc: "Start instantly with GH₵10,000 in virtual funding. No bank linking, no verification delays. Just immediate access to the simulated market.",
  },
  {
    num: "02",
    title: "Analyze & Execute",
    desc: "Browse 40+ real GSE equities and mutual funds. Review historical performance charts, ask Ato AI for explanations, and execute trades with accurate fee reductions.",
  },
  {
    num: "03",
    title: "Build the Habit",
    desc: "Track your portfolio over weeks and months. Learn how dividends hit your balance, understand capital gains, and iterate on your investment strategy safely.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-5xl">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[6.5rem] font-bold text-zinc-950 leading-[0.85] tracking-[-0.04em] text-balance mb-6 break-words"
          >
            A clear path to <br className="hidden md:block" />
            <span className="text-zinc-400">financial confidence.</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-8 bottom-8 left-[27px] md:left-[39px] w-px bg-gradient-to-b from-blue-500 via-blue-200 to-transparent" />

          <div className="flex flex-col gap-16 md:gap-24 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                key={i}
                className="flex gap-8 md:gap-14 group"
              >
                {/* Step Number Badge */}
                <div className="relative">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white border-2 border-zinc-200 shadow-sm flex items-center justify-center shrink-0 z-10 transition-colors duration-500 group-hover:border-blue-500 group-hover:bg-blue-50">
                    <span className="text-lg md:text-2xl font-black text-zinc-300 transition-colors duration-500 group-hover:text-blue-600">
                      {step.num}
                    </span>
                  </div>
                  {/* Subtle pulsing ring on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 scale-50 transition-all duration-500 group-hover:scale-150 group-hover:opacity-0" />
                </div>

                {/* Step Content */}
                <div className="pt-2 md:pt-4 max-w-2xl">
                  <h3 className="text-3xl md:text-[2.5rem] font-black text-zinc-950 mb-5 tracking-[-0.03em] transition-colors duration-300 group-hover:text-blue-600 leading-none">
                    {step.title}
                  </h3>
                  <p className="text-xl text-zinc-500 leading-relaxed font-medium tracking-tight">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
