"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Sign Up (30 seconds)",
    desc: "Just your email. No credit card. Get GH₵10,000 virtual cash instantly and start exploring the market.",
  },
  {
    num: "02",
    title: "Practice Trading",
    desc: "Buy MTN stock. Sell Ecobank. Try mutual funds. See what happens when prices go up and down. Learn what fees actually cost — all with money you can't lose.",
  },
  {
    num: "03",
    title: "Get Confident. Invest for Real.",
    desc: "After weeks of practice, you'll know how to pick stocks, diversify, and manage fees. When you're ready, connect to a real broker. Your practice paid off.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Decorative gradient orb */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-5xl">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold text-foreground leading-[0.9] tracking-[-0.04em] text-balance mb-6 break-words"
          >
            Start Investing in <br className="hidden md:block" />
            <span className="text-primary">3 simple steps.</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-8 bottom-8 left-[27px] md:left-[39px] w-px bg-gradient-to-b from-primary via-primary/20 to-transparent" />

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
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-background border-2 border-border shadow-sm flex items-center justify-center shrink-0 z-10 transition-all duration-500 group-hover:border-primary group-hover:bg-primary/5">
                    <span className="text-xl md:text-3xl font-black text-muted-foreground transition-colors duration-500 group-hover:text-primary">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="pt-2 md:pt-4 max-w-2xl">
                  <h3 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-[-0.03em] transition-colors duration-300 group-hover:text-primary leading-none">
                    {step.title}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed font-medium tracking-tight">
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
