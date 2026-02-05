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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-card bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Redeem Units</h2>
                        <p className="text-sm font-medium text-gray-600">{fund.fund_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/50 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">Redemption Successful!</h3>
                        <p className="text-gray-600">Funds have been credited to your cash balance.</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Current Holdings */}
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 space-y-2">
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Your Holdings</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-bold text-indigo-700">Units Held</div>
                                    <div className="text-xl font-black text-indigo-900">{holding.units_held.toFixed(4)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-indigo-700">Current Value</div>
                                    <div className="text-xl font-black text-indigo-900">{formatCurrency(holding.current_value || 0)}</div>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-indigo-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-700">Avg NAV</span>
                                <span className="text-sm font-black text-indigo-900">{formatCurrency(holding.average_nav)}</span>
                            </div>
                        </div>

                        {/* Minimum Holding Period Warning */}
                        {!holdingPeriodMet && fund.minimum_holding_period > 0 && (
                            <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-amber-700">Minimum Holding Period Not Met</div>
                                    <div className="text-xs text-amber-600 mt-1">
                                        {fund.minimum_holding_period - daysSincePurchase} days remaining. Early redemption may incur additional fees.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Redemption Method Selector */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Redemption Method</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => {
                                        setRedemptionMethod("units");
                                        setInputValue("");
                                    }}
                                    className={`py-3 rounded-lg text-sm font-black transition-all ${redemptionMethod === "units"
                                            ? "bg-white text-red-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    By Units
                                </button>
                                <button
                                    onClick={() => {
                                        setRedemptionMethod("amount");
                                        setInputValue("");
                                    }}
                                    className={`py-3 rounded-lg text-sm font-black transition-all ${redemptionMethod === "amount"
                                            ? "bg-white text-red-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    By Amount
                                </button>
                            </div>
                        </div>

                        {/* Input Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">
                                    {redemptionMethod === "units" ? "Units to Redeem" : "Redemption Amount (GH₵)"}
                                </label>
                                <button
                                    onClick={handleMaxClick}
                                    className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    MAX
                                </button>
                            </div>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={redemptionMethod === "units" ? "Enter units" : "Enter amount"}
                                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-400 text-lg font-bold"
                            />
                        </div>

                        {/* Preview Calculation */}
                        {preview && (
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">Units to Redeem</span>
                                    <span className="text-sm font-black text-gray-900">{preview.units.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">NAV per Unit</span>
                                    <span className="text-sm font-black text-gray-900">{formatCurrency(fund.current_nav)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">Gross Value</span>
                                    <span className="text-sm font-black text-gray-900">{formatCurrency(preview.grossValue)}</span>
                                </div>
                                {fund.exit_fee > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">Exit Fee ({formatPercent(fund.exit_fee, false)})</span>
                                        <span className="text-sm font-black text-red-600">-{formatCurrency(preview.exitFee)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-base font-black text-gray-900">Net Proceeds</span>
                                    <span className="text-xl font-black text-emerald-600">{formatCurrency(preview.netProceeds)}</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200">
                                <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                                <span className="text-sm font-bold text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!preview || loading || (preview && preview.units > holding.units_held)}
                                className="flex-1 px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Redemption"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
