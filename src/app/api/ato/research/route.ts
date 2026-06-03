import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAtoDeepResearchEnabled } from "@/lib/config/feature-flags";
import { runDeepResearchPipeline } from "@/lib/ai/research/pipeline";
import { getCachedResearch, setCachedResearch } from "@/lib/ai/research/cache";
import type { ResearchProgressEvent } from "@/lib/ai/research/types";

const RESEARCH_RATE_LIMIT = 5;

function sseEncode(event: ResearchProgressEvent | Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  if (!isAtoDeepResearchEnabled()) {
    return new Response(JSON.stringify({ error: "Deep research is currently disabled." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const symbol = typeof body?.symbol === "string" ? body.symbol.trim().toUpperCase() : undefined;
  const stream = body?.stream !== false;

  if (!query) {
    return new Response(JSON.stringify({ error: "A non-empty research query is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: usageData } = await supabase.rpc("get_ato_research_usage", {
    p_user_id: user.id,
  });
  const currentUsage = usageData ?? 0;

  if (currentUsage >= RESEARCH_RATE_LIMIT) {
    return new Response(
      JSON.stringify({
        error: `Daily deep research limit reached (${RESEARCH_RATE_LIMIT}/day).`,
        limitReached: true,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const cached = await getCachedResearch(query, symbol);
  if (cached) {
    if (!stream) {
      return Response.json({
        brief: cached,
        cached: true,
        usage: { used: currentUsage, remaining: RESEARCH_RATE_LIMIT - currentUsage, limit: RESEARCH_RATE_LIMIT },
      });
    }

    const streamBody = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(sseEncode({ type: "brief", brief: cached })));
        controller.close();
      },
    });
    return new Response(streamBody, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  if (!stream) {
    try {
      const brief = await runDeepResearchPipeline({ userQuery: query, symbol });
      await setCachedResearch(query, symbol, brief);
      await supabase.rpc("increment_ato_research_usage", { p_user_id: user.id });
      const { data: newUsage } = await supabase.rpc("get_ato_research_usage", {
        p_user_id: user.id,
      });
      return Response.json({
        brief,
        cached: false,
        usage: {
          used: newUsage ?? currentUsage + 1,
          remaining: RESEARCH_RATE_LIMIT - (newUsage ?? currentUsage + 1),
          limit: RESEARCH_RATE_LIMIT,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Research failed.";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  const streamBody = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const brief = await runDeepResearchPipeline({
          userQuery: query,
          symbol,
          onProgress: (event) => {
            controller.enqueue(encoder.encode(sseEncode(event)));
          },
        });
        await setCachedResearch(query, symbol, brief);
        await supabase.rpc("increment_ato_research_usage", { p_user_id: user.id });
        const { data: newUsage } = await supabase.rpc("get_ato_research_usage", {
          p_user_id: user.id,
        });
        controller.enqueue(
          encoder.encode(
            sseEncode({
              type: "usage",
              usage: {
                used: newUsage ?? currentUsage + 1,
                remaining: RESEARCH_RATE_LIMIT - (newUsage ?? currentUsage + 1),
                limit: RESEARCH_RATE_LIMIT,
              },
            })
          )
        );
        controller.close();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Research failed.";
        controller.enqueue(encoder.encode(sseEncode({ type: "error", message })));
        controller.close();
      }
    },
  });

  return new Response(streamBody, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
