// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No gradient backgrounds
// ✗ No floating shapes
// ✗ No gradient text
// ✗ No glowing buttons

import { motion } from "framer-motion";
import Link from "next/link";

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-36 bg-ink-950">
      <div className="px-6 md:px-12 lg:px-20 max-w-4xl">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
          className="origin-left mb-10"
        >
          <div className="editorial-rule-strong" />
        </motion.div>

        <p className="section-label font-mono text-ink-muted mb-6">
          Ready to Stop Watching and Start Doing?
        </p>

        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-paper-text leading-[0.95] mb-4">
          Join 400+ Ghanaians
        </h2>
        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-terracotta leading-[0.95] mb-8">
          Learning to Invest
        </h2>

        <p className="text-ink-muted text-base md:text-lg mb-10 max-w-md">
          Practice risk-free. Build real confidence. Create lasting wealth.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/register">
            <button className="btn-editorial-fill">
              Start Practicing Free
            </button>
          </Link>
          <button className="btn-editorial">
            Partner with inv.labs
          </button>
        </div>

        {/* Trust badges — inline text, not icon cards */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-ink-muted text-sm font-mono">
          <span>Bank-level security</span>
          <span>·</span>
          <span>Made in Ghana</span>
          <span>·</span>
          <span>Works on any device</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
