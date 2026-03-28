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

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Chat panel */}
            <div 
                className={`fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 md:w-[450px] h-[85vh] md:h-[700px] bg-card/95 backdrop-blur-2xl rounded-t-3xl md:rounded-2xl shadow-premium flex flex-col border border-border overflow-hidden transition-all duration-300 ease-out origin-bottom ${
                    isOpen 
                        ? "opacity-100 translate-y-0 scale-100" 
                        : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 rounded-t-3xl md:rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl font-syne">A</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Ato</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Investment Intelligence 🇬🇭</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onMinimize && (
                            <button
                                onClick={onMinimize}
                                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                                aria-label="Minimize"
                            >
                                <Minimize2 size={18} className="text-muted-foreground" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-transparent">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-8">
                            <div className="text-center space-y-3">
                                <h4 className="text-2xl font-instrument-serif text-foreground">How can I help you today?</h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[240px]">Navigate the Ghana Stock Exchange with personalized insights.</p>
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
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Loader2 size={14} className="text-white animate-spin" />
                                    </div>
                                    <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border border-border rounded-2xl shadow-xl backdrop-blur-md">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                        <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Ato is analyzing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                        </div>
                    </div>
                )}

                {/* Usage/Disclaimer footer */}
                <div className="px-6 py-2.5 bg-muted/5 border-t border-border">
                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                        Institutional Grade Intelligence •{" "}
                        <span className="text-primary">
                            {usage.remaining}/{usage.limit} Queries Left
                        </span>
                    </p>
                </div>

                {/* Input area */}
                <div className="p-6 border-t border-border bg-muted/20 rounded-b-3xl md:rounded-b-2xl">
                    <div className="flex gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Ato about market trends..."
                            className="flex-1 px-4 py-4 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:border-primary/50 focus:bg-muted/40 text-sm text-foreground font-instrument-sans placeholder:text-muted-foreground/60 transition-all"
                            rows={1}
                            disabled={isLoading || !!error}
                            maxLength={500}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading || !!error}
                            className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center min-w-[64px] shadow-lg shadow-primary/20 active:scale-95"
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
