"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { getDailyMissions, completeMission } from '@/app/actions/xp';
import { toast } from 'sonner';

export function DailyMissionsWidget() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            const data = await getDailyMissions();
            setMissions(data);
            setLoading(false);
        };
        fetchMissions();
    }, []);

    const handleComplete = async (missionKey: string) => {
        // Optimistic update
        setMissions(prev => prev.map(m => 
            m.mission_key === missionKey ? { ...m, completed: true } : m
        ));

        const result = await completeMission(missionKey);
        
        if (result.success) {
            toast.success(`Mission Accomplished! +${result.xp_awarded || 20} XP`, {
                description: "You're building the habit of a thoughtful investor.",
                icon: <Zap className="text-amber-500" size={16} />
            });
        } else {
            // Revert on error
            setMissions(prev => prev.map(m => 
                m.mission_key === missionKey ? { ...m, completed: false } : m
            ));
            toast.error("Cloud sync failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] space-y-4">
                <Loader2 size={24} className="text-primary animate-spin" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading Missions</p>
            </div>
        );
    }

    if (!missions || missions.length === 0) return null;

    const completedCount = missions.filter(m => m.completed).length;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Daily Missions
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {completedCount} of {missions.length} Completed
                    </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                    <Zap size={14} className="fill-primary/20" />
                    <span className="text-xs font-bold tabular-nums">+{missions.reduce((acc, m) => acc + (m.completed ? 0 : m.xp_reward), 0)} XP</span>
                </div>
            </div>

            <div className="space-y-3">
                {missions.map((mission, idx) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
                            flex items-center gap-3 p-3 rounded-xl border transition-all
                            ${mission.completed 
                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                                : 'bg-muted/20 border-border hover:border-primary/40 cursor-default'
                            }
                        `}
                    >
                        <div className={`flex-shrink-0 ${mission.completed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {mission.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${mission.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {mission.mission_key === 'watch_video' ? 'Watch an educational video' :
                                 mission.mission_key === 'ask_ato' ? 'Ask Ato a financial question' :
                                 mission.mission_key === 'review_portfolio' ? 'Review your portfolio' :
                                 mission.mission_key === 'explore_stock' ? 'Explore a new stock' :
                                 mission.mission_key === 'complete_lesson' ? 'Complete a lesson' : 'Daily Mission'}
                            </p>
                        </div>
                        <div className="text-[10px] font-bold text-primary tabular-nums">
                            +{mission.xp_reward}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mr-4">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / missions.length) * 100}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                        />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                        {completedCount === missions.length ? 'All Clear!' : 'Keep Going'}
                    </span>
                </div>
            </div>
        </div>
    );
}
