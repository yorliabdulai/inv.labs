import { GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { planResearchQueries } from "./query-planner";
import { resolveResearchEntity, formatEntityForSynthesis } from "./entity-resolver";
import { serperSearch, dedupeSources, classifyCitationType } from "./serper";
import { getLatestMacroSnapshot, formatMacroForPrompt } from "./macro-data-service";
import { fetchTopDocuments } from "./content-fetcher";
import type {
  AtoResearchBrief,
  ResearchStep,
  ResearchProgressEvent,
  SerperSource,
  AtoCitation,
} from "./types";
import { buildMarkdownSummary, parseLlmJson } from "./parse-llm-json";
import { completeOpenRouterChat } from "../openrouter-client";

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeoutId) };
}

type LlmBriefPayload = {
  subject: string;
  whatItDoes: string;
  latestFinancialSignal: string;
  recommendation: AtoResearchBrief["recommendation"];
  reasoning: string;
  assetHint?: AtoResearchBrief["assetHint"];
};

function normalizeRecommendation(
  value: unknown
): AtoResearchBrief["recommendation"] {
  const v = String(value ?? "hold").toLowerCase();
  if (v === "buy" || v === "hold" || v === "pass") return v;
  return "hold";
}

async function fetchGseQuote(symbol?: string): Promise<AtoResearchBrief["gseQuote"] | undefined> {
  if (!symbol) return undefined;
  try {
    const res = await fetch(`${GSE_API_BASE}/live`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const raw = await res.json();
    const q = raw.find((x: { name: string }) => x.name?.toUpperCase() === symbol.toUpperCase());
    if (!q) return undefined;
    const prev = q.price - q.change;
    return {
      symbol: q.name,
      price: q.price,
      changePercent: prev !== 0 ? (q.change / prev) * 100 : 0,
    };
  } catch {
    return undefined;
  }
}

function rankSourcesForEntity(sources: SerperSource[], entity: ReturnType<typeof resolveResearchEntity>): SerperSource[] {
  const sym = entity.symbol?.toLowerCase();
  const nameParts = entity.companyName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const score = (s: SerperSource): number => {
    const blob = `${s.title} ${s.url} ${s.snippet || ""}`.toLowerCase();
    let pts = 0;
    if (sym && (blob.includes(sym) || blob.includes(`${sym}.gh`))) pts += 40;
    for (const part of nameParts) {
      if (blob.includes(part)) pts += 15;
    }
    if (/zenith|bank of ghana|bog\.gov/i.test(blob) && sym === "zen") pts -= 30;
    if (/petroleum|zen\.gh|zen petroleum/i.test(blob)) pts += 25;
    if (/gse\.com\.gh|african-markets\.com.*zen/i.test(blob)) pts += 20;
    if (blob.includes("bank of ghana") && !/petroleum/i.test(blob)) pts -= 15;
    return pts;
  };

  return [...sources].sort((a, b) => score(b) - score(a));
}

function buildCitations(sources: SerperSource[]): AtoCitation[] {
  return sources.map((s, i) => ({
    index: i + 1,
    title: s.title,
    url: s.url,
    excerpt: s.snippet,
    type: classifyCitationType(s.url),
    date: s.date,
  }));
}

export async function synthesizeResearchBrief(args: {
  userQuery: string;
  entity: ReturnType<typeof resolveResearchEntity>;
  sources: SerperSource[];
  documents: { url: string; title: string; text: string }[];
  macroBlock: string;
  gseQuote?: AtoResearchBrief["gseQuote"];
}): Promise<AtoResearchBrief> {
  const sourcesBlock = args.sources
    .slice(0, 8)
    .map((s, idx) => {
      const snippet = s.snippet ? `\nSnippet: ${s.snippet.slice(0, 280)}` : "";
      const date = s.date ? `\nDate: ${s.date}` : "";
      return `SOURCE ${idx + 1}\nTitle: ${s.title}\nURL: ${s.url}${date}${snippet}`;
    })
    .join("\n\n");

  const docsBlock = args.documents
    .slice(0, 2)
    .map(
      (d, idx) =>
        `DOCUMENT ${idx + 1}\nTitle: ${d.title}\nURL: ${d.url}\nExcerpt:\n${d.text.slice(0, 1200)}`
    )
    .join("\n\n");

  const gseBlock = args.gseQuote
    ? `LIVE GSE QUOTE: ${args.gseQuote.symbol} @ GH₵${args.gseQuote.price.toFixed(2)} (${args.gseQuote.changePercent.toFixed(2)}% today)`
    : "";

  const system = [
    "You are Ato, a Ghana-focused investment research assistant for INV.LABS (simulated trading/education).",
    "Produce a structured brief using ONLY the provided sources and documents. Cite source numbers [1], [2] for every numeric claim.",
    "Social results are indexed web snippets, not live feeds.",
    "Return a single JSON object only. No markdown fences.",
    "",
    "JSON SCHEMA:",
    "{",
    '  "subject": string,',
    '  "whatItDoes": string,',
    '  "latestFinancialSignal": string,',
    '  "recommendation": "buy" | "hold" | "pass",',
    '  "reasoning": string,',
    '  "assetHint": { "assetType": "stock"|"mutual_fund"|"unknown", "symbol"?: string, "name"?: string }',
    "}",
    "",
    "RULES:",
    "- Keep every string value on ONE line (use spaces, not line breaks). Escape double quotes as \\\".",
    "- Use [1], [2] style source citations inside string fields where relevant.",
    "- If filings insufficient, state that clearly in latestFinancialSignal.",
    "- recommendation is for SIMULATED education only.",
    "- subject must be the resolved company name (or ticker + sector), never Bank of Ghana.",
  ].join("\n");

  const entityBlock = formatEntityForSynthesis(args.entity);

  const user = [
    `User request: ${args.userQuery}`,
    "",
    entityBlock,
    "",
    gseBlock,
    "",
    "=== MACRO CONTEXT (Bank of Ghana central bank — NOT the company) ===",
    args.macroBlock,
    "=== END MACRO CONTEXT ===",
    "",
    "Sources:",
    sourcesBlock || "(none)",
    "",
    "Extracted documents:",
    docsBlock || "(none)",
    "",
    "Produce JSON.",
  ]
    .filter(Boolean)
    .join("\n");

  let lastParseError = "Invalid JSON";

  for (let attempt = 0; attempt < 2; attempt++) {
    const extraSystem =
      attempt === 1
        ? "CRITICAL: Reply with ONE valid JSON object only. Single-line strings. No markdown fences."
        : undefined;

    const { content: raw } = await completeOpenRouterChat({
      temperature: 0.35,
      maxTokens: 2048,
      jsonMode: false,
      timeoutMs: 90_000,
      messages: [
        {
          role: "system",
          content: extraSystem ? `${system}\n\n${extraSystem}` : system,
        },
        { role: "user", content: user },
      ],
    });

    const parsed = parseLlmJson<LlmBriefPayload>(raw);
    if (parsed.ok) {
      const value = parsed.value;
      const recommendation = normalizeRecommendation(value.recommendation);

      const citations = buildCitations(args.sources);
      return {
        subject: value.subject || "Research brief",
        whatItDoes: value.whatItDoes || "",
        latestFinancialSignal: value.latestFinancialSignal || "",
        recommendation,
        reasoning: value.reasoning || "",
        markdownSummary: buildMarkdownSummary({
          subject: value.subject || "Research brief",
          whatItDoes: value.whatItDoes || "",
          latestFinancialSignal: value.latestFinancialSignal || "",
          recommendation,
          reasoning: value.reasoning || "",
        }),
        assetHint:
          value.assetHint?.symbol || args.entity.symbol
            ? {
                assetType: "stock" as const,
                symbol: value.assetHint?.symbol || args.entity.symbol,
                name: value.assetHint?.name || args.entity.companyName,
              }
            : value.assetHint,
        sources: args.sources.slice(0, 12),
        citations,
        macroContext: undefined,
        gseQuote: args.gseQuote,
      };
    }

    lastParseError = parsed.error;
  }

  throw new Error(`Research brief JSON parse failed: ${lastParseError}`);
}

export type RunResearchOptions = {
  userQuery: string;
  symbol?: string;
  onProgress?: (event: ResearchProgressEvent) => void;
};

export async function runDeepResearchPipeline(
  opts: RunResearchOptions
): Promise<AtoResearchBrief> {
  const entity = resolveResearchEntity(opts.userQuery, opts.symbol);
  const resolvedSymbol = entity.symbol ?? opts.symbol;

  const steps: ResearchStep[] = [];
  const emitStep = (step: ResearchStep) => {
    const idx = steps.findIndex((s) => s.id === step.id);
    if (idx >= 0) steps[idx] = step;
    else steps.push(step);
    opts.onProgress?.({ type: "step", step });
  };

  emitStep({ id: "gse", label: "Checking live GSE price…", status: "running" });
  const gseQuote = await fetchGseQuote(resolvedSymbol);
  emitStep({ id: "gse", label: "Checking live GSE price…", status: gseQuote ? "done" : "error" });

  emitStep({ id: "macro", label: "Pulling Bank of Ghana policy rate…", status: "running" });
  const macro = await getLatestMacroSnapshot();
  const macroBlock = formatMacroForPrompt(macro);
  emitStep({
    id: "macro",
    label: "Pulling Bank of Ghana policy rate…",
    status: macro ? "done" : "error",
  });

  const planned = planResearchQueries({ entity });

  let allSources: SerperSource[] = [];

  await Promise.all(
    planned.map(async (pq) => {
      emitStep({ id: pq.id, label: pq.label, status: "running" });
      try {
        const results = await serperSearch(pq.query, {
          num: 6,
          type: pq.searchType,
          scope: pq.scope,
        });
        allSources = dedupeSources([...allSources, ...results], 22);
        emitStep({ id: pq.id, label: pq.label, status: "done" });
      } catch {
        emitStep({ id: pq.id, label: pq.label, status: "error" });
      }
    })
  );

  allSources = rankSourcesForEntity(allSources, entity);

  emitStep({ id: "fetch", label: "Reading annual reports & key pages…", status: "running" });
  const documents = await fetchTopDocuments(allSources, 4);
  emitStep({
    id: "fetch",
    label: "Reading annual reports & key pages…",
    status: documents.length > 0 ? "done" : "error",
  });

  emitStep({ id: "synth", label: "Synthesizing research brief…", status: "running" });

  const brief = await synthesizeResearchBrief({
    userQuery: opts.userQuery,
    entity,
    sources: allSources,
    documents,
    macroBlock,
    gseQuote,
  });

  brief.researchSteps = steps.map((s) =>
    s.id === "synth" ? { ...s, status: "done" as const } : s
  );
  if (macro) {
    brief.macroContext = {
      policyRate: macro.policyRate,
      effectiveDate: macro.effectiveDate,
      sourceUrl: macro.sourceUrl,
      sefdPdfUrl: macro.sefdPdfUrl,
    };
  }

  if (!brief.assetHint?.symbol && resolvedSymbol) {
    brief.assetHint = {
      assetType: "stock",
      symbol: resolvedSymbol.toUpperCase(),
      name: entity.companyName,
    };
  }

  if (brief.subject && /bank of ghana/i.test(brief.subject) && !/petroleum/i.test(brief.subject)) {
    brief.subject = entity.companyName + (resolvedSymbol ? ` (${resolvedSymbol})` : "");
    brief.whatItDoes =
      brief.whatItDoes?.replace(/bank of ghana/gi, entity.companyName) || brief.whatItDoes;
  }

  emitStep({ id: "synth", label: "Synthesizing research brief…", status: "done" });
  opts.onProgress?.({ type: "brief", brief });

  return brief;
}

export function buildResearchCacheKey(query: string, symbol?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const base = symbol ? `${symbol.toUpperCase()}:${query.trim().toLowerCase()}` : query.trim().toLowerCase();
  return `${day}:${base.slice(0, 200)}`;
}
