import React from 'react';

interface LevelBadgeProps {
    level: number;
    className?: string;
    showLabel?: boolean;
}

const LEVEL_COLORS: Record<number, string> = {
    1: 'from-slate-400 to-slate-500 shadow-slate-500/20',
    2: 'from-emerald-400 to-emerald-600 shadow-emerald-600/20',
    3: 'from-blue-400 to-blue-600 shadow-blue-600/20',
    4: 'from-violet-400 to-violet-600 shadow-violet-600/20',
    5: 'from-amber-400 to-amber-600 shadow-amber-600/20',
    6: 'from-red-400 to-red-600 shadow-red-600/20',
    7: 'from-fuchsia-400 to-fuchsia-600 shadow-fuchsia-600/20',
};

export function LevelBadge({ level, className = "", showLabel = false }: LevelBadgeProps) {
    const colorClass = LEVEL_COLORS[level] || LEVEL_COLORS[1];
    
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`
                relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 
                rounded-lg bg-gradient-to-br ${colorClass} 
                text-white font-bold text-[10px] sm:text-xs shadow-lg
                border border-white/20
            `}>
                <span className="relative z-10">{level}</span>
                <div className="absolute inset-0 bg-white/10 rounded-lg" />
            </div>
            {showLabel && (
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Level {level}
                </span>
            )}
        </div>
    );
}
