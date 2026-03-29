"use client";

import React from 'react';
import { ACHIEVEMENTS } from '@/lib/gamification-config';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface AchievementsPanelProps {
    earnedAchievementKeys: string[];
}

export function AchievementsPanel({ earnedAchievementKeys }: AchievementsPanelProps) {
    const earnedSet = new Set(earnedAchievementKeys);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map((achievement, idx) => {
                    const isEarned = earnedSet.has(achievement.key);
                    const IconComponent = (Icons as any)[achievement.icon] || Icons.Trophy;
                    
                    return (
                        <motion.div
                            key={achievement.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`
                                relative p-5 rounded-2xl border transition-all duration-300
                                ${isEarned 
                                    ? 'bg-card border-border shadow-sm hover:shadow-md hover:border-primary/40' 
                                    : 'bg-muted/10 border-border/50 opacity-60 grayscale'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                    ${isEarned 
                                        ? 'bg-primary/10 text-primary border border-primary/20' 
                                        : 'bg-muted text-muted-foreground border border-border'
                                    }
                                `}>
                                    <IconComponent size={24} />
                                </div>
                                
                                <div className="space-y-1">
                                    <h4 className={`text-sm font-bold tracking-tight ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {achievement.name}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {achievement.description}
                                    </p>
                                </div>
                            </div>
                            
                            {isEarned && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                            )}
                            
                            {!isEarned && (
                                <div className="mt-4 pt-3 border-t border-border/30">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-muted-foreground/20 w-[0%]" />
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Locked</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
