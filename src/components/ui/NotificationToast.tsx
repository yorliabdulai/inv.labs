"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X, TrendingUp, TrendingDown } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info" | "trade";

interface NotificationToastProps {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    symbol?: string;
    value?: string;
    change?: string;
    duration?: number;
    onClose: (id: string) => void;
}

export function NotificationToast({
    id,
    type,
    title,
    message,
    symbol,
    value,
    change,
    duration = 5000,
    onClose
}: NotificationToastProps) {

    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after duration
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle size={20} className="text-emerald-500" />;
            case "error":
                return <XCircle size={20} className="text-red-500" />;
            case "warning":
                return <AlertTriangle size={20} className="text-amber-500" />;
            case "trade":
                return change?.startsWith('+') ?
                    <TrendingUp size={20} className="text-emerald-500" /> :
                    <TrendingDown size={20} className="text-red-500" />;
            default:
                return <Info size={20} className="text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-emerald-50 border-emerald-200",
                    accent: "bg-emerald-500",
                    text: "text-emerald-800"
                };
            case "error":
                return {
                    bg: "bg-red-50 border-red-200",
                    accent: "bg-red-500",
                    text: "text-red-800"
                };
            case "warning":
                return {
                    bg: "bg-amber-50 border-amber-200",
                    accent: "bg-amber-500",
                    text: "text-amber-800"
                };
            case "trade":
                return {
                    bg: "bg-indigo-50 border-indigo-200",
                    accent: change?.startsWith('+') ? "bg-emerald-500" : "bg-red-500",
                    text: "text-indigo-800"
                };
            default:
                return {
                    bg: "bg-blue-50 border-blue-200",
                    accent: "bg-blue-500",
                    text: "text-blue-800"
                };
        }
    };

    const colors = getColors();

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
                isVisible && !isExiting
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            }`}
        >
            <div className={`glass-card p-4 border ${colors.bg} shadow-lg`}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${colors.accent} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold text-sm ${colors.text} truncate`}>
                                {symbol && `${symbol} • `}{title}
                            </h4>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-black/10 rounded transition-colors ml-2 flex-shrink-0"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        </div>

                        {message && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {message}
                            </p>
                        )}

                        {(value || change) && (
                            <div className="flex items-center gap-2">
                                {value && (
                                    <span className="font-mono font-bold text-gray-800 text-sm">
                                        {value}
                                    </span>
                                )}
                                {change && (
                                    <span className={`font-bold text-sm ${
                                        change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                        {change}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress bar for auto-dismiss */}
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${colors.accent} transition-all ease-linear`}
                        style={{
                            animation: `shrink ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}

// Notification Manager Component
interface NotificationManagerProps {
    notifications: Array<Omit<NotificationToastProps, 'onClose'>>;
    onRemove: (id: string) => void;
}

export function NotificationManager({ notifications, onRemove }: NotificationManagerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {notifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    {...notification}
                    onClose={onRemove}
                />
            ))}
        </div>
    );
}

