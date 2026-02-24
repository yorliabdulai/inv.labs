"use client";

import LiveTicker from "@/components/landing/LiveTicker";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Hero from "@/components/landing/Hero";
import Heartbeat from "@/components/landing/Heartbeat";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import AtoSection from "@/components/landing/AtoSection";
import TrustSection from "@/components/landing/TrustSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ComparisonTable from "@/components/landing/ComparisonTable";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-terracotta/10">
      <LiveTicker />
      <ScrollProgress />
      <Hero />
      <Heartbeat />
      <ProblemSection />
      <Heartbeat />
      <SolutionSection />
      <Heartbeat />
      <AtoSection />
      <Heartbeat />
      <TrustSection />
      <Heartbeat />
      <HowItWorks />
      <Heartbeat />
      <FeaturesGrid />
      <Heartbeat />
      <ComparisonTable />
      <Heartbeat />
      <PricingSection />
      <Heartbeat />
      <FinalCTA />
      <Footer />
    </div>
  );
}
