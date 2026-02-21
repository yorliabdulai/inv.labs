"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Stock } from "@/lib/market-data";
import { X, TrendingUp, TrendingDown, DollarSign, Calculator, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface TradeModalProps {
    stock: Stock;
    isOpen: boolean;
    onClose: () => void;
    userBalance: number;
    onSuccess?: () => void; // callback to refresh balance in parent
}

export function TradeModal({ stock, isOpen, onClose, userBalance, onSuccess }: TradeModalProps) {
    const [type, setType] = useState<"BUY" | "SELL">("BUY");
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [limitPrice, setLimitPrice] = useState(stock.price.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Ensure portal only renders on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset form when modal opens
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
    const vat = brokerFee * 0.15; // VAT on Broker Commission
    const totalFees = brokerFee + secLevy + gseLevy + vat;

    const totalCost = type === "BUY" ? subtotal + totalFees : subtotal - totalFees;
    const estimatedValue = totalCost;

    // Quick quantity presets
    const quantityPresets = [1, 5, 10, 25, 50, 100];

    const handleTrade = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            if (type === "BUY" && totalCost > userBalance) {
                throw new Error("Insufficient virtual funds for this transaction");
            }

            if (quantity < 1) {
                throw new Error("Please enter a valid quantity");
            }

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Authentication required. Please log in again.");

            // --- Step 1: Try to record the transaction ---
            // (May fail if the stocks table doesn't have this symbol yet — that's OK)
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: user.id,
                symbol: stock.symbol,
                type,
                quantity,
                price_per_share: price,
                total_amount: totalCost,
                fees: totalFees,
            });

            if (txError) {
                // FK violation = symbol not in stocks table. Log but don't block the trade.
                console.warn("Transaction record skipped (FK):", txError.message);
            }

            // --- Step 2: Update the cash balance (always runs) ---
            const newBalance = type === "BUY"
                ? userBalance - totalCost
                : userBalance + totalCost;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ cash_balance: Math.max(0, newBalance) })
                .eq('id', user.id);

            if (updateError) throw new Error(`Balance update failed: ${updateError.message}`);

            setSuccess(true);
            onSuccess?.();
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return createPortal(
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                <div className="glass-card p-8 max-w-md w-full text-center bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-800 mb-2">Trade Executed!</h3>
                    <p className="text-emerald-700 mb-4">
                        Successfully {type === "BUY" ? "purchased" : "sold"} {quantity} shares of {stock.symbol}
                    </p>
                    <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                        <div className="text-sm font-bold text-emerald-800">Total Value: GH₵{estimatedValue.toFixed(2)}</div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }


    return createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto overflow-x-hidden pt-10 md:pt-0">
            <div className="min-h-full flex items-end md:items-center justify-center p-0 md:p-4">
                <div className="glass-card max-w-2xl w-full bg-white border-gray-200 shadow-2xl md:rounded-[32px] rounded-t-[32px] overflow-hidden relative">
                    {/* Mobile Drag Handle */}
                    <div className="md:hidden flex justify-center pt-3 pb-2 sticky top-0 bg-white/80 backdrop-blur-sm z-20">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col">
                        {/* Header Section */}
                        <div className="p-5 md:p-8 flex items-center justify-between border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border ${type === "BUY"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : "bg-red-50 border-red-100 text-red-700"
                                    }`}>
                                    {stock.symbol.substring(0, 2)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#1A1C4E] tracking-tight">{stock.symbol}</h2>
                                    <p className="text-sm font-semibold text-gray-500">{stock.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all group active:scale-95"
                            >
                                <X size={20} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="p-5 md:p-8 space-y-8 pb-10">
                            {/* Action Selectors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Trade Action</label>
                                    <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50">
                                        <button
                                            onClick={() => setType("BUY")}
                                            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${type === "BUY"
                                                ? "bg-white text-emerald-600 shadow-premium border border-emerald-100/50"
                                                : "text-gray-500 hover:text-gray-800"
                                                }`}
                                        >
                                            <TrendingUp size={14} />
                                            Buy
                                        </button>
                                        <button
                                            onClick={() => setType("SELL")}
                                            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${type === "SELL"
                                                ? "bg-white text-red-600 shadow-premium border border-red-100/50"
                                                : "text-gray-500 hover:text-gray-800"
                                                }`}
                                        >
                                            <TrendingDown size={14} />
                                            Sell
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Order Execution</label>
                                    <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50">
                                        <button
                                            onClick={() => setOrderType("MARKET")}
                                            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${orderType === "MARKET"
                                                ? "bg-white text-indigo-600 shadow-premium border border-indigo-100/50"
                                                : "text-gray-500 hover:text-gray-800"
                                                }`}
                                        >
                                            Market
                                        </button>
                                        <button
                                            onClick={() => setOrderType("LIMIT")}
                                            className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${orderType === "LIMIT"
                                                ? "bg-white text-indigo-600 shadow-premium border border-indigo-100/50"
                                                : "text-gray-500 hover:text-gray-800"
                                                }`}
                                        >
                                            Limit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Input Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Quantity (Shares)</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xl font-black text-[#1A1C4E] transition-all"
                                            placeholder="0"
                                        />
                                        <div className="flex gap-1 mt-3 overflow-x-auto no-scrollbar pb-1">
                                            {[10, 50, 100, 500].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setQuantity(p)}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-[10px] font-black text-gray-500 hover:text-indigo-600 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    +{p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {orderType === "LIMIT" && (
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Limit Price (GH₵)</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={limitPrice}
                                                onChange={(e) => setLimitPrice(e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xl font-black text-[#1A1C4E] transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Summary - Premium Receipt Style */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-50/30 rounded-[32px] -rotate-1"></div>
                                <div className="relative bg-white border border-indigo-100/50 rounded-[28px] p-6 md:p-8 shadow-premium overflow-hidden">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                            <Calculator size={16} className="text-indigo-500" />
                                            Order Summary
                                        </h3>
                                        <div className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase">
                                            Estimate
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Base Cost</p>
                                                <p className="text-sm font-black text-gray-800">{quantity.toLocaleString()} × GH₵{price.toFixed(2)}</p>
                                            </div>
                                            <p className="text-lg font-black text-[#1A1C4E] font-mono">GH₵{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-500 font-semibold group cursor-help">
                                                    GSE Levies & Fees
                                                    <Info size={12} className="text-gray-300" />
                                                </div>
                                                <span className="font-mono font-bold text-gray-700">+GH₵{totalFees.toFixed(2)}</span>
                                            </div>

                                            {/* Nested Fee Breakdown */}
                                            <div className="bg-gray-50/80 rounded-2xl p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Brokerage (1.5%)</p>
                                                    <p className="text-xs font-bold text-gray-700 font-mono">GH₵{brokerFee.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">SEC Levy (0.4%)</p>
                                                    <p className="text-xs font-bold text-gray-700 font-mono">GH₵{secLevy.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">GSE Levy (0.14%)</p>
                                                    <p className="text-xs font-bold text-gray-700 font-mono">GH₵{gseLevy.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">VAT on Fee</p>
                                                    <p className="text-xs font-bold text-gray-700 font-mono">GH₵{vat.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-2 border-t-2 border-dashed border-gray-100 relative">
                                            {/* Receipt notches */}
                                            <div className="absolute -left-10 -top-3 w-6 h-6 bg-white border border-indigo-100/50 rounded-full"></div>
                                            <div className="absolute -right-10 -top-3 w-6 h-6 bg-white border border-indigo-100/50 rounded-full"></div>

                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-black text-gray-800">{type === "BUY" ? "Total Payable" : "Net Proceeds"}</p>
                                                <div className="text-right">
                                                    <p className={`text-3xl font-black font-mono tracking-tighter ${type === "BUY" ? "text-emerald-600" : "text-red-600"}`}>
                                                        GH₵{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Balance Check */}
                            <div className={`p-5 rounded-[24px] border-2 flex items-center justify-between gap-4 transition-all ${type === "BUY" && totalCost > userBalance
                                ? "bg-red-50/50 border-red-100 text-red-700 shadow-sm"
                                : "bg-emerald-50/50 border-emerald-100 text-emerald-700 shadow-sm"
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === "BUY" && totalCost > userBalance ? "bg-red-100" : "bg-emerald-100"
                                        }`}>
                                        {type === "BUY" && totalCost > userBalance ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Available Balance</p>
                                        <p className="text-base font-black font-mono">GH₵{userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                                {type === "BUY" && totalCost > userBalance && (
                                    <div className="text-xs font-bold text-red-600 text-right leading-snug">
                                        Insufficient virtual funds.<br />
                                        <span className="font-medium text-red-500">Available: GH₵{userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="grid grid-cols-2 gap-4 pb-8">
                                <button
                                    onClick={onClose}
                                    className="py-4 px-6 bg-gray-100 text-gray-600 font-black rounded-[20px] hover:bg-gray-200 transition-all active:scale-95"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTrade}
                                    disabled={isSubmitting || quantity < 1 || (type === "BUY" && totalCost > userBalance)}
                                    className={`py-4 px-6 font-black rounded-[20px] text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${type === "BUY"
                                        ? "bg-emerald-600 shadow-emerald-200/50 hover:bg-emerald-700"
                                        : "bg-red-600 shadow-red-200/50 hover:bg-red-700"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Executing...
                                        </div>
                                    ) : (
                                        `Execute ${type}`
                                    )}
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
