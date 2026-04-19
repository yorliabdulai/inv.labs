"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Zap } from 'lucide-react';

interface FoundingMemberBannerProps {
    isFoundingMember: boolean;
    alreadyNotified: boolean;
    onDismiss: () => void;
}

export function FoundingMemberBanner({ isFoundingMember, alreadyNotified, onDismiss }: FoundingMemberBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isFoundingMember && !alreadyNotified) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isFoundingMember, alreadyNotified]);

    if (!isFoundingMember || alreadyNotified) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 mb-8"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Award size={120} />
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <Award className="text-white" size={32} />
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white font-syne tracking-tight flex items-center justify-center md:justify-start gap-2">
                                Congratulations 🎉
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest font-bold border border-white/10">Founding Member</span>
                            </h3>
                            <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
                                You are one of the first 1,000 members of inv.labs. As a token of our appreciation, 
                                you have been granted <strong>Lifetime Professional Access</strong> to the entire platform. 
                                Thank you for building the future of financial education with us.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-3 min-w-[140px]">
                            <button 
                                onClick={() => {
                                    setIsVisible(false);
                                    onDismiss();
                                }}
                                className="px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-95 text-sm"
                            >
                                Claim Access
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setIsVisible(false);
                            onDismiss();
                        }}
                        className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                        aria-label="Dismiss banner"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full bg-white/40"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function FoundingMemberBadge({ className = "" }: { className?: string }) {
    return (
        <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 
            bg-blue-500/10 text-blue-600 dark:text-blue-400 
            rounded-full border border-blue-500/20 
            text-[9px] font-bold uppercase tracking-widest 
            ${className}
        `}>
            <Award size={10} />
            Founding Member
        </div>
    );
}
