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
        <div className="pb-24 space-y-8 md:space-y-12 font-sans max-w-[1440px] mx-auto px-4 md:px-8">
            <DashboardHeader />

            {/* ── Header ── */}
            <div className="relative rounded-2xl p-8 md:p-12 bg-card border border-border shadow-premium overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-primary/20">
                            {displayInitial}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight uppercase font-syne">
                                System Settings
                            </h1>
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Settings2 size={12} className="text-primary" /> Configuration & Access
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
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 border text-left ${isActive
                                    ? "bg-primary/10 border-primary/20 shadow-premium text-foreground"
                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-primary" : ""} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <div className="bg-card border border-border rounded-2xl shadow-premium p-8 min-h-[500px]">
                        {activeTab === "profile" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-1">Node Identity</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manage your institutional profile representation</p>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="p-6 border border-border rounded-xl bg-muted/20 flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-primary/20">
                                            {displayInitial}
                                        </div>
                                        <div>
                                            <button className="px-6 py-2 border border-border bg-muted/30 hover:bg-muted/50 text-foreground text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg mb-2">
                                                Update Representation
                                            </button>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Standard JPG/PNG up to 2MB allowed.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Display Identifier</label>
                                            <input type="text" defaultValue={displayName} className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all focus:bg-muted/40" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Comms Address</label>
                                            <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-muted/10 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest transition-all rounded-xl text-[10px] shadow-xl shadow-primary/20 active:scale-[0.98]">
                                            Save Base Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "preferences" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-1">Terminal Preferences</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Customize the operational environment</p>
                                </div>
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center justify-between p-6 border border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <MonitorSmartphone size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground">Visual Mode</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Dual Theme Sync (Active)</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20 rounded-lg">Enabled</div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 border border-border rounded-xl bg-muted/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-muted/30 border border-border flex items-center justify-center text-muted-foreground">
                                                <Globe size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground">Localization</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Base Currency & Timezone</div>
                                            </div>
                                        </div>
                                        <select disabled className="bg-muted/30 border border-border rounded-lg text-[10px] px-3 py-1.5 text-muted-foreground cursor-not-allowed outline-none font-bold uppercase tracking-widest">
                                            <option>GHS (Ghana Cedi)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-1">Alert Vectors</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manage incoming system signals</p>
                                </div>
                                <div className="space-y-4 max-w-2xl">
                                    {[
                                        { title: "Market Execution", desc: "Alerts on successful or failed trades", defaultChecked: true },
                                        { title: "Node Security", desc: "Login attempts and security events", defaultChecked: true },
                                        { title: "Portfolio Activity", desc: "Daily summary of total equity changes", defaultChecked: false },
                                        { title: "Ato AI Analytics", desc: "Intelligent insights from the GSE", defaultChecked: true }
                                    ].map((item, i) => (
                                        <label key={i} className="flex items-start gap-4 p-5 border border-border hover:border-primary/20 rounded-xl cursor-pointer transition-all bg-muted/10 hover:bg-muted/30 group">
                                            <div className="relative flex items-center mt-1">
                                                <input type="checkbox" defaultChecked={item.defaultChecked} className="peer sr-only" />
                                                <div className="w-10 h-5 bg-muted/40 border border-border rounded-full peer peer-checked:bg-primary/20 peer-checked:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground/40 peer-checked:after:bg-primary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight font-sans">{item.title}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">{item.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-1">Defense Parameters</h2>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Authentication and access control</p>
                                </div>
                                <div className="space-y-6 max-w-2xl">
                                    <div className="p-6 border border-border rounded-xl bg-muted/10 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Shield size={80} className="text-primary" />
                                        </div>
                                        <div className="flex items-start gap-4 mb-6 relative z-10">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight font-sans">Access Credentials</h3>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-medium leading-relaxed">Recommended to update passwords cyclically to prevent unauthorized terminal access.</p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-3 border border-border bg-muted/30 hover:bg-muted/50 text-foreground text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg relative z-10">
                                            Initiate Password Reset
                                        </button>
                                    </div>
                                    <div className="p-6 border border-red-500/10 bg-red-500/5 rounded-xl">
                                        <h3 className="text-sm font-bold text-red-500 uppercase tracking-tight font-sans mb-2">Eradicate Node</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4 font-medium leading-relaxed">Critical: Permanent deletion of all simulation data, holdings, and history. This action is irreversible.</p>
                                        <button className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg">
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
