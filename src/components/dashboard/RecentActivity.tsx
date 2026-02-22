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
        <div className="space-y-1">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${tx.type.includes('BUY')
                            ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                            }`}>
                            {tx.type.includes('BUY') ? <ShoppingCart size={18} /> : <Wallet size={18} />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-gray-900 text-sm truncate">{tx.name}</span>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${tx.type.includes('STOCK') ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    {tx.type.includes('STOCK') || tx.type === 'BUY' || tx.type === 'SELL' ? 'Stock' : 'Fund'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <span>{tx.type.replace('_', ' ')}</span>
                                <span className="text-gray-300">•</span>
                                <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`font-black text-sm text-gray-900`}>
                            {tx.type.includes('BUY') ? '-' : '+'}{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-tight mt-0.5">
                            {tx.units?.toFixed(2)} Units @ {formatCurrency(tx.price || 0)}
                        </div>
                    </div>
                </div>
            ))}

            <button className="w-full mt-2 py-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center gap-2 group">
                View All Transactions
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
