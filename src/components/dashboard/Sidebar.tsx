"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, TrendingUp, PieChart, GraduationCap, User, LogOut, Settings, Award, X, Menu, Briefcase } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { supabase } from "@/lib/supabase/client";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { displayName, displayInitial, profile, loading } = useUserProfile();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/market", label: "Stocks", icon: TrendingUp },
        { href: "/dashboard/mutual-funds", label: "Mutual Funds", icon: PieChart },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
        { href: "/dashboard/leaderboard", label: "Rankings", icon: Award },
        { href: "/dashboard/learn", label: "Education", icon: GraduationCap },
    ];

    useEffect(() => { setIsMobileOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMobileOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const NavItem = ({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ElementType; onClick?: () => void }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : isActive(href);
        return (
            <Link
                href={href}
                onClick={onClick}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[40px] ${active
                    ? "bg-primary/10 text-primary dark:bg-white/[0.08] dark:text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
            >
                <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${active ? "text-primary dark:text-blue-400" : "text-muted-foreground group-hover:text-foreground"}`}
                    strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-500" />}
            </Link>
        );
    };

    const Logo = () => (
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner shadow-blue-500/30 flex-shrink-0">
                iL
            </div>
            <span className="font-bold text-base tracking-tight text-foreground dark:text-white">inv.labs</span>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar — renders at md+ breakpoint only */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-background border-r border-border z-50 transition-colors duration-300">
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-border">
                    <Logo />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
                    <div>
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
                        <div className="space-y-0.5">
                            {navItems.map((item) => <NavItem key={item.href} {...item} />)}
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">Account</p>
                        <div className="space-y-0.5">
                            <NavItem href="/dashboard/profile" label="Profile" icon={User} />
                            <NavItem href="/dashboard/settings" label="Settings" icon={Settings} />
                        </div>
                    </div>
                </nav>

                {/* Desktop Footer */}
                <div className="p-3 border-t border-border">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors mb-1">
                        <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 relative overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                loading ? "·" : displayInitial
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{loading ? "Loading…" : displayName}</div>
                            <div className="text-xs text-muted-foreground">Investor</div>
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}