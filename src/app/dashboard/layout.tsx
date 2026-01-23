import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F6F7FF] relative overflow-x-hidden">
            <Sidebar />

            <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-300">
                <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 pb-32 md:pb-12">
                    {children}
                </main>
            </div>

            <BottomNav />
        </div>
    );
}
