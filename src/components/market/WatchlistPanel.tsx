"use client";

import { useState, useEffect } from "react";
import { Plus, Star, X, TrendingUp, TrendingDown, Eye, Bell, BellOff } from "lucide-react";
import { Stock } from "@/lib/market-data";

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
    const [watchlists, setWatchlists] = useState<{
        id: string;
        name: string;
        stocks: WatchlistItem[];
        isDefault?: boolean;
    }[]>([
        {
            id: "default",
            name: "My Watchlist",
            isDefault: true,
            stocks: [
                {
                    symbol: "MTNGH",
                    name: "Scancom PLC",
                    price: 1.55,
                    change: 1.2,
                    changePercent: 1.2,
                    volume: 2400000,
                    sector: "Telecommunications",
                    alerts: { priceAbove: 1.60 }
                },
                {
                    symbol: "EGH",
                    name: "Ecobank Ghana",
                    price: 6.80,
                    change: -0.4,
                    changePercent: -0.4,
                    volume: 1800000,
                    sector: "Banking",
                    alerts: { priceBelow: 6.50 }
                }
            ]
        }
    ]);

    const [activeWatchlist, setActiveWatchlist] = useState("default");
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const currentWatchlist = watchlists.find(w => w.id === activeWatchlist);

    const createWatchlist = () => {
        if (newWatchlistName.trim()) {
            const newWatchlist = {
                id: Date.now().toString(),
                name: newWatchlistName.trim(),
                stocks: []
            };
            setWatchlists(prev => [...prev, newWatchlist]);
            setActiveWatchlist(newWatchlist.id);
            setNewWatchlistName("");
            setShowCreateForm(false);
        }
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlists(prev =>
            prev.map(watchlist =>
                watchlist.id === activeWatchlist
                    ? { ...watchlist, stocks: watchlist.stocks.filter(s => s.symbol !== symbol) }
                    : watchlist
            )
        );
    };

    const toggleAlert = (symbol: string, alertType: keyof NonNullable<WatchlistItem['alerts']>) => {
        setWatchlists(prev =>
            prev.map(watchlist =>
                watchlist.id === activeWatchlist
                    ? {
                        ...watchlist,
                        stocks: watchlist.stocks.map(stock =>
                            stock.symbol === symbol
                                ? {
                                    ...stock,
                                    alerts: {
                                        ...stock.alerts,
                                        [alertType]: stock.alerts?.[alertType] ? undefined : stock.price * (alertType === 'priceAbove' ? 1.05 : 0.95)
                                    }
                                }
                                : stock
                        )
                    }
                    : watchlist
            )
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Star size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-black text-[#1A1C4E]">Watchlists</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            {/* Watchlist Tabs */}
            <div className="border-b border-gray-100">
                <div className="flex gap-1 p-4 overflow-x-auto">
                    {watchlists.map(watchlist => (
                        <button
                            key={watchlist.id}
                            onClick={() => setActiveWatchlist(watchlist.id)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeWatchlist === watchlist.id
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {watchlist.name}
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {watchlist.stocks.length}
                            </span>
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Create Watchlist Form */}
                {showCreateForm && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Watchlist name..."
                                value={newWatchlistName}
                                onChange={(e) => setNewWatchlistName(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                                onKeyPress={(e) => e.key === 'Enter' && createWatchlist()}
                            />
                            <button
                                onClick={createWatchlist}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => { setShowCreateForm(false); setNewWatchlistName(""); }}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Watchlist Content */}
            <div className="flex-1 overflow-y-auto">
                {currentWatchlist?.stocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Star size={48} className="mb-4 opacity-50" />
                        <p className="text-center font-medium mb-2">No stocks in watchlist</p>
                        <p className="text-center text-sm text-gray-500 max-w-xs">
                            Add stocks from the market explorer to track their performance
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {currentWatchlist?.stocks.map(stock => (
                            <div key={stock.symbol} className="glass-card p-4 hover:shadow-md transition-all">
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
                                        className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={14} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mb-3">
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

                                {/* Alerts */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAlert(stock.symbol, 'priceAbove')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${stock.alerts?.priceAbove
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Bell size={12} />
                                        Price Alert
                                    </button>
                                    <button
                                        onClick={() => toggleAlert(stock.symbol, 'volumeSpike')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${stock.alerts?.volumeSpike
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <TrendingUp size={12} />
                                        Volume
                                    </button>
                                </div>

                                {/* Active Alerts Display */}
                                {stock.alerts && Object.keys(stock.alerts).some(key => stock.alerts?.[key as keyof typeof stock.alerts]) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Alerts</div>
                                        <div className="flex flex-wrap gap-1">
                                            {stock.alerts.priceAbove && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                                                    <Bell size={10} />
                                                    Above GH₵{stock.alerts.priceAbove.toFixed(2)}
                                                </span>
                                            )}
                                            {stock.alerts.priceBelow && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                                                    <Bell size={10} />
                                                    Below GH₵{stock.alerts.priceBelow?.toFixed(2)}
                                                </span>
                                            )}
                                            {stock.alerts.volumeSpike && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                    <TrendingUp size={10} />
                                                    Volume Spike
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                        <Eye size={16} />
                        Market Scanner
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        <Bell size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

