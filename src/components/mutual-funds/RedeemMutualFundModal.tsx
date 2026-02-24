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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md pt-0 md:pt-0 flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-[#121417] shadow-2xl md:rounded-[2px] overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-white/10 border font-instrument-sans">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#121417] border-b border-white/10 px-6 py-4 flex items-center justify-between font-instrument-serif">
                    <div>
                        <h2 className="text-xl font-black text-[#F9F9F9] tracking-tighter uppercase">Liquidate Portfolio Units</h2>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 font-instrument-sans">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-[2px] flex items-center justify-center hover:bg-white/5 transition-colors group"
                    >
                        <X size={20} className="text-white/40 group-hover:text-[#F9F9F9]" />
                    </button>
                </div>

                {/* Sticky Holding Bar - Context for Redemption */}
                <div className="sticky top-[73px] z-10 bg-[#C05E42]/5 border-b border-[#C05E42]/20 px-6 py-3 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <TrendingDown size={14} className="text-[#C05E42]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Portfolio Exposure</span>
                    </div>
                    <div className="text-sm font-black text-[#F9F9F9] tabular-nums">
                        {formatCurrency(holding.current_value || 0)}
                    </div>
                </div>

                {success ? (
                    <div className="p-12 text-center bg-[#121417] flex-1 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-[2px] bg-[#C05E42]/10 border border-[#C05E42]/20 flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle size={32} className="text-[#C05E42]" />
                        </div>
                        <h3 className="text-xl font-black text-[#F9F9F9] mb-2 font-instrument-serif uppercase tracking-tight">Liquidation Complete</h3>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            Funds have been credited to your virtual capital account.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Current Holdings */}
                            <div className="bg-white/5 rounded-[2px] p-5 border border-white/10 space-y-4">
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Asset Position</div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Accumulated Units</div>
                                        <div className="text-2xl font-black text-[#F9F9F9] tabular-nums tracking-tighter">{holding.units_held.toFixed(4)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Entrance NAV</div>
                                        <div className="text-2xl font-black text-[#F9F9F9] tabular-nums tracking-tighter">{formatCurrency(holding.average_nav)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimum Holding Period Warning */}
                            {!holdingPeriodMet && fund.minimum_holding_period > 0 && (
                                <div className="flex items-start gap-3 p-5 bg-[#C05E42]/10 rounded-[2px] border border-[#C05E42]/20">
                                    <AlertTriangle size={18} className="text-[#C05E42] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-black text-[#C05E42] uppercase tracking-widest">Premature Exit Advisory</div>
                                        <div className="text-[9px] text-white/40 mt-1 uppercase tracking-wider font-bold">
                                            {fund.minimum_holding_period - daysSincePurchase} sessions remaining. Early liquidation incurs exit premiums.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Redemption Method Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Liquidation Logic</label>
                                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-[2px] border border-white/10">
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${redemptionMethod === "units"
                                            ? "bg-white/10 text-[#F9F9F9]"
                                            : "text-white/30 hover:text-white/60"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all ${redemptionMethod === "amount"
                                            ? "bg-white/10 text-[#F9F9F9]"
                                            : "text-white/30 hover:text-white/60"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">
                                        {redemptionMethod === "units" ? "Units to Liquidate" : "Liquidation Value (GH₵)"}
                                    </label>
                                    <button
                                        onClick={handleMaxClick}
                                        className="px-3 py-1.5 bg-[#C05E42]/10 text-[#C05E42] text-[9px] font-black rounded-[1px] hover:bg-[#C05E42] hover:text-[#F9F9F9] transition-all uppercase tracking-widest border border-[#C05E42]/20"
                                    >
                                        MAX POSITION
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={redemptionMethod === "units" ? "Enter units" : "Enter amount"}
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2px] focus:outline-none focus:bg-white/10 focus:border-[#C05E42]/50 text-2xl font-black text-[#F9F9F9] tabular-nums transition-all"
                                />
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-white/5 rounded-[2px] p-6 space-y-4 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Liquidated Units</span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Valuation Per Unit</span>
                                        <span className="text-sm font-black text-[#F9F9F9] tabular-nums">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.exit_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Exit Premium ({formatPercent(fund.exit_fee, false)})</span>
                                            <span className="text-sm font-black text-[#C05E42] tabular-nums">-{formatCurrency(preview.exitFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[11px] font-black text-[#C05E42] uppercase tracking-[0.2em]">Net Capital Gain</span>
                                        <span className="text-3xl font-black text-[#F9F9F9] tabular-nums tracking-tighter">{formatCurrency(preview.netProceeds)}</span>
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
                                    disabled={!preview || loading || (preview && preview.units > holding.units_held)}
                                    className="flex-1 px-6 py-5 bg-[#C05E42] text-[#F9F9F9] font-black rounded-[2px] shadow-xl shadow-[#C05E42]/10 hover:shadow-[#C05E42]/20 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] order-1 sm:order-2"
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
