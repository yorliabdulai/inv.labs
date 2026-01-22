import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ paddingBottom: "80px" }}> {/* Padding for BottomNav */}
            <main className="container" style={{ paddingTop: "1rem" }}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
