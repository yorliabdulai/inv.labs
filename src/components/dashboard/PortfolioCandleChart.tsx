"use client";

import { useMemo } from "react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
    Line
} from "recharts";

interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PortfolioCandleChartProps {
    period?: string;
}

/**
 * Professional Candlestick Chart for Portfolio Analysis
 * Highly legible, premium fintech aesthetic.
 */
export function PortfolioCandleChart({ period = "1M" }: PortfolioCandleChartProps) {
    // Generate mock OHLC data based on the period
    const chartData = useMemo(() => {
        const points = period === "1D" ? 24 : period === "1W" ? 7 : period === "1M" ? 30 : 60;
        const data: CandleData[] = [];
        let lastClose = 125000;

        for (let i = 0; i < points; i++) {
            const volatility = 2000;
            const open = lastClose;
            const close = open + (Math.random() - 0.45) * volatility; // Slight upward bias
            const high = Math.max(open, close) + Math.random() * 500;
            const low = Math.min(open, close) - Math.random() * 500;

            data.push({
                time: i.toString(),
                open,
                high,
                low,
                close,
                volume: Math.random() * 1000000
            });
            lastClose = close;
        }
        return data;
    }, [period]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as CandleData;
            const isUp = data.close >= data.open;
            return (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl text-white min-w-[180px]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Portfolio Snapshot</p>
                    <div className="space-y-2">
                        <div className="flex justify-between gap-4">
                            <span className="text-xs font-bold text-slate-400">OPEN</span>
                            <span className="text-xs font-black tabular-nums">GH₵ {data.open.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-slate-400">CLOSE</span>
                            <span className={`text-xs font-black tabular-nums ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                GH₵ {data.close.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1">
                            <span className="text-xs font-bold text-slate-400">HIGH</span>
                            <span className="text-xs font-black tabular-nums">GH₵ {data.high.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-xs font-bold text-slate-400">LOW</span>
                            <span className="text-xs font-black tabular-nums">GH₵ {data.low.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="time"
                        hide
                    />
                    <YAxis
                        orientation="right"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `GH₵${(val / 1000).toFixed(0)}k`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                    {/* Wick (High-Low Line) */}
                    <Line
                        type="monotone"
                        dataKey="high"
                        stroke="#e2e8f0"
                        strokeWidth={1}
                        dot={false}
                        activeDot={false}
                        connectNulls
                        isAnimationActive={false}
                    />

                    {/* Shadow Bars (to create the candle effect) */}
                    <Bar
                        dataKey="close"
                        isAnimationActive={true}
                        animationDuration={1000}
                    >
                        {chartData.map((entry, index) => {
                            const isUp = entry.close >= entry.open;
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={isUp ? "#10b981" : "#ef4444"}
                                    radius={2}
                                />
                            );
                        })}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
