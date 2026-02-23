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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20 space-y-12 animate-in fade-in duration-700">
            <DashboardHeader />

            {/* Academy Accreditation Hero */}
            <div className="rounded-[2rem] p-8 md:p-12 bg-slate-950 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles size={12} /> Institutional Academy
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-normal leading-[1.2]">
                            Elevate Your <span className="text-indigo-300">Market Intelligence.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Professional accreditation paths designed to transition investors from fundamental awareness to institutional-grade execution.
                        </p>
                    </div>

                    {/* Proficiency Stats */}
                    <div className="flex items-center gap-10 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Accreditation</p>
                            <p className="text-3xl font-bold tracking-tight">Level 08</p>
                            <p className="text-xs font-semibold text-slate-400">Senior Analyst</p>
                            <div className="w-32 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }} />
                            </div>
                        </div>
                        <div className="w-px h-16 bg-white/10" />
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Knowledge XP</p>
                            <p className="text-3xl font-bold tracking-tight tabular-nums">2,450</p>
                            <p className="text-xs font-bold text-emerald-400">+150 Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certification Paths */}
            <section className="space-y-8">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Accreditation Paths</h2>
                        <p className="text-sm font-medium text-slate-500">Structured curriculums for progressive mastery.</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-2 hover:gap-3 transition-all">
                        View Course Catalog <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {learningPaths.map((path, i) => (
                        <div key={i} className="group bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${path.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                    path.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    <path.icon size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${path.level === 'Foundational' ? 'bg-indigo-50 text-indigo-600' :
                                    path.level === 'Professional' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {path.level}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                {path.title}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow">
                                {path.description}
                            </p>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Proficiency</span>
                                        <span className="text-slate-900">{path.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${path.color === 'indigo' ? 'bg-indigo-600' :
                                                path.color === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
                                                }`}
                                            style={{ width: `${path.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} /> {path.completedLessons}/{path.totalLessons} Modules
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} /> {path.estimatedTime}
                                    </div>
                                </div>

                                <button className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${path.progress === 100
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200"
                                    }`}>
                                    {path.progress === 100 ? "Certification Earned" : "Resume Path"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Research & Intelligence Modules */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Intelligence Modules</h2>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                        {['Latest', 'Most Read'].map((f) => (
                            <button key={f} className="px-4 py-1.5 text-[11px] font-bold rounded-md transition-all hover:text-indigo-600">
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredModules.map((mod, i) => (
                        <div key={i} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all flex flex-col">
                            <div className="p-8 space-y-4 flex-grow">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                                        {mod.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{mod.type}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {mod.title}
                                </h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>

                            <div className="px-8 pb-8 pt-6 border-t border-slate-50 space-y-6">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {mod.readTime}</span>
                                        <span className="flex items-center gap-1.5"><Users size={12} /> {mod.students}</span>
                                    </div>
                                    <span className="text-indigo-500">{mod.difficulty}</span>
                                </div>
                                <button className="w-full py-3.5 bg-slate-50 text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-widest border border-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-all">
                                    Access Briefing
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Assessment Banner */}
            <div className="rounded-[2.5rem] p-10 md:p-16 bg-indigo-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <GraduationCap size={200} />
                </div>
                <div className="relative z-10 max-w-2xl space-y-6 text-center md:text-left">
                    <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-[0.3em]">Daily Assessment</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Validate Today's Market Signals.</h2>
                    <p className="text-indigo-100 text-lg font-medium opacity-80">
                        Test your comprehension of the latest GSE price discovery phases and earn analyst accreditation credits.
                    </p>
                    <button className="mt-4 px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">
                        Start Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}