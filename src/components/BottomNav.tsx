"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, Layers, GraduationCap } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/dashboard/market", label: "Stocks", icon: TrendingUp },
        { href: "/dashboard/mutual-funds", label: "Funds", icon: Layers },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
        { href: "/dashboard/learn", label: "Learn", icon: GraduationCap },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 safe-area-inset-bottom transition-colors duration-300">
            <div className="flex justify-around items-center h-16 px-2 max-w-screen-xl mx-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center min-w-[60px] min-h-[60px] rounded-xl transition-all duration-200 touch-manipulation ${active
                                ? "text-blue-600 scale-105"
                                : "text-zinc-500 active:scale-95"
                                }`}
                            aria-label={label}
                        >
                            <div className={`relative transition-all duration-300 ${active ? "-translate-y-0.5" : ""}`}>
                                <Icon
                                    size={24}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={active ? "drop-shadow-sm" : ""}
                                />
                                {active && (
                                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)] animate-pulse"></span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold mt-0.5 transition-all ${active ? "opacity-100" : "opacity-60"}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}