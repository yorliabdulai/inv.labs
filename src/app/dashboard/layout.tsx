import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { UserProfileProvider } from "@/lib/UserProfileContext";
import { createClient } from "@/lib/supabase/server";
import { AtoChatContainer } from "@/components/ai/AtoChatContainer";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const [
        { data: { user }, error: authError },
        { data: profile }
    ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("*").single()
    ]);

    if (!user || authError) {
        redirect("/login");
    }

    const hydratedProfile = profile ? {
        id: profile.id,
        full_name: profile.full_name || user.user_metadata?.full_name || "Trader",
        avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || "",
        cash_balance: Number(profile.cash_balance ?? 10000),
        username: profile.username || "",
        role: (profile as any).role || "user",
        created_at: profile.created_at,
    } : {
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
            <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-blue-500/30 selection:text-white transition-colors duration-300">
                <Sidebar />

                <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-300 ease-out z-10 relative">
                    <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-12 safe-area-inset-bottom">
                        <div className="h-2 md:hidden"></div>
                        {children}
                    </main>
                </div>

                <BottomNav />

                <AtoChatContainer />
            </div>
        </UserProfileProvider>
    );
}
