"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Loader2, AlertCircle, ExternalLink, ArrowRight } from "lucide-react";
import type { AtoAgentBrief } from "@/lib/ai/ato-agent-service";
import { deriveTradeIntent } from "@/lib/ai/ato-agent-trade-adapter";
import { TradeModal } from "@/components/trade/TradeModal";
import { type Stock, GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { useUserProfile } from "@/lib/useUserProfile";

interface AtoAgentModeProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

export function AtoAgentMode({ isOpen, onClose, onMinimize }: AtoAgentModeProps) {
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState<AtoAgentBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const [tradeStock, setTradeStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { profile } = useUserProfile();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleRunAgent = async () => {
    const textToSend = query.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setHasConfirmed(false);
    setHasDeclined(false);
    setBrief(null);
    setTradeStock(null);

    setIsLoading(true);
    try {
      const response = await fetch("/api/ato/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run Agent Mode.");
      }

      setBrief(data.brief as AtoAgentBrief);
    } catch (err: any) {
      console.error("Ato Agent error:", err);
      setError(err.message || "Failed to run Agent Mode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRunAgent();
    }
  };

  const handleConfirmAction = async () => {
    if (!brief) return;
    setHasConfirmed(true);
    setHasDeclined(false);

    const intent = deriveTradeIntent(brief);
    if (intent.kind !== "stock") {
      return;
    }

    try {
      const response = await fetch(`${GSE_API_BASE}/live`, { cache: "no-store", mode: "cors" });
      if (!response.ok) return;
      const raw = await response.json();
      const mapped: Stock[] = raw.map((q: any) => {
        const meta = KNOWN_METADATA[q.name] ?? { name: q.name, sector: "Other" };
        const prev = q.price - q.change;
        return {
          symbol: q.name,
          name: meta.name,
          sector: meta.sector,
          price: q.price,
          change: q.change,
          changePercent: prev !== 0 ? (q.change / prev) * 100 : 0,
          volume: q.volume,
        };
      });
      const match = mapped.find((s) => s.symbol.toUpperCase() === intent.symbol.toUpperCase());
      if (match) {
        setTradeStock(match);
        setIsTradeModalOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch live stock data for Agent Mode trade:", e);
    }
  };

  const handleDeclineAction = () => {
    setHasDeclined(true);
    setHasConfirmed(false);
  };

  const renderTradeSection = () => {
    if (!brief) return null;

    const intent = deriveTradeIntent(brief);
    if (intent.kind === "none") {
      return (
        <div className="mt-4 p-4 rounded-2xl border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">{intent.reason}</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 rounded-2xl border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/20">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Simulated trade option
            </p>
            <p className="text-sm font-medium text-foreground">
              Execute a simulated BUY order for{" "}
              <span className="font-bold">{intent.symbol}</span> on the Ghana Stock Exchange.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>2-step confirmation</span>
            <ArrowRight size={12} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConfirmAction}
            className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm hover:bg-amber-600 active:scale-95"
          >
            Confirm &amp; open trade ticket
          </button>
          <button
            type="button"
            onClick={handleDeclineAction}
            className="px-3 py-1.5 rounded-full border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 active:scale-95"
          >
            No thanks
          </button>
        </div>

        {hasDeclined && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Got it — Ato will not place any simulated trades for this idea.
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Agent panel */}
      <div
        className={`fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 md:w-[450px] h-[85vh] md:h-[700px] bg-card/95 backdrop-blur-2xl rounded-t-3xl md:rounded-2xl shadow-premium flex flex-col border border-border overflow-hidden transition-all duration-300 ease-out origin-bottom ${
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-amber-50/70 dark:bg-amber-950/40 rounded-t-3xl md:rounded-t-2xl min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <span className="text-white font-bold text-lg md:text-xl font-syne">A</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest truncate">
                Ato Agent Mode
              </h3>
              <p className="text-[10px] text-amber-700 dark:text-amber-200 uppercase font-bold tracking-widest truncate">
                Research &amp; Simulated Orders
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-6 space-y-4 bg-transparent">
          {/* Input */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Ask Ato to research a specific company or investment idea with a Ghana market focus.
            </p>
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Example: Research MTN Ghana and tell me whether a simulated BUY makes sense right now."
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:border-amber-500/60 focus:bg-muted/40 text-sm text-foreground font-instrument-sans placeholder:text-muted-foreground/60 transition-all"
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Ghana-focused • External web research
              </p>
              <button
                type="button"
                onClick={handleRunAgent}
                disabled={!query.trim() || isLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                <span>Run research</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <p className="text-[11px] text-red-500">{error}</p>
            </div>
          )}

          {/* Brief */}
          {brief && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-border bg-muted/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Subject
                </p>
                <p className="text-sm font-semibold text-foreground">{brief.subject}</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  What the company / investment does
                </p>
                <p className="text-sm text-foreground whitespace-pre-line">{brief.whatItDoes}</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Latest financial signal
                </p>
                <p className="text-sm text-foreground whitespace-pre-line">{brief.latestFinancialSignal}</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Recommendation (simulated only)
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {brief.recommendation.toUpperCase()}
                </p>
                <p className="text-sm text-foreground whitespace-pre-line">{brief.reasoning}</p>
              </div>

              {/* Trade section */}
              {renderTradeSection()}

              {/* Sources */}
              {brief.sources && brief.sources.length > 0 && (
                <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Sources
                  </p>
                  <ul className="space-y-2">
                    {brief.sources.map((s, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{s.title}</span>
                        {s.date && <span className="ml-1 text-[10px] text-muted-foreground/80">({s.date})</span>}
                        {s.url && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              <ExternalLink size={10} />
                              <span className="truncate max-w-[220px]">{s.url}</span>
                            </a>
                          </div>
                        )}
                        {s.snippet && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground/90 line-clamp-2">
                            {s.snippet}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                All outputs are educational and for simulated trading only — not financial advice.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trade modal (reuses existing execution flow) */}
      {tradeStock && profile && (
        <TradeModal
          stock={tradeStock}
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          userBalance={Number(profile.cash_balance ?? 0)}
        />
      )}
    </>
  );
}

