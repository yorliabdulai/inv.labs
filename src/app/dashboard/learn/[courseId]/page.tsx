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
                // Award XP for watching the video/starting module
                import("@/app/actions/xp").then(mod => mod.awardXP('VIDEO_WATCHED'));
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
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-8 animate-in fade-in duration-700 font-sans">
                <DashboardHeader />
                <div className="py-24 text-center text-muted-foreground/40 animate-pulse text-[10px] font-bold uppercase tracking-widest">
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
    const currentModuleIndex = Math.min(enrollment?.completed_lessons || 0, course.total_lessons - 1);
    const currentLesson = course.lessons?.[currentModuleIndex];

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24 space-y-8 animate-in fade-in duration-700 font-instrument-sans">
            <DashboardHeader />

            <button
                onClick={() => router.push("/dashboard/learn")}
                className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
            >
                <ArrowLeft size={14} /> Back to Academy Catalog
            </button>

            {/* Course Header */}
            <div className="relative rounded-2xl p-6 md:p-12 bg-card border border-border shadow-premium flex flex-col md:flex-row gap-8 items-start justify-between overflow-hidden group backdrop-blur-md">
                <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 max-w-3xl">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 duration-500">
                        <IconComponent size={28} />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/30 border border-border rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            {course.level}
                        </div>
                        <h1 className="text-2xl md:text-5xl font-bold text-foreground tracking-tight uppercase font-syne leading-tight break-words">
                            {course.title}
                        </h1>
                        <p className="text-muted-foreground text-[10px] md:text-base font-medium leading-relaxed uppercase tracking-normal md:tracking-widest">
                            {course.description}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 bg-muted/30 border border-border p-6 rounded-xl min-w-[240px] shrink-0 space-y-6 backdrop-blur-md">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Progress</span>
                            <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000 rounded-full" style={{ width: `${enrollment?.progress || 0}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><BookOpen size={12} className="text-primary" /> Modules</span>
                            <span className="text-foreground">{enrollment?.completed_lessons || 0} / {course.total_lessons}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2"><Clock size={12} className="text-primary" /> Est. Time</span>
                            <span className="text-foreground">{course.estimated_time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Curriculum list */}
                <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Course Curriculum</h3>
                    <div className="space-y-3">
                        {course.lessons?.map((lesson, i) => {
                            const lessonNum = i + 1;
                            const isPast = lessonNum <= (enrollment?.completed_lessons || 0);
                            const isCurrent = i === currentModuleIndex && !isCompleted;

                            return (
                                <div
                                    key={i}
                                    className={`p-4 md:p-5 border rounded-xl flex items-center justify-between transition-all ${isCurrent
                                        ? "bg-primary/10 border-primary/30 text-foreground shadow-premium translate-x-2"
                                        : isPast
                                            ? "bg-card/50 border-emerald-500/20 text-muted-foreground"
                                            : "bg-card/30 border-border text-muted-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${isPast ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : isCurrent ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/10 border border-border text-muted-foreground"
                                            }`}>
                                            {isPast ? <CheckCircle size={14} /> : lessonNum}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-widest line-clamp-1">{lesson.title}</span>
                                            <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">{lesson.duration}</span>
                                        </div>
                                    </div>
                                    {isCurrent && <PlayCircle size={14} className="text-primary animate-pulse" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right side: Player interface */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                    <div className="bg-card backdrop-blur-xl border border-border rounded-2xl shadow-premium flex flex-col h-full min-h-[500px] overflow-hidden">
                        {isCompleted ? (
                            <div className="p-16 flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/30 text-primary shadow-2xl shadow-primary/10">
                                    <Shield size={48} />
                                </div>
                                <div className="space-y-4 max-w-sm">
                                    <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight font-syne leading-none">Certification Earned</h2>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-loose">
                                        You have successfully graduated from this curriculum. Your profile has been credited with {course.xp_reward} Knowledge XP.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/dashboard/learn")}
                                    className="px-8 py-4 bg-muted/30 text-foreground hover:bg-muted/50 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-premium"
                                >
                                    Return to Academy
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* YouTube Video Player */}
                                <div className="aspect-video w-full bg-black border-b border-border relative overflow-hidden group/video">
                                    {currentLesson ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?rel=0&modestbranding=1`}
                                            title={currentLesson.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0"
                                        ></iframe>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                                            Video not available
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 md:p-10 flex-1 flex flex-col items-start justify-between">
                                    <div className="space-y-6 max-w-2xl">
                                        <h3 className="text-lg md:text-2xl font-bold text-foreground uppercase tracking-tight font-syne leading-tight break-words">
                                            {currentLesson?.title || `Instructional Module ${currentModuleIndex + 1}`}
                                        </h3>
                                        <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-normal md:tracking-widest leading-loose">
                                            {currentLesson?.description || "Please review the video module above before proceeding. The knowledge tested here will directly impact your strategic allocation skills within the terminal simulator."}
                                        </p>
                                    </div>
                                    <div className="pt-8 w-full border-t border-border mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle size={14} /> Auto-Saving Progress
                                        </span>
                                        <button
                                            onClick={handleCompleteModule}
                                            disabled={advancing}
                                            className="w-full sm:w-auto px-10 py-5 bg-primary text-white hover:bg-primary/90 active:scale-95 disabled:opacity-50 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20"
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
