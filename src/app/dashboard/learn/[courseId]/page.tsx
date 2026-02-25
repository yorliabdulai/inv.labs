"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle, Clock, PlayCircle, Shield, BrainCircuit, Globe } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCourseWithEnrollment, advanceCourseProgress, Course, Enrollment } from "@/app/actions/gamification";
import { useToast } from "@/hooks/use-toast";

export default function CourseLearningPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [loading, setLoading] = useState(true);
    const [advancing, setAdvancing] = useState(false);

    useEffect(() => {
        if (!courseId) return;

        async function fetchCourseData() {
            const data = await getCourseWithEnrollment(courseId);
            if (data?.course) {
                setCourse(data.course);
                setEnrollment(data.enrollment);
            } else {
                toast({
                    title: "Course Unavailable",
                    description: "We could not find the course you requested.",
                    variant: "destructive"
                });
                router.push("/dashboard/learn");
            }
            setLoading(false);
        }
        fetchCourseData();
    }, [courseId, router, toast]);

    const handleCompleteModule = async () => {
        setAdvancing(true);
        const { error, success, isCompleted, xp_reward } = await advanceCourseProgress(courseId);

        if (error) {
            toast({
                title: "Error Saving Progress",
                description: error,
                variant: "destructive"
            });
            setAdvancing(false);
            return;
        }

        if (success) {
            // Refresh local state
            const data = await getCourseWithEnrollment(courseId);
            if (data?.enrollment) setEnrollment(data.enrollment);

            if (isCompleted) {
                toast({
                    title: "Certification Earned!",
                    description: `You've completed ${course?.title} and earned ${xp_reward} XP.`,
                });
            } else {
                toast({
                    title: "Progress Saved",
                    description: "Module completed. Keep up the good work!",
                });
            }
        }
        setAdvancing(false);
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-12 animate-in fade-in duration-700 font-instrument-sans">
                <DashboardHeader />
                <div className="py-24 text-center text-white/40 animate-pulse text-xs font-black uppercase tracking-[0.3em]">
                    Initializing Institutional Course Module...
                </div>
            </div>
        );
    }

    if (!course) return null;

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'Globe': return Globe;
            case 'BrainCircuit': return BrainCircuit;
            case 'Shield': return Shield;
            default: return BookOpen;
        }
    };

    const IconComponent = getIconComponent(course.icon);
    const isCompleted = enrollment?.status === 'completed';
    // For visual purposes, we generate numbered modules based on total_lessons
    const currentModule = Math.min((enrollment?.completed_lessons || 0) + 1, course.total_lessons);

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-8 animate-in fade-in duration-700 font-instrument-sans">
            <DashboardHeader />

            <button
                onClick={() => router.push("/dashboard/learn")}
                className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-[#F9F9F9] uppercase tracking-[0.2em] transition-colors"
            >
                <ArrowLeft size={14} /> Back to Academy Catalog
            </button>

            {/* Course Header */}
            <div className="relative rounded-[2px] p-8 md:p-12 bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col md:flex-row gap-8 items-start justify-between overflow-hidden group">
                <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#C05E42]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-[#C05E42]/20 transition-all duration-700" />

                <div className="relative z-10 flex gap-6 max-w-3xl">
                    <div className="w-16 h-16 rounded-[2px] bg-[#C05E42] flex items-center justify-center text-[#F9F9F9] shrink-0 shadow-lg shadow-[#C05E42]/20">
                        <IconComponent size={28} />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-[1px] text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                            {course.level}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#F9F9F9] tracking-tighter uppercase font-instrument-serif leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed uppercase tracking-widest">
                            {course.description}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-[2px] min-w-[240px] shrink-0 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C05E42]">Progress</span>
                            <span className="text-xl font-black text-[#F9F9F9] tabular-nums">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-[1px] overflow-hidden">
                            <div className="h-full bg-[#C05E42] transition-all duration-1000" style={{ width: `${enrollment?.progress || 0}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            <span className="flex items-center gap-2"><BookOpen size={12} /> Modules</span>
                            <span className="text-[#F9F9F9]">{enrollment?.completed_lessons || 0} / {course.total_lessons}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            <span className="flex items-center gap-2"><Clock size={12} /> Est. Time</span>
                            <span className="text-[#F9F9F9]">{course.estimated_time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Curriculum list */}
                <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                    <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.3em] mb-6">Course Curriculum</h3>
                    <div className="space-y-3">
                        {Array.from({ length: course.total_lessons }).map((_, i) => {
                            const lessonNum = i + 1;
                            const isPast = lessonNum <= (enrollment?.completed_lessons || 0);
                            const isCurrent = lessonNum === currentModule && !isCompleted;

                            return (
                                <div
                                    key={i}
                                    className={`p-4 border rounded-[2px] flex items-center justify-between transition-all ${isCurrent
                                            ? "bg-[#C05E42]/10 border-[#C05E42]/30 text-[#F9F9F9]"
                                            : isPast
                                                ? "bg-white/5 border-[#10B981]/30 text-white/60"
                                                : "bg-[#121417] border-white/5 text-white/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${isPast ? "bg-[#10B981] text-[#121417]" : isCurrent ? "bg-[#C05E42] text-[#F9F9F9]" : "bg-white/10"
                                            }`}>
                                            {isPast ? <CheckCircle size={12} /> : lessonNum}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Module {lessonNum}</span>
                                    </div>
                                    {isCurrent && <PlayCircle size={14} className="text-[#C05E42] animate-pulse" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right side: Player interface */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                    <div className="bg-[#121417] border border-white/10 rounded-[2px] shadow-2xl flex flex-col h-full min-h-[500px]">
                        {isCompleted ? (
                            <div className="p-16 flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 bg-[#10B981]/10 rounded-full flex items-center justify-center border border-[#10B981]/30 text-[#10B981]">
                                    <Shield size={48} />
                                </div>
                                <div className="space-y-4 max-w-sm">
                                    <h2 className="text-3xl font-black text-[#F9F9F9] uppercase tracking-tighter font-instrument-serif leading-none">Certification Earned</h2>
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-loose">
                                        You have successfully graduated from this curriculum. Your profile has been credited with {course.xp_reward} Knowledge XP.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/dashboard/learn")}
                                    className="px-8 py-4 bg-white/5 text-[#F9F9F9] hover:bg-white/10 border border-white/10 rounded-[2px] text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                >
                                    Return to Academy
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* Video Placeholder */}
                                <div className="aspect-video w-full bg-black flex items-center justify-center border-b border-white/10 relative overflow-hidden group/video cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                    <PlayCircle size={64} className="text-white/40 group-hover/video:text-white/80 group-hover/video:scale-110 transition-all z-20" />
                                    <div className="absolute bottom-4 left-6 z-20">
                                        <span className="text-[10px] font-black text-white px-2 py-1 bg-[#C05E42] rounded-[1px] uppercase tracking-widest">Live Execution Protocol</span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col items-start justify-between">
                                    <div className="space-y-4 max-w-2xl">
                                        <h3 className="text-2xl font-black text-[#F9F9F9] uppercase tracking-tighter font-instrument-serif">
                                            Instructional Module {currentModule}
                                        </h3>
                                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest leading-loose">
                                            Please review the video module above before proceeding. The knowledge tested here will directly impact your strategic allocation skills within the terminal simulator.
                                        </p>
                                    </div>

                                    <div className="pt-8 w-full border-t border-white/10 mt-8 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CheckCircle size={14} /> Auto-Saving Progress
                                        </span>
                                        <button
                                            onClick={handleCompleteModule}
                                            disabled={advancing}
                                            className="px-8 py-4 bg-[#C05E42] text-[#F9F9F9] hover:bg-[#D16D4F] active:scale-95 disabled:opacity-50 font-black text-[10px] uppercase tracking-[0.3em] rounded-[2px] transition-all shadow-xl shadow-[#C05E42]/10"
                                        >
                                            {advancing ? "Validating..." : "Complete Module & Advance"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
