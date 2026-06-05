import { createClient } from "@supabase/supabase-js";
import type { MacroContext } from "./types";

const BOG_POLICY_URL = "https://www.bog.gov.gh/monetary-policy/policy-rate-trends/";
const BOG_HOME = "https://www.bog.gov.gh/";

export type MacroSnapshot = MacroContext & {
  sefdPdfUrl?: string;
  rawSummary?: string;
  fetchedAt: string;
};

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function parsePolicyRateFromHtml(html: string): { rate: number; effectiveDate: string } | null {
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const cells = rows[i].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (!cells || cells.length < 4) continue;
    const textCells = cells.map((c) =>
      c.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    );
    const rateStr = textCells[textCells.length - 1];
    const rate = parseFloat(rateStr);
    if (!Number.isFinite(rate) || rate < 1 || rate > 50) continue;
    const dateCell = textCells[textCells.length - 2] || textCells[1];
    return { rate, effectiveDate: dateCell };
  }

  const fallback = html.match(/(\d{1,2}\.\d)\s*%?\s*<\/td>\s*<\/tr>\s*<\/tbody>/i);
  if (fallback) {
    return { rate: parseFloat(fallback[1]), effectiveDate: new Date().toISOString().slice(0, 10) };
  }
  return null;
}

function findSefdPdfUrl(html: string): string | undefined {
  const match = html.match(
    /href="(https:\/\/www\.bog\.gov\.gh\/wp-content\/uploads\/[^"]+Summary-of-Economic-and-Financial-Data[^"]+\.pdf)"/i
  );
  return match?.[1];
}

export async function fetchMacroSnapshotFromWeb(): Promise<MacroSnapshot | null> {
  try {
    const [policyRes, homeRes] = await Promise.all([
      fetch(BOG_POLICY_URL, {
        headers: { "User-Agent": "InvLabs/1.0 (educational simulator)" },
        next: { revalidate: 0 },
      }),
      fetch(BOG_HOME, {
        headers: { "User-Agent": "InvLabs/1.0 (educational simulator)" },
        next: { revalidate: 0 },
      }),
    ]);

    if (!policyRes.ok) return null;
    const policyHtml = await policyRes.text();
    const parsed = parsePolicyRateFromHtml(policyHtml);
    if (!parsed) return null;

    let sefdPdfUrl: string | undefined;
    if (homeRes.ok) {
      const homeHtml = await homeRes.text();
      sefdPdfUrl = findSefdPdfUrl(homeHtml);
    }

    return {
      policyRate: parsed.rate,
      effectiveDate: parsed.effectiveDate,
      sourceUrl: BOG_POLICY_URL,
      sefdPdfUrl,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("fetchMacroSnapshotFromWeb:", e);
    return null;
  }
}

export async function upsertMacroSnapshot(snapshot: MacroSnapshot): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("macro_snapshots").insert({
    policy_rate: snapshot.policyRate,
    policy_rate_effective_date: snapshot.effectiveDate,
    policy_rate_source_url: snapshot.sourceUrl,
    sefd_pdf_url: snapshot.sefdPdfUrl ?? null,
    raw_summary: snapshot.rawSummary ?? null,
    fetched_at: snapshot.fetchedAt,
  });
}

export async function getLatestMacroSnapshot(): Promise<MacroSnapshot | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("macro_snapshots")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.policy_rate != null) {
      return {
        policyRate: Number(data.policy_rate),
        effectiveDate: data.policy_rate_effective_date || "",
        sourceUrl: data.policy_rate_source_url || BOG_POLICY_URL,
        sefdPdfUrl: data.sefd_pdf_url || undefined,
        rawSummary: data.raw_summary || undefined,
        fetchedAt: data.fetched_at,
      };
    }
  } catch {
    // Table may not exist yet
  }

  const fresh = await fetchMacroSnapshotFromWeb();
  if (fresh) {
    try {
      await upsertMacroSnapshot(fresh);
    } catch {
      // ignore write failures
    }
  }
  return fresh;
}

export function formatMacroForPrompt(macro: MacroSnapshot | null): string {
  if (!macro) return "BANK OF GHANA MACRO: Unavailable at this time.";
  return [
    "BANK OF GHANA MACRO (cached):",
    `- Monetary policy rate: ${macro.policyRate}%`,
    `- Effective: ${macro.effectiveDate}`,
    `- Source: ${macro.sourceUrl}`,
    macro.sefdPdfUrl ? `- Latest SEFD PDF: ${macro.sefdPdfUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
