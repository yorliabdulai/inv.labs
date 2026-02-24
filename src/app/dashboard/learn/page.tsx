"use client";

import {
    BookOpen, Clock, PlayCircle, Shield,
    ArrowRight, Sparkles, BookCheck, BrainCircuit, Globe,
    ChevronRight, Users, GraduationCap, BarChart3, Star
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function LearnPage() {
    const learningPaths = [
        {
            title: "GSE Fundamentals",
            description: "Master the architecture of the Ghana Stock Exchange, from listing protocols to session mechanics.",
            progress: 100,
            totalLessons: 12,
            completedLessons: 12,
            level: "Foundational",
            color: "indigo",
            icon: Globe,
            estimatedTime: "4h 30m"
        },
        {
            title: "Portfolio Architecture",
            description: "Learn to construct diversified portfolios using modern asset allocation theories tailored for the GSE.",
            progress: 45,
            totalLessons: 15,
            completedLessons: 7,
            level: "Professional",
            color: "purple",
            icon: BrainCircuit,
            estimatedTime: "6h 15m"
        },
        {
            title: "Risk & Volatility Logic",
            description: "Advanced strategies for downside protection, beta management, and structured risk mitigation.",
            progress: 20,
            totalLessons: 8,
            completedLessons: 2,
            level: "Advanced",
            color: "emerald",
            icon: Shield,
            estimatedTime: "3h 45m"
        }
    ];

    const featuredModules = [
        {
            title: "GSE Market Microstructure",
            category: "Fundamentals",
            readTime: "12 min",
            type: "Technical Paper",
            difficulty: "Foundational",
            description: "An analysis of the order-matching engine, auction phases, and price discovery mechanisms of the GSE.",
            rating: 4.8,
            students: "1.2k",
            tag: "Essential"
        },
        {
            title: "Banking Sector Valuations",
            category: "Analysis",
            readTime: "15 min",
            type: "Video Briefing",
            difficulty: "Professional",
            description: "Frameworks for valuing Tier-1 banks in Ghana using P/B and P/E ratios in high-inflation environments.",
            rating: 4.9,
            students: "892",
            tag: "High Yield"
        },
        {
            title: "Beta-Neutral Hedging",
            category: "Risk",
            readTime: "20 min",
            type: "Case Study",
            difficulty: "Advanced",
            description: "Case studies on using NewGold ETF and cash positions to hedge against broad-market volatility.",
            rating: 4.7,
            students: "654",
            tag: "Advanced"
        }
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-instrument-sans">
            <DashboardHeader />

            {/* ── Academy Accreditation Hero ── */}
            <div className="relative rounded-[2px] p-8 md:p-16 bg-[#121417] text-[#F9F9F9] border border-white/10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C05E42]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-[#C05E42]/10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -ml-40 -mb-40" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-[2px] text-[9px] font-black uppercase tracking-[0.3em] text-[#C05E42]">
                            <Sparkles size={12} /> Institutional_Academy
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-instrument-serif leading-tight">
                            Elevate Your <span className="text-[#C05E42]">Market Intelligence.</span>
                        </h1>
                        <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest">
                            Professional accreditation paths designed to transition investors from fundamental awareness to institutional-grade execution.
                        </p>
                    </div>

                    {/* Proficiency Stats */}
                    <div className="flex items-center gap-12 bg-white/[0.03] backdrop-blur-xl p-10 rounded-[2px] border border-white/10 shadow-2xl">
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em]">Accreditation</p>
                            <p className="text-4xl font-black font-instrument-serif tracking-tighter">Level 08</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Senior Analyst</p>
                            <div className="w-40 h-1 bg-white/5 rounded-[1px] mt-6 overflow-hidden">
                                <div className="h-full bg-[#C05E42] rounded-[1px]" style={{ width: '85%' }} />
                            </div>
                        </div>
                        <div className="w-px h-20 bg-white/5" />
                        <div className="space-y-3 text-right">
                            <p className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em]">Knowledge XP</p>
                            <p className="text-4xl font-black font-instrument-serif tracking-tighter tabular-nums">2,450</p>
                            <p className="text-[10px] font-black text-[#10B981]">INC_150_TODAY</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Certification Paths ── */}
            <section className="space-y-10">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-2">
                        <h2 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.3em] flex items-center gap-3">
                            <GraduationCap size={18} className="text-[#C05E42]" />
                            Accreditation_Paths
                        </h2>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Structured curriculums for progressive mastery.</p>
                    </div>
                    <button className="text-[10px] font-black text-[#C05E42] uppercase tracking-[0.4em] flex items-center gap-2 hover:gap-3 transition-all">
                        View_Course_Catalog <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {learningPaths.map((path, i) => (
                        <div key={i} className="group bg-white/5 border border-white/10 rounded-[2px] p-8 hover:bg-white/[0.07] hover:border-[#C05E42]/30 transition-all duration-500 flex flex-col h-full shadow-2xl">
                            <div className="flex items-start justify-between mb-10">
                                <div className={`w-14 h-14 rounded-[2px] flex items-center justify-center border border-white/10 transition-colors bg-white/5 text-[#C05E42] group-hover:bg-[#C05E42] group-hover:text-[#F9F9F9]`}>
                                    <path.icon size={28} />
                                </div>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-[1px] text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                                    {path.level}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-[#F9F9F9] mb-4 uppercase tracking-tighter font-instrument-sans group-hover:text-[#C05E42] transition-colors leading-tight">
                                {path.title}
                            </h3>
                            <p className="text-white/30 text-[11px] font-black uppercase tracking-widest leading-loose mb-10 flex-grow">
                                {path.description}
                            </p>

                            <div className="space-y-8 pt-8 border-t border-white/5">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                                        <span>Proficiency</span>
                                        <span className="text-[#F9F9F9]">{path.progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-[1px] overflow-hidden">
                                        <div
                                            className="h-full bg-[#C05E42] transition-all duration-1000"
                                            style={{ width: `${path.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-[#C05E42]" /> {path.completedLessons}/{path.totalLessons} MOD
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-white/40" /> {path.estimatedTime}
                                    </div>
                                </div>

                                <button className={`w-full py-5 rounded-[2px] font-black text-[10px] uppercase tracking-[0.3em] transition-all ${path.progress === 100
                                    ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/10"
                                    : "bg-[#C05E42] text-[#F9F9F9] hover:bg-[#D16D4F] shadow-xl shadow-[#C05E42]/10 active:scale-95"
                                    }`}>
                                    {path.progress === 100 ? "Certification_Earned" : "Resume_Path"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Research & Intelligence Modules ── */}
            <section className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                    <h2 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.3em] flex items-center gap-3">
                        <BrainCircuit size={18} className="text-[#C05E42]" />
                        Intelligence_Modules
                    </h2>
                    <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-[1px]">
                        {['LATEST', 'MOST_READ'].map((f) => (
                            <button key={f} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-[1px] transition-all ${f === 'LATEST' ? 'bg-[#C05E42] text-[#F9F9F9]' : 'text-white/30 hover:text-white/60'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredModules.map((mod, i) => (
                        <div key={i} className="group bg-white/5 border border-white/10 rounded-[2px] overflow-hidden hover:border-[#C05E42]/30 transition-all flex flex-col shadow-2xl">
                            <div className="p-8 space-y-6 flex-grow">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[#C05E42] uppercase tracking-[0.3em] bg-[#C05E42]/10 px-3 py-1 rounded-[1px] border border-[#C05E42]/20">
                                        {mod.category}
                                    </span>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{mod.type}</span>
                                </div>
                                <h3 className="text-lg font-black text-[#F9F9F9] leading-tight group-hover:text-[#C05E42] transition-colors uppercase font-instrument-sans tracking-tight">
                                    {mod.title}
                                </h3>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-loose">
                                    {mod.description}
                                </p>
                            </div>

                            <div className="px-8 pb-8 pt-6 border-t border-white/5 space-y-6 bg-white/[0.01]">
                                <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#C05E42]" /> {mod.readTime}</span>
                                        <span className="flex items-center gap-1.5"><Users size={12} className="text-white/40" /> {mod.students}</span>
                                    </div>
                                    <span className="text-[#C05E42]">{mod.difficulty}</span>
                                </div>
                                <button className="w-full py-4 bg-white/5 text-[#F9F9F9] font-black border border-white/10 rounded-[2px] text-[9px] uppercase tracking-[0.4em] transition-all group-hover:bg-[#C05E42] group-hover:border-[#C05E42] group-hover:shadow-xl group-hover:shadow-[#C05E42]/10">
                                    Access_Briefing
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Assessment Banner ── */}
            <div className="relative rounded-[2px] p-12 md:p-24 bg-[#121417] text-[#F9F9F9] border border-white/10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C05E42]/10 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:bg-[#C05E42]/15 transition-all" />
                <div className="absolute -bottom-24 -left-24 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                    <GraduationCap size={400} />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-1 bg-[#C05E42]" />
                        <p className="text-[#C05E42] text-[10px] font-black uppercase tracking-[0.5em]">Daily_Assessment</p>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase font-instrument-serif leading-none">Validate Today's Market Signals.</h2>
                    <p className="text-white/40 text-sm md:text-lg font-medium leading-relaxed uppercase tracking-[0.2em] max-w-2xl">
                        Test your comprehension of the latest GSE price discovery phases and earn analyst accreditation credits.
                    </p>
                    <button className="px-12 py-6 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] text-xs uppercase tracking-[0.4em] hover:bg-[#D16D4F] transition-all shadow-2xl shadow-[#C05E42]/20 active:scale-95 group">
                        Start_Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}