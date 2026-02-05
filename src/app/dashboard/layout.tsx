"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AtoFloatingButton } from "@/components/ai/AtoFloatingButton";
import { AtoChat } from "@/components/ai/AtoChat";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            <Sidebar />

            <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-300 ease-out">
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:px-10 md:py-10 pb-24 md:pb-12 safe-area-inset-bottom">
                    {/* Mobile Header Spacer */}
                    <div className="h-2 md:hidden"></div>

                    {children}
                </main>
            </div>

            <BottomNav />

            {/* Ato AI Assistant */}
            <AtoFloatingButton onClick={() => setIsChatOpen(true)} />
            <AtoChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
}
