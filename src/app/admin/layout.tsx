import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-foreground">
                <h1 className="text-3xl font-bold font-syne mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">You do not have administrative privileges.</p>
                <Link href="/dashboard" className="px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:opacity-90 flex items-center gap-2">
                    <ArrowLeft size={16} /> Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
            {/* Simple Admin Nav */}
            <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted font-medium text-sm">
                            <ArrowLeft size={16} /> Exit Admin
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <span className="font-syne font-bold text-lg tracking-tight">Admin Console</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                        <Link href="/admin/partners" className="text-primary">Partners</Link>
                    </nav>
                </div>
            </div>
            {children}
        </div>
    );
}
