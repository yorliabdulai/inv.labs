"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, TrendingUp, PieChart, GraduationCap, User, LogOut, Settings, Award, ChevronRight, X, Menu, Briefcase } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { supabase } from "@/lib/supabase/client";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { displayName, displayInitial, loading } = useUserProfile();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Command Center", icon: Home },
        { href: "/dashboard/market", label: "Stocks", icon: TrendingUp },
        { href: "/dashboard/mutual-funds", label: "Mutual Funds", icon: PieChart },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
        { href: "/dashboard/leaderboard", label: "Rankings", icon: Award },
        { href: "/dashboard/learn", label: "Education", icon: GraduationCap },
    ];

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const UserCard = ({ compact = false }: { compact?: boolean }) => (
        <div className={`flex items-center gap-3 ${compact ? '' : 'w-full'}`}>
            <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-brand to-brand-accent text-white flex items-center justify-center font-bold ${compact ? 'text-xs' : 'text-sm'} ring-2 ring-white flex-shrink-0`}>
                {loading ? "·" : displayInitial}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
                <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-text-primary truncate`}>
                    {loading ? "Loading..." : displayName}
                </div>
                <div className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-text-tertiary`}>
                    Investor Account
                </div>
            </div>
            <ChevronRight size={compact ? 14 : 16} className="text-text-tertiary flex-shrink-0" />
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-3 left-4 z-50 w-10 h-10 bg-background-surface rounded-xl shadow-premium border border-border flex items-center justify-center hover:bg-background-elevated transition-all touch-manipulation active:scale-95"
                aria-label="Open menu"
            >
                <Menu size={20} className="text-text-secondary" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background-surface z-50">
                {/* Logo */}
                <div className="h-header flex items-center px-6 border-b border-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                            <TrendingUp className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-black text-text-primary tracking-tight">
                            GSE<span className="text-brand">.</span>LABS
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
                    <div>
                        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em] px-3 mb-3">Main Navigation</h3>
                        <div className="space-y-1">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`group flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-[44px] ${active
                                            ? "bg-brand/5 text-brand shadow-sm shadow-brand/5"
                                            : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`transition-colors duration-200 ${active ? "text-brand" : "text-text-tertiary group-hover:text-text-secondary"}`}>
                                                <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                        {active && <div className="w-1 h-4 bg-brand rounded-full" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em] px-3 mb-3">Settings & Tools</h3>
                        <div className="space-y-1">
                            <Link href="/dashboard/profile" className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-all min-h-[44px]">
                                <User size={19} className="text-text-tertiary group-hover:text-text-secondary" />
                                <span>Profile</span>
                            </Link>
                            <Link href="/dashboard/settings" className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-all min-h-[44px]">
                                <Settings size={19} className="text-text-tertiary group-hover:text-text-secondary" />
                                <span>Preferences</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Desktop Footer */}
                <div className="p-4 mt-auto">
                    <Link href="/dashboard/profile" className="block mb-2">
                        <div className="glass-card bg-gray-50/50 border-none p-0">
                            <div className="p-3 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-sm">
                                <UserCard compact />
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-3 text-xs font-bold text-status-error hover:bg-red-50 rounded-xl transition-colors min-h-[44px]"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-background-surface z-50 shadow-2xl transform transition-transform duration-300 ease-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Mobile Header */}
                <div className="h-header flex items-center justify-between px-6 border-b border-border bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                            <TrendingUp className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-black text-text-primary tracking-tight">
                            GSE<span className="text-brand">.</span>LABS
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors touch-manipulation active:scale-95"
                        aria-label="Close menu"
                    >
                        <X size={20} className="text-text-secondary" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-144px)]">
                    <div>
                        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider px-3 mb-3">Main Navigation</h3>
                        <div className="space-y-2">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`group flex items-center justify-between px-4 py-4 rounded-xl text-base font-bold transition-all duration-200 min-h-[52px] ${active
                                            ? "bg-brand/5 text-brand shadow-sm shadow-brand/5"
                                            : "text-text-secondary hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`transition-colors duration-200 ${active ? "text-brand" : "text-text-tertiary"}`}>
                                                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                        {active && <div className="w-1.5 h-6 bg-brand rounded-full" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider px-3 mb-3">Settings & Tools</h3>
                        <div className="space-y-2">
                            <Link href="/dashboard/profile" onClick={() => setIsMobileOpen(false)} className="group flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold text-text-secondary hover:bg-gray-50 transition-all min-h-[52px]">
                                <User size={22} className="text-text-tertiary" />
                                <span>Profile</span>
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="group flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold text-text-secondary hover:bg-gray-50 transition-all min-h-[52px]">
                                <Settings size={22} className="text-text-tertiary" />
                                <span>Preferences</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-border bg-gray-50/50">
                    <Link href="/dashboard/profile" onClick={() => setIsMobileOpen(false)} className="block mb-3">
                        <div className="p-4 rounded-xl bg-white border border-border">
                            <UserCard />
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 w-full px-4 py-4 text-sm font-bold text-status-error hover:bg-red-50 rounded-xl transition-colors min-h-[52px]"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}