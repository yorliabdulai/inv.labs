"use client";

import { type TransactionRecord } from "@/app/actions/dashboard";
import {
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    Wallet,
    Clock,
    ChevronRight,
    Search
} from "lucide-react";
import { formatCurrency } from "@/lib/mutual-funds-data";

interface RecentActivityProps {
    transactions: TransactionRecord[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                    <Clock size={24} className="text-gray-300" />
                </div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">No Activity Yet</h4>
                <p className="text-xs text-gray-500 mt-1">Your investment history will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="group flex items-center justify-between p-5 rounded-[24px] hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm"
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${tx.type.includes('BUY')
                            ? "bg-indigo-50 text-indigo-600 shadow-sm"
                            : "bg-red-50 text-red-600 shadow-sm"
                            }`}>
                            {tx.type.includes('BUY') ? <ShoppingCart size={22} /> : <Wallet size={22} />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-[#1A1C4E] text-sm truncate tracking-tight">{tx.name}</span>
                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border leading-none ${tx.type.includes('STOCK') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                                    }`}>
                                    {tx.type.includes('STOCK') || tx.type === 'BUY' || tx.type === 'SELL' ? 'Stock' : 'Fund'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className={tx.type.includes('BUY') ? 'text-indigo-500' : 'text-emerald-500'}>
                                    {tx.type.replace('_', ' ')}
                                </span>
                                <span className="text-slate-200">/</span>
                                <span className="text-slate-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="font-black text-sm text-[#1A1C4E] tabular-nums tracking-tighter">
                            {tx.type.includes('BUY') ? '-' : '+'}{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1.5 border-t border-slate-50 pt-1">
                            {tx.units?.toFixed(2)} @ {formatCurrency(tx.price || 0)}
                        </div>
                    </div>
                </div>
            ))}

            <button className="w-full mt-6 py-5 text-[10px] font-black text-[#1A1C4E] uppercase tracking-[0.3em] hover:bg-[#1A1C4E] hover:text-white border-2 border-slate-50 rounded-[24px] transition-all flex items-center justify-center gap-3 group shadow-sm hover:shadow-xl">
                Open Full Transaction Ledger
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
