import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateQuickInsight } from "@/lib/ai/ato-service";
import { buildCompleteContext } from "@/lib/ai/ato-context";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const { type } = body;

        if (!type || !["portfolio", "diversification", "performance"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid insight type" },
                { status: 400 }
            );
        }

        // Build context
        const context = await buildCompleteContext(user.id);

        // Generate insight
        const insight = await generateQuickInsight(
            context,
            type as "portfolio" | "diversification" | "performance"
        );

        return NextResponse.json({ insight });
    } catch (error: any) {
        console.error("Error generating insight:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
