"use client";

import React from 'react';
import { LEVELS } from '@/lib/gamification-config';
import { LevelBadge } from './LevelBadge';
import { motion } from 'framer-motion';

interface XPProgressBarProps {
    currentXP: number;
    level: number;
    variant?: 'compact' | 'full';
}

export function XPProgressBar({ currentXP, level, variant = 'compact' }: XPProgressBarProps) {
    const currentLevelData = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevelData = LEVELS.find(l => l.level === level + 1);
    
    const minXP = currentLevelData.minXP;
    const maxXP = nextLevelData ? nextLevelData.minXP : currentXP + 1000; // Cap if max level
    
    const progress = Math.min(100, Math.max(0, ((currentXP - minXP) / (maxXP - minXP)) * 100));
    const xpToNext = nextLevelData ? nextLevelData.minXP - currentXP : 0;

    if (variant === 'compact') {
        return (
            <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                <div className="flex items-center justify-between">
                    <LevelBadge level={level} className="scale-75 -ml-2" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums">
                        {currentXP} / {maxXP} XP
                    </span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                        <LevelBadge level={level} className="scale-110" />
                        <div>
                            <h3 className="text-xl font-bold font-syne tracking-tight text-foreground">{currentLevelData.name}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Investor Growth Track</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-primary">{currentXP} Total XP</span>
                            <span className="text-muted-foreground">
                                {nextLevelData ? `${xpToNext} XP to ${nextLevelData.name}` : "Max Level Reached"}
                            </span>
                        </div>
                        <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden border border-border/50 p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 rounded-full shadow-lg shadow-primary/20"
                            />
                        </div>
                    </div>
                </div>
                
                {nextLevelData && (
                    <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl border border-primary/10 min-w-[120px]">
                        <div className="text-2xl font-bold font-syne text-primary">{level + 1}</div>
                        <div className="text-[8px] font-bold text-primary/60 uppercase tracking-tighter">Next Milestone</div>
                    </div>
                )}
            </div>
        </div>
    );
}
