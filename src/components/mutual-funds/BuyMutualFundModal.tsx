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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md pt-0 md:pt-0 flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-[#121417] shadow-2xl md:rounded-[2px] overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-white/10 border">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#121417] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#F9F9F9] tracking-tighter font-instrument-serif uppercase">Acquire Units</h2>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-[2px] flex items-center justify-center hover:bg-white/5 transition-colors group"
                    >
                        <X size={20} className="text-white/40 group-hover:text-[#F9F9F9]" />
                    </button>
                </div>

                {/* Sticky Balance Bar - ALWAYS VISIBLE */}
                <div className="sticky top-[73px] z-10 bg-[#C05E42]/5 border-b border-[#C05E42]/20 px-6 py-3 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-[#C05E42]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Available Virtual Capital</span>
                    </div>
                    <div className="text-sm font-black text-[#F9F9F9] tabular-nums">
                        {formatCurrency(cashBalance)}
                    </div>
                </div>

                {success ? (
                    <div className="p-12 text-center bg-[#121417] flex-1 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-[2px] bg-[#C05E42]/10 border border-[#C05E42]/20 flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle size={32} className="text-[#C05E42]" />
                        </div>
                        <h3 className="text-xl font-black text-[#F9F9F9] mb-2 font-instrument-serif uppercase tracking-tight">Acquisition Confirmed</h3>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            Your units have been successfully added to your ledger.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Current NAV */}
                            <div className="bg-white/5 rounded-[2px] p-5 border border-white/10 group">
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Current Unit Price (NAV)</div>
                                <div className="text-3xl font-black text-[#F9F9F9] tabular-nums tracking-tighter leading-none">{formatCurrency(fund.current_nav)}</div>
                                <div className="text-[10px] font-bold text-[#C05E42] mt-3 uppercase tracking-wider">Per Performance Unit</div>
                            </div>

                            {/* Investment Method Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Allocation Strategy</label>
                                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-[2px] border border-white/10">
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${investmentMethod === "amount"
                                            ? "bg-white/10 text-[#F9F9F9]"
                                            : "text-white/30 hover:text-white/60"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${investmentMethod === "units"
                                            ? "bg-white/10 text-[#F9F9F9]"
                                            : "text-white/30 hover:text-white/60"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">
                                    {investmentMethod === "amount" ? "Capital Allocation (GH₵)" : "Total Placement Units"}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={investmentMethod === "amount" ? "Enter amount" : "Enter units"}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2px] focus:outline-none focus:bg-white/10 focus:border-[#C05E42]/50 text-2xl font-black text-[#F9F9F9] tabular-nums transition-all"
                                    />
                                </div>
                                <div className="mt-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">
                                    Minimum Entry Threshold: <span className="text-[#F9F9F9]">{formatCurrency(fund.minimum_investment)}</span>
                                </div>
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-white/5 rounded-[2px] p-6 space-y-4 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calculated Units</span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Value</span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.entry_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Entry Privilege ({formatPercent(fund.entry_fee, false)})</span>
                                            <span className="text-sm font-black text-[#F9F9F9] tabular-nums">{formatCurrency(preview.entryFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[11px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Total Liquidity</span>
                                        <span className="text-3xl font-black text-[#F9F9F9] tabular-nums tracking-tighter">{formatCurrency(preview.totalCost)}</span>
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
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-12">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-5 bg-white/5 text-white/40 font-black rounded-[2px] hover:bg-white/10 hover:text-[#F9F9F9] transition-all text-xs uppercase tracking-widest order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!preview || loading || (preview && preview.totalCost > cashBalance)}
                                    className="flex-1 px-6 py-5 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] shadow-xl shadow-[#C05E42]/10 hover:shadow-[#C05E42]/20 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] order-1 sm:order-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Authorizing...
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
