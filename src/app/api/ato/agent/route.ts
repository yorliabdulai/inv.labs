import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAtoDeepResearchEnabled } from "@/lib/config/feature-flags";
import { runDeepResearchPipeline } from "@/lib/ai/research/pipeline";

/** Legacy alias — prefer POST /api/ato/research */
export async function POST(request: NextRequest) {
  try {
    if (!isAtoDeepResearchEnabled()) {
      return NextResponse.json(
        { error: "Deep research is currently disabled." },
        { status: 503 }
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const symbol = typeof body?.symbol === "string" ? body.symbol.trim() : undefined;

    if (!query) {
      return NextResponse.json(
        { error: "A non-empty research query is required." },
        { status: 400 }
      );
    }

    const brief = await runDeepResearchPipeline({ userQuery: query, symbol });

    return NextResponse.json({ brief });
  } catch (error: unknown) {
    console.error("[ATO AGENT API ERROR]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to run research.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
