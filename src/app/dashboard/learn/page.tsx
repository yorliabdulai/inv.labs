"use client";

import { useState, useEffect, useMemo } from "react";
import {
    BookOpen, Clock, PlayCircle, Shield,
    ArrowRight, Sparkles, BookCheck, BrainCircuit, Globe,
    ChevronRight, Users, GraduationCap, BarChart3, Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCourses, getUserEnrollments, enrollInCourse, Course, Enrollment } from "@/app/actions/gamification";
import { useToast } from "@/hooks/use-toast";

export default function LearnPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [coursesData, enrollmentsData] = await Promise.all([
                    getCourses(),
                    getUserEnrollments()
                ]);
                setCourses(coursesData);
                setEnrollments(enrollmentsData);
            } catch (err) {
                console.error("Failed to load gamification data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleEnroll = async (courseId: string) => {
        const { error, success } = await enrollInCourse(courseId);
        if (error) {
            toast({
                title: "Enrollment Failed",
                description: "You could not be enrolled in this course right now.",
                variant: "destructive"
            });
        } else if (success) {
            toast({
                title: "Enrolled Successfully",
                description: "You have started a new certification path!",
            });
            router.push(`/dashboard/learn/${courseId}`);
        }
    };

    // Calculate overall accreditation level logic roughly
    // ⚡ BOLT OPTIMIZATION: Memoize O(n) array reduction computation to prevent running
    // it synchronously on every re-render (e.g. when toast notifications trigger state changes).
    const totalXp = useMemo(() => {
        return enrollments.reduce((sum, e) => {
            if (e.status === 'completed' && e.course) {
                return sum + e.course.xp_reward;
            }
            return sum; // Partial formula logic missing, stubbing
        }, 0);
    }, [enrollments]);

    // Map icon strings to components based on static fallback logic
    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'Globe': return Globe;
            case 'BrainCircuit': return BrainCircuit;
            case 'Shield': return Shield;
            default: return BookOpen;
        }
    };
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
            <div className="relative rounded-2xl p-8 md:p-16 bg-[#121417] text-white border border-white/[0.06] shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-blue-600/10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -ml-40 -mb-40" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-500">
                            <Sparkles size={12} /> Institutional Academy
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-instrument-serif leading-tight">
                            Elevate Your <span className="text-blue-500">Market Intelligence.</span>
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest">
                            Professional accreditation paths designed to transition investors from fundamental awareness to institutional-grade execution.
                        </p>
                    </div>

                    {/* Proficiency Stats */}
                    <div className="flex items-center gap-12 bg-white/[0.02] backdrop-blur-xl p-10 rounded-2xl border border-white/[0.06] shadow-2xl">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Accreditation</p>
                            <p className="text-4xl font-bold font-instrument-serif tracking-tight">Level {Math.floor(totalXp / 1000) + 1 < 10 ? `0${Math.floor(totalXp / 1000) + 1}` : Math.floor(totalXp / 1000) + 1}</p>
                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{totalXp > 3000 ? "Senior Analyst" : totalXp > 1000 ? "Analyst" : "Junior Analyst"}</p>
                            <div className="w-40 h-1.5 bg-white/[0.06] rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(totalXp % 1000) / 10}%` }} />
                            </div>
                        </div>
                        <div className="w-px h-20 bg-white/[0.06]" />
                        <div className="space-y-3 text-right">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Knowledge XP</p>
                            <p className="text-4xl font-bold font-instrument-serif tracking-tight tabular-nums">{totalXp.toLocaleString()}</p>
                            <p className="text-[11px] font-bold text-emerald-500">+150 TODAY</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Certification Paths ── */}
            <section className="space-y-10">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <GraduationCap size={18} className="text-blue-500" />
                            Accreditation Paths
                        </h2>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Structured curriculums for progressive mastery.</p>
                    </div>
                    <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                        View Course Catalog <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-3 py-12 text-center text-zinc-500 animate-pulse text-xs tracking-widest uppercase font-bold">
                            Loading Curriculums...
                        </div>
                    ) : courses.map((course, i) => {
                        const enrollment = enrollments.find(e => e.course_id === course.id);
                        const progress = enrollment ? enrollment.progress : 0;
                        const isCompleted = enrollment?.status === 'completed';
                        const isEnrolled = !!enrollment;
                        const IconComponent = getIconComponent(course.icon);

                        return (
                            <div key={i} className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-white/[0.06] transition-colors bg-white/[0.03] text-blue-500 group-hover:bg-blue-600 group-hover:text-white shadow-lg shadow-transparent group-hover:shadow-blue-900/20`}>
                                        <IconComponent size={28} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                        {course.level}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight font-instrument-sans group-hover:text-blue-500 transition-colors leading-tight">
                                    {course.title}
                                </h3>
                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest leading-relaxed mb-10 flex-grow">
                                    {course.description}
                                </p>

                                <div className="space-y-8 pt-8 border-t border-white/[0.06]">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            <span>Proficiency</span>
                                            <span className="text-white">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} className="text-blue-500" /> {enrollment?.completed_lessons || 0}/{course.total_lessons} MOD
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-zinc-600" /> {course.estimated_time || "1h 30m"}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isEnrolled ? router.push(`/dashboard/learn/${course.id}`) : handleEnroll(course.id)}
                                        disabled={isCompleted}
                                        className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isCompleted
                                            ? "bg-white/[0.03] text-zinc-600 cursor-not-allowed border border-white/[0.06]"
                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/20 active:scale-95"
                                            }`}>
                                        {isCompleted ? "Certification Earned" : isEnrolled ? "Resume Path" : "Start Course"}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ── Research & Intelligence Modules ── */}
            <section className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <BrainCircuit size={18} className="text-blue-500" />
                        Intelligence Modules
                    </h2>
                    <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                        {['LATEST', 'MOST READ'].map((f) => (
                            <button key={f} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${f === 'LATEST' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredModules.map((mod, i) => (
                        <div key={i} className="group bg-[#0D0F12] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col shadow-2xl backdrop-blur-md">
                            <div className="p-8 space-y-6 flex-grow">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                        {mod.category}
                                    </span>
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{mod.type}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-500 transition-colors uppercase font-instrument-sans tracking-tight">
                                    {mod.title}
                                </h3>
                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>

                            <div className="px-8 pb-8 pt-6 border-t border-white/[0.06] space-y-6 bg-white/[0.01]">
                                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {mod.readTime}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} className="text-zinc-600" /> {mod.students}</span>
                                    </div>
                                    <span className="text-blue-500">{mod.difficulty}</span>
                                </div>
                                <button className="w-full py-4 bg-white/[0.03] text-white font-bold border border-white/[0.06] rounded-xl text-[10px] uppercase tracking-widest transition-all group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-900/20">
                                    Access Briefing
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Assessment Banner ── */}
            <div className="relative rounded-2xl p-12 md:p-24 bg-[#121417] text-white border border-white/[0.06] shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:bg-blue-600/15 transition-all" />
                <div className="absolute -bottom-24 -left-24 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                    <GraduationCap size={400} className="text-blue-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-1 bg-blue-500 rounded-full" />
                        <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Daily Assessment</p>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight uppercase font-instrument-serif leading-none">Validate Today's Market Signals.</h2>
                    <p className="text-zinc-400 text-sm md:text-lg font-medium leading-relaxed uppercase tracking-widest max-w-2xl">
                        Test your comprehension of the latest GSE price discovery phases and earn analyst accreditation credits.
                    </p>
                    <button className="px-10 py-5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/20 active:scale-95 group">
                        Start Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}