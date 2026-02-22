import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { UserProfileProvider } from "@/lib/UserProfileContext";
import { createClient } from "@/lib/supabase/server";
import { AtoChatContainer } from "@/components/ai/AtoChatContainer";

/**
 * DashboardLayout (Server Component).
 * 
 * Fetches the user session and profile data on the server.
 * This data is then passed to the UserProfileProvider to hydrate
 * the client-side context instantly.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Initialize server client
    const supabase = await createClient();

    // 2. Fetch User & Profile concurrently (efficiency)
    const [
        { data: { user }, error: authError },
        { data: profile }
    ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("*").single() // Suffixing .single() since RLS limits to one
    ]);

    // Safety Redirect: In case middleware was bypassed or session expired mid-request
    if (!user || authError) {
        redirect("/login");
    }

    // 3. Robust Hydration Mapping
    // This ensures that the client-side context starts with valid data immediately.
    const hydratedProfile = profile ? {
        id: profile.id,
        full_name: profile.full_name || user.user_metadata?.full_name || "Trader",
        avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || "",
        cash_balance: Number(profile.cash_balance ?? 10000),
        username: profile.username || "",
        role: (profile as any).role || "user", // Support RBAC field
        created_at: profile.created_at,
    } : {
        // Fallback for brand-new users before trigger finishes or in case of DB delays
        id: user.id,
        full_name: user.user_metadata?.full_name || "Trader",
        avatar_url: user.user_metadata?.avatar_url || "",
        cash_balance: 10000,
        username: "",
        role: "user",
        created_at: new Date().toISOString(),
    };

    return (
        <UserProfileProvider initialUser={user} initialProfile={hydratedProfile}>
            <div className="min-h-screen bg-background relative overflow-x-hidden">
                <Sidebar />

                <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-300 ease-out">
                    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:px-10 md:py-10 pb-24 md:pb-12 safe-area-inset-bottom">
                        <div className="h-2 md:hidden"></div>
                        {children}
                    </main>
                </div>

                <BottomNav />

                {/* Ato AI Assistant - Handles its own client state */}
                <AtoChatContainer />
            </div>
        </UserProfileProvider>
    );
}
