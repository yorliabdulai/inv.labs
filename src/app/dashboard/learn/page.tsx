"use client";

import { BookOpen, Clock, ChevronRight } from "lucide-react";

export default function LearnPage() {
    const articles = [
        {
            title: "Understanding the GSE Market Structure",
            category: "Market Fundamentals",
            readTime: "5 min",
            description: "An in-depth look at how the Ghana Stock Exchange is organized, from listing requirements to trading sessions."
        },
        {
            title: "Decoding the P/E Ratio: A Value Investor's Guide",
            category: "Analysis",
            readTime: "8 min",
            description: "How to use the Price-to-Earnings ratio to identify undervalued stocks in the banking and telecom sectors."
        },
        {
            title: "Dividend Yields vs. Capital Gains",
            category: "Strategy",
            readTime: "6 min",
            description: "Understanding the two main sources of return and how to balance them in your portfolio."
        },
        {
            title: "Risk Management 101",
            category: "Risk",
            readTime: "4 min",
            description: "Essential techniques for preserving capital, including stop-losses and diversification."
        },
        {
            title: "The Psychology of Trading",
            category: "Psychology",
            readTime: "10 min",
            description: "Mastering your emotions is key to long-term success. Learn how to avoid FOMO and panic selling."
        },
    ];

    return (
        <div style={{ paddingBottom: "4rem", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Knowledge Base</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
                    Expert insights to help you navigate the Ghana Stock Exchange with confidence.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {articles.map((article, i) => (
                    <article key={i} className="feature-panel" style={{
                        padding: "2rem",
                        display: "flex",
                        gap: "1.5rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}>
                        <div style={{
                            flexShrink: 0,
                            width: "60px",
                            height: "60px",
                            background: "var(--bg-surface-elevated)",
                            borderRadius: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--brand-primary)"
                        }}>
                            <BookOpen size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em",
                                color: "var(--text-tertiary)", marginBottom: "0.5rem"
                            }}>
                                <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>{article.category}</span>
                                <span>•</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {article.readTime}</span>
                            </div>

                            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{article.title}</h3>
                            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0" }}>
                                {article.description}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", color: "var(--border-active)" }}>
                            <ChevronRight size={24} />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
