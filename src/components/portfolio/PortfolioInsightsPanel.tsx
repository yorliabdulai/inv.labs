"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

const INSIGHT_TYPES = [
  { id: "portfolio" as const, label: "Portfolio overview" },
  { id: "diversification" as const, label: "Diversification" },
  { id: "performance" as const, label: "Performance" },
];

export function PortfolioInsightsPanel() {
  const [activeType, setActiveType] = useState<"portfolio" | "diversification" | "performance">("portfolio");
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async (type: typeof activeType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ato/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load insight");
      setInsight(data.insight);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load insight");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight(activeType);
  }, [activeType]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-premium">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Ato quick insights
          </h3>
        </div>
        <button
          type="button"
          onClick={() => fetchInsight(activeType)}
          disabled={loading}
          className="p-2 rounded-lg border border-border hover:bg-muted/40 disabled:opacity-50"
          aria-label="Refresh insight"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {INSIGHT_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
              activeType === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 size={16} className="animate-spin text-primary" />
          Generating insight…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 py-4">{error}</p>
      )}

      {insight && !loading && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{insight}</p>
      )}

      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-4 text-center">
        Educational only — not financial advice
      </p>
    </div>
  );
}
