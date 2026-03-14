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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-xl flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-card shadow-premium md:rounded-3xl overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-border border">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight font-instrument-serif uppercase">Acquire Units</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 hover:bg-muted border border-border transition-all group shadow-premium"
                        aria-label="Close"
                    >
                        <X size={20} className="text-muted-foreground group-hover:text-foreground" />
                    </button>
                </div>

                {/* Sticky Balance Bar */}
                <div className="sticky top-[89px] z-10 bg-primary/5 border-b border-primary/10 px-8 py-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <DollarSign size={12} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Liquidity</span>
                    </div>
                    <div className="text-base font-bold text-foreground tabular-nums tracking-tight">
                        {formatCurrency(cashBalance)}
                    </div>
                </div>

                {success ? (
                    <div className="p-16 text-center bg-card flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-premium animate-in zoom-in-50 duration-500">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 font-instrument-serif uppercase tracking-tight">Acquisition Confirmed</h3>
                        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            Your units have been successfully added to the portfolio.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 md:p-10 space-y-10">
                            {/* Current NAV */}
                            <div className="bg-muted/30 rounded-2xl p-8 border border-border group shadow-premium relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Current Unit Price (NAV)</div>
                                    <div className="text-4xl md:text-5xl font-bold text-foreground tabular-nums tracking-tighter leading-none font-instrument-serif">{formatCurrency(fund.current_nav)}</div>
                                    <div className="text-[10px] font-bold text-primary mt-6 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        Standard Performance Unit
                                    </div>
                                </div>
                            </div>

                            {/* Investment Method Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Allocation Strategy</label>
                                <div className="grid grid-cols-2 gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${investmentMethod === "amount"
                                            ? "bg-card text-foreground shadow-premium border border-border"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${investmentMethod === "units"
                                            ? "bg-card text-foreground shadow-premium border border-border"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                    {investmentMethod === "amount" ? "Capital Allocation (GH₵)" : "Total Placement Units"}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={investmentMethod === "amount" ? "Enter amount" : "Enter units"}
                                        className="w-full px-8 py-8 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:bg-muted/80 focus:border-primary/50 text-4xl font-bold text-foreground tabular-nums transition-all shadow-premium placeholder:text-muted-foreground/30 font-instrument-serif"
                                    />
                                </div>
                                <div className="mt-4 px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                                    <span>Minimum Entry Threshold</span>
                                    <span className="text-primary">{formatCurrency(fund.minimum_investment)}</span>
                                </div>
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-muted/10 rounded-2xl p-8 space-y-6 border border-border animate-in fade-in slide-in-from-top-4 duration-500 shadow-premium">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calculated Units</span>
                                        <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base NAV Unit</span>
                                        <span className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.entry_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Privilege ({formatPercent(fund.entry_fee, false)})</span>
                                            <span className="text-lg font-bold text-foreground tabular-nums">+{formatCurrency(preview.entryFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-8 border-t border-border flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Final Token Value</span>
                                        <span className="text-4xl font-bold text-foreground tabular-nums tracking-tighter leading-none font-instrument-serif">{formatCurrency(preview.totalCost)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10 animate-in shake duration-500 shadow-premium">
                                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-10 pb-16">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-5 bg-muted/50 text-muted-foreground hover:text-foreground font-bold rounded-2xl border border-border hover:bg-muted transition-all text-[10px] uppercase tracking-widest order-2 sm:order-1 active:scale-95 shadow-premium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!preview || loading || (preview && preview.totalCost > cashBalance)}
                                    className="flex-1 px-8 py-5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest order-1 sm:order-2 active:scale-95"
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
