"use client";

import { useState } from "react";
import { Bell, BellOff, AlertTriangle, TrendingUp, TrendingDown, X, Settings, Clock, DollarSign } from "lucide-react";

interface Alert {
    id: string;
    type: 'price' | 'volume' | 'news' | 'earnings';
    symbol?: string;
    condition: 'above' | 'below' | 'spike' | 'earnings' | 'news';
    value?: number;
    message: string;
    timestamp: Date;
    triggered: boolean;
    active: boolean;
}

interface AlertsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AlertsPanel({ isOpen, onClose }: AlertsPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: "1",
            type: "price",
            symbol: "MTNGH",
            condition: "above",
            value: 1.60,
            message: "MTNGH crossed above GH₵1.60",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            triggered: true,
            active: true
        },
        {
            id: "2",
            type: "price",
            symbol: "EGH",
            condition: "below",
            value: 6.50,
            message: "EGH dropped below GH₵6.50",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            triggered: true,
            active: true
        },
        {
            id: "3",
            type: "volume",
            symbol: "CAL",
            condition: "spike",
            message: "CAL volume spike detected (2.1M shares)",
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            triggered: true,
            active: true
        },
        {
            id: "4",
            type: "price",
            symbol: "MTNGH",
            condition: "below",
            value: 1.45,
            message: "MTNGH alert: Below GH₵1.45",
            timestamp: new Date(),
            triggered: false,
            active: true
        }
    ]);

    const [filter, setFilter] = useState<'all' | 'triggered' | 'active'>('all');

    const filteredAlerts = alerts.filter(alert => {
        switch (filter) {
            case 'triggered':
                return alert.triggered;
            case 'active':
                return alert.active && !alert.triggered;
            default:
                return true;
        }
    });

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, active: false } : alert
        ));
    };

    const toggleAlert = (id: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, active: !alert.active } : alert
        ));
    };

    const getAlertIcon = (alert: Alert) => {
        if (alert.triggered) {
            return alert.type === 'price' && alert.condition === 'above' ? TrendingUp : TrendingDown;
        }
        return alert.active ? Bell : BellOff;
    };

    const getAlertColor = (alert: Alert) => {
        if (!alert.active) return 'gray';
        if (alert.triggered) return 'emerald';
        return 'blue';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Bell size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#1A1C4E]">Alerts & Notifications</h2>
                        <p className="text-sm text-gray-600">Price alerts and market signals</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings size={18} className="text-gray-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-gray-100">
                <div className="flex p-4 gap-1">
                    {[
                        { key: 'all', label: 'All', count: alerts.length },
                        { key: 'triggered', label: 'Triggered', count: alerts.filter(a => a.triggered).length },
                        { key: 'active', label: 'Active', count: alerts.filter(a => a.active && !a.triggered).length }
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as any)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all relative ${
                                filter === key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {label}
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <BellOff size={48} className="mb-4 opacity-50" />
                        <p className="text-center font-medium mb-2">No alerts found</p>
                        <p className="text-center text-sm text-gray-500 max-w-xs">
                            {filter === 'triggered' ? 'No triggered alerts yet' :
                             filter === 'active' ? 'No active alerts configured' :
                             'Create alerts to monitor market movements'}
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredAlerts.map(alert => {
                            const Icon = getAlertIcon(alert);
                            const color = getAlertColor(alert);

                            return (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                        alert.triggered
                                            ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                            : alert.active
                                                ? 'bg-white border-gray-200 hover:shadow-md'
                                                : 'bg-gray-50 border-gray-200 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {alert.symbol && (
                                                        <span className="font-black text-[#1A1C4E] text-sm">{alert.symbol}</span>
                                                    )}
                                                    {alert.triggered && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                            Triggered
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {alert.active && !alert.triggered && (
                                                <button
                                                    onClick={() => toggleAlert(alert.id)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    title="Disable alert"
                                                >
                                                    <BellOff size={14} className="text-gray-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => dismissAlert(alert.id)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Dismiss"
                                            >
                                                <X size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Alert Details */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {alert.value && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={12} />
                                                    GH₵{alert.value.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs font-medium">
                                            {alert.timestamp.toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Action Buttons for Triggered Alerts */}
                                    {alert.triggered && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-200">
                                            <button className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all text-sm">
                                                View Stock
                                            </button>
                                            <button className="px-3 py-2 bg-white text-emerald-600 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-all text-sm">
                                                Trade
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                        <Bell size={16} />
                        Create Alert
                    </button>
                    <button className="py-3 bg-white text-indigo-600 font-black rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                        <Settings size={16} />
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
}

