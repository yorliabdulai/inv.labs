"use client";

import Link from "next/link";
import { type TransactionRecord } from "@/app/actions/dashboard";
import {
    ShoppingCart,
    Wallet,
    Clock,
    ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/mutual-funds-data";

interface RecentActivityProps {
    transactions: TransactionRecord[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-[2px] bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <Clock size={24} className="text-white/20" />
                </div>
                <h4 className="text-sm font-black text-[#F9F9F9] uppercase tracking-[0.2em]">No Activity Yet</h4>
                <p className="text-xs text-white/30 mt-1">Your investment history will appear here.</p>
            </div>
        );
    }

    return (
        <>
            <ul className="space-y-4" role="list">
                {transactions.map((tx) => (
                    <li
                        key={tx.id}
                        className="group flex items-center justify-between p-5 rounded-[2px] bg-white/5 border border-white/5"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-[2px] flex items-center justify-center flex-shrink-0 transition-all ${tx.type.includes('BUY')
                                ? "bg-[#C05E42] text-[#F9F9F9]"
                                : "bg-[#F9F9F9] text-[#121417]"
                                }`}>
                                {tx.type.includes('BUY') ? <ShoppingCart size={22} /> : <Wallet size={22} />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-[#F9F9F9] text-sm truncate tracking-tight uppercase font-instrument-sans">{tx.name}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-[1px] border leading-none ${tx.type.includes('STOCK') ? 'bg-white/10 text-white/70 border-white/10' : 'bg-[#C05E42]/20 text-[#C05E42] border-[#C05E42]/30'
                                        }`}>
                                        {tx.type.includes('STOCK') || tx.type === 'BUY' || tx.type === 'SELL' ? 'Stock' : 'Fund'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 text-[9px] font-black uppercase tracking-widest">
                                    <span className={tx.type.includes('BUY') ? 'text-[#C05E42]' : 'text-[#10B981]'}>
                                        {tx.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-white/10">/</span>
                                    <span className="text-white/30">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-black text-sm text-[#F9F9F9] tabular-nums tracking-tighter">
                                {tx.type.includes('BUY') ? '-' : '+'}{formatCurrency(tx.amount)}
                            </div>
                            <div className="text-[9px] font-black text-white/30 uppercase tracking-tighter mt-1.5 border-t border-white/5 pt-1">
                                {tx.units?.toFixed(2)} @ {formatCurrency(tx.price || 0)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <Link
                href="/dashboard/portfolio"
                className="w-full mt-6 py-5 text-[10px] font-black text-[#F9F9F9] uppercase tracking-[0.4em] bg-white/5 hover:bg-[#C05E42] border border-white/5 rounded-[2px] transition-all flex items-center justify-center gap-3 group shadow-xl hover:shadow-[#C05E42]/20"
            >
                View Full Transaction Ledger
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </>
    );
}
