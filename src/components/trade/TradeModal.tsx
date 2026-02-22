"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Stock } from "@/lib/market-data";
import { X, TrendingUp, TrendingDown, DollarSign, Calculator, AlertTriangle, CheckCircle, Clock, Info, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { executeStockTrade } from "@/app/actions/stocks";
import { formatCurrency } from "@/lib/mutual-funds-data";
import { useUserProfile } from "@/lib/useUserProfile";

interface TradeModalProps {
    stock: Stock;
    isOpen: boolean;
    onClose: () => void;
    userBalance: number;
    onSuccess?: () => void;
}

export function TradeModal({ stock, isOpen, onClose, userBalance, onSuccess }: TradeModalProps) {
    const { user } = useUserProfile();
    const [type, setType] = useState<"BUY" | "SELL">("BUY");
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [limitPrice, setLimitPrice] = useState(stock.price.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setType("BUY");
            setQuantity(1);
            setOrderType("MARKET");
            setLimitPrice(stock.price.toString());
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, stock.price]);

    if (!isOpen || !mounted) return null;

    const price = orderType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price;
    const subtotal = price * quantity;

    // Ghana Stock Exchange Fees
    const brokerFee = subtotal * 0.015;
    const secLevy = subtotal * 0.004;
    const gseLevy = subtotal * 0.0014;
    const vat = brokerFee * 0.15;
    const totalFees = brokerFee + secLevy + gseLevy + vat;

    const totalCost = type === "BUY" ? subtotal + totalFees : subtotal - totalFees;

    const handleTrade = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            if (type === "BUY" && totalCost > userBalance) {
                throw new Error("Insufficient virtual funds");
            }

            if (quantity < 1) {
                throw new Error("Invalid quantity");
            }

            if (!user) throw new Error("Authentication required");

            const result = await executeStockTrade({
                userId: user.id,
                symbol: stock.symbol,
                type,
                quantity,
                price,
                totalCost,
                fees: totalFees
            });

            if (!result.success) throw new Error(result.message);

            setSuccess(true);
            onSuccess?.();
            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return createPortal(
            <div className="fixed inset-0 bg-[#1A1C4E]/40 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-indigo-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                    <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 animate-bounce">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1C4E] mb-2 tracking-tight">Trade Authorized</h3>
                    <p className="text-slate-500 font-medium mb-8">
                        Successfully {type === "BUY" ? "commissioned" : "liquidated"} {quantity} shares of {stock.symbol}
                    </p>
                    <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Settlement Value</div>
                        <div className="text-3xl font-black text-[#1A1C4E] tabular-nums tracking-tighter">{formatCurrency(totalCost)}</div>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <ShieldCheck size={14} />
                        Verified via Ledger
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 bg-[#1A1C4E]/60 backdrop-blur-md z-[9999] overflow-y-auto overflow-x-hidden p-4 md:p-8 flex items-center justify-center animate-in fade-in duration-300">
            <div className="max-w-4xl w-full bg-white border border-slate-200 shadow-2xl rounded-[40px] overflow-hidden flex flex-col lg:flex-row relative">

                {/* Left Panel: Configuration */}
                <div className="flex-1 p-6 md:p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#1A1C4E] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-900/20">
                                {stock.symbol.substring(0, 2)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#1A1C4E] tracking-tighter leading-none">{stock.symbol}</h2>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5">{stock.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all group lg:hidden">
                            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Type & Order Logic */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                    <button
                                        onClick={() => setType("BUY")}
                                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${type === "BUY" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Acquire
                                    </button>
                                    <button
                                        onClick={() => setType("SELL")}
                                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${type === "SELL" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Liquidate
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                    <button
                                        onClick={() => setOrderType("MARKET")}
                                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${orderType === "MARKET" ? "bg-white text-[#1A1C4E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Market
                                    </button>
                                    <button
                                        onClick={() => setOrderType("LIMIT")}
                                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${orderType === "LIMIT" ? "bg-white text-[#1A1C4E] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Limit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Quantity</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/20 outline-none text-2xl font-black text-[#1A1C4E] tabular-nums"
                                        placeholder="0"
                                    />
                                    <div className="flex gap-1.5 mt-3">
                                        {[10, 50, 100, 500].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setQuantity(p)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#1A1C4E] text-[10px] font-black text-slate-500 hover:text-white rounded-lg transition-all"
                                            >
                                                +{p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {orderType === "LIMIT" && (
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit Threshold (GH₵)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={limitPrice}
                                        onChange={(e) => setLimitPrice(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/20 outline-none text-2xl font-black text-[#1A1C4E] tabular-nums"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Balance Shield */}
                        <div className={`p-6 rounded-3xl border ${type === "BUY" && totalCost > userBalance ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/50 rounded-xl shadow-sm">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Settlement Account</p>
                                        <p className="text-lg font-black tabular-nums tracking-tight">{formatCurrency(userBalance)}</p>
                                    </div>
                                </div>
                                {type === "BUY" && totalCost > userBalance && (
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        <AlertTriangle size={14} />
                                        Locked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Settlement Ledger */}
                <div className="lg:w-[380px] bg-slate-50 p-6 md:p-10 border-l border-slate-100 flex flex-col">
                    <div className="hidden lg:flex justify-end mb-6">
                        <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all group">
                            <X size={20} className="text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-2 text-[#1A1C4E]">
                            <Calculator size={18} />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Settlement Ledger</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Allocation</span>
                                <span className="text-sm font-black text-[#1A1C4E] tabular-nums tracking-tight">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    Regulatory Levies
                                    <Info size={12} className="text-slate-300" />
                                </span>
                                <span className="text-sm font-black text-slate-700 tabular-nums">+{formatCurrency(totalFees)}</span>
                            </div>

                            <div className="bg-white/50 rounded-2xl p-4 space-y-3 border border-slate-100">
                                {[
                                    { label: "Brokerage (1.5%)", value: brokerFee },
                                    { label: "SEC Levy (0.4%)", value: secLevy },
                                    { label: "GSE Levy (0.14%)", value: gseLevy },
                                    { label: "VAT on Comm.", value: vat }
                                ].map((fee, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fee.label}</span>
                                        <span className="text-[11px] font-black text-slate-600 tabular-nums">{formatCurrency(fee.value)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Resolution</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-[#1A1C4E] tracking-tighter">GH₵</span>
                                    <span className={`text-4xl font-black tabular-nums tracking-tighter ${type === "BUY" ? "text-emerald-600" : "text-red-600"}`}>
                                        {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
                                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                <p className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleTrade}
                            disabled={isSubmitting || quantity < 1 || (type === "BUY" && totalCost > userBalance)}
                            className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${type === "BUY" ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-red-600 text-white shadow-red-200"}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Authorizing...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <ArrowRightLeft size={18} />
                                    Confirm {type}
                                </div>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                            disabled={isSubmitting}
                        >
                            Abort Transaction
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
