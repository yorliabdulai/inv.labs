"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, Globe, Smartphone, Server, Activity, ChevronRight } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Hero Animations
      const title = new SplitType("#hero-title", { types: "chars, words" });
      const tl = gsap.timeline();

      tl.from(title.chars, {
        opacity: 0,
        y: 40,
        stagger: 0.02,
        duration: 1,
        ease: "expo.out",
      })
        .from("#hero-subtitle", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.6")
        .from(".hero-cta", {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out"
        }, "-=0.4")
        .from(".hero-mockup", {
          opacity: 0,
          y: 60,
          scale: 0.95,
          duration: 1.2,
          ease: "expo.out"
        }, "-=0.4");

      // 2. Continuous Floating Animation for Mockups
      gsap.to(".floating-mockup", {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // 3. Scroll Reveal for Sections
      const revealElements = gsap.utils.toArray<HTMLElement>(".reveal-up");
      revealElements.forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        });
      });

      // 4. Feature Cards Reveal
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ backgroundColor: "var(--bg-page)", color: "var(--text-secondary)" }}>

      {/* Top Engineering Indicator */}
      <div style={{
        background: "#0F172A",
        color: "#94A3B8",
        textAlign: "center",
        padding: "10px 0",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        position: "relative",
        zIndex: 2000
      }}>
        <span className="flex items-center gap-2" style={{ color: "#10B981" }}><Activity size={14} /> API STATUS: 99.98% UPTIME</span>
        <span className="flex items-center gap-2" style={{ color: "#6366F1" }}><Server size={14} /> LATENCY: {"<"} 45MS</span>
        <span className="flex items-center gap-2" style={{ color: "#3B82F6" }}><Globe size={14} /> REGION: US-EAST-1</span>
      </div>

      {/* Navigation */}
      <nav className="nav-fixed glass">
        <div className="container" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1280px" }}>
          <div className="flex items-center gap-3" style={{ fontSize: "1.5rem", fontWeight: 900 }}>
            <TrendingUp style={{ color: "var(--brand-primary)" }} size={32} />
            <span style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}>GSE<span style={{ opacity: 0.4 }}>.LABS</span></span>
          </div>

          <div className="flex items-center gap-12">
            <Link href="/login" className="text-sm font-bold" style={{ color: "var(--text-primary)", textDecoration: "none", opacity: 0.8 }}>Log In</Link>
            <Link href="/register" className="btn-premium btn-premium-solid" style={{ borderRadius: "10px" }}>
              Request Sandbox Access
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section style={{ paddingTop: "160px", paddingBottom: "120px", position: "relative" }} className="bg-glow-main">
          <div className="container" style={{ textAlign: "center" }}>

            <div className="reveal-up trust-badge mb-10">
              STABLE RELEASE V2.4.0 • TRUSTED BY 56K+ INVESTORS
            </div>

            <h1 id="hero-title" style={{
              fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
              maxWidth: "1100px",
              margin: "0 auto 3rem",
              color: "var(--text-primary)",
              lineHeight: 0.95,
              letterSpacing: "-0.05em"
            }}>
              Practice Trading. <br />Institutional Precision.
            </h1>

            <p id="hero-subtitle" style={{
              maxWidth: "680px",
              margin: "0 auto 4rem",
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              Experience the Ghana Stock Exchange with a high-fidelity simulator that mirrors
              real-world market depth, brokerage fees, and execution latency.
            </p>

            <div className="flex justify-center gap-6 mb-24">
              <Link href="/register" className="hero-cta btn-premium btn-premium-solid" style={{ padding: "1.4rem 3.5rem", fontSize: "1rem" }}>
                Open Trading Sandbox
              </Link>
              <Link href="/learn" className="hero-cta btn-premium btn-premium-primary" style={{ padding: "1.4rem 3.5rem", fontSize: "1rem" }}>
                API Docs <ChevronRight size={20} style={{ marginLeft: "6px" }} />
              </Link>
            </div>

            {/* Hero Mockup - Proprietary Visual */}
            <div className="hero-mockup floating-mockup" style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
              <div className="glass-card" style={{ padding: "10px", borderRadius: "32px", overflow: "hidden", display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }}>
                <img
                  src="/mockups/trading_view.png"
                  alt="Simulator Portfolio Logic"
                  style={{ width: "100%", height: "auto", display: "block", borderRadius: "24px" }}
                />
              </div>

              {/* Technical Floaties */}
              <div className="reveal-up glass-card" style={{
                position: "absolute", top: "15%", left: "-15%", padding: "24px 32px",
                background: "rgba(255,255,255,0.95)", border: "1px solid var(--border-default)",
                zIndex: 10
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-tertiary)", marginBottom: "6px", letterSpacing: "0.1em" }}>FEED SPEED</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text-primary)" }}>45ms <span style={{ color: "var(--color-success)", fontSize: "0.875rem" }}>GLOBAL</span></div>
              </div>

              <div className="reveal-up glass-card" style={{
                position: "absolute", bottom: "15%", right: "-10%", padding: "24px 32px",
                background: "rgba(255,255,255,0.95)", border: "1px solid var(--border-default)",
                zIndex: 10
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-tertiary)", marginBottom: "6px", letterSpacing: "0.1em" }}>ORDER ROUTING</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", background: "#10B981", borderRadius: "50%" }}></div> GSE SYNCED
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon: Mobile Apps */}
        <section style={{ padding: "160px 0", background: "#F9FAFB", position: "relative", overflow: "visible" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10rem", alignItems: "center" }}>
              <div className="reveal-up">
                <div className="trust-badge mb-6" style={{ background: "rgba(79, 70, 229, 0.1)" }}>MOBILE ECOSYSTEM</div>
                <h2 style={{ marginBottom: "2.5rem", fontSize: "3.5rem" }}>Native Experience. <br />Arriving Q2 2026.</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "4rem", fontSize: "1.25rem", lineHeight: 1.6 }}>
                  We're finalizing the most intuitive mobile interface for West African investors.
                  Institutional-grade analytics in your pocket.
                </p>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div className="glass-card" style={{ padding: "14px 28px", opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "12px", border: "1px dashed var(--border-default)" }}>
                    <Smartphone size={24} /> App Store
                  </div>
                  <div className="glass-card" style={{ padding: "14px 28px", opacity: 0.5, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "12px", border: "1px dashed var(--border-default)" }}>
                    <div style={{ width: "24px", height: "24px", background: "#333", borderRadius: "4px" }}></div> Play Store
                  </div>
                </div>
              </div>
              <div className="reveal-up" style={{ position: "relative" }}>
                <img
                  src="/mockups/market_discover.png"
                  alt="Mobile App Market Experience"
                  style={{ width: "100%", height: "auto", borderRadius: "48px", boxShadow: "0 40px 100px -20px rgba(0,0,0,0.15)" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Engineering Standards */}
        <section style={{ padding: "160px 0", background: "#FFFFFF" }}>
          <div className="container">
            <div className="reveal-up" style={{ textAlign: "center", marginBottom: "8rem" }}>
              <h2 style={{ marginBottom: "2rem" }}>Reliable Data. Faster Execution.</h2>
              <p style={{ maxWidth: "650px", margin: "0 auto", fontSize: "1.25rem" }}>
                Our infrastructure is built to handle the next generation of financial simulation.
                Secure, transparent, and high-performance.
              </p>
            </div>

            <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" }}>
              {/* Card 1 */}
              <div className="feature-card glass-card" style={{ padding: "3.5rem" }}>
                <BarChart3 style={{ color: "var(--brand-primary)", marginBottom: "2.5rem" }} size={48} />
                <h3 style={{ marginBottom: "1.25rem" }}>Tick-Level Data</h3>
                <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>Don't settle for delayed feeds. Access real-time price activity across 50+ list entries on the GSE.</p>
              </div>

              {/* Card 2 */}
              <div className="feature-card glass-card" style={{ padding: "3.5rem" }}>
                <Shield style={{ color: "var(--brand-primary)", marginBottom: "2.5rem" }} size={48} />
                <h3 style={{ marginBottom: "1.25rem" }}>Accurate Levies</h3>
                <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>Automated SEC, GSE, and Brokerage fee simulations ensure your virtual profit reflects your potential reality.</p>
              </div>

              {/* Card 3 */}
              <div className="feature-card glass-card" style={{ padding: "3.5rem" }}>
                <Zap style={{ color: "var(--brand-primary)", marginBottom: "2.5rem" }} size={48} />
                <h3 style={{ marginBottom: "1.25rem" }}>Zero-Slip Engine</h3>
                <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>Engineered to simulate liquidity availability, preventing "fantasy" profits from unrealized market volume.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Context */}
        <section style={{ padding: "180px 0", textAlign: "center", background: "var(--bg-page)" }}>
          <div className="container">
            <h2 className="reveal-up" style={{ fontSize: "4.5rem", marginBottom: "4rem", letterSpacing: "-0.04em" }}>Institutional Access. <br />Universal Reach.</h2>
            <div className="reveal-up">
              <Link href="/register" className="btn-premium btn-premium-solid" style={{ padding: "1.6rem 5rem", fontSize: "1.125rem", borderRadius: "12px" }}>
                Create Sandbox Portfolio
              </Link>
            </div>
            <p className="reveal-up" style={{ marginTop: "2.5rem", fontSize: "0.9375rem", color: "var(--text-tertiary)", fontWeight: 600 }}>
              STABLE RELEASE V2.4.0 • 100% FREE SANDBOX
            </p>
          </div>
        </section>

      </main>

      <footer style={{ borderTop: "1px solid var(--border-default)", padding: "100px 0", background: "#FFFFFF" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: "6rem" }}>
          <div>
            <div className="flex items-center gap-3 mb-8" style={{ fontSize: "1.5rem", fontWeight: 900 }}>
              <TrendingUp style={{ color: "var(--brand-primary)" }} size={32} />
              <span style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}>GSE<span style={{ opacity: 0.4 }}>.LABS</span></span>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-tertiary)", maxWidth: "260px", lineHeight: 1.6 }}>The #1 standard for West African financial simulation. Built for trust.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: "1.75rem", fontSize: "1rem", color: "var(--text-primary)" }}>Platform</h4>
            <div className="flex flex-col gap-4">
              <Link href="/market" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Market Feed</Link>
              <Link href="/status" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>System Status</Link>
              <Link href="/docs" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>API Reference</Link>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: "1.75rem", fontSize: "1rem", color: "var(--text-primary)" }}>Company</h4>
            <div className="flex flex-col gap-4">
              <Link href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Engineering Story</Link>
              <Link href="/careers" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Careers</Link>
              <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Privacy Hub</Link>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: "1.75rem", fontSize: "1rem", color: "var(--text-primary)" }}>Contact</h4>
            <div className="flex flex-col gap-4">
              <Link href="mailto:invest@gselabs.io" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Investor Relations</Link>
              <Link href="mailto:support@gselabs.io" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9375rem" }}>Technical Support</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
                .nav-fixed {
                    position: fixed;
                    top: 42px; left: 0; right: 0;
                    height: var(--header-height);
                    z-index: 1000;
                }
                .container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .gap-3 { gap: 0.75rem; }
                .gap-4 { gap: 1rem; }
                .gap-6 { gap: 1.5rem; }
                .gap-12 { gap: 3rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-8 { margin-bottom: 2rem; }
                .mb-10 { margin-bottom: 2.5rem; }
                .mb-24 { margin-bottom: 6rem; }
            `}</style>
    </div>
  );
}
