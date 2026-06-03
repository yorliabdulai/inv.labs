import { GSE_API_BASE, KNOWN_METADATA } from "@/lib/market-data";
import { planResearchQueries } from "./query-planner";
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

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeoutId) };
}

function safeJsonParse<T>(raw: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const slice = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw;
    return { ok: true, value: JSON.parse(slice) as T };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to parse JSON.";
    return { ok: false, error: msg };
  }
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
  symbol?: string;
  sources: SerperSource[];
  documents: { url: string; title: string; text: string }[];
  macroBlock: string;
  gseQuote?: AtoResearchBrief["gseQuote"];
}): Promise<AtoResearchBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured for OpenRouter.");
  }

  const sourcesBlock = args.sources
    .slice(0, 12)
    .map((s, idx) => {
      const snippet = s.snippet ? `\nSnippet: ${s.snippet}` : "";
      const date = s.date ? `\nDate: ${s.date}` : "";
      return `SOURCE ${idx + 1}\nTitle: ${s.title}\nURL: ${s.url}${date}${snippet}`;
    })
    .join("\n\n");

  const docsBlock = args.documents
    .map((d, idx) => `DOCUMENT ${idx + 1}\nTitle: ${d.title}\nURL: ${d.url}\nExcerpt:\n${d.text.slice(0, 6000)}`)
    .join("\n\n");

  const gseBlock = args.gseQuote
    ? `LIVE GSE QUOTE: ${args.gseQuote.symbol} @ GH₵${args.gseQuote.price.toFixed(2)} (${args.gseQuote.changePercent.toFixed(2)}% today)`
    : "";

  const system = [
    "You are Ato, a Ghana-focused investment research assistant for INV.LABS (simulated trading/education).",
    "Produce a structured brief using ONLY the provided sources and documents. Cite source numbers [1], [2] for every numeric claim.",
    "Social results are indexed web snippets, not live feeds.",
    "Return STRICT JSON only.",
    "",
    "JSON SCHEMA:",
    "{",
    '  "subject": string,',
    '  "whatItDoes": string,',
    '  "latestFinancialSignal": string,',
    '  "recommendation": "buy" | "hold" | "pass",',
    '  "reasoning": string,',
    '  "markdownSummary": string (2-4 paragraphs with [n] citations),',
    '  "assetHint": { "assetType": "stock"|"mutual_fund"|"unknown", "symbol"?: string, "name"?: string },',
    "}",
    "",
    "RULES:",
    "- markdownSummary must use inline [1] style citations matching SOURCE numbers.",
    "- If filings insufficient, state that clearly in latestFinancialSignal.",
    "- recommendation is for SIMULATED education only.",
  ].join("\n");

  const user = [
    `User request: ${args.userQuery}`,
    args.symbol ? `GSE symbol hint: ${args.symbol}` : "",
    gseBlock,
    args.macroBlock,
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

  const { controller, clear } = withTimeout(60_000);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://invlabs.com",
        "X-Title": "INV.LABS",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openrouter/free",
        temperature: 0.35,
        max_tokens: 1200,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`OpenRouter error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error("OpenRouter returned an empty response.");
    }

    const parsed = safeJsonParse<{
      subject: string;
      whatItDoes: string;
      latestFinancialSignal: string;
      recommendation: AtoResearchBrief["recommendation"];
      reasoning: string;
      markdownSummary: string;
      assetHint?: AtoResearchBrief["assetHint"];
    }>(raw);

    if (!parsed.ok) {
      throw new Error(`Research brief JSON parse failed: ${parsed.error}`);
    }

    const citations = buildCitations(args.sources);
    const value = parsed.value;

    return {
      ...value,
      markdownSummary:
        value.markdownSummary ||
        [value.whatItDoes, value.latestFinancialSignal, value.reasoning].filter(Boolean).join("\n\n"),
      sources: args.sources.slice(0, 12),
      citations,
      macroContext: undefined,
      gseQuote: args.gseQuote,
    };
  } finally {
    clear();
  }
}

export type RunResearchOptions = {
  userQuery: string;
  symbol?: string;
  onProgress?: (event: ResearchProgressEvent) => void;
};

export async function runDeepResearchPipeline(
  opts: RunResearchOptions
): Promise<AtoResearchBrief> {
  const steps: ResearchStep[] = [];
  const emitStep = (step: ResearchStep) => {
    const idx = steps.findIndex((s) => s.id === step.id);
    if (idx >= 0) steps[idx] = step;
    else steps.push(step);
    opts.onProgress?.({ type: "step", step });
  };

  emitStep({ id: "gse", label: "Checking live GSE price…", status: "running" });
  const gseQuote = await fetchGseQuote(opts.symbol);
  emitStep({ id: "gse", label: "Checking live GSE price…", status: gseQuote ? "done" : "error" });

  emitStep({ id: "macro", label: "Pulling Bank of Ghana policy rate…", status: "running" });
  const macro = await getLatestMacroSnapshot();
  const macroBlock = formatMacroForPrompt(macro);
  emitStep({
    id: "macro",
    label: "Pulling Bank of Ghana policy rate…",
    status: macro ? "done" : "error",
  });

  const planned = planResearchQueries({
    userQuery: opts.userQuery,
    symbol: opts.symbol,
  });

  let allSources: SerperSource[] = [];

  await Promise.all(
    planned.map(async (pq) => {
      emitStep({ id: pq.id, label: pq.label, status: "running" });
      try {
        const results = await serperSearch(pq.query, {
          num: 6,
          type: pq.searchType,
        });
        allSources = dedupeSources([...allSources, ...results], 22);
        emitStep({ id: pq.id, label: pq.label, status: "done" });
      } catch {
        emitStep({ id: pq.id, label: pq.label, status: "error" });
      }
    })
  );

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
    symbol: opts.symbol,
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

  if (!brief.assetHint?.symbol && opts.symbol) {
    const meta = KNOWN_METADATA[opts.symbol.toUpperCase()];
    brief.assetHint = {
      assetType: "stock",
      symbol: opts.symbol.toUpperCase(),
      name: meta?.name,
    };
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
