"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Stock } from "@/lib/market-data";
import { X, TrendingUp, TrendingDown, DollarSign, Calculator, AlertTriangle, CheckCircle, Clock, Info, ShieldCheck, ArrowRightLeft, Loader2 } from "lucide-react";
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
                quantity,
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
            <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-in fade-in zoom-in duration-300">
                <div className="bg-card p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                        <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight uppercase font-syne">Trade Authorized</h3>
                    <p className="text-muted-foreground font-medium mb-8 text-sm">
                        Successfully {type === "BUY" ? "commissioned" : "liquidated"} {quantity} shares of {stock.symbol}
                    </p>
                    <div className="bg-muted rounded-3xl p-6 border border-border shadow-inner">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Settlement Value</div>
                        <div className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(totalCost)}</div>
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        <ShieldCheck size={14} />
                        Verified via Distributed Ledger
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[9999] overflow-y-auto overflow-x-hidden flex items-start md:items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-background border border-border shadow-2xl md:rounded-3xl overflow-hidden flex flex-col relative h-full md:h-auto md:max-h-[90vh]">

                {/* Sticky Header with Logo and Close */}
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border p-4 md:p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-base shadow-xl shadow-primary/20 transition-transform hover:scale-110">
                            {stock.symbol.substring(0, 3)}
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-foreground tracking-tight leading-none font-syne">{stock.symbol}</h2>
                            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 md:mt-2">{stock.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 md:p-3 bg-muted hover:bg-muted/80 rounded-xl border border-border transition-all group" aria-label="Close">
                        <X size={18} className="text-muted-foreground group-hover:text-foreground" />
                    </button>
                </div>

                {/* Sticky Balance Bar - ALWAYS VISIBLE */}
                <div className="sticky top-[73px] md:top-[113px] z-20 bg-primary/5 border-b border-primary/20 px-6 md:px-10 py-3 md:py-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign size={12} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Virtual Liquidity Available</span>
                    </div>
                    <div className="text-base font-bold text-foreground tabular-nums tracking-tight">
                        {formatCurrency(userBalance)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Panel: Configuration */}
                        <div className="flex-1 p-6 md:p-10 space-y-10 border-b lg:border-b-0 lg:border-r border-border">
                            <div className="space-y-10">
                                {/* Type & Execution Controls */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Trade Objective</label>
                                        <div className="flex bg-muted p-1.5 rounded-xl border border-border">
                                            <button
                                                onClick={() => setType("BUY")}
                                                className={`flex-1 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${type === "BUY" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                                Acquire
                                            </button>
                                            <button
                                                onClick={() => setType("SELL")}
                                                className={`flex-1 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${type === "SELL" ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                                Liquidate
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Execution Protocol</label>
                                        <div className="flex bg-muted p-1.5 rounded-xl border border-border">
                                            <button
                                                onClick={() => setOrderType("MARKET")}
                                                className={`flex-1 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${orderType === "MARKET" ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                                Market
                                            </button>
                                            <button
                                                onClick={() => setOrderType("LIMIT")}
                                                className={`flex-1 py-3.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${orderType === "LIMIT" ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                            >
                                                Limit
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-1 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Order Quantity</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                                className="w-full px-8 py-8 bg-muted border border-border rounded-2xl focus:bg-muted/80 focus:border-primary/50 outline-none text-4xl font-bold text-foreground tabular-nums transition-all placeholder:text-muted-foreground shadow-inner"
                                                placeholder="0"
                                            />
                                            <div className="flex flex-wrap gap-2 mt-6">
                                                {[10, 50, 100, 500].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setQuantity(p)}
                                                        className="px-5 py-2.5 bg-muted hover:bg-primary border border-border text-[10px] font-bold text-muted-foreground hover:text-white rounded-lg transition-all uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                                                    >
                                                        +{p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {orderType === "LIMIT" && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Threshold Price (GH₵)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={limitPrice}
                                                onChange={(e) => setLimitPrice(e.target.value)}
                                                className="w-full px-8 py-5 bg-muted border border-border rounded-2xl focus:bg-muted/80 focus:border-primary/50 outline-none text-2xl font-bold text-foreground tabular-nums transition-all shadow-inner"
                                            />
                                        </div>
                                    )}
                                </div>

                                {type === "BUY" && totalCost > userBalance && (
                                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle size={18} className="text-red-500" />
                                        </div>
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                                            Insufficient Liquidity: Capital required exceeds institutional balance.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Settlement Ledger */}
                        <div className="lg:w-[400px] bg-muted/30 p-6 md:p-10 flex flex-col backdrop-blur-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                            <div className="flex-1 space-y-8 relative z-10">
                                <div className="flex items-center gap-4 text-foreground">
                                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                                        <Calculator size={20} />
                                    </div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Settlement Ledger</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Value</span>
                                        <span className="text-base font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            Compliance Levies
                                            <div className="group relative">
                                                <Info size={12} className="text-muted-foreground" />
                                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-card border border-border rounded-xl text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                                    Official GSE Transaction & Regulatory Fees apply.
                                                </div>
                                            </div>
                                        </span>
                                        <span className="text-base font-bold text-foreground tabular-nums">+{formatCurrency(totalFees)}</span>
                                    </div>

                                    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border shadow-inner">
                                        {[
                                            { label: "Brokerage Service (1.5%)", value: brokerFee },
                                            { label: "SEC Regulatory Levy (0.4%)", value: secLevy },
                                            { label: "GSE Transaction Levy (0.14%)", value: gseLevy },
                                            { label: "Tax Obligation (VAT)", value: vat }
                                        ].map((fee, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{fee.label}</span>
                                                <span className="text-[11px] font-bold text-foreground tabular-nums">{formatCurrency(fee.value)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-10 border-t border-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Final Token Requirement</span>
                                        </div>
                                        <div className="flex items-baseline justify-between overflow-hidden">
                                            <span className="text-2xl font-bold text-muted/30 tracking-tight tabular-nums leading-none">GH₵</span>
                                            <span className="text-5xl font-bold text-foreground tabular-nums tracking-tighter leading-none">
                                                {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-4 relative z-10">
                                {error && (
                                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 shadow-2xl">
                                        <AlertTriangle size={20} className="text-red-500 shrink-0" />
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleTrade}
                                    disabled={isSubmitting || quantity < 1 || (type === "BUY" && totalCost > userBalance)}
                                    className="w-full py-6 bg-primary text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-20 disabled:grayscale focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <Loader2 size={18} className="text-white animate-spin" />
                                            Authorizing Process...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-4">
                                            <ArrowRightLeft size={18} />
                                            Confirm {type}
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all mt-2 active:scale-95"
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
