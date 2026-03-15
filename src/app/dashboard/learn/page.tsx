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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-sans">
            <DashboardHeader />

            {/* ── Academy Accreditation Hero ── */}
            <div className="relative rounded-2xl p-8 md:p-16 bg-card text-foreground border border-border shadow-premium overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-muted/20 rounded-full blur-[100px] -ml-40 -mb-40" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-muted/30 border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary">
                            <Sparkles size={12} /> Institutional Academy
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase font-syne leading-tight text-foreground">
                            Elevate Your <span className="text-primary">Market Intelligence.</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest">
                            Professional accreditation paths designed to transition investors from fundamental awareness to institutional-grade execution.
                        </p>
                    </div>

                    {/* Proficiency Stats */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 bg-muted/20 backdrop-blur-xl p-6 sm:p-10 rounded-2xl border border-border shadow-xl w-full lg:w-auto">
                        <div className="space-y-2 w-full sm:w-auto">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center sm:text-left">Accreditation</p>
                            <p className="text-3xl sm:text-4xl font-bold font-syne tracking-tight text-foreground text-center sm:text-left leading-none">Level {Math.floor(totalXp / 1000) + 1 < 10 ? `0${Math.floor(totalXp / 1000) + 1}` : Math.floor(totalXp / 1000) + 1}</p>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-center sm:text-left">{totalXp > 3000 ? "Senior Analyst" : totalXp > 1000 ? "Analyst" : "Junior Analyst"}</p>
                            <div className="w-full sm:w-40 h-1.5 bg-muted/30 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(totalXp % 1000) / 10}%` }} />
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-20 bg-border/50" />
                        <div className="space-y-3 w-full sm:w-auto text-center sm:text-right">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Knowledge XP</p>
                            <p className="text-4xl font-bold font-syne tracking-tight tabular-nums text-foreground">{totalXp.toLocaleString()}</p>
                            <p className="text-[11px] font-bold text-emerald-500 tracking-widest">+150 TODAY</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Certification Paths ── */}
            <section className="space-y-10">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                            <GraduationCap size={18} className="text-primary" />
                            Accreditation Paths
                        </h2>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Structured curriculums for progressive mastery.</p>
                    </div>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
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
                            <div key={i} className="group bg-card border border-border rounded-2xl p-8 hover:bg-muted/30 hover:border-primary/30 transition-all duration-500 flex flex-col h-full shadow-premium backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-border transition-colors bg-muted/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground shadow-lg shadow-transparent group-hover:shadow-primary/20`}>
                                        <IconComponent size={28} />
                                    </div>
                                    <span className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {course.level}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-4 uppercase tracking-tight font-sans group-hover:text-primary transition-colors leading-tight break-words">
                                    {course.title}
                                </h3>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest leading-relaxed mb-10 flex-grow">
                                    {course.description}
                                </p>

                                <div className="space-y-8 pt-8 border-t border-border">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Proficiency</span>
                                            <span className="text-foreground">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} className="text-primary" /> {enrollment?.completed_lessons || 0}/{course.total_lessons} MOD
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-muted-foreground/60" /> {course.estimated_time || "1h 30m"}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isEnrolled ? router.push(`/dashboard/learn/${course.id}`) : handleEnroll(course.id)}
                                        disabled={isCompleted}
                                        className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isCompleted
                                            ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95"
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
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                        <BrainCircuit size={18} className="text-primary" />
                        Intelligence Modules
                    </h2>
                    <div className="flex gap-1 p-1 bg-muted/30 border border-border rounded-xl">
                        {['LATEST', 'MOST READ'].map((f) => (
                            <button key={f} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${f === 'LATEST' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredModules.map((mod, i) => (
                        <div key={i} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all flex flex-col shadow-premium backdrop-blur-md">
                            <div className="p-8 space-y-6 flex-grow">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 whitespace-nowrap">
                                        {mod.category}
                                    </span>
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{mod.type}</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors uppercase font-sans tracking-tight">
                                    {mod.title}
                                </h3>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>

                            <div className="px-8 pb-8 pt-6 border-t border-border space-y-6 bg-muted/5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {mod.readTime}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} className="text-muted-foreground/60" /> {mod.students}</span>
                                    </div>
                                    <span className="text-primary">{mod.difficulty}</span>
                                </div>
                                <button className="w-full py-4 bg-muted/30 text-foreground font-bold border border-border rounded-xl text-[10px] uppercase tracking-widest transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20">
                                    Access Briefing
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Assessment Banner ── */}
            <div className="relative rounded-2xl p-12 md:p-24 bg-card text-foreground border border-border shadow-premium overflow-hidden group">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:bg-primary/15 transition-all" />
                <div className="absolute -bottom-24 -left-24 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                    <GraduationCap size={400} className="text-primary" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-1 bg-primary rounded-full" />
                        <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Daily Assessment</p>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight uppercase font-syne leading-none">Validate Today's Market Signals.</h2>
                    <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed uppercase tracking-widest max-w-2xl">
                        Test your comprehension of the latest GSE price discovery phases and earn analyst accreditation credits.
                    </p>
                    <button className="px-10 py-5 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-95 group">
                        Start Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}