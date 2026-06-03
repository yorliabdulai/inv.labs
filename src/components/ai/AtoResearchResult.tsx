"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { AtoResearchBrief } from "@/lib/ai/research/types";
import { deriveTradeIntent } from "@/lib/ai/ato-agent-trade-adapter";
import { TradeModal } from "@/components/trade/TradeModal";
import { type Stock, GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { useUserProfile } from "@/lib/useUserProfile";

type Props = {
  brief: AtoResearchBrief;
  onDeclineTrade?: () => void;
};

export function AtoResearchResult({ brief, onDeclineTrade }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [tradeStock, setTradeStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const { profile } = useUserProfile();

  const handleConfirmTrade = async () => {
    const intent = deriveTradeIntent(brief);
    if (intent.kind !== "stock") return;

    try {
      const response = await fetch(`${GSE_API_BASE}/live`, { cache: "no-store", mode: "cors" });
      if (!response.ok) return;
      const raw = await response.json();
      const mapped: Stock[] = raw.map((q: { name: string; price: number; change: number; volume: number }) => {
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
      console.error("Failed to load stock for trade:", e);
    }
  };

  const intent = deriveTradeIntent(brief);

  return (
    <div className="space-y-4">
      {brief.macroContext && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Bank of Ghana context
          </p>
          <p className="text-sm text-foreground">
            Policy rate: <span className="font-bold">{brief.macroContext.policyRate}%</span>
            {brief.macroContext.effectiveDate && (
              <span className="text-muted-foreground"> · effective {brief.macroContext.effectiveDate}</span>
            )}
          </p>
          <a
            href={brief.macroContext.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-[10px] text-primary hover:underline"
          >
            <ExternalLink size={10} />
            BoG source
          </a>
        </div>
      )}

      {brief.gseQuote && (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
            Live GSE price
          </p>
          <span className="font-bold">{brief.gseQuote.symbol}</span>
          <span className="text-muted-foreground"> · </span>
          GH₵{brief.gseQuote.price.toFixed(2)}
          <span
            className={
              brief.gseQuote.changePercent >= 0 ? " text-emerald-500 ml-2" : " text-red-500 ml-2"
            }
          >
            {brief.gseQuote.changePercent >= 0 ? "+" : ""}
            {brief.gseQuote.changePercent.toFixed(2)}% vs prior close
          </span>
          {brief.gseQuote.fetchedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Updated{" "}
              {new Date(brief.gseQuote.fetchedAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief.markdownSummary || brief.reasoning}</ReactMarkdown>
      </div>

      <div className="grid gap-3">
        <BriefSection title="Subject" content={brief.subject} />
        <BriefSection title="What it does" content={brief.whatItDoes} />
        <BriefSection title="Latest financial signal" content={brief.latestFinancialSignal} />
        <div className="p-4 rounded-2xl border border-border bg-muted/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Simulated recommendation
          </p>
          <p className="text-sm font-bold text-foreground uppercase">{brief.recommendation}</p>
          <p className="text-sm text-foreground/90 mt-2 whitespace-pre-line">{brief.reasoning}</p>
        </div>
      </div>

      {intent.kind === "stock" && !hasDeclined && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
            Simulated trade option
          </p>
          <p className="text-sm text-foreground mb-3">
            Open a simulated BUY ticket for <span className="font-bold">{intent.symbol}</span> on the GSE.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirmTrade}
              className="px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
            >
              Confirm trade ticket
              <ArrowRight size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                setHasDeclined(true);
                onDeclineTrade?.();
              }}
              className="px-3 py-1.5 rounded-full border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {(brief.citations?.length > 0 || brief.sources?.length > 0) && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Sources ({brief.citations?.length || brief.sources.length})
            {sourcesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {sourcesOpen && (
            <ul className="px-4 pb-4 space-y-3 max-h-48 overflow-y-auto">
              {(brief.citations?.length ? brief.citations : brief.sources.map((s, i) => ({
                index: i + 1,
                title: s.title,
                url: s.url,
                excerpt: s.snippet,
                type: "web" as const,
              }))).map((c) => (
                <li key={c.index} className="text-xs">
                  <span className="font-bold text-primary">[{c.index}]</span>{" "}
                  <span className="font-semibold text-foreground">{c.title}</span>
                  {"type" in c && c.type === "social" && (
                    <span className="ml-1 text-[9px] uppercase text-muted-foreground">(indexed web)</span>
                  )}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 mt-0.5 text-primary hover:underline truncate"
                  >
                    <ExternalLink size={10} />
                    {c.url}
                  </a>
                  {c.excerpt && (
                    <p className="mt-0.5 text-muted-foreground line-clamp-2">{c.excerpt}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-center">
        Educational & simulated only — not financial advice
      </p>

      {tradeStock && profile && (
        <TradeModal
          stock={tradeStock}
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          userBalance={Number(profile.cash_balance ?? 0)}
        />
      )}
    </div>
  );
}

function BriefSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-muted/10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground whitespace-pre-line">{content}</p>
    </div>
  );
}
