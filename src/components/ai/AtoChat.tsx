"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Send, AlertCircle, Loader2 } from "lucide-react";
import { AtoChatBubble } from "./AtoChatBubble";
import { AtoSuggestions } from "./AtoSuggestions";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

interface AtoChatProps {
    isOpen: boolean;
    onClose: () => void;
    onMinimize?: () => void;
}

export function AtoChat({ isOpen, onClose, onMinimize }: AtoChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [usage, setUsage] = useState({ used: 0, remaining: 50, limit: 50 });
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input.trim();

        if (!textToSend || isLoading) return;

        setError(null);
        setInput("");

        // Add user message to UI immediately
        const userMessage: Message = {
            role: "user",
            content: textToSend,
            timestamp: new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/ato/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: textToSend,
                    conversationId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.limitReached) {
                    setError(data.error);
                } else {
                    throw new Error(data.error || "Failed to get response");
                }
                setIsLoading(false);
                return;
            }

            // Add assistant message
            const assistantMessage: Message = {
                role: "assistant",
                content: data.response,
                timestamp: new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Update conversation ID and usage
            if (data.conversationId) {
                setConversationId(data.conversationId);
            }
            if (data.usage) {
                setUsage({
                    used: data.usage.messagesUsed,
                    remaining: data.usage.messagesRemaining,
                    limit: data.usage.limit,
                });
            }
        } catch (err: any) {
            console.error("Error sending message:", err);
            setError(err.message || "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        setInput(suggestion);
        handleSendMessage(suggestion);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Chat panel */}
            <div className="fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 md:w-[400px] h-[85vh] md:h-[600px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">A</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900">Ato</h3>
                            <p className="text-xs text-gray-500">Your Investment Guide 🇬🇭</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onMinimize && (
                            <button
                                onClick={onMinimize}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                aria-label="Minimize"
                            >
                                <Minimize2 size={18} className="text-gray-600" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <AtoSuggestions onSelect={handleSuggestionSelect} />
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <AtoChatBubble
                                    key={index}
                                    role={message.role}
                                    content={message.content}
                                    timestamp={message.timestamp}
                                />
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <Loader2 size={16} className="text-white animate-spin" />
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">Ato is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Disclaimer footer */}
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs text-amber-800 text-center">
                        ⚠️ Educational info only, not financial advice •{" "}
                        <span className="font-bold">
                            {usage.remaining}/{usage.limit} messages left today
                        </span>
                    </p>
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
                    <div className="flex gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Ato anything about investing..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            rows={1}
                            disabled={isLoading || !!error}
                            maxLength={500}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading || !!error}
                            className="px-4 py-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[52px]"
                            aria-label="Send message"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                    {input.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {input.length}/500
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
