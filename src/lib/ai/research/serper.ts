import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import type { SerperSource } from "./types";

type SerperOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
  date?: string;
};

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeoutId) };
}

export function ghanaScopedQuery(userQuery: string, opts?: { scope?: "company" | "macro" }) {
  const q = userQuery.trim();
  const hasGhana = /\bghana\b/i.test(q);
  const hasGse = /\bGSE\b|\bghana stock exchange\b/i.test(q);
  const isMacro = opts?.scope === "macro" || /\bbank of ghana\b/i.test(q);

  if (isMacro) {
    return hasGhana ? q : `${q} Ghana`;
  }

  const suffixParts = [hasGhana ? null : "Ghana", hasGse ? null : "GSE"].filter(Boolean);

  return suffixParts.length ? `${q} ${suffixParts.join(" ")}` : q;
}

export async function serperSearch(
  query: string,
  opts?: { num?: number; type?: "search" | "news"; scope?: "company" | "macro" }
): Promise<SerperSource[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured.");
  }

  const { controller, clear } = withTimeout(20_000);
  try {
    const endpoint =
      opts?.type === "news"
        ? "https://google.serper.dev/news"
        : "https://google.serper.dev/search";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        q: ghanaScopedQuery(query, { scope: opts?.scope }),
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
    const organic: SerperOrganicResult[] = Array.isArray(data?.organic)
      ? data.organic
      : Array.isArray(data?.news)
        ? data.news
        : [];

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
        } satisfies SerperSource;
      })
      .filter(Boolean) as SerperSource[];
  } finally {
    clear();
  }
}

export function dedupeSources(sources: SerperSource[], cap = 20): SerperSource[] {
  const seen = new Set<string>();
  const out: SerperSource[] = [];
  for (const s of sources) {
    const key = s.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= cap) break;
  }
  return out;
}

export function classifyCitationType(url: string): import("./types").CitationType {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf") || u.includes(".pdf?")) return "pdf";
  if (u.includes("facebook.com") || u.includes("x.com") || u.includes("twitter.com"))
    return "social";
  if (u.includes("bog.gov.gh") || u.includes("gse.com.gh")) return "official";
  if (u.includes("news") || u.includes("graphic.com") || u.includes("myjoyonline"))
    return "news";
  return "web";
}
