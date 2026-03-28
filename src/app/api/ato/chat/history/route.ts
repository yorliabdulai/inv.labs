import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerClient();

        // Get authenticated user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Find the user's most recently updated conversation
        const { data: latestConversation, error: convError } = await supabase
            .from("ato_conversations")
            .select("id, title")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

        // If no conversation found or error fetching, return empty
        if (convError || !latestConversation) {
            return NextResponse.json({ messages: [], conversationId: null });
        }

        // 2. Fetch messages for that conversation
        const { data: messages, error: messagesError } = await supabase
            .from("ato_messages")
            .select("role, content, created_at")
            .eq("conversation_id", latestConversation.id)
            .order("created_at", { ascending: true });

        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
        }

        // Format for frontend
        const formattedMessages = messages?.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        })) || [];

        // 3. Fetch current usage stats
        const { data: usageData } = await supabase.rpc("get_ato_usage", {
            p_user_id: user.id,
        });

        const currentUsage = usageData || 0;
        const RATE_LIMIT = 15; // Same limit as route.ts

        return NextResponse.json({ 
            messages: formattedMessages, 
            conversationId: latestConversation.id,
            title: latestConversation.title,
            usage: {
                messagesUsed: currentUsage,
                messagesRemaining: Math.max(0, RATE_LIMIT - currentUsage),
                limit: RATE_LIMIT,
            }
        });
    } catch (error: any) {
        console.error("Error in chat history endpoint:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred while fetching chat history." },
            { status: 500 }
        );
    }
}
