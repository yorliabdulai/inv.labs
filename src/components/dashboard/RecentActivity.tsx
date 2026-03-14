"use client";

import { type TransactionRecord } from "@/app/actions/dashboard";
import { ShoppingCart, Wallet, Clock, ChevronRight, Search } from "lucide-react";
import { formatCurrency } from "@/lib/mutual-funds-data";

interface RecentActivityProps {
    transactions: TransactionRecord[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.06]">
                    <Clock size={24} className="text-zinc-600" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-300">No Activity Yet</h4>
                <p className="text-xs text-zinc-500 mt-1">Your investment history will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/[0.05] hover:border-blue-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${tx.type.includes('BUY')
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                            {tx.type.includes('BUY') ? <ShoppingCart size={18} /> : <Wallet size={18} />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-200 text-sm truncate tracking-tight">{tx.name}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${tx.type.includes('STOCK')
                                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    }`}>
                                    {tx.type.includes('STOCK') || tx.type === 'BUY' || tx.type === 'SELL' ? 'Stock' : 'Fund'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-zinc-500">
                                <span className={tx.type.includes('BUY') ? 'text-blue-400' : 'text-emerald-400'}>
                                    {tx.type.replace('_', ' ')}
                                </span>
                                <span>•</span>
                                <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="font-semibold text-sm text-zinc-200 tabular-nums tracking-tight">
                            {tx.type.includes('BUY') ? '-' : '+'}{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                            {tx.units?.toFixed(2)} @ {formatCurrency(tx.price || 0)}
                        </div>
                    </div>
                </div>
            ))}

            <button className="w-full mt-4 py-3.5 text-xs font-semibold text-zinc-400 bg-white/[0.02] hover:bg-white/[0.05] hover:text-white border border-white/[0.05] rounded-xl transition-all flex items-center justify-center gap-2 group">
                View Transaction Ledger
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
