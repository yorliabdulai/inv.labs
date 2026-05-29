import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isAtoAgentModeEnabled } from "@/lib/config/feature-flags";
import { runAtoResearchAgent } from "@/lib/ai/ato-agent-service";

export async function POST(request: NextRequest) {
  try {
    if (!isAtoAgentModeEnabled()) {
      return NextResponse.json(
        { error: "Agent Mode is currently disabled." },
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
    const { query } = body ?? {};

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "A non-empty research query is required." },
        { status: 400 }
      );
    }

    const brief = await runAtoResearchAgent(query.trim());

    return NextResponse.json({ brief });
  } catch (error: any) {
    console.error("[ATO AGENT API ERROR]:", error);

    const status = typeof error?.status === "number" ? error.status : 500;
    const message =
      status >= 500
        ? "An unexpected error occurred while running Agent Mode."
        : error?.message || "Failed to run Agent Mode.";

    return NextResponse.json({ error: message }, { status });
  }
}

