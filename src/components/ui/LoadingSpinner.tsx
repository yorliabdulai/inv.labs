"use client";

import { Loader2, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "market" | "portfolio" | "analysis";
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = "md",
    variant = "default",
    message,
    fullScreen = false
}: LoadingSpinnerProps) {

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const getIcon = () => {
        switch (variant) {
            case "market":
                return <TrendingUp size={size === "lg" ? 32 : size === "md" ? 24 : 16} className="text-indigo-600" />;
            case "portfolio":
                return <DollarSign size={size === "lg" ? 32 : size === "md" ? 24 : 16} className="text-emerald-600" />;
            case "analysis":
                return <BarChart3 size={size === "lg" ? 32 : size === "md" ? 24 : 16} className="text-purple-600" />;
            default:
                return <Loader2 size={size === "lg" ? 32 : size === "md" ? 24 : 16} className="text-indigo-600" />;
        }
    };

    const getMessage = () => {
        if (message) return message;

        switch (variant) {
            case "market":
                return "Loading market data...";
            case "portfolio":
                return "Analyzing portfolio...";
            case "analysis":
                return "Running analysis...";
            default:
                return "Loading...";
        }
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className={`relative ${sizeClasses[size]}`}>
                <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-2 flex items-center justify-center">
                    {getIcon()}
                </div>
            </div>

            {message !== null && (
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 animate-pulse">
                        {getMessage()}
                    </p>
                    {variant === "market" && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass-card p-8 max-w-sm w-full mx-4">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
}

