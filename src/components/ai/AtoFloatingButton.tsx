"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

interface AtoFloatingButtonProps {
    onClick: () => void;
    hasUnread?: boolean;
}

export function AtoFloatingButton({ onClick, hasUnread = false }: AtoFloatingButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 group transition-all duration-500"
            aria-label="Open Ato AI Assistant"
        >
            {/* Main button */}
            <div className={`relative w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/50 flex items-center justify-center transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"
                } hover:shadow-amber-500/70`}>
                {/* Pulse animation */}
                <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20"></div>

                {/* Icon */}
                <div className="relative z-10">
                    {isHovered ? (
                        <Sparkles size={28} className="text-white animate-pulse" />
                    ) : (
                        <MessageCircle size={28} className="text-white" />
                    )}
                </div>

                {/* Unread indicator */}
                {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>
                )}
            </div>

            {/* Tooltip */}
            <div className={`absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}>
                Ask Ato 🇬🇭
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>

            {/* Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full shadow-lg border border-gray-200">
                <span className="text-xs font-black text-amber-600">Ato</span>
            </div>
        </button>
    );
}
