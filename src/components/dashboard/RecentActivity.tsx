"use client";

import Link from "next/link";
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
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border">
                    <Clock size={24} className="text-muted-foreground" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">No Activity Yet</h4>
                <p className="text-xs text-muted-foreground mt-1">Your investment history will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted transition-all cursor-pointer border border-border hover:border-primary/40 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${tx.type.includes('BUY')
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}>
                            {tx.type.includes('BUY') ? <ShoppingCart size={18} /> : <Wallet size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-[--text-primary] dark:text-[--text-dark-primary] text-sm truncate block w-full tracking-tight">{tx.name}</span>
                                <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${tx.type.includes('STOCK')
                                    ? 'bg-muted text-muted-foreground border-border'
                                    : 'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                    {tx.type.includes('STOCK') || tx.type === 'BUY' || tx.type === 'SELL' ? 'Stock' : 'Fund'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-muted-foreground">
                                <span className={tx.type.includes('BUY') ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'}>
                                    {tx.type.replace('_', ' ')}
                                </span>
                                <span>•</span>
                                <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                        <div className="font-semibold text-sm text-foreground tabular-nums tracking-tight">
                            {tx.type.includes('BUY') ? '-' : '+'}{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                            {tx.units?.toFixed(2)} @ {formatCurrency(tx.price || 0)}
                        </div>
                    </div>
                </div>
            ))}

            <Link href="/dashboard/portfolio" className="w-full mt-4 py-3.5 text-xs font-semibold text-[--text-primary] dark:text-[--text-dark-primary] bg-muted hover:bg-muted/80 hover:text-foreground border border-border rounded-xl transition-all flex items-center justify-center gap-2 group shadow-sm">
                View Transaction Ledger
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
