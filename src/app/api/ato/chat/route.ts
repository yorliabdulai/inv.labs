import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { chatWithAto } from "@/lib/ai/ato-service";
import { buildCompleteContext } from "@/lib/ai/ato-context";

const RATE_LIMIT = 15; // messages per day

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
                    error: `Daily query limit reached (${RATE_LIMIT} queries/day). Upgrade to Premium for unlimited access!`,
                    limitReached: true,
                },
                { status: 429 }
            );
        }

        // Get or create conversation
        let activeConversationId = conversationId;

        if (activeConversationId) {
            // Verify ownership to prevent IDOR
            const { data: conversation, error: checkError } = await supabase
                .from("ato_conversations")
                .select("user_id")
                .eq("id", activeConversationId)
                .single();

            if (checkError || !conversation || conversation.user_id !== user.id) {
                // Return 404 to prevent resource enumeration
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }
        } else {
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
            messages?.map((m: { role: string; content: string }) => ({
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
    } catch (error: unknown) {
        // Log the full error server-side
        const errMessage = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : '';
        const status = (error as { status?: number })?.status || 500;

        try {
            const fs = await import('fs');
            fs.writeFileSync('ato_error_log.txt', String(errMessage) + '\n' + String(errStack));
        } catch(_){}

        console.error("[ATO API ERROR]:", error);

        // Return a generic, safe error message to the client
        return NextResponse.json(
            {
                error: status >= 500 ? "An unexpected error occurred while processing your request." : errMessage,
            },
            { status }
        );
    }
}
