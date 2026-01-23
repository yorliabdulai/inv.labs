"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, Award, GraduationCap } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/dashboard/market", label: "Markets", icon: TrendingUp },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
        { href: "/dashboard/leaderboard", label: "Rank", icon: Award },
        { href: "/dashboard/learn", label: "Learn", icon: GraduationCap },
    ];

    return (
        <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl shadow-indigo-100/50 flex md:hidden justify-around items-center py-3 px-2 z-50 rounded-2xl border-white/50">
            {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-300 ${active ? "text-indigo-600 scale-110" : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <div className={`relative transition-transform duration-300 ${active ? "-translate-y-1" : ""}`}>
                            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                            {active && (
                                <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                            )}
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
