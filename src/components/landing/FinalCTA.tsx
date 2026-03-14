"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="relative py-32 md:py-48 bg-zinc-950 overflow-hidden isolate">
      {/* Background Glows for High Contrast */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-6 md:px-12 text-center relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-12 shadow-[0_0_30px_rgba(43,89,255,0.2)]">
            Start Free
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight text-balance mb-8 w-full overflow-hidden">
            Ready to trade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400">with confidence?</span>
          </h2>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            Join thousands of Ghanaians mastering the stock market. Zero hidden fees. Zero real capital required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 text-base font-bold text-white bg-primary rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(43,89,255,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Create Free Account</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="text-sm text-zinc-500 font-medium mt-4 sm:mt-0 sm:ml-4">
              Takes 30 seconds.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
