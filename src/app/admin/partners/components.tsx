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
