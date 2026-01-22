"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
// Removed GSAP complex imports for now to focus on layout performance and clean load

export default function Home() {
  return (
    <div style={{ paddingBottom: "4rem" }}>

      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="container nav-container">
          <div style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            GSE<span style={{ color: "var(--brand-primary)" }}>.SIM</span>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/login" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
              Log In
            </Link>
            <Link href="/register" className="btn btn-secondary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}>
              Start Trading
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: "160px", paddingBottom: "100px", textAlign: "center" }}>
        <div className="container">
          <div style={{
            display: "inline-block",
            marginBottom: "2rem",
            padding: "0.5rem 1rem",
            borderRadius: "99px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            fontWeight: 500
          }}>
            New: Real-time GSE Market Data Integration
          </div>

          <h1 style={{ maxWidth: "900px", margin: "0 auto 1.5rem" }}>
            The Professional Way to <br />
            <span style={{ color: "var(--text-secondary)" }}>Master the Ghana Stock Market</span>
          </h1>

          <p style={{ maxWidth: "600px", margin: "0 auto 3rem", fontSize: "1.25rem", color: "var(--text-secondary)" }}>
            A high-fidelity simulation platform for serious investors.
            Practice strategies, analyze trends, and build confidence with zero risk.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link href="/register" className="btn btn-primary">
              Create Free Account
            </Link>
            <Link href="/market" className="btn btn-outline">
              View Live Market
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Dashboard Preview (Static & Clean) */}
      <section className="container" style={{ marginBottom: "8rem" }}>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 0 1px var(--border-default), 0 20px 40px -20px rgba(0,0,0,0.5)",
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Visual placeholder for the detailed interface */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", fontWeight: 700, letterSpacing: "-0.05em", color: "var(--text-primary)" }}>
              GH₵ 10,000.00
            </div>
            <div style={{ color: "var(--color-success)", fontSize: "1.25rem", marginTop: "1rem", fontWeight: 500 }}>
              + Portfolio Active
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container">
        <div style={{ marginBottom: "4rem" }}>
          <h2>Platform Capabilities</h2>
          <p style={{ maxWidth: "500px" }}>Engineered for performance and accuracy.</p>
        </div>

        <div className="card-grid">
          <div className="feature-panel">
            <div style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}><BarChart3 size={32} /></div>
            <h3>Live Market Simulation</h3>
            <p>
              Execution engine that mimics real-world liquidity and pricing.
              Accurate tax and fee handling included.
            </p>
          </div>

          <div className="feature-panel">
            <div style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}><Zap size={32} /></div>
            <h3>Instant Execution</h3>
            <p>
              Low-latency order processing. Buy and sell stocks instantly
              to capitalize on market movements.
            </p>
          </div>

          <div className="feature-panel">
            <div style={{ marginBottom: "1.5rem", color: "var(--text-primary)" }}><Shield size={32} /></div>
            <h3>Institutional Grade</h3>
            <p>
              Security and data handling practices that mirror
              real financial institutions.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: "8rem", borderTop: "1px solid var(--border-default)", padding: "4rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            &copy; 2026 GSE Simulator Inc.
          </div>
        </div>
      </footer>

    </div>
  );
}
