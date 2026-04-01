"use client";

import { useState, useEffect } from "react";
import { AtoFloatingButton } from "./AtoFloatingButton";
import { AtoChat } from "./AtoChat";

/**
 * Client component to handle the state of the Ato AI Assistant.
 * This keeps the main DashboardLayout as a Server Component.
 */
export function AtoChatContainer() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "j" || e.key === "K" || e.key === "J")) {
                e.preventDefault();
                setIsChatOpen(prev => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {!isChatOpen && <AtoFloatingButton onClick={() => setIsChatOpen(true)} />}
            <AtoChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
}
