import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: conversationId } = await params;
        const supabase = await createServerClient();

        // Get authenticated user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const { data: conversation } = await supabase
            .from("ato_conversations")
            .select("user_id")
            .eq("id", conversationId)
            .single();

        if (!conversation || conversation.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete conversation (messages will be deleted via CASCADE)
        const { error } = await supabase
            .from("ato_conversations")
            .delete()
            .eq("id", conversationId);

        if (error) {
            console.error("Error deleting conversation:", error);
            return NextResponse.json(
                { error: "Failed to delete conversation" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in delete conversation:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
