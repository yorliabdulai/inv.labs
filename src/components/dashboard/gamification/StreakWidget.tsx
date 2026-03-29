"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakWidgetProps {
    streak: number;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
    if (streak <= 0) return null;

    return (
        <div className={`
            flex items-center gap-2 px-4 py-3 rounded-2xl border bg-card shadow-sm
            ${streak >= 7 ? 'border-orange-500/30' : 'border-border'}
            transition-all duration-500 hover:shadow-md
        `}>
            <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-xl
                ${streak >= 30 ? 'bg-red-500/10 text-red-500' : 
                  streak >= 7 ? 'bg-orange-500/10 text-orange-500' : 
                  'bg-amber-500/10 text-amber-500'}
            `}>
                <Flame size={24} className={streak >= 7 ? 'animate-pulse' : ''} />
                
                {/* Visual feedback for high streaks */}
                {streak >= 7 && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-xl bg-orange-500/20 blur-md pointer-events-none" 
                    />
                )}
            </div>
            
            <div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold font-syne tracking-tight tabular-nums">
                        {streak}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Day Streak
                    </span>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                    {streak >= 30 ? 'Legendary Consistency' : 
                     streak >= 7 ? 'Habit of a Pro' : 
                     'Building Momentum'}
                </p>
            </div>
        </div>
    );
}
