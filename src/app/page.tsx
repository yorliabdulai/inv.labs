"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import LearningToolsShowcase from "@/components/landing/LearningToolsShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustSection from "@/components/landing/TrustSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import LifetimeBanner from "@/components/landing/LifetimeBanner";

export default function Home() {
  return (
    <div className="min-h-screen text-zinc-900 selection:bg-blue-500/30 overflow-x-hidden relative bg-white">

      {/* V3 Global Fluid Background Mesh - Anchors the entire page */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[40%] bg-blue-50/50 rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full blur-[160px] opacity-60 mix-blend-multiply" />
        <div className="absolute top-[60%] left-[20%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[180px] opacity-50 mix-blend-multiply" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <Navbar />

      <main className="flex flex-col relative z-0">
        <Hero />

        <div className="relative z-10">
          <ProblemSection />
          <SolutionSection />
          <LearningToolsShowcase />
        </div>

        <HowItWorks />

        {/* Dark Transition for Trust */}
        <div className="relative z-30">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-zinc-950 pointer-events-none" />
          <TrustSection />
          {/* Transition back to light for Pricing/FAQ */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-zinc-950 pointer-events-none" />
        </div>

        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <Footer />
      <LifetimeBanner />
    </div>
  );
}
