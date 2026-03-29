"use client";

import React from "react";
import { 
    Flame, 
    BookOpen, 
    Target, 
    MessageSquare, 
    ChevronRight,
    ArrowRight,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ActionSuggestion {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    buttonText: string;
    xpReward: number;
    color: string;
}

interface NextBestActionProps {
    streak: number;
    level: number;
    lastActiveDate: string | null;
    missions?: any[];
}

export function NextBestAction({ streak, level, lastActiveDate, missions = [] }: NextBestActionProps) {
    const today = new Date().toISOString().split('T')[0];
    const isStreakDoneToday = lastActiveDate === today;

    // Filter out missions already done
    const pendingMissions = missions.filter(m => !m.completed);
    
    let action: ActionSuggestion;

    if (isStreakDoneToday && pendingMissions.length === 0) {
        action = {
            id: "done",
            title: "Day Complete! 🎉",
            description: "You've finished all your missions and kept your streak alive. Rest up and come back tomorrow for new challenges!",
            icon: <Zap className="text-yellow-500" size={20} />,
            href: "/dashboard/portfolio",
            buttonText: "View Portfolio",
            xpReward: 0,
            color: "from-yellow-500/10 to-transparent"
        };
    } else if (isStreakDoneToday && pendingMissions.length > 0) {
        const nextMission = pendingMissions[0];
        const missionInfoMap: Record<string, { title: string; desc: string; icon: React.ReactNode; href: string }> = {
            'ask_ato': { title: "Ask Ato a question", desc: "Need help? Ato is available 24/7 to explain complex financial terms.", icon: <MessageSquare className="text-primary" size={20} />, href: "/dashboard?showAto=true" },
            'watch_video': { title: "Watch a Video", desc: "Level up your visual learning by watching a quick market breakdown.", icon: <Zap className="text-blue-500" size={20} />, href: "/dashboard/learn" },
            'review_portfolio': { title: "Review Portfolio", desc: "Check your weightings and sector allocation to stay balanced.", icon: <Target className="text-emerald-500" size={20} />, href: "/dashboard/portfolio" },
            'explore_stock': { title: "Explore a Stock", desc: "Research a new symbol to find your next major move.", icon: <ArrowRight className="text-amber-500" size={20} />, href: "/dashboard/market" },
            'complete_lesson': { title: "Finish a Lesson", desc: "Consistent learning is the key to institutional-grade trading.", icon: <BookOpen className="text-purple-500" size={20} />, href: "/dashboard/learn" },
        };
        
        const missionInfo = missionInfoMap[nextMission.mission_key] || { title: "Complete Mission", desc: "Finish your daily goals to earn bonus XP.", icon: <Zap className="text-primary" size={20} />, href: "/dashboard" };

        action = {
            id: nextMission.mission_key,
            title: missionInfo.title,
            description: missionInfo.desc,
            icon: missionInfo.icon,
            href: missionInfo.href,
            buttonText: "Go to Task",
            xpReward: nextMission.xp_reward,
            color: "from-primary/10 to-transparent"
        };
    } else {
        // Streak not done yet
        action = {
            id: "streak",
            title: "Keep the streak alive",
            description: `You're currently on a ${streak} day streak! Complete any action today to keep it going.`,
            icon: <Flame className="text-orange-500" size={20} />,
            href: "/dashboard/market",
            buttonText: "Start Daily Session",
            xpReward: 10,
            color: "from-orange-500/10 to-transparent"
        };
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
            {/* Background Accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-50`} />
            
            <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                </div>
                
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground font-syne tracking-tight">{action.title}</h4>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest">
                            <Zap size={10} />
                            +{action.xpReward} XP
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                        {action.description}
                    </p>
                </div>
                
                <Link 
                    href={action.href}
                    className="w-full sm:w-auto px-6 py-3 bg-foreground text-background rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn shadow-lg"
                >
                    {action.buttonText}
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
}
