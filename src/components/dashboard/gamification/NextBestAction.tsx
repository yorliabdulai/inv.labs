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

export function NextBestAction() {
    // In a real app, this would be computed based on user state (missions left, streak status, etc.)
    const suggestions: ActionSuggestion[] = [
        {
            id: "streak",
            title: "Keep the streak alive",
            description: "You're 1 day away from a 3-day flame! Log in tomorrow to claim 50 bonus XP.",
            icon: <Flame className="text-orange-500" size={20} />,
            href: "/dashboard/learn",
            buttonText: "Go to Academy",
            xpReward: 50,
            color: "from-orange-500/10 to-transparent"
        },
        {
            id: "ato",
            title: "Ask Ato a question",
            description: "Need help understanding P/E ratios? Ato can explain it in seconds.",
            icon: <MessageSquare className="text-primary" size={20} />,
            href: "/dashboard?showAto=true",
            buttonText: "Ask Ato",
            xpReward: 15,
            color: "from-primary/10 to-transparent"
        },
        {
            id: "lesson",
            title: "Master the Basics",
            description: "Complete 'Intro to Stock Markets' to unlock the Explorer badge.",
            icon: <BookOpen className="text-emerald-500" size={20} />,
            href: "/dashboard/learn",
            buttonText: "Continue Learning",
            xpReward: 100,
            color: "from-emerald-500/10 to-transparent"
        }
    ];

    // Pick one random suggestion or based on logic
    const action = suggestions[Math.floor(Math.random() * suggestions.length)];

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
