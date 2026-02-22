import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { chatWithAto } from "@/lib/ai/ato-service";
import { buildCompleteContext } from "@/lib/ai/ato-context";

const RATE_LIMIT = 50; // messages per day

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
        const { message, conversationId } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Check rate limit
        const { data: usageData } = await supabase.rpc("get_ato_usage", {
            p_user_id: user.id,
        });

        const currentUsage = usageData || 0;

        if (currentUsage >= RATE_LIMIT) {
            return NextResponse.json(
                {
                    error: `Daily message limit reached (${RATE_LIMIT} messages/day). Resets at midnight.`,
                    limitReached: true,
                },
                { status: 429 }
            );
        }

        // Get or create conversation
        let activeConversationId = conversationId;

        if (!activeConversationId) {
            // Create new conversation
            const title =
                message.length > 50 ? message.substring(0, 50) + "..." : message;

            const { data: newConversation, error: convError } = await supabase
                .from("ato_conversations")
                .insert({
                    user_id: user.id,
                    title,
                })
                .select()
                .single();

            if (convError || !newConversation) {
                console.error("Error creating conversation:", convError);
                return NextResponse.json(
                    { error: "Failed to create conversation" },
                    { status: 500 }
                );
            }

            activeConversationId = newConversation.id;
        }

        // Get conversation history
        const { data: messages } = await supabase
            .from("ato_messages")
            .select("role, content")
            .eq("conversation_id", activeConversationId)
            .order("created_at", { ascending: true });

        const conversationHistory =
            messages?.map((m: any) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })) || [];

        // Build context
        const context = await buildCompleteContext(user.id);

        // Get AI response
        const atoResponse = await chatWithAto(message, context, conversationHistory);

        // Save user message
        await supabase.from("ato_messages").insert({
            conversation_id: activeConversationId,
            role: "user",
            content: message,
        });

        // Save assistant message
        await supabase.from("ato_messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: atoResponse.content,
        });

        // Increment usage
        await supabase.rpc("increment_ato_usage", {
            p_user_id: user.id,
        });

        // Update conversation timestamp
        await supabase
            .from("ato_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);

        // Get updated usage
        const { data: newUsageData } = await supabase.rpc("get_ato_usage", {
            p_user_id: user.id,
        });

        return NextResponse.json({
            response: atoResponse.content,
            conversationId: activeConversationId,
            usage: {
                messagesUsed: newUsageData || currentUsage + 1,
                messagesRemaining: RATE_LIMIT - (newUsageData || currentUsage + 1),
                limit: RATE_LIMIT,
            },
        });
    } catch (error: any) {
        console.error("[ATO API ERROR]:", error);

        // Check for specific error types
        const errorMessage = error.message || "Internal server error";
        const status = error.status || 500;

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.stack || undefined
            },
            { status }
        );
    }
}
