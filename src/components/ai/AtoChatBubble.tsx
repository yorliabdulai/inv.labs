"use client";

import { Bot, User } from "lucide-react";

interface AtoChatBubbleProps {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

export function AtoChatBubble({ role, content, timestamp }: AtoChatBubbleProps) {
    const isUser = role === "user";

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6 animate-fade-in`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg ${isUser
                ? "bg-zinc-800 border-white/[0.06]"
                : "bg-blue-600 border-blue-500/30 shadow-blue-600/20"
                }`}>
                {isUser ? (
                    <User size={14} className="text-white" />
                ) : (
                    <Bot size={14} className="text-white" />
                )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-xl transition-all hover:scale-[1.01] ${isUser
                    ? "bg-blue-600 text-white border border-blue-500/30"
                    : "bg-white/[0.05] text-white border border-white/[0.06] backdrop-blur-md"
                    }`}>
                    {/* Render content with basic markdown support */}
                    <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words font-instrument-sans">
                        {content.split('\n').map((line, i) => {
                            // Bold text
                            const boldRegex = /\*\*(.*?)\*\*/g;
                            const parts = line.split(boldRegex);

                            return (
                                <p key={i} className={i > 0 ? "mt-2" : ""}>
                                    {parts.map((part, j) =>
                                        j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[9px] text-zinc-500 mt-2 px-1 uppercase tracking-widest font-bold">
                        {timestamp}
                    </span>
                )}
            </div>
        </div>
    );
}
