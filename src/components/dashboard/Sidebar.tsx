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
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-[#121417] z-50">
                {/* Logo */}
                <div className="h-header flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[2px] bg-[#C05E42] flex items-center justify-center shadow-lg shadow-[#C05E42]/20">
                            <TrendingUp className="text-[#F9F9F9]" size={18} />
                        </div>
                        <span className="text-xl font-black text-[#F9F9F9] tracking-tighter font-instrument-serif">
                            INVEST<span className="text-[#C05E42]">.</span>LABS
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-10 space-y-10 overflow-y-auto">
                    <div>
                        <h3 className="text-[9px] font-black text-[#C05E42]/80 uppercase tracking-[0.3em] px-3 mb-4">Terminal Navigation</h3>
                        <div className="space-y-1.5">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`group flex items-center justify-between px-3 py-3 rounded-[1px] text-[11px] font-bold uppercase tracking-widest transition-all duration-200 min-h-[44px] ${active
                                            ? "bg-white/5 text-[#F9F9F9] border border-white/5"
                                            : "text-white/40 hover:bg-white/5 hover:text-[#F9F9F9]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`transition-colors duration-200 ${active ? "text-[#C05E42]" : "text-white/20 group-hover:text-white/40"}`}>
                                                <Icon size={18} strokeWidth={active ? 3 : 2} />
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                        {active && <div className="w-1 h-3 bg-[#C05E42] rounded-full" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3 mb-4">Configuration</h3>
                        <div className="space-y-1.5">
                            <Link href="/dashboard/profile" className="group flex items-center gap-3 px-3 py-3 rounded-[1px] text-[11px] font-bold text-white/40 hover:bg-white/5 hover:text-[#F9F9F9] transition-all min-h-[44px] border border-transparent hover:border-white/5 uppercase tracking-widest">
                                <User size={18} className="text-white/20 group-hover:text-white/40" />
                                <span>Profile</span>
                            </Link>
                            <Link href="/dashboard/settings" className="group flex items-center gap-3 px-3 py-3 rounded-[1px] text-[11px] font-bold text-white/40 hover:bg-white/5 hover:text-[#F9F9F9] transition-all min-h-[44px] border border-transparent hover:border-white/5 uppercase tracking-widest">
                                <Settings size={18} className="text-white/20 group-hover:text-white/40" />
                                <span>Settings</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Desktop Footer */}
                <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
                    <Link href="/dashboard/profile" className="block mb-4">
                        <div className="bg-white/5 border border-white/10 p-3 rounded-[1px] hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[1px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-bold text-xs ring-1 ring-white/10 flex-shrink-0">
                                    {loading ? "·" : displayInitial}
                                </div>
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <div className="text-[11px] font-black text-[#F9F9F9] truncate uppercase tracking-tight">
                                        {loading ? "..." : displayName}
                                    </div>
                                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                        Investor
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-3 text-[10px] uppercase tracking-widest font-black text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[1px] transition-colors min-h-[44px]"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-[#121417] z-50 shadow-3xl transform transition-transform duration-300 ease-out border-r border-white/10 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Mobile Header */}
                <div className="h-header flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[1px] bg-[#C05E42] flex items-center justify-center shadow-lg shadow-[#C05E42]/20">
                            <TrendingUp className="text-[#F9F9F9]" size={18} />
                        </div>
                        <span className="text-xl font-black text-[#F9F9F9] tracking-tighter font-instrument-serif">
                            INVEST<span className="text-[#C05E42]">.</span>LABS
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="w-10 h-10 rounded-[1px] flex items-center justify-center hover:bg-white/10 transition-colors touch-manipulation active:scale-95"
                        aria-label="Close menu"
                    >
                        <X size={20} className="text-white/60" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto h-[calc(100vh-144px)]">
                    <div>
                        <h3 className="text-[9px] font-black text-[#C05E42]/80 uppercase tracking-[0.3em] px-3 mb-4">Navigation</h3>
                        <div className="space-y-1.5">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`group flex items-center justify-between px-4 py-4 rounded-[1px] text-sm font-bold uppercase tracking-widest transition-all duration-200 min-h-[52px] ${active
                                            ? "bg-white/5 text-[#F9F9F9] border border-white/5 shadow-sm shadow-black/20"
                                            : "text-white/40 hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`transition-colors duration-200 ${active ? "text-[#C05E42]" : "text-white/20"}`}>
                                                <Icon size={22} strokeWidth={active ? 3 : 2} />
                                            </div>
                                            <span>{label}</span>
                                        </div>
                                        {active && <div className="w-1.5 h-6 bg-[#C05E42] rounded-full" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3 mb-4">Settings</h3>
                        <div className="space-y-1.5">
                            <Link href="/dashboard/profile" onClick={() => setIsMobileOpen(false)} className="group flex items-center gap-4 px-4 py-4 rounded-[1px] text-sm font-bold text-white/40 hover:bg-white/5 transition-all min-h-[52px] uppercase tracking-widest border border-transparent hover:border-white/5">
                                <User size={22} className="text-white/20" />
                                <span>Profile</span>
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="group flex items-center gap-4 px-4 py-4 rounded-[1px] text-sm font-bold text-white/40 hover:bg-white/5 transition-all min-h-[52px] uppercase tracking-widest border border-transparent hover:border-white/5">
                                <Settings size={22} className="text-white/20" />
                                <span>Settings</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-white/10 bg-black/40">
                    <Link href="/dashboard/profile" onClick={() => setIsMobileOpen(false)} className="block mb-4">
                        <div className="p-4 rounded-[1px] bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-[1px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-bold text-base shadow-lg shadow-[#C05E42]/20">
                                    {loading ? "·" : displayInitial}
                                </div>
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <div className="text-sm font-black text-[#F9F9F9] truncate uppercase tracking-tight">
                                        {loading ? "..." : displayName}
                                    </div>
                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                        Investor
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 w-full px-4 py-4 text-xs font-black uppercase tracking-widest text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[1px] transition-colors min-h-[52px]"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}