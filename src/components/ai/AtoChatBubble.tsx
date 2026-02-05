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
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4 animate-fade-in`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                    ? "bg-indigo-600"
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                }`}>
                {isUser ? (
                    <User size={16} className="text-white" />
                ) : (
                    <Bot size={16} className="text-white" />
                )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl ${isUser
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-900 rounded-tl-none"
                    }`}>
                    {/* Render content with basic markdown support */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {content.split('\n').map((line, i) => {
                            // Bold text
                            const boldRegex = /\*\*(.*?)\*\*/g;
                            const parts = line.split(boldRegex);

                            return (
                                <p key={i} className={i > 0 ? "mt-2" : ""}>
                                    {parts.map((part, j) =>
                                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-xs text-gray-400 mt-1 px-2">
                        {timestamp}
                    </span>
                )}
            </div>
        </div>
    );
}
