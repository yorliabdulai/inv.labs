"use client";

import React from 'react';
import { INVESTOR_JOURNEY_STAGES } from '@/lib/gamification-config';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface InvestorJourneyMapProps {
    currentLevel: number;
}

export function InvestorJourneyMap({ currentLevel }: InvestorJourneyMapProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-premium overflow-hidden relative">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-10">Investor Evolution Track</h4>
            
            <div className="relative">
                {/* Horizontal Track Line */}
                <div className="absolute top-10 left-0 w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (currentLevel / 7) * 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500"
                    />
                </div>
                
                <div className="flex justify-between items-start relative z-10 w-full">
                    {INVESTOR_JOURNEY_STAGES.map((stage, idx) => {
                        const isUnlocked = currentLevel >= stage.minLevel;
                        const isCurrent = currentLevel >= stage.minLevel && (idx === INVESTOR_JOURNEY_STAGES.length - 1 || currentLevel < INVESTOR_JOURNEY_STAGES[idx+1].minLevel);
                        
                        return (
                            <div key={stage.id} className="flex flex-col items-center gap-4 text-center max-w-[120px]">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.15 }}
                                    className={`
                                        w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-500 relative
                                        ${isUnlocked 
                                            ? 'bg-card border-primary/40 text-primary shadow-lg shadow-primary/10' 
                                            : 'bg-muted/10 border-border text-muted-foreground opacity-50'
                                        }
                                        ${isCurrent ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}
                                    `}
                                >
                                    {isUnlocked ? (
                                        <div className="relative">
                                            <span className="text-xl font-bold font-syne">{idx + 1}</span>
                                            {isUnlocked && !isCurrent && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-background shadow-lg">
                                                    <Check size={10} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-lg font-bold font-syne opacity-50">{idx + 1}</span>
                                    )}
                                    
                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-2xl bg-primary/20 blur-md pointer-events-none"
                                        />
                                    )}
                                </motion.div>
                                
                                <div className="space-y-1">
                                    <h5 className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {stage.name}
                                    </h5>
                                    <p className="text-[9px] text-muted-foreground uppercase font-medium tracking-tighter leading-tight">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="mt-12 p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        iP
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Your Current Status: <span className="text-foreground ml-1">Stage {INVESTOR_JOURNEY_STAGES.findIndex(s => currentLevel >= s.minLevel && (currentLevel < (INVESTOR_JOURNEY_STAGES[INVESTOR_JOURNEY_STAGES.indexOf(s)+1]?.minLevel || 999))) + 1} Reached</span>
                    </div>
                </div>
                <button className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    Full Roadmap <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
}
