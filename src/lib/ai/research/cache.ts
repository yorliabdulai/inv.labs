import { createClient } from "@supabase/supabase-js";
import type { AtoResearchBrief } from "./types";
import { buildResearchCacheKey } from "./pipeline";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getCachedResearch(
  query: string,
  symbol?: string
): Promise<AtoResearchBrief | null> {
  try {
    const supabase = getSupabaseAdmin();
    const cacheKey = buildResearchCacheKey(query, symbol);
    const { data } = await supabase
      .from("ato_research_cache")
      .select("brief_json, created_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (!data?.brief_json) return null;
    const created = new Date(data.created_at).getTime();
    const ageHours = (Date.now() - created) / (1000 * 60 * 60);
    // Narrative cache only — live GSE prices are re-fetched on every response
    if (ageHours > 12) return null;

    return data.brief_json as AtoResearchBrief;
  } catch {
    return null;
  }
}

export async function setCachedResearch(
  query: string,
  symbol: string | undefined,
  brief: AtoResearchBrief
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const cacheKey = buildResearchCacheKey(query, symbol);
    await supabase.from("ato_research_cache").upsert(
      {
        cache_key: cacheKey,
        symbol: symbol?.toUpperCase() ?? null,
        query: query.slice(0, 500),
        brief_json: brief,
      },
      { onConflict: "cache_key" }
    );
  } catch (e) {
    console.error("setCachedResearch:", e);
  }
}
