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
                symbol: stock.symbol,
                type,
                quantity
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] overflow-y-auto overflow-x-hidden flex items-start md:items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-[#121417] border-white/10 shadow-2xl md:rounded-[2px] overflow-hidden flex flex-col relative h-full md:h-auto md:max-h-[90vh]">

                {/* Sticky Header with Logo and Close */}
                <div className="sticky top-0 z-20 bg-[#121417] border-b border-white/10 p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#C05E42] rounded-[2px] flex items-center justify-center text-[#F9F9F9] font-black text-sm shadow-lg shadow-[#C05E42]/20">
                            {stock.symbol.substring(0, 3)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#F9F9F9] tracking-tighter leading-none font-instrument-serif">{stock.symbol}</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{stock.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-[2px] transition-all group">
                        <X size={20} className="text-white/40 group-hover:text-[#F9F9F9]" />
                    </button>
                </div>

                {/* Sticky Balance Bar - ALWAYS VISIBLE */}
                <div className="sticky top-[73px] md:top-[89px] z-10 bg-[#C05E42]/5 border-b border-[#C05E42]/20 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-[#C05E42]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Virtual Capital Available</span>
                    </div>
                    <div className="text-sm font-black text-[#F9F9F9] tabular-nums">
                        {formatCurrency(userBalance)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel: Configuration */}
                        <div className="flex-1 p-6 md:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-white/10">
                            <div className="space-y-8">
                                {/* Type & Execution Controls */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Objective</label>
                                        <div className="flex bg-white/5 p-1 rounded-[2px] border border-white/10">
                                            <button
                                                onClick={() => setType("BUY")}
                                                className={`flex-1 py-3 rounded-[1px] font-black text-[10px] uppercase tracking-widest transition-all ${type === "BUY" ? "bg-[#C05E42] text-[#F9F9F9] shadow-lg shadow-[#C05E42]/20" : "text-white/40 hover:text-[#F9F9F9]"}`}
                                            >
                                                Acquire
                                            </button>
                                            <button
                                                onClick={() => setType("SELL")}
                                                className={`flex-1 py-3 rounded-[1px] font-black text-[10px] uppercase tracking-widest transition-all ${type === "SELL" ? "bg-white/10 text-[#F9F9F9]" : "text-white/40 hover:text-[#F9F9F9]"}`}
                                            >
                                                Liquidate
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Execution Mode</label>
                                        <div className="flex bg-white/5 p-1 rounded-[2px] border border-white/10">
                                            <button
                                                onClick={() => setOrderType("MARKET")}
                                                className={`flex-1 py-3 rounded-[1px] font-black text-[10px] uppercase tracking-widest transition-all ${orderType === "MARKET" ? "bg-white/10 text-[#F9F9F9]" : "text-white/40 hover:text-[#F9F9F9]"}`}
                                            >
                                                Market
                                            </button>
                                            <button
                                                onClick={() => setOrderType("LIMIT")}
                                                className={`flex-1 py-3 rounded-[1px] font-black text-[10px] uppercase tracking-widest transition-all ${orderType === "LIMIT" ? "bg-white/10 text-[#F9F9F9]" : "text-white/40 hover:text-[#F9F9F9]"}`}
                                            >
                                                Limit
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Order Quantity</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                                className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-[2px] focus:bg-white/10 focus:border-[#C05E42]/50 outline-none text-3xl font-black text-[#F9F9F9] tabular-nums transition-all"
                                                placeholder="0"
                                            />
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {[10, 50, 100, 500].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setQuantity(p)}
                                                        className="px-4 py-2 bg-white/5 hover:bg-[#C05E42] border border-white/10 text-[9px] font-black text-white/40 hover:text-[#F9F9F9] rounded-[1px] transition-all uppercase tracking-widest"
                                                    >
                                                        +{p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {orderType === "LIMIT" && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Limit Price (GH₵)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={limitPrice}
                                                onChange={(e) => setLimitPrice(e.target.value)}
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[2px] focus:bg-white/10 focus:border-[#C05E42]/50 outline-none text-2xl font-black text-[#F9F9F9] tabular-nums transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                {type === "BUY" && totalCost > userBalance && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[2px] flex items-center gap-3">
                                        <AlertTriangle size={18} className="text-red-500" />
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-tight">
                                            Insufficient Virtual Capital for this transaction.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Settlement Ledger */}
                        <div className="lg:w-[380px] bg-black/40 p-6 md:p-10 flex flex-col">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3 text-[#F9F9F9]">
                                    <div className="p-2 bg-white/5 rounded-[2px] border border-white/10">
                                        <Calculator size={18} className="text-[#C05E42]" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Settlement Ledger</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Value</span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums tracking-tight">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                                            Compliance Levies
                                            <Info size={12} className="text-white/20" />
                                        </span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums">+{formatCurrency(totalFees)}</span>
                                    </div>

                                    <div className="bg-white/5 rounded-[2px] p-5 space-y-3 border border-white/10">
                                        {[
                                            { label: "Brokerage Service (1.5%)", value: brokerFee },
                                            { label: "SEC Regulatory Levy (0.4%)", value: secLevy },
                                            { label: "GSE Transaction Levy (0.14%)", value: gseLevy },
                                            { label: "Tax Obligation (VAT)", value: vat }
                                        ].map((fee, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.15em]">{fee.label}</span>
                                                <span className="text-[11px] font-black text-white/60 tabular-nums">{formatCurrency(fee.value)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Total Liquidity Required</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-2xl font-black text-white/20 tracking-tighter tabular-nums leading-none">GH₵</span>
                                            <span className="text-5xl font-black text-[#F9F9F9] tabular-nums tracking-tighter leading-none">
                                                {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-4">
                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[2px] flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                        <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-tight">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleTrade}
                                    disabled={isSubmitting || quantity < 1 || (type === "BUY" && totalCost > userBalance)}
                                    className="w-full py-6 bg-[#C05E42] text-[#F9F9F9] rounded-[2px] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-[#C05E42]/10 hover:shadow-[#C05E42]/20 active:scale-[0.98] disabled:opacity-20 disabled:grayscale"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-4 h-4 border-2 border-[#F9F9F9]/30 border-t-[#F9F9F9] rounded-full animate-spin"></div>
                                            Authorizing Process...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            <ArrowRightLeft size={16} />
                                            Confirm {type}
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-[9px] font-black text-white/20 hover:text-[#F9F9F9] uppercase tracking-[0.3em] transition-all mt-2"
                                    disabled={isSubmitting}
                                >
                                    Abort Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
