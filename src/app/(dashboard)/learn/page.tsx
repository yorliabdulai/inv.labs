"use client";

import { BookOpen } from "lucide-react";

export default function LearnPage() {
    const articles = [
        { title: "Understanding the GSE", category: "Basics", readTime: "5 min" },
        { title: "What is a P/E Ratio?", category: "Metrics", readTime: "3 min" },
        { title: "Dividends Explained", category: "Income", readTime: "4 min" },
        { title: "How to Build a Portfolio", category: "Strategy", readTime: "7 min" },
        { title: "Risk vs Reward", category: "Psychology", readTime: "5 min" },
    ];

    return (
        <div>
            <h1 className="font-bold" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Education Hub</h1>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>Learn the fundamentals of investing in Ghana.</p>

            <div style={{ display: "grid", gap: "1rem" }}>
                {articles.map((article, i) => (
                    <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                            backgroundColor: "rgba(206, 17, 38, 0.1)",
                            color: "var(--color-primary)",
                            padding: "0.75rem",
                            borderRadius: "var(--radius-md)"
                        }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">{article.title}</h3>
                            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                {article.category} • {article.readTime} read
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
