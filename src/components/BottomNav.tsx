"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, GraduationCap, Award, User, Share2, Zap, LayoutGrid } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";

export function BottomNav() {
    const pathname = usePathname();
    const { isPartner } = useUserProfile();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    // UX Redesign: 5 Pillars of Investor Mobility
    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home, id: "nav-home" },
        { href: "/dashboard/market", label: "Market", icon: LayoutGrid, id: "nav-market" },
        { href: "/dashboard/market", label: "Trade", icon: Zap, id: "nav-trade", isAction: true }, // Trade action centers the nav
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart, id: "nav-portfolio" },
        { href: "/dashboard/grow", label: "Grow", icon: Award, id: "nav-grow" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background/90 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-[100] safe-area-inset-bottom transform-gpu translate-z-0">
            <div className="flex items-center justify-around h-20 px-4">
                {navItems.map(({ href, label, icon: Icon, id, isAction }) => {
                    const active = isAction ? false : (isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard");
                    
                    if (isAction) {
                        return (
                            <Link
                                key={href}
                                href={href}
                                id={id}
                                className="flex flex-col items-center justify-center -translate-y-6 group"
                                aria-label={label}
                            >
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/40 group-active:scale-90 transition-all duration-200 border-4 border-background">
                                    <Icon size={28} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold mt-2 text-primary uppercase tracking-widest">{label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={href}
                            href={href}
                            id={id}
                            className={`flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-200 ${
                                active ? "text-primary" : "text-muted-foreground opacity-70"
                            }`}
                            aria-label={label}
                        >
                            <div className="relative mb-1">
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={active ? "drop-shadow-sm" : ""}
                                />
                                {active && (
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(43,89,255,0.5)]"></span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight ${active ? "opacity-100" : "opacity-100"}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}