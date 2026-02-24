"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useUserProfile } from "@/lib/useUserProfile";
import { User, Bell, Lock, Shield, Settings2, MonitorSmartphone, Palette, Globe, HelpCircle } from "lucide-react";

export default function SettingsPage() {
    const { displayName, displayInitial, user } = useUserProfile();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "preferences", label: "Preferences", icon: Palette },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Lock },
    ];

    return (
        <div className="pb-24 space-y-8 md:space-y-12 font-instrument-sans max-w-[1440px] mx-auto px-4 md:px-8">
            <DashboardHeader />

            {/* ── Header ── */}
            <div className="relative rounded-[2px] p-8 md:p-12 bg-[#121417] border border-white/10 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#C05E42]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-[#C05E42]/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-black text-2xl shadow-xl shadow-[#C05E42]/20">
                            {displayInitial}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-[#F9F9F9] tracking-tighter uppercase font-instrument-serif">
                                System Settings
                            </h1>
                            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                <Settings2 size={12} className="text-[#C05E42]" /> Configuration & Access
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Settings Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[2px] transition-all duration-200 border text-left ${isActive
                                        ? "bg-white/5 border-white/10 shadow-lg"
                                        : "bg-transparent border-transparent text-white/40 hover:bg-white/[0.02] hover:text-[#F9F9F9]"
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-[#C05E42]" : ""} />
                                <span className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-[#F9F9F9]" : ""}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <div className="bg-[#121417] border border-white/10 rounded-[2px] shadow-2xl p-8 min-h-[500px]">
                        {activeTab === "profile" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-black text-[#F9F9F9] uppercase tracking-widest mb-1">Node Identity</h2>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Manage your institutional profile representation</p>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="p-6 border border-white/5 rounded-[2px] bg-white/[0.02] flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[2px] bg-[#C05E42] text-[#F9F9F9] flex items-center justify-center font-black text-3xl">
                                            {displayInitial}
                                        </div>
                                        <div>
                                            <button className="px-6 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-[#F9F9F9] text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1px] mb-2">
                                                Update Representation
                                            </button>
                                            <p className="text-[10px] text-white/30">Standard JPG/PNG up to 2MB allowed.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05E42]">Display Identifier</label>
                                            <input type="text" defaultValue={displayName} className="w-full bg-white/5 border border-white/10 rounded-[2px] px-4 py-3 text-sm text-[#F9F9F9] focus:outline-none focus:border-[#C05E42]/50 transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C05E42]">Comms Address</label>
                                            <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-black/20 border border-white/5 rounded-[2px] px-4 py-3 text-sm text-white/30 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <button className="px-8 py-4 bg-[#C05E42] hover:bg-[#D16D4F] text-[#F9F9F9] font-black uppercase tracking-[0.2em] transition-all rounded-[2px] text-xs shadow-xl shadow-[#C05E42]/20">
                                            Save Base Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "preferences" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-black text-[#F9F9F9] uppercase tracking-widest mb-1">Terminal Preferences</h2>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Customize the operational environment</p>
                                </div>
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center justify-between p-6 border border-white/5 rounded-[2px] bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <MonitorSmartphone className="text-white/40" size={20} />
                                            <div>
                                                <div className="text-sm font-bold text-[#F9F9F9]">Visual Mode</div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Slated Dark Theme (Default)</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-[9px] font-black uppercase tracking-widest border border-[#10B981]/20 rounded-[1px]">Active</div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 border border-white/5 rounded-[2px] bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <Globe className="text-white/40" size={20} />
                                            <div>
                                                <div className="text-sm font-bold text-[#F9F9F9]">Localization</div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Base Currency & Timezone</div>
                                            </div>
                                        </div>
                                        <select disabled className="bg-black/20 border border-white/10 rounded-[1px] text-xs px-3 py-1.5 text-white/40 cursor-not-allowed outline-none">
                                            <option>GHS (Ghana Cedi)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-black text-[#F9F9F9] uppercase tracking-widest mb-1">Alert Vectors</h2>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Manage incoming system signals</p>
                                </div>
                                <div className="space-y-4 max-w-2xl">
                                    {[
                                        { title: "Market Execution", desc: "Alerts on successful or failed trades", defaultChecked: true },
                                        { title: "Node Security", desc: "Login attempts and security events", defaultChecked: true },
                                        { title: "Portfolio Activity", desc: "Daily summary of total equity changes", defaultChecked: false },
                                        { title: "Ato AI Analytics", desc: "Intelligent insights from the GSE", defaultChecked: true }
                                    ].map((item, i) => (
                                        <label key={i} className="flex items-start gap-4 p-5 border border-white/5 hover:border-white/10 rounded-[2px] cursor-pointer transition-colors bg-white/[0.01]">
                                            <div className="relative flex items-center mt-0.5">
                                                <input type="checkbox" defaultChecked={item.defaultChecked} className="peer sr-only" />
                                                <div className="w-10 h-5 bg-black/40 border border-white/10 rounded-full peer peer-checked:bg-[#C05E42]/20 peer-checked:border-[#C05E42] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 peer-checked:after:bg-[#C05E42] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-[#F9F9F9]">{item.title}</div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{item.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-black text-[#F9F9F9] uppercase tracking-widest mb-1">Defense Parameters</h2>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Authentication and access control</p>
                                </div>
                                <div className="space-y-6 max-w-2xl">
                                    <div className="p-6 border border-white/5 rounded-[2px] bg-white/[0.02]">
                                        <div className="flex items-start gap-4 mb-6">
                                            <Shield className="text-[#C05E42]" size={24} />
                                            <div>
                                                <h3 className="text-sm font-bold text-[#F9F9F9]">Access Credentials</h3>
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Recommended to update passwords cyclically</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-[#F9F9F9] text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1px]">
                                            Initiate Password Reset
                                        </button>
                                    </div>
                                    <div className="p-6 border border-red-500/10 bg-red-500/5 rounded-[2px]">
                                        <h3 className="text-sm font-bold text-red-500 mb-2">Eradicate Node</h3>
                                        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-4">Permanent deletion of all simulation data. Irreversible.</p>
                                        <button className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1px]">
                                            Format Terminal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
