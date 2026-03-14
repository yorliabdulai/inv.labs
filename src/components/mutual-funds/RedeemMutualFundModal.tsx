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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-xl flex items-start md:items-center justify-center">
            <div className="min-h-full md:min-h-0 w-full max-w-xl bg-card shadow-premium md:rounded-3xl overflow-hidden relative flex flex-col h-full md:h-auto md:max-h-[90vh] border-border border">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight font-syne uppercase">Liquidate Units</h2>
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

                {/* Sticky Holding Bar */}
                <div className="sticky top-[89px] z-10 bg-primary/5 border-b border-primary/10 px-8 py-4 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <TrendingDown size={12} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portfolio Exposure</span>
                    </div>
                    <div className="text-base font-bold text-foreground tabular-nums tracking-tight">
                        {formatCurrency(holding.current_value || 0)}
                    </div>
                </div>

                {success ? (
                    <div className="p-16 text-center bg-card flex-1 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-premium animate-in zoom-in-50 duration-500">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3 font-syne uppercase tracking-tight">Liquidation Complete</h3>
                        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            Funds have been credited to your institutional ledger.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 md:p-10 space-y-10">
                            {/* Current Holdings */}
                            <div className="bg-muted/30 rounded-2xl p-8 border border-border shadow-premium relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16" />
                                <div className="relative z-10 space-y-8">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Position Summary</div>
                                    <div className="grid grid-cols-2 gap-12">
                                        <div>
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Accumulated Units</div>
                                            <div className="text-3xl font-bold text-foreground tabular-nums tracking-tighter font-syne">{holding.units_held.toFixed(4)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Entrance NAV</div>
                                            <div className="text-3xl font-bold text-foreground tabular-nums tracking-tighter font-syne">{formatCurrency(holding.average_nav)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimum Holding Period Warning */}
                            {!holdingPeriodMet && fund.minimum_holding_period > 0 && (
                                <div className="flex items-start gap-4 p-8 bg-red-500/5 rounded-2xl border border-red-500/10 shadow-premium animate-in shake duration-500">
                                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Premature Exit Advisory</div>
                                        <div className="text-[11px] text-muted-foreground mt-3 uppercase tracking-widest font-bold leading-relaxed">
                                            {fund.minimum_holding_period - daysSincePurchase} sessions remaining. Early liquidation incurs exit premiums.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Redemption Method Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Liquidation Logic</label>
                                <div className="grid grid-cols-2 gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${redemptionMethod === "units"
                                            ? "bg-card text-foreground shadow-premium border border-border"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRedemptionMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${redemptionMethod === "amount"
                                            ? "bg-card text-foreground shadow-premium border border-border"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        By Capital
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {redemptionMethod === "units" ? "Units to Liquidate" : "Liquidation Value (GH₵)"}
                                    </label>
                                    <button
                                        onClick={handleMaxClick}
                                        className="px-4 py-2 bg-primary/10 text-primary text-[9px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest border border-primary/20 active:scale-95 shadow-premium"
                                    >
                                        MAX POSITION
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={redemptionMethod === "units" ? "Enter units" : "Enter amount"}
                                    className="w-full px-8 py-8 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:bg-muted/80 focus:border-primary/50 text-4xl font-bold text-foreground tabular-nums transition-all shadow-premium placeholder:text-muted-foreground/30 font-syne"
                                />
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-muted/10 rounded-2xl p-8 space-y-6 border border-border animate-in fade-in slide-in-from-top-4 duration-500 shadow-premium">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Liquidated Units</span>
                                        <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valuation Per Unit</span>
                                        <span className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.exit_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exit Premium ({formatPercent(fund.exit_fee, false)})</span>
                                            <span className="text-lg font-bold text-red-500 tabular-nums">-{formatCurrency(preview.exitFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-8 border-t border-border flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Net Capital Gain</span>
                                        <span className="text-4xl font-bold text-foreground tabular-nums tracking-tighter leading-none font-syne">{formatCurrency(preview.netProceeds)}</span>
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
                                    disabled={!preview || loading || (preview && preview.units > holding.units_held)}
                                    className="flex-1 px-8 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest order-1 sm:order-2 active:scale-95"
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
