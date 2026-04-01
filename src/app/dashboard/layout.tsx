import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { UserProfileProvider } from "@/lib/UserProfileContext";
import { createClient } from "@/lib/supabase/server";
import { AtoChatContainer } from "@/components/ai/AtoChatContainer";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const hydratedProfile = profile ? {
        id: profile.id,
        full_name: profile.full_name || user.user_metadata?.full_name || "Trader",
        avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || "",
        cash_balance: Number(profile.cash_balance ?? 10000),
        username: profile.username || "",
        onboarding_completed: !!profile.onboarding_completed,
        role: (profile as any).role || "user",
        created_at: profile.created_at,
        knowledge_xp: profile.knowledge_xp || 0,
        level: profile.level || 1,
        is_founding_member: !!profile.is_founding_member,
        streak_count: profile.streak_count || 0,
        last_active_date: profile.last_active_date || null,
    } : {
        id: user.id,
        full_name: user.user_metadata?.full_name || "Trader",
        avatar_url: user.user_metadata?.avatar_url || "",
        cash_balance: 10000,
        username: "",
        onboarding_completed: false,
        role: "user",
        created_at: new Date().toISOString(),
        knowledge_xp: 0,
        level: 1,
        is_founding_member: false,
        streak_count: 0,
        last_active_date: null,
    };

    return (
        <UserProfileProvider initialUser={user} initialProfile={hydratedProfile}>
            <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-blue-500/30 selection:text-white transition-colors duration-300">
                <Sidebar />

                <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-300 ease-out z-10 relative">
                    <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 md:px-8 md:py-8 pb-32 md:pb-12 safe-area-inset-bottom">
                        <div className="h-2 md:hidden"></div>
                        {children}
                    </main>
                </div>

                <BottomNav />

                <AtoChatContainer />
                
                <OnboardingTour />
            </div>
        </UserProfileProvider>
    );
}
