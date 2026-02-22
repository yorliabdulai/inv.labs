"use client";

import { useState } from "react";
import { AtoFloatingButton } from "./AtoFloatingButton";
import { AtoChat } from "./AtoChat";

/**
 * Client component to handle the state of the Ato AI Assistant.
 * This keeps the main DashboardLayout as a Server Component.
 */
export function AtoChatContainer() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <AtoFloatingButton onClick={() => setIsChatOpen(true)} />
            <AtoChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
}
