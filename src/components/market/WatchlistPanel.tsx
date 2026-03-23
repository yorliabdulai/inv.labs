"use client";

import { useState, useEffect } from "react";
import { Star, X, TrendingUp, TrendingDown, Eye, Bell, RefreshCw } from "lucide-react";
import { type Stock } from "@/lib/market-data";
import { getBookmarks, toggleBookmark, getMarketData } from "@/app/actions/market";
import { useUserProfile } from "@/lib/useUserProfile";

interface WatchlistItem extends Stock {
    alerts?: {
        priceAbove?: number;
        priceBelow?: number;
        volumeSpike?: boolean;
    };
}

interface WatchlistPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WatchlistPanel({ isOpen, onClose }: WatchlistPanelProps) {
    const { user } = useUserProfile();
    const [bookmarkedStocks, setBookmarkedStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);

    const loadWatchlist = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [symbols, allStocks] = await Promise.all([
                getBookmarks(),
                getMarketData()
            ]);

            const filtered = allStocks.filter(s => symbols.includes(s.symbol));
            setBookmarkedStocks(filtered);
        } catch (error) {
            console.error("Watchlist error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && user) {
            loadWatchlist();
        }
    }, [isOpen, user]);

    const removeFromWatchlist = async (symbol: string) => {
        await toggleBookmark(symbol);
        setBookmarkedStocks(prev => prev.filter(s => s.symbol !== symbol));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Star size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-black text-primary">Watchlists</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            {/* Watchlist Tabs */}
            <div className="border-b border-gray-100">
                <div className="flex gap-1 p-4 overflow-x-auto">
                    <div className="px-4 py-2 rounded-lg font-bold text-sm bg-primary text-white shadow-lg shadow-indigo-100">
                        My Watchlist
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            {bookmarkedStocks.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Watchlist Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <RefreshCw size={24} className="animate-spin mb-4 opacity-50" />
                        <p className="text-sm">Loading watchlist...</p>
                    </div>
                ) : bookmarkedStocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Star size={48} className="mb-4 opacity-50" />
                        <p className="text-center font-medium mb-2">No stocks in watchlist</p>
                        <p className="text-center text-sm text-gray-500 max-w-xs">
                            Add stocks from the market explorer to track their performance
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {bookmarkedStocks.map(stock => (
                            <div key={stock.symbol} className="glass-card p-4 hover:shadow-md transition-all group relative">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${stock.change >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {stock.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-sm">{stock.symbol}</div>
                                            <div className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{stock.name}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromWatchlist(stock.symbol)}
                                        className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors text-gray-400"
                                        aria-label={`Remove ${stock.symbol} from watchlist`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-black text-[#1A1C4E] font-mono">GH₵{stock.price.toFixed(2)}</div>
                                        <div className={`text-sm font-bold flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                            {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Volume</div>
                                        <div className="text-sm font-black text-gray-800">{(stock.volume / 1000).toFixed(1)}K</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-primary text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                        <Eye size={16} />
                        Market Scanner
                    </button>
                    <button
                        className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        aria-label="Alerts"
                    >
                        <Bell size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

