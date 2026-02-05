"use client";

import { useState, useEffect } from "react";
import { Stock } from "@/lib/market-data";
import { X, TrendingUp, TrendingDown, DollarSign, Calculator, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface TradeModalProps {
    stock: Stock;
    isOpen: boolean;
    onClose: () => void;
    userBalance: number; // In real app, fetch from context
}

export function TradeModal({ stock, isOpen, onClose, userBalance }: TradeModalProps) {
    const [type, setType] = useState<"BUY" | "SELL">("BUY");
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [limitPrice, setLimitPrice] = useState(stock.price.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    if (!isOpen) return null;

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
                throw new Error("Insufficient funds for this transaction");
            }

            if (quantity < 1) {
                throw new Error("Please enter a valid quantity");
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            // Insert transaction
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: user.id,
                symbol: stock.symbol,
                type,
                quantity,
                price_per_share: price,
                total_amount: totalCost,
                fees: totalFees,
                order_type: orderType,
                limit_price: orderType === "LIMIT" ? parseFloat(limitPrice) : null
            });

            if (txError) throw txError;

            setSuccess(true);
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
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
            <div className="glass-card max-w-lg w-full bg-white border-gray-200 shadow-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto safe-area-inset-bottom">
                {/* Mobile Drag Handle */}
                <div className="md:hidden flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${type === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            }`}>
                            {stock.symbol.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-black text-[#1A1C4E] truncate">Trade {stock.symbol}</h2>
                            <p className="text-xs md:text-sm text-gray-600 truncate">{stock.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 flex-shrink-0"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Trade Type Selection */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                        <button
                            onClick={() => setType("BUY")}
                            className={`flex-1 py-3 md:py-3 px-4 rounded-lg font-black text-sm transition-all min-h-[48px] touch-manipulation active:scale-95 ${type === "BUY"
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                    : "text-gray-600 hover:text-emerald-600"
                                }`}
                        >
                            <TrendingUp size={16} className="inline mr-2" />
                            Buy
                        </button>
                        <button
                            onClick={() => setType("SELL")}
                            className={`flex-1 py-3 md:py-3 px-4 rounded-lg font-black text-sm transition-all min-h-[48px] touch-manipulation active:scale-95 ${type === "SELL"
                                    ? "bg-red-600 text-white shadow-lg shadow-red-100"
                                    : "text-gray-600 hover:text-red-600"
                                }`}
                        >
                            <TrendingDown size={16} className="inline mr-2" />
                            Sell
                        </button>
                    </div>
                </div>

                {/* Order Type */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setOrderType("MARKET")}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all border min-h-[48px] touch-manipulation active:scale-95 ${orderType === "MARKET"
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                }`}
                        >
                            Market Order
                        </button>
                        <button
                            onClick={() => setOrderType("LIMIT")}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all border min-h-[48px] touch-manipulation active:scale-95 ${orderType === "LIMIT"
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                }`}
                        >
                            Limit Order
                        </button>
                    </div>
                </div>

                {/* Quantity Input */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-4 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 text-lg font-mono touch-manipulation"
                    />

                    {/* Quantity Presets */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {quantityPresets.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setQuantity(preset)}
                                className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-sm font-bold transition-colors min-h-[44px] touch-manipulation active:scale-95"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Limit Price (if applicable) */}
                {orderType === "LIMIT" && (
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Limit Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">GH₵</span>
                            <input
                                type="number"
                                step="0.01"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 text-lg font-mono touch-manipulation"
                            />
                        </div>
                    </div>
                )}

                {/* Order Summary */}
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                        <Calculator size={16} />
                        Order Summary
                    </h4>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Share Price</span>
                            <span className="font-mono font-bold text-gray-800">GH₵{price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quantity</span>
                            <span className="font-mono font-bold text-gray-800">{quantity} shares</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="font-mono font-bold text-gray-800">GH₵{subtotal.toFixed(2)}</span>
                        </div>

                        {/* Fee Breakdown */}
                        <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-500">Broker Fee (1.5%)</span>
                                <span className="font-mono text-gray-700">GH₵{brokerFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-500">SEC Levy (0.4%)</span>
                                <span className="font-mono text-gray-700">GH₵{secLevy.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-gray-500">GSE Levy (0.14%)</span>
                                <span className="font-mono text-gray-700">GH₵{gseLevy.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">VAT (15% on Broker Fee)</span>
                                <span className="font-mono text-gray-700">GH₵{vat.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-800">Total Fees</span>
                            <span className="font-mono font-bold text-gray-800">GH₵{totalFees.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg font-black pt-2 border-t-2 border-gray-300">
                            <span className={type === "BUY" ? "text-emerald-600" : "text-red-600"}>
                                {type === "BUY" ? "Total Cost" : "Net Proceeds"}
                            </span>
                            <span className={`font-mono ${type === "BUY" ? "text-emerald-600" : "text-red-600"}`}>
                                GH₵{estimatedValue.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Account Balance Check */}
                    {type === "BUY" && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${estimatedValue > userBalance
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                            {estimatedValue > userBalance ? (
                                <AlertTriangle size={16} />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            <span>
                                {estimatedValue > userBalance
                                    ? `Insufficient funds. Available: GH₵${userBalance.toFixed(2)}`
                                    : `Available balance: GH₵${userBalance.toFixed(2)}`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-4 md:mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 md:p-6 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white border-t border-gray-100 md:border-t-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 md:py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all min-h-[52px] touch-manipulation active:scale-95"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTrade}
                        disabled={isSubmitting || quantity < 1 || (type === "BUY" && estimatedValue > userBalance)}
                        className={`flex-1 py-4 md:py-3 px-6 font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation active:scale-95 ${type === "BUY"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : (
                            `Confirm ${type}`
                        )}
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-3 rounded-lg">
                        <Info size={14} className="mt-0.5 flex-shrink-0" />
                        <p>
                            All fees are estimates and may vary. Market orders execute at current market price.
                            Limit orders may not execute if price target is not reached.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
