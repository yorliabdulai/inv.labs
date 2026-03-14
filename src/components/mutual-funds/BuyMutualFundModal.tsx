"use client";

import { useState, useEffect } from "react";
import { type MutualFund, formatCurrency, formatPercent } from "@/lib/mutual-funds-data";
import { previewBuyTransaction, buyMutualFundUnits } from "@/app/actions/mutual-funds";
import { X, DollarSign, TrendingUp, AlertCircle, CheckCircle, Loader } from "lucide-react";

interface BuyMutualFundModalProps {
    fund: MutualFund;
    userId: string;
    cashBalance: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function BuyMutualFundModal({
    fund,
    userId,
    cashBalance,
    isOpen,
    onClose,
    onSuccess,
}: BuyMutualFundModalProps) {
    const [investmentMethod, setInvestmentMethod] = useState<"amount" | "units">("amount");
    const [inputValue, setInputValue] = useState("");
    const [preview, setPreview] = useState<{
        units: number;
        entryFee: number;
        totalCost: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Calculate preview when input changes
    useEffect(() => {
        const value = parseFloat(inputValue);
        if (!inputValue || isNaN(value) || value <= 0) {
            setPreview(null);
            return;
        }

        if (investmentMethod === "amount") {
            previewBuyTransaction(fund.fund_id, value).then((result) => {
                if (result.success && result.preview) {
                    setPreview(result.preview);
                }
            });
        } else {
            // Calculate from units
            const amount = value * fund.current_nav;
            const entryFee = (amount * fund.entry_fee) / 100;
            const totalCost = amount + entryFee;
            setPreview({ units: value, entryFee, totalCost });
        }
    }, [inputValue, investmentMethod, fund]);

    const handleConfirm = async () => {
        if (!preview) return;

        if (preview.totalCost > cashBalance) {
            setError("Insufficient cash balance");
            return;
        }

        setLoading(true);
        setError("");

        const amount = investmentMethod === "amount" ? parseFloat(inputValue) : preview.units * fund.current_nav;
        const result = await buyMutualFundUnits(userId, fund.fund_id, amount);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
                setSuccess(false);
                setInputValue("");
                setPreview(null);
            }, 2000);
        } else {
            setError(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl pt-0 md:pt-0 flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-[#0D0F12] shadow-2xl md:rounded-3xl overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-white/[0.06] border">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#0D0F12]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight font-instrument-serif uppercase">Acquire Units</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group"
                        aria-label="Close"
                    >
                        <X size={20} className="text-zinc-500 group-hover:text-white" />
                    </button>
                </div>

                {/* Sticky Balance Bar - ALWAYS VISIBLE */}
                <div className="sticky top-[89px] z-10 bg-blue-600/5 border-b border-blue-600/20 px-8 py-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                            <DollarSign size={12} className="text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Virtual Liquidity</span>
                    </div>
                    <div className="text-base font-bold text-white tabular-nums tracking-tight">
                        {formatCurrency(cashBalance)}
                    </div>
                </div>

                {success ? (
                    <div className="p-16 text-center bg-[#0D0F12] flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 font-instrument-serif uppercase tracking-tight">Acquisition Confirmed</h3>
                        <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed">
                            Your units have been successfully added to the institutional ledger.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8 md:p-10 space-y-10">
                            {/* Current NAV */}
                            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] group shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Current Unit Price (NAV)</div>
                                    <div className="text-4xl font-bold text-white tabular-nums tracking-tighter leading-none">{formatCurrency(fund.current_nav)}</div>
                                    <div className="text-[10px] font-bold text-blue-500 mt-4 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Standard Performance Unit
                                    </div>
                                </div>
                            </div>

                            {/* Investment Method Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Allocation Strategy</label>
                                <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.06]">
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${investmentMethod === "amount"
                                            ? "bg-white/[0.06] text-white shadow-lg"
                                            : "text-zinc-500 hover:text-white"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${investmentMethod === "units"
                                            ? "bg-white/[0.06] text-white shadow-lg"
                                            : "text-zinc-500 hover:text-white"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                    {investmentMethod === "amount" ? "Capital Allocation (GH₵)" : "Total Placement Units"}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={investmentMethod === "amount" ? "Enter amount" : "Enter units"}
                                        className="w-full px-8 py-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 text-4xl font-bold text-white tabular-nums transition-all shadow-inner placeholder:text-zinc-800"
                                    />
                                </div>
                                <div className="mt-3 px-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    Minimum Entry Threshold: <span className="text-zinc-400">{formatCurrency(fund.minimum_investment)}</span>
                                </div>
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-white/[0.02] rounded-2xl p-8 space-y-5 border border-white/[0.06] animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Calculated Units</span>
                                        <span className="text-base font-bold text-white tabular-nums tracking-tight">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base NAV Unit</span>
                                        <span className="text-base font-bold text-white tabular-nums tracking-tight">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.entry_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Entry Privilege ({formatPercent(fund.entry_fee, false)})</span>
                                            <span className="text-base font-bold text-white tabular-nums">+{formatCurrency(preview.entryFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">Final Token Value</span>
                                        <span className="text-4xl font-bold text-white tabular-nums tracking-tighter leading-none">{formatCurrency(preview.totalCost)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-3 p-5 bg-red-500/10 rounded-[2px] border border-red-500/20 animate-in slide-in-from-bottom-2 duration-300">
                                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-tight">{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-10 pb-16">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-5 bg-white/[0.03] text-zinc-500 hover:text-white font-bold rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] transition-all text-[11px] uppercase tracking-widest order-2 sm:order-1 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!preview || loading || (preview && preview.totalCost > cashBalance)}
                                    className="flex-1 px-8 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest order-1 sm:order-2 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Authorizing Placement...
                                        </>
                                    ) : (
                                        "Execute Placement"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
