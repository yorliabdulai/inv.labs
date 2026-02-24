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
            <div className={`flex-shrink-0 w-8 h-8 rounded-[2px] flex items-center justify-center border ${isUser
                ? "bg-[#121417] border-white/10"
                : "bg-[#C05E42] border-[#C05E42]/20"
                }`}>
                {isUser ? (
                    <User size={14} className="text-[#F9F9F9]" />
                ) : (
                    <Bot size={14} className="text-[#F9F9F9]" />
                )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-[2px] ${isUser
                    ? "bg-[#121417] text-[#F9F9F9] border border-white/10"
                    : "bg-[#F9F9F9] text-[#121417] border border-black/5 shadow-sm"
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
                    <span className="text-[10px] text-black/30 md:text-white/30 mt-1.5 px-1 uppercase tracking-widest font-bold">
                        {timestamp}
                    </span>
                )}
            </div>
        </div>
    );
}
