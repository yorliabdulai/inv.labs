"use client";

import { BookOpen, Clock, ChevronRight, PlayCircle, Lightbulb, Bookmark } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function LearnPage() {
    const articles = [
        {
            title: "Understanding the GSE Market Structure",
            category: "Market Fundamentals",
            readTime: "5 min",
            type: "Article",
            description: "An in-depth look at how the Ghana Stock Exchange is organized, from listing requirements to trading sessions."
        },
        {
            title: "Decoding the P/E Ratio: A Value Investor's Guide",
            category: "Analysis",
            readTime: "8 min",
            type: "Video",
            description: "How to use the Price-to-Earnings ratio to identify undervalued stocks in the banking and telecom sectors."
        },
        {
            title: "Dividend Yields vs. Capital Gains",
            category: "Strategy",
            readTime: "6 min",
            type: "Article",
            description: "Understanding the two main sources of return and how to balance them in your portfolio."
        },
        {
            title: "Risk Management 101",
            category: "Risk",
            readTime: "4 min",
            type: "Guide",
            description: "Essential techniques for preserving capital, including stop-losses and diversification."
        },
    ];

    return (
        <div style={{ paddingBottom: "4rem" }}>
            <DashboardHeader />

            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Knowledge Base</h1>
                        <p className="text-gray-500">
                            Expert insights to help you navigate the Ghana Stock Exchange with confidence.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {articles.map((article, i) => (
                            <article key={i} className="glass-card group hover:scale-[1.01] transition-transform duration-200 cursor-pointer p-6 flex gap-6 items-start">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${article.type === "Video" ? "bg-red-50 text-red-500" :
                                        article.type === "Guide" ? "bg-emerald-50 text-emerald-500" :
                                            "bg-indigo-50 text-indigo-500"
                                    }`}>
                                    {article.type === "Video" ? <PlayCircle size={28} /> :
                                        article.type === "Guide" ? <Lightbulb size={28} /> :
                                            <BookOpen size={28} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        <span className={
                                            article.type === "Video" ? "text-red-500" :
                                                article.type === "Guide" ? "text-emerald-500" :
                                                    "text-indigo-500"
                                        }>{article.category}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                                    </div>

                                    <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-0">
                                        {article.description}
                                    </p>
                                </div>

                                <div className="hidden sm:flex items-center text-gray-300 group-hover:text-indigo-500 transition-colors">
                                    <ChevronRight size={24} />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-80 flex-shrink-0">
                    <div className="glass-card p-6 mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Your Progress</h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm font-bold mb-1">
                                <span>Level 3 Investor</span>
                                <span className="text-indigo-600">350 / 1000 XP</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Read 2 more articles to unlock the <strong className="text-gray-900">Analyst Badge</strong>.</p>
                    </div>

                    <div className="glass-card p-6 bg-indigo-900 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <Bookmark size={20} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Saved for Later</h3>
                        <p className="text-indigo-200 text-sm mb-4">You have 3 articles in your reading list.</p>
                        <button className="w-full py-2 bg-white text-indigo-900 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            View Saved
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
