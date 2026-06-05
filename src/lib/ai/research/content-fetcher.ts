import * as cheerio from "cheerio";
import type { SerperSource } from "./types";
import { classifyCitationType } from "./serper";

const MAX_DOC_CHARS = 8000;
const FETCH_TIMEOUT_MS = 12_000;

const ALLOWED_HOST_PATTERNS = [
  /\.gh$/i,
  /bog\.gov\.gh/i,
  /gse\.com\.gh/i,
  /facebook\.com/i,
  /x\.com/i,
  /twitter\.com/i,
  /graphic\.com\.gh/i,
  /myjoyonline\.com/i,
  /citinewsroom\.com/i,
  /businessghana\.com/i,
  /mtn\.com/i,
  /gcb\.com/i,
  /ecobank\.com/i,
  /standardchartered/i,
  /unilever/i,
  /fanmilk/i,
  /googleusercontent/i,
];

export type ExtractedDocument = {
  url: string;
  title: string;
  text: string;
  type: ReturnType<typeof classifyCitationType>;
};

function isAllowedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.endsWith(".pdf") || url.toLowerCase().includes(".pdf")) return true;
    return ALLOWED_HOST_PATTERNS.some((p) => p.test(host) || p.test(url));
  } catch {
    return false;
  }
}

function scoreSource(s: SerperSource): number {
  const u = s.url.toLowerCase();
  let score = 0;
  if (u.endsWith(".pdf") || u.includes(".pdf")) score += 100;
  if (u.includes("annual") || u.includes("financial") || u.includes("investor")) score += 50;
  if (u.includes("gse.com.gh")) score += 40;
  if (u.includes("bog.gov.gh")) score += 35;
  if (u.includes("facebook") || u.includes("x.com") || u.includes("twitter")) score += 15;
  if (s.snippet && s.snippet.length > 80) score += 10;
  return score;
}

export function rankSourcesForFetch(sources: SerperSource[], limit = 5): SerperSource[] {
  return [...sources]
    .filter((s) => isAllowedUrl(s.url))
    .sort((a, b) => scoreSource(b) - scoreSource(a))
    .slice(0, limit);
}

async function fetchWithTimeout(url: string): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "InvLabs/1.0 (educational research bot)",
        Accept: "text/html,application/pdf,*/*",
      },
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 4_000_000) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: Buffer.from(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return (result.text || "").replace(/\s+/g, " ").trim().slice(0, MAX_DOC_CHARS);
  } catch {
    return "";
  }
}

function extractHtmlText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript").remove();
  const text = $("main, article, [role=main], .content, body")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, MAX_DOC_CHARS);
}

export async function fetchTopDocuments(
  sources: SerperSource[],
  limit = 4
): Promise<ExtractedDocument[]> {
  const ranked = rankSourcesForFetch(sources, limit);
  const docs: ExtractedDocument[] = [];

  for (const s of ranked) {
    const buf = await fetchWithTimeout(s.url);
    if (!buf) continue;

    const header = new Uint8Array(buf.slice(0, 5));
    const isPdf =
      s.url.toLowerCase().includes(".pdf") ||
      (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46);

    let text = "";
    if (isPdf) {
      text = await extractPdfText(buf);
    } else {
      const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      text = extractHtmlText(html);
    }

    if (text.length < 120) continue;

    docs.push({
      url: s.url,
      title: s.title,
      text,
      type: classifyCitationType(s.url),
    });
  }

  return docs;
}
