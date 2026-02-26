"use client";

import { useEffect, useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    ComposedChart,
    Cell
} from "recharts";
import { formatCurrency } from "@/lib/mutual-funds-data";
import { generatePortfolioHistory, ChartData } from "@/lib/portfolio-utils";

interface PortfolioUniversalChartProps {
    period: string;
    chartType: 'area' | 'bar' | 'candle';
    totalEquity: number;
}

export function PortfolioUniversalChart({ period, chartType, totalEquity }: PortfolioUniversalChartProps) {
    const data = useMemo(() => generatePortfolioHistory(totalEquity, period), [totalEquity, period]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full" />;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload as ChartData;
            return (
                <div className="bg-[#1A1C4E] border border-white/10 p-4 rounded-2xl shadow-2xl text-white min-w-[180px] backdrop-blur-md">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                        {item.time}
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-slate-400">Net Value</span>
                            <span className="text-sm font-black tabular-nums">{formatCurrency(item.value)}</span>
                        </div>
                        {chartType === 'candle' && (
                            <>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Open</span>
                                    <span className="text-xs font-black tabular-nums">{formatCurrency(item.open)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">High</span>
                                    <span className="text-xs font-black text-emerald-400 tabular-nums">{formatCurrency(item.high)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Low</span>
                                    <span className="text-xs font-black text-red-400 tabular-nums">{formatCurrency(item.low)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C05E42" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#C05E42" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(249, 249, 249, 0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(249, 249, 249, 0.4)' }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 249, 249, 0.05)', radius: 2 }} />
                        <Bar
                            dataKey="value"
                            fill="url(#barGradient)"
                            radius={[2, 2, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                );
            case 'candle':
                return (
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(249, 249, 249, 0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(249, 249, 249, 0.4)' }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(249, 249, 249, 0.1)', strokeWidth: 1 }} />
                        <Bar dataKey="high" fill="transparent">
                            {data.map((entry, index) => {
                                const isUp = entry.close >= entry.open;
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isUp ? "#10B981" : "#EF4444"}
                                        stroke={isUp ? "#10B981" : "#EF4444"}
                                        strokeWidth={1}
                                    />
                                );
                            })}
                        </Bar>
                        {/* Custom Candle Implementation using Bar overlay */}
                        <Bar dataKey="value" barSize={12}>
                            {data.map((entry, index) => {
                                const isUp = entry.close >= entry.open;
                                return (
                                    <Cell
                                        key={`cell-candle-${index}`}
                                        fill={isUp ? "#10B981" : "#EF4444"}
                                        radius={1}
                                    />
                                );
                            })}
                        </Bar>
                    </ComposedChart>
                );
            case 'area':
            default:
                return (
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C05E42" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#C05E42" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(249, 249, 249, 0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(249, 249, 249, 0.4)' }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#C05E42"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                );
        }
    };

    return (
        <div className="w-full h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
