import { jsonrepair } from "jsonrepair";

export function extractJsonPayload(raw: string): string {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) text = fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

export function parseLlmJson<T>(raw: string): { ok: true; value: T } | { ok: false; error: string } {
  const payload = extractJsonPayload(raw);
  const attempts = [payload];

  try {
    const repaired = jsonrepair(payload);
    if (repaired !== payload) attempts.unshift(repaired);
  } catch {
    // jsonrepair could not fix; try raw parse paths below
  }

  let lastError = "Invalid JSON";
  for (const candidate of attempts) {
    try {
      return { ok: true, value: JSON.parse(candidate) as T };
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : lastError;
    }
  }

  const fallback = parseResearchBriefFallback(raw);
  if (fallback) return { ok: true, value: fallback as T };

  return { ok: false, error: lastError };
}

/** Last-resort extraction when JSON is badly truncated */
function parseResearchBriefFallback(raw: string): Record<string, unknown> | null {
  const pick = (key: string): string | undefined => {
    const re = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "s");
    const m = raw.match(re);
    if (m?.[1]) return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    return undefined;
  };

  const subject = pick("subject");
  const whatItDoes = pick("whatItDoes");
  const latestFinancialSignal = pick("latestFinancialSignal");
  const reasoning = pick("reasoning");
  if (!subject && !whatItDoes) return null;

  const recMatch = raw.match(/"recommendation"\s*:\s*"(buy|hold|pass)"/i);
  const symbolMatch = raw.match(/"symbol"\s*:\s*"([A-Z0-9]+)"/i);
  const assetTypeMatch = raw.match(/"assetType"\s*:\s*"(stock|mutual_fund|unknown)"/i);

  return {
    subject: subject || "Research brief",
    whatItDoes: whatItDoes || "",
    latestFinancialSignal: latestFinancialSignal || "See sources below.",
    recommendation: recMatch?.[1]?.toLowerCase() || "hold",
    reasoning: reasoning || "Insufficient structured output; review cited sources.",
    assetHint: symbolMatch
      ? { assetType: assetTypeMatch?.[1] || "stock", symbol: symbolMatch[1] }
      : { assetType: assetTypeMatch?.[1] || "unknown" },
  };
}

export function buildMarkdownSummary(fields: {
  subject: string;
  whatItDoes: string;
  latestFinancialSignal: string;
  recommendation: string;
  reasoning: string;
}): string {
  return [
    `## ${fields.subject}`,
    fields.whatItDoes,
    `**Latest financial signal:** ${fields.latestFinancialSignal}`,
    `**Simulated view (${fields.recommendation.toUpperCase()}):** ${fields.reasoning}`,
  ].join("\n\n");
}
