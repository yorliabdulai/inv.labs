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
            <div className="fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 md:w-[450px] h-[85vh] md:h-[650px] bg-[#F9F9F9] rounded-t-3xl md:rounded-[2px] shadow-3xl flex flex-col animate-slide-up border border-black/5">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#121417] rounded-t-3xl md:rounded-[2px]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[2px] bg-[#C05E42] flex items-center justify-center shadow-lg shadow-[#C05E42]/20">
                            <span className="text-[#F9F9F9] font-black text-xl font-instrument-serif">A</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em]">Ato</h3>
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Investment Intelligence 🇬🇭</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onMinimize && (
                            <button
                                onClick={onMinimize}
                                className="p-2 hover:bg-white/10 rounded-[2px] transition-colors"
                                aria-label="Minimize"
                            >
                                <Minimize2 size={18} className="text-white/60" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-[2px] transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} className="text-white/60" />
                        </button>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#F9F9F9]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-8">
                            <div className="text-center space-y-2">
                                <h4 className="text-xl font-instrument-serif text-[#121417]">How can I help you today?</h4>
                                <p className="text-xs text-black/40 font-medium max-w-[240px]">Navigate the Ghana Stock Exchange with personalized insights.</p>
                            </div>
                            <AtoSuggestions onSelect={handleSuggestionSelect} />
                        </div>
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
                                <div className="flex gap-3 mb-6 animate-fade-in">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-[2px] bg-[#C05E42] flex items-center justify-center">
                                        <Loader2 size={14} className="text-[#F9F9F9] animate-spin" />
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-black/5 rounded-[2px] shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-[#C05E42] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-1 h-1 bg-[#C05E42] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-1 h-1 bg-[#C05E42] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                        <span className="text-[10px] text-[#C05E42] font-black uppercase tracking-widest">Ato is analyzing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="px-6 py-3 bg-[#EF4444]/5 border-t border-[#EF4444]/10">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider">{error}</p>
                        </div>
                    </div>
                )}

                {/* Usage/Disclaimer footer */}
                <div className="px-6 py-2 bg-black/[0.02] border-t border-black/5">
                    <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest text-center">
                        Institutional Grade Intelligence •{" "}
                        <span className="text-[#C05E42]">
                            {usage.remaining}/{usage.limit} Queries Left
                        </span>
                    </p>
                </div>

                {/* Input area */}
                <div className="p-6 border-t border-black/5 bg-white rounded-b-3xl md:rounded-[2px]">
                    <div className="flex gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Message Ato..."
                            className="flex-1 px-4 py-3 border border-black/10 rounded-[2px] resize-none focus:outline-none focus:border-[#C05E42] text-sm font-instrument-sans placeholder:text-black/20"
                            rows={1}
                            disabled={isLoading || !!error}
                            maxLength={500}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading || !!error}
                            className="px-5 py-3 bg-[#121417] text-[#F9F9F9] rounded-[2px] hover:bg-[#C05E42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px] shadow-lg shadow-black/10"
                            aria-label="Send message"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
