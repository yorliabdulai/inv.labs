"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { AtoFloatingButton } from "./AtoFloatingButton";
import { AtoChat } from "./AtoChat";

/**
 * Client component to handle the state of the Ato AI Assistant.
 * This keeps the main DashboardLayout as a Server Component.
 */
export function AtoChatContainer() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "j" || e.key === "K" || e.key === "J")) {
                e.preventDefault();
                if (isMinimized) {
                    setIsMinimized(false);
                } else {
                    setIsChatOpen(prev => !prev);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMinimized]);

    const handleOpen = () => {
        setIsMinimized(false);
        setIsChatOpen(true);
    };

    const handleClose = () => {
        setIsChatOpen(false);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
    };

    return (
        <>
            {/* Floating button — only when chat is fully closed */}
            {!isChatOpen && !isMinimized && <AtoFloatingButton onClick={handleOpen} />}

            {/* Minimized pill — compact restore bar shown at bottom-right */}
            {isMinimized && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-xl backdrop-blur-sm hover:bg-muted/60 transition-all active:scale-95"
                    aria-label="Restore Ato chat"
                >
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <span className="text-xs font-bold text-foreground uppercase tracking-widest">Ato</span>
                    <Maximize2 size={13} className="text-muted-foreground" />
                </button>
            )}

            {/* Full chat panel */}
            <AtoChat
                isOpen={isChatOpen && !isMinimized}
                onClose={handleClose}
                onMinimize={handleMinimize}
            />
        </>
    );
}
