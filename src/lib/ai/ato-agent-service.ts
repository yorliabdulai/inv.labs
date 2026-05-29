import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

type SerperOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
  date?: string;
};

export type AtoAgentSource = {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
};

export type AtoAgentRecommendation = "buy" | "hold" | "pass";

export type AtoAgentBrief = {
  subject: string;
  whatItDoes: string;
  latestFinancialSignal: string;
  recommendation: AtoAgentRecommendation;
  reasoning: string;
  assetHint?: {
    assetType: "stock" | "mutual_fund" | "unknown";
    symbol?: string; // GSE ticker when assetType === "stock"
    name?: string;
  };
  sources: AtoAgentSource[];
};

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeoutId) };
}

function ghanaScopedQuery(userQuery: string) {
  const q = userQuery.trim();
  const hasGhana = /\bghana\b/i.test(q);
  const hasGse = /\bGSE\b|\bghana stock exchange\b/i.test(q);

  // Keep this lightweight: gently bias toward Ghana finance sources.
  const suffixParts = [
    hasGhana ? null : "Ghana",
    hasGse ? null : "Ghana Stock Exchange",
    "financials",
  ].filter(Boolean);

  return suffixParts.length ? `${q} ${suffixParts.join(" ")}` : q;
}

export async function serperSearchGhana(
  query: string,
  opts?: { num?: number }
): Promise<AtoAgentSource[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured.");
  }

  const { controller, clear } = withTimeout(20_000);
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        q: ghanaScopedQuery(query),
        gl: "gh",
        hl: "en",
        num: Math.min(Math.max(opts?.num ?? 6, 3), 10),
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Serper error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const organic: SerperOrganicResult[] = Array.isArray(data?.organic) ? data.organic : [];

    return organic
      .map((r) => {
        const title = (r.title || "").trim();
        const url = (r.link || "").trim();
        if (!title || !url) return null;
        return {
          title,
          url,
          snippet: r.snippet?.trim() || undefined,
          date: r.date?.trim() || undefined,
        } satisfies AtoAgentSource;
      })
      .filter(Boolean) as AtoAgentSource[];
  } finally {
    clear();
  }
}

function safeJsonParse<T>(raw: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const slice = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw;
    return { ok: true, value: JSON.parse(slice) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Failed to parse JSON." };
  }
}

export async function synthesizeAtoAgentBrief(args: {
  userQuery: string;
  sources: AtoAgentSource[];
}): Promise<AtoAgentBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured for OpenRouter.");
  }

  const sourcesBlock = args.sources
    .slice(0, 8)
    .map((s, idx) => {
      const snippet = s.snippet ? `\nSnippet: ${s.snippet}` : "";
      const date = s.date ? `\nDate: ${s.date}` : "";
      return `SOURCE ${idx + 1}\nTitle: ${s.title}\nURL: ${s.url}${date}${snippet}`;
    })
    .join("\n\n");

  const system = [
    "You are Ato Agent Mode, a research assistant for INV.LABS (an investment simulator focused on Ghana).",
    "You must produce a structured brief based ONLY on the provided sources. If the sources are insufficient, say so clearly.",
    "Prefer Ghana-relevant context and Ghana market angles when possible.",
    "Return STRICT JSON and nothing else.",
    "",
    "JSON SCHEMA:",
    "{",
    '  \"subject\": string,',
    '  \"whatItDoes\": string,',
    '  \"latestFinancialSignal\": string,',
    '  \"recommendation\": \"buy\" | \"hold\" | \"pass\",',
    '  \"reasoning\": string,',
    "  \"assetHint\": {",
    '    \"assetType\": \"stock\" | \"mutual_fund\" | \"unknown\",',
    '    \"symbol\"?: string,',
    '    \"name\"?: string',
    "  },",
    "  \"sources\": [",
    "    { \"title\": string, \"url\": string, \"snippet\"?: string, \"date\"?: string }",
    "  ]",
    "}",
    "",
    "RULES:",
    "- Keep fields concise but specific (2–6 sentences per field).",
    "- \"latestFinancialSignal\" must reference a concrete signal (earnings, revenue, margins, dividend, share price move, regulatory event, or similar) and cite which SOURCE supports it.",
    "- The recommendation is for a SIMULATED trade decision only.",
    "- If you cannot confidently map to a tradable asset, set assetHint.assetType = \"unknown\".",
  ].join("\n");

  const user = [
    `User request: ${args.userQuery}`,
    "",
    "Sources:",
    sourcesBlock || "(No sources returned.)",
    "",
    "Now produce the JSON brief.",
  ].join("\n");

  const { controller, clear } = withTimeout(45_000);
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
        temperature: 0.4,
        max_tokens: 900,
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

    const parsed = safeJsonParse<AtoAgentBrief>(raw);
    if (!parsed.ok) {
      throw new Error(`Agent brief JSON parse failed: ${parsed.error}`);
    }

    // Ensure sources are always present and normalized.
    const brief = parsed.value;
    if (!Array.isArray(brief.sources) || brief.sources.length === 0) {
      brief.sources = args.sources;
    }
    brief.sources = brief.sources
      .filter((s) => s && typeof s.url === "string" && typeof s.title === "string")
      .slice(0, 10);

    return brief;
  } finally {
    clear();
  }
}

export async function runAtoResearchAgent(userQuery: string): Promise<AtoAgentBrief> {
  const sources = await serperSearchGhana(userQuery, { num: 6 });
  return await synthesizeAtoAgentBrief({ userQuery, sources });
}

