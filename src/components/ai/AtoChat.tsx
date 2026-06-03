"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Send, AlertCircle, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { AtoChatBubble } from "./AtoChatBubble";
import { AtoSuggestions } from "./AtoSuggestions";
import { AtoResearchPanel } from "./AtoResearchPanel";
import { isAtoDeepResearchEnabled } from "@/lib/config/feature-flags";
import { KNOWN_METADATA } from "@/lib/market-data";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

type ChatView = "chat" | "research";

interface AtoChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  initialView?: ChatView;
  initialResearchSymbol?: string;
}

export function AtoChat({
  isOpen,
  onClose,
  onMinimize,
  initialView = "chat",
  initialResearchSymbol,
}: AtoChatProps) {
  const deepResearchEnabled = isAtoDeepResearchEnabled();
  const [view, setView] = useState<ChatView>(initialView);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [usage, setUsage] = useState({ used: 0, remaining: 15, limit: 15 });
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const researchMeta = initialResearchSymbol
    ? KNOWN_METADATA[initialResearchSymbol]
    : undefined;

  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  useEffect(() => {
    if (isOpen && view === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, view]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/ato/chat/history");
        if (response.ok) {
          const data = await response.json();
          if (data.messages?.length > 0) {
            setMessages(data.messages);
            if (data.conversationId) setConversationId(data.conversationId);
          }
          if (data.usage) {
            setUsage({
              used: data.usage.messagesUsed,
              remaining: data.usage.messagesRemaining,
              limit: data.usage.limit,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setInput("");

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
        body: JSON.stringify({ message: textToSend, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) setError(data.error);
        else throw new Error(data.error || "Failed to get response");
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.usage) {
        setUsage({
          used: data.usage.messagesUsed,
          remaining: data.usage.messagesRemaining,
          limit: data.usage.limit,
        });
      }

      try {
        const { awardXP } = await import("@/app/actions/xp");
        await awardXP("ATO_QUESTION");
      } catch (xpErr) {
        console.error("Failed to award XP for Ato question", xpErr);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message.";
      setError(msg);
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

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 md:w-[450px] h-[85vh] md:h-[700px] bg-card/95 backdrop-blur-2xl rounded-t-3xl md:rounded-2xl shadow-premium flex flex-col border border-border overflow-hidden transition-all duration-300 ease-out origin-bottom ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-muted/20 rounded-t-3xl md:rounded-t-2xl min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="text-white font-bold text-lg md:text-xl font-syne">A</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest truncate">
                Ato
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">
                {view === "research" ? "Deep Research" : "Chat"} · Ghana 🇬🇭
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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

        {deepResearchEnabled && (
          <div className="flex border-b border-border px-4 pt-2 gap-1">
            <button
              type="button"
              onClick={() => setView("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-t-lg transition-colors ${
                view === "chat"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare size={12} />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setView("research")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-t-lg transition-colors ${
                view === "research"
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles size={12} />
              Deep research
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-6 bg-transparent">
          {view === "research" && deepResearchEnabled ? (
            <AtoResearchPanel
              compact
              symbol={initialResearchSymbol}
              companyName={researchMeta?.name}
            />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8">
              <div className="text-center space-y-3">
                <h4 className="text-2xl font-instrument-serif text-foreground">
                  How can I help you today?
                </h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[260px]">
                  Chat for portfolio help, or switch to Deep research for filings, BoG rates & sources.
                </p>
              </div>
              <AtoSuggestions onSelect={(s) => handleSendMessage(s)} />
              {deepResearchEnabled && (
                <button
                  type="button"
                  onClick={() => setView("research")}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={12} />
                  Run deep research
                </button>
              )}
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
                <div className="flex gap-3 mb-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Loader2 size={14} className="text-white animate-spin" />
                  </div>
                  <div className="px-4 py-3 bg-muted/30 border border-border rounded-2xl text-[9px] text-primary font-bold uppercase tracking-widest">
                    Ato is thinking…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && view === "chat" && (
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
            </div>
          </div>
        )}

        {view === "chat" && (
          <>
            <div className="px-4 md:px-6 py-3 bg-muted/5 border-t border-border flex justify-between items-center gap-3 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">
                <span className="font-bold text-primary">{usage.remaining}</span> chat queries left
              </p>
            </div>

            <div className="p-3 md:p-6 border-t border-border bg-muted/20 rounded-b-3xl md:rounded-b-2xl">
              <div className="flex gap-2 md:gap-3 min-w-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Ato about market trends..."
                  className="flex-1 px-4 py-4 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:border-primary/50 text-sm"
                  rows={1}
                  disabled={isLoading || !!error}
                  maxLength={500}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading || !!error}
                  className="px-5 py-3 bg-primary text-white rounded-xl disabled:opacity-50 flex items-center justify-center min-w-[64px]"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              {deepResearchEnabled && (
                <button
                  type="button"
                  onClick={() => setView("research")}
                  className="mt-3 w-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
                >
                  <Sparkles size={10} />
                  Need filings & BoG context? Deep research
                </button>
              )}
              <div className="mt-3 flex items-center justify-center gap-1.5 opacity-60">
                <AlertCircle size={10} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                  Educational guidance only — not financial advice
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
