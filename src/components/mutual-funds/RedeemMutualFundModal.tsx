"use client";

import { useState, useEffect } from "react";
import { type MutualFund, type UserMutualFundHolding, formatCurrency, formatPercent } from "@/lib/mutual-funds-data";
import { previewRedeemTransaction, redeemMutualFundUnits } from "@/app/actions/mutual-funds";
import { X, TrendingDown, AlertCircle, CheckCircle, Loader, AlertTriangle } from "lucide-react";

interface RedeemMutualFundModalProps {
    fund: MutualFund;
    holding: UserMutualFundHolding;
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function RedeemMutualFundModal({
    fund,
    holding,
    userId,
    isOpen,
    onClose,
    onSuccess,
}: RedeemMutualFundModalProps) {
    const [redemptionMethod, setRedemptionMethod] = useState<"units" | "amount">("units");
    const [inputValue, setInputValue] = useState("");
    const [preview, setPreview] = useState<{
        units: number;
        grossValue: number;
        exitFee: number;
        netProceeds: number;
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

        if (redemptionMethod === "units") {
            previewRedeemTransaction(fund.fund_id, value).then((result) => {
                if (result.success && result.preview) {
                    setPreview({ units: value, ...result.preview });
                }
            });
        } else {
            // Calculate units from amount
            const units = value / fund.current_nav;
            previewRedeemTransaction(fund.fund_id, units).then((result) => {
                if (result.success && result.preview) {
                    setPreview({ units, ...result.preview });
                }
            });
        }
    }, [inputValue, redemptionMethod, fund]);

    const handleMaxClick = () => {
        setRedemptionMethod("units");
        setInputValue(holding.units_held.toString());
    };

    const handleConfirm = async () => {
        if (!preview) return;

        if (preview.units > holding.units_held) {
            setError("Insufficient units");
            return;
        }

        setLoading(true);
        setError("");

        const result = await redeemMutualFundUnits(userId, fund.fund_id, preview.units);

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

    // Check minimum holding period
    const daysSincePurchase = Math.floor(
        (Date.now() - new Date(holding.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const holdingPeriodMet = daysSincePurchase >= fund.minimum_holding_period;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl pt-0 md:pt-0 flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-[#0D0F12] shadow-2xl md:rounded-3xl overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-white/[0.06] border font-instrument-sans">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#0D0F12]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight font-instrument-serif uppercase">Liquidate Units</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 font-instrument-sans">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group"
                        aria-label="Close"
                    >
                        <X size={20} className="text-zinc-500 group-hover:text-white" />
                    </button>
                </div>

                {/* Sticky Holding Bar - Context for Redemption */}
                <div className="sticky top-[89px] z-10 bg-blue-600/5 border-b border-blue-600/20 px-8 py-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                            <TrendingDown size={12} className="text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Portfolio Exposure</span>
                    </div>
                    <div className="text-base font-bold text-white tabular-nums tracking-tight">
                        {formatCurrency(holding.current_value || 0)}
                    </div>
                </div>

                {success ? (
                    <div className="p-16 text-center bg-[#0D0F12] flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10 transition-all">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 font-instrument-serif uppercase tracking-tight">Liquidation Complete</h3>
                        <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed">
                            Funds have been credited to your institutional ledger.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8 md:p-10 space-y-10">
                            {/* Current Holdings */}
                            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                <div className="relative z-10 space-y-6">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset Position Summary</div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Accumulated Units</div>
                                            <div className="text-3xl font-bold text-white tabular-nums tracking-tighter">{holding.units_held.toFixed(4)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Entrance NAV</div>
                                            <div className="text-3xl font-bold text-white tabular-nums tracking-tighter">{formatCurrency(holding.average_nav)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimum Holding Period Warning */}
                            {!holdingPeriodMet && fund.minimum_holding_period > 0 && (
                                <div className="flex items-start gap-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10 shadow-2xl shadow-red-500/5 animate-in shake duration-500">
                                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Premature Exit Advisory</div>
                                        <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-bold leading-relaxed">
                                            {fund.minimum_holding_period - daysSincePurchase} sessions remaining. Early liquidation incurs exit premiums.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Redemption Method Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Liquidation Logic</label>
                                <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.06]">
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${redemptionMethod === "units"
                                            ? "bg-white/[0.06] text-white shadow-lg"
                                            : "text-zinc-500 hover:text-white"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${redemptionMethod === "amount"
                                            ? "bg-white/[0.06] text-white shadow-lg"
                                            : "text-zinc-500 hover:text-white"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                        {redemptionMethod === "units" ? "Units to Liquidate" : "Liquidation Value (GH₵)"}
                                    </label>
                                    <button
                                        onClick={handleMaxClick}
                                        className="px-4 py-2 bg-blue-600/10 text-blue-500 text-[9px] font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest border border-blue-600/20 active:scale-95 shadow-xl shadow-blue-600/5"
                                    >
                                        MAX POSITION
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={redemptionMethod === "units" ? "Enter units" : "Enter amount"}
                                    className="w-full px-8 py-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 text-4xl font-bold text-white tabular-nums transition-all shadow-inner placeholder:text-zinc-800"
                                />
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-white/[0.02] rounded-2xl p-8 space-y-5 border border-white/[0.06] animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Liquidated Units</span>
                                        <span className="text-base font-bold text-white tabular-nums tracking-tight">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valuation Per Unit</span>
                                        <span className="text-base font-bold text-white tabular-nums tracking-tight">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.exit_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Exit Premium ({formatPercent(fund.exit_fee, false)})</span>
                                            <span className="text-base font-bold text-red-500 tabular-nums">-{formatCurrency(preview.exitFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">Net Capital Gain</span>
                                        <span className="text-4xl font-bold text-white tabular-nums tracking-tighter leading-none">{formatCurrency(preview.netProceeds)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-4 p-5 bg-red-500/5 rounded-2xl border border-red-500/10 animate-in slide-in-from-bottom-2 duration-300 shadow-2xl">
                                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{error}</span>
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
                                    disabled={!preview || loading || (preview && preview.units > holding.units_held)}
                                    className="flex-1 px-8 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest order-1 sm:order-2 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Authorizing...
                                        </>
                                    ) : (
                                        "Confirm Liquidation"
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
