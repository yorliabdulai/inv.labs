"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, Layers, GraduationCap, Award, User, Share2 } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";

export function BottomNav() {
    const pathname = usePathname();
    const { isPartner } = useUserProfile();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    // Prioritize core actions, secondary ones are in the scroll path
    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home, id: "tour-nav-dashboard" },
        { href: "/dashboard/market", label: "Stocks", icon: TrendingUp, id: "tour-nav-stocks" },
        { href: "/dashboard/mutual-funds", label: "Funds", icon: Layers, id: "tour-nav-mutual-funds" },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart, id: "tour-nav-portfolio" },
        ...(isPartner ? [{ href: "/dashboard/partner", label: "Partner", icon: Share2, id: "nav-partner" }] : []),
        { href: "/dashboard/leaderboard", label: "Rank", icon: Award, id: "tour-nav-rankings" },
        { href: "/dashboard/learn", label: "Learn", icon: GraduationCap, id: "tour-nav-education" },
        { href: "/dashboard/profile", label: "Profile", icon: User, id: "tour-nav-profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 safe-area-inset-bottom transition-colors duration-300">
            <div className="flex items-center h-16 px-2 overflow-x-auto scroll-smooth hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-1 pb-1 pt-1">
                {navItems.map(({ href, label, icon: Icon, id }) => {
                    const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                    return (
                        <Link
                            key={href}
                            href={href}
                            id={id}
                            className={`flex flex-col items-center justify-center min-w-[60px] h-full shrink-0 rounded-xl transition-all duration-200 touch-manipulation snap-center ${active
                                ? "text-primary scale-105"
                                : "text-zinc-500 active:scale-95"
                                }`}
                            aria-label={label}
                        >
                            <div className={`relative transition-all duration-300 ${active ? "-translate-y-0.5" : ""}`}>
                                <Icon
                                    size={20}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={active ? "drop-shadow-sm" : ""}
                                />
                                {active && (
                                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(43,89,255,0.5)]"></span>
                                )}
                            </div>
                            <span className={`text-[9px] font-bold mt-1 transition-all ${active ? "opacity-100" : "opacity-60"}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}