"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronRight, ChevronLeft, X, CheckCircle2, 
    Home, TrendingUp, PieChart, Briefcase, Award, 
    GraduationCap, User, Settings 
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { completeOnboarding } from "@/app/actions/gamification";

interface Step {
    id: string;
    targetId: string;
    title: string;
    description: string;
    icon: React.ElementType;
    position: "right" | "left" | "top" | "bottom" | "center";
}

const STEPS: Step[] = [
    {
        id: "welcome",
        targetId: "tour-nav-dashboard",
        title: "Welcome to inv.labs!",
        description: "Let's take a quick tour to show you how to master the market. This is your Dashboard, where you see your overall performance at a glance.",
        icon: Home,
        position: "right"
    },
    {
        id: "market",
        targetId: "tour-nav-stocks",
        title: "Market Scanner",
        description: "Scan the Ghana Stock Exchange for live quotes, top gainers, and market trends. You can bookmark stocks to track them easily.",
        icon: TrendingUp,
        position: "right"
    },
    {
        id: "mutual-funds",
        targetId: "tour-nav-mutual-funds",
        title: "Mutual Funds",
        description: "Explore curated mutual funds. Diversify your portfolio with managed assets and historical yield tracking.",
        icon: PieChart,
        position: "right"
    },
    {
        id: "portfolio",
        targetId: "tour-nav-portfolio",
        title: "Portfolio Tracker",
        description: "Track your real and simulated holdings. See your asset concentration and P&L in real-time.",
        icon: Briefcase,
        position: "right"
    },
    {
        id: "rankings",
        targetId: "tour-nav-rankings",
        title: "Global Leaderboard",
        description: "Compete with other traders! See where you rank globally based on your knowledge XP and trading performance.",
        icon: Award,
        position: "right"
    },
    {
        id: "education",
        targetId: "tour-nav-education",
        title: "Academy",
        description: "Level up your financial literacy. Complete courses, earn XP, and become an accredited investor.",
        icon: GraduationCap,
        position: "right"
    },
    {
        id: "profile",
        targetId: "tour-nav-profile",
        title: "Your Profile",
        description: "Manage your personal details, see your badges, and track your accreditation progress here.",
        icon: User,
        position: "right"
    },
    {
        id: "settings",
        targetId: "tour-nav-settings",
        title: "Settings",
        description: "Customize your experience, toggle between dark and light themes, and manage notifications.",
        icon: Settings,
        position: "right"
    }
];

const CARD_HEIGHT = 240; // conservative height estimate for clamping
const CARD_WIDTH = 320;
const CARD_GAP = 24;
const VIEWPORT_PADDING = 16;

export function OnboardingTour() {
    const { profile, refetch } = useUserProfile();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const currentStep = STEPS[currentStepIndex];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (profile && !profile.onboarding_completed && !localStorage.getItem("inv_onboarding_done")) {
            // Delay slightly to ensure layout is ready
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [profile]);

    const updateTargetRect = useCallback(() => {
        if (!isVisible) return;
        const elements = document.querySelectorAll(`[id="${currentStep.targetId}"]`);
        let targetElement: HTMLElement | null = null;
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Intelligent visibility check: skip the hidden desktop sidebar on mobile
            if (rect.width > 0 && rect.height > 0) {
                targetElement = el as HTMLElement;
            }
        });

        if (targetElement) {
            setTargetRect((targetElement as Element).getBoundingClientRect());
        }
    }, [isVisible, currentStep.targetId]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect, true);
        return () => {
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect, true);
        };
    }, [updateTargetRect]);

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const markDone = async () => {
        setIsVisible(false);
        localStorage.setItem("inv_onboarding_done", "true");
        await completeOnboarding();
        refetch();
    };

    const handleComplete = () => markDone();
    const handleSkip = () => markDone();

    if (!isVisible || !targetRect) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* Backdrop with Spotlight */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 pointer-events-auto"
                onClick={handleSkip}
                style={{
                    clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        ${targetRect.left - 8}px 100%, 
                        ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px 100%, 
                        100% 100%, 
                        100% 0%
                    )`
                }}
            />

            {/* Tooltip Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { type: "spring", damping: 25, stiffness: 300 }
                    }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-[101] pointer-events-auto"
                    style={(() => {
                        if (isMobile) {
                            return {
                                top: VIEWPORT_PADDING + 64, // below any top-bar
                                left: "50%",
                                transform: "translateX(-50%)",
                            };
                        }
                        const vh = window.innerHeight;
                        const vw = window.innerWidth;
                        const cardH = cardRef.current?.offsetHeight ?? CARD_HEIGHT;

                        let rawTop = targetRect.top;
                        if (currentStep.position === "bottom") rawTop = targetRect.bottom + CARD_GAP;
                        else if (currentStep.position === "top") rawTop = targetRect.top - cardH - CARD_GAP;

                        // Clamp vertically so card never goes off-screen
                        const clampedTop = Math.min(
                            Math.max(rawTop, VIEWPORT_PADDING),
                            vh - cardH - VIEWPORT_PADDING
                        );

                        let rawLeft = targetRect.right + CARD_GAP;
                        if (currentStep.position === "left") rawLeft = targetRect.left - CARD_WIDTH - CARD_GAP;
                        else if (currentStep.position === "center") rawLeft = targetRect.left;

                        // Clamp horizontally
                        const clampedLeft = Math.min(
                            Math.max(rawLeft, VIEWPORT_PADDING),
                            vw - CARD_WIDTH - VIEWPORT_PADDING
                        );

                        return { top: clampedTop, left: clampedLeft };
                    })()}
                >
                    <div ref={cardRef} className="w-[320px] bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden relative group">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
                            <motion.div 
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <currentStep.icon size={20} />
                            </div>
                            <button 
                                onClick={handleSkip}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                            aria-label="Skip tour"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-2">{currentStep.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {currentStep.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Step {currentStepIndex + 1} of {STEPS.length}
                            </span>
                            <div className="flex gap-2">
                                {currentStepIndex > 0 && (
                                    <button
                                        onClick={handleBack}
                                    className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-label="Previous step"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    {currentStepIndex === STEPS.length - 1 ? (
                                        <>Complete <CheckCircle2 size={16} /></>
                                    ) : (
                                        <>Next <ChevronRight size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
