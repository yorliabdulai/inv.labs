"use client";

import { useState } from "react";
import { createPartner, addRevenue } from "@/app/actions/admin";
import { Loader2, Plus, DollarSign } from "lucide-react";

export function CreatePartnerForm() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    async function action(formData: FormData) {
        setLoading(true);
        setMsg("");
        const res = await createPartner(formData);
        if (!res.success) {
            setMsg("Error: " + res.error);
        } else {
            setMsg("Partner created successfully!");
        }
        setLoading(false);
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-syne font-bold mb-4">New Partner</h2>
            <form action={action} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Partner Name</label>
                    <input name="name" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary transition-colors outline-none" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Partner Email</label>
                    <input name="email" type="email" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary transition-colors outline-none" placeholder="partner@example.com" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Referral Code</label>
                    <input name="referral_code" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary transition-colors outline-none font-mono" placeholder="acme" />
                </div>
                {msg && <p className={`text-xs font-semibold ${msg.startsWith('Error') ? 'text-red-500' : 'text-emerald-500'}`}>{msg}</p>}
                
                <button disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Partner
                </button>
            </form>
        </div>
    );
}

export function AddRevenueForm({ partnerId, referralId }: { partnerId: string, referralId: string | null }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleAdd() {
        if (!referralId) return alert("This partner has no referrals yet to attribute revenue to.");
        if (!amount || isNaN(Number(amount))) return;
        
        setLoading(true);
        const res = await addRevenue(referralId, Number(amount));
        if (!res.success) {
            alert(res.error);
        } else {
            setAmount("");
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
               <input 
                   type="number" 
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   placeholder="Amount (GH₵)" 
                   className="w-28 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs focus:border-green-500 transition-colors outline-none" 
               />
               <button 
                   onClick={handleAdd}
                   disabled={loading || !amount}
                   className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
               >
                   {loading ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                   Add Revenue
               </button>
           </div>
           {!referralId && <p className="text-[10px] text-muted-foreground pl-1">Needs at least 1 referral to attribute.</p>}
        </div>
    );
}

export function MonthlyReportModal({ partnerId, partnerName, commissionRate }: { partnerId: string, partnerName: string, commissionRate: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [published, setPublished] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() || 12); // Month is 0-indexed, but our action handles 1-12? Wait.
    const [year, setYear] = useState(new Date().getFullYear());

    // Fix month selection: Previous month is default
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const defaultMonth = prevMonthDate.getMonth() + 1;
    const defaultYear = prevMonthDate.getFullYear();

    async function generateReport() {
        setLoading(true);
        setPublished(false);
        const res = await getPartnerMonthlyReport(partnerId, month, year);
        if (res.success) {
            setStats(res.stats);
        } else {
            alert(res.error);
        }
        setLoading(false);
    }

    async function handlePublish() {
        if (!stats) return;
        setLoading(true);
        const res = await publishMonthlyReport(partnerId, month, year, stats);
        if (res.success) {
            setPublished(true);
        } else {
            alert(res.error);
        }
        setLoading(false);
    }

    return (
        <div>
            <button 
                onClick={() => { setIsOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
                <Plus size={14} />
                Monthly Report
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold font-syne">Monthly Earnings</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Partner: {partnerName}</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-2">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Month</label>
                                    <select 
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                        value={month}
                                        onChange={e => setMonth(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Year</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm"
                                        value={year}
                                        onChange={e => setYear(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {!stats ? (
                                <button 
                                    onClick={generateReport}
                                    disabled={loading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    Calculate Stats
                                </button>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Conversions</p>
                                            <p className="text-2xl font-black font-syne">{stats.conversions}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Earnings</p>
                                            <p className="text-2xl font-black font-syne text-emerald-600">GH₵{stats.earnings.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-[10px] font-bold text-blue-600 leading-relaxed">
                                        REPORTING PERIOD: {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        <br/>
                                        COMMISSION RATE: {(commissionRate * 100).toFixed(0)}%
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={handlePublish}
                                            disabled={loading || published}
                                            className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                            {published ? "Published & Shared" : "Finalize & Share"}
                                        </button>
                                        <button 
                                            onClick={() => setStats(null)}
                                            className="px-6 py-4 bg-secondary text-foreground font-bold rounded-2xl hover:bg-muted transition-all border border-border"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { getPartnerMonthlyReport, publishMonthlyReport } from "@/app/actions/admin";
