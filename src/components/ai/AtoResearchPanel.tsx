"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Search, Sparkles, AlertCircle } from "lucide-react";
import type { AtoResearchBrief, ResearchStep } from "@/lib/ai/research/types";
import { runAtoResearchStream } from "@/lib/ai/research/client";
import { isAtoDeepResearchEnabled } from "@/lib/config/feature-flags";
import { AtoResearchSteps } from "./AtoResearchSteps";
import { AtoResearchResult } from "./AtoResearchResult";

export type AtoResearchPanelProps = {
  initialQuery?: string;
  symbol?: string;
  companyName?: string;
  compact?: boolean;
  onResearchComplete?: (brief: AtoResearchBrief) => void;
};

export function AtoResearchPanel({
  initialQuery = "",
  symbol,
  companyName,
  compact = false,
  onResearchComplete,
}: AtoResearchPanelProps) {
  const deepEnabled = isAtoDeepResearchEnabled();
  const defaultQuery =
    initialQuery ||
    (symbol
      ? `Research ${companyName || symbol} (${symbol}) for Ghana market context and whether a simulated position makes sense.`
      : "");

  const [query, setQuery] = useState(defaultQuery);
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [brief, setBrief] = useState<AtoResearchBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleResearch = async () => {
    const text = query.trim();
    if (!text || isLoading || !deepEnabled) return;

    setError(null);
    setBrief(null);
    setSteps([]);
    setIsLoading(true);

    try {
      await runAtoResearchStream({
        query: text,
        symbol,
        onStep: (step) => {
          setSteps((prev) => {
            const idx = prev.findIndex((s) => s.id === step.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = step;
              return next;
            }
            return [...prev, step];
          });
        },
        onBrief: (b) => {
          setBrief(b);
          onResearchComplete?.(b);
        },
        onUsage: (u) => setUsage({ remaining: u.remaining, limit: u.limit }),
        onError: (msg) => setError(msg),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Research failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!deepEnabled) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Deep research is not enabled. Set NEXT_PUBLIC_ATO_DEEP_RESEARCH_ENABLED=true.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className="space-y-2">
        {!compact && (
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Deep research · Ghana sources
            </p>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleResearch();
            }
          }}
          placeholder="Research a GSE company, sector, or macro theme…"
          className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl resize-none focus:outline-none focus:border-primary/50 text-sm min-h-[80px]"
          disabled={isLoading}
          maxLength={500}
        />
        <div className="flex items-center justify-between gap-2">
          {usage && (
            <p className="text-[10px] text-muted-foreground">
              <span className="font-bold text-primary">{usage.remaining}</span> deep researches left today
            </p>
          )}
          <button
            type="button"
            onClick={handleResearch}
            disabled={!query.trim() || isLoading}
            className="ml-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Run deep research
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {(isLoading || steps.length > 0) && !brief && <AtoResearchSteps steps={steps} />}

      {brief && (
        <>
          {steps.length > 0 && <AtoResearchSteps steps={steps} />}
          <AtoResearchResult brief={brief} />
        </>
      )}
    </div>
  );
}
