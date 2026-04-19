"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, CheckCircle2, TrendingUp, Award, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MilestoneCelebrationProps {
    type: 'first_trade' | 'trade_count' | 'level_up' | 'streak';
    title: string;
    description: string;
    value?: number | string;
    onClose: () => void;
}

export function MilestoneCelebration({ type, title, description, value, onClose }: MilestoneCelebrationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
        }, 8000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const Icon = type === 'first_trade' ? PartyPopper : 
                 type === 'trade_count' ? TrendingUp : 
                 type === 'level_up' ? Award : Zap;

    const colorClasses = type === 'first_trade' ? 'from-emerald-500 to-teal-600' :
                        type === 'trade_count' ? 'from-blue-500 to-indigo-600' :
                        type === 'level_up' ? 'from-violet-500 to-purple-600' : 
                        'from-orange-500 to-amber-600';

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 md:p-8">
                    {/* Confetti-like effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -20, opacity: 0, scale: 0 }}
                                animate={{ 
                                    y: [null, Math.random() * 800], 
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0.5],
                                    x: [null, (Math.random() - 0.5) * 400]
                                }}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                                className={`absolute left-1/2 top-0 w-2 h-2 rounded-full ${colorClasses} opacity-50`}
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-md w-full pointer-events-auto relative overflow-hidden"
                    >
                        {/* Gradient corner */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${colorClasses} opacity-20 blur-3xl rounded-full`} />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${colorClasses} flex items-center justify-center text-white shadow-2xl relative`}
                            >
                                <Icon size={48} strokeWidth={1.5} />
                                <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-sm -z-10" />
                            </motion.div>

                            <div className="space-y-2">
                                <motion.h3 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl font-bold font-syne tracking-tight text-foreground"
                                >
                                    {title}
                                </motion.h3>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-sm font-medium text-muted-foreground leading-relaxed"
                                >
                                    {description}
                                </motion.p>
                            </div>

                            {value && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="px-4 py-2 bg-muted/50 rounded-xl border border-border text-lg font-bold font-syne tabular-nums"
                                >
                                    {value}
                                </motion.div>
                            )}

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 500);
                                }}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm uppercase tracking-widest"
                            >
                                Continue Journey
                            </motion.button>
                        </div>

                        <button 
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 500);
                            }}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Helper to trigger milestone celebrations via toast system for lighter events
export const triggerXpToast = (xp: number, label: string) => {
    toast.success(`+${xp} XP`, {
        description: label,
        icon: <Zap className="text-amber-500" size={16} />
    });
};
