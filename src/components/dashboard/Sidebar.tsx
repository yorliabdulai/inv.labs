"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, PieChart, GraduationCap, User, LogOut, Settings, Award, ChevronRight } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/market", label: "Markets", icon: TrendingUp },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: PieChart },
        { href: "/dashboard/leaderboard", label: "Rankings", icon: Award },
        { href: "/dashboard/learn", label: "Education", icon: GraduationCap },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white z-50">
            {/* Logo Area */}
            <div className="h-18 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                        <TrendingUp className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-black text-[#1A1C4E] tracking-tight">
                        GSE<span className="text-indigo-600">.</span>LABS
                    </span>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-3">Main Navigation</h3>
                    <div className="space-y-1">
                        {navItems.map(({ href, label, icon: Icon }) => {
                            const active = isActive(href) && href !== "/dashboard" ? true : href === "/dashboard" && pathname === "/dashboard";
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${active
                                        ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-colors duration-200 ${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                                            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                                        </div>
                                        <span>{label}</span>
                                    </div>
                                    {active && <div className="w-1 h-4 bg-indigo-600 rounded-full" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-3">Settings \u0026 Tools</h3>
                    <div className="space-y-1">
                        <Link href="/dashboard/profile" className="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
                            <User size={19} className="text-gray-400 group-hover:text-gray-600" />
                            <span>Profile</span>
                        </Link>
                        <Link href="/dashboard/settings" className="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
                            <Settings size={19} className="text-gray-400 group-hover:text-gray-600" />
                            <span>Preferences</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* User Account / Footer */}
            <div className="p-4 bg-gray-50/50 mt-auto">
                <div className="p-3 mb-2 rounded-xl bg-white border border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        K
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-gray-900 truncate">Kwame Nkrumah</div>
                        <div className="text-[10px] font-medium text-gray-500 truncate">Pro Account</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                </div>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
