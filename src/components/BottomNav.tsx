"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, GraduationCap, User } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/dashboard/market", label: "Market", icon: TrendingUp },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
        { href: "/dashboard/learn", label: "Learn", icon: GraduationCap },
        { href: "/dashboard/profile", label: "Profile", icon: User },
    ];

    return (
        <nav style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "var(--color-surface)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "0.5rem 0",
            zIndex: 50,
            height: "64px"
        }}>
            {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                return (
                    <Link
                        key={href}
                        href={href}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                            fontSize: "0.75rem",
                            textDecoration: "none",
                            transition: "color 0.2s"
                        }}
                    >
                        <Icon size={24} style={{ marginBottom: "2px" }} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
