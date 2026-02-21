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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm pt-10 md:pt-0">
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="glass-card bg-white max-w-lg w-full overflow-hidden shadow-2xl rounded-[24px] md:rounded-[32px] relative">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Buy Units</h2>
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
                        <div className="p-8 text-center bg-white">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">Purchase Successful!</h3>
                            <p className="text-gray-600">Your mutual fund units have been added to your portfolio.</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6 bg-white pb-10">
                            {/* Current NAV */}
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Current NAV</div>
                                <div className="text-2xl font-black text-indigo-900">{formatCurrency(fund.current_nav)}</div>
                                <div className="text-xs font-medium text-indigo-600 mt-1">per unit</div>
                            </div>

                            {/* Investment Method Selector */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">Investment Method</label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("amount");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-lg text-sm font-black transition-all ${investmentMethod === "amount"
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        By Amount
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInvestmentMethod("units");
                                            setInputValue("");
                                        }}
                                        className={`py-3 rounded-lg text-sm font-black transition-all ${investmentMethod === "units"
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        By Units
                                    </button>
                                </div>
                            </div>

                            {/* Input Field */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">
                                    {investmentMethod === "amount" ? "Investment Amount (GH₵)" : "Number of Units"}
                                </label>
                                <div className="relative">
                                    {investmentMethod === "amount" && (
                                        <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    )}
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={investmentMethod === "amount" ? "Enter amount" : "Enter units"}
                                        className={`w-full ${investmentMethod === "amount" ? "pl-12" : "pl-4"} pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 text-lg font-bold`}
                                    />
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-500">
                                    Minimum investment: {formatCurrency(fund.minimum_investment)}
                                </div>
                            </div>

                            {/* Preview Calculation */}
                            {preview && (
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">Units to Purchase</span>
                                        <span className="text-sm font-black text-gray-900">{preview.units.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">NAV per Unit</span>
                                        <span className="text-sm font-black text-gray-900">{formatCurrency(fund.current_nav)}</span>
                                    </div>
                                    {fund.entry_fee > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-600">Entry Fee ({formatPercent(fund.entry_fee, false)})</span>
                                            <span className="text-sm font-black text-gray-900">{formatCurrency(preview.entryFee)}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-base font-black text-gray-900">Total Cost</span>
                                        <span className="text-xl font-black text-indigo-600">{formatCurrency(preview.totalCost)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Cash Balance */}
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <span className="text-sm font-bold text-purple-700">Available Cash</span>
                                <span className="text-lg font-black text-purple-900">{formatCurrency(cashBalance)}</span>
                            </div>

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
                                    disabled={!preview || loading || (preview && preview.totalCost > cashBalance)}
                                    className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm Purchase"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
