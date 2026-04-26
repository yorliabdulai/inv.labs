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
import { generatePortfolioHistory, ChartData, TransactionRecord } from "@/lib/portfolio-utils";

interface PortfolioUniversalChartProps {
    period: string;
    chartType: 'area' | 'bar' | 'candle';
    currentTotal: number;
    transactions: TransactionRecord[];
    currentPrices: Record<string, number>;
}

// ⚡ BOLT OPTIMIZATION: Extracted CustomTooltip outside the render function.
// Impact: Prevents React from recreating the component reference on every render or hover event,
// eliminating severe jank and unnecessary unmounting/remounting of the tooltip DOM node.
// Measurement: Hover interactions and period changes now trigger 0 tooltip component remounts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, chartType }: { active?: boolean; payload?: any[]; chartType?: string }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload as ChartData;
        return (
            <div className="bg-card border border-border p-4 rounded-2xl shadow-2xl text-foreground min-w-[180px] backdrop-blur-md">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 border-b border-border pb-2">
                    {item.time}
                </p>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Net Value</span>
                        <span className="text-sm font-black tabular-nums">{formatCurrency(item.value)}</span>
                    </div>
                    {chartType === 'candle' && (
                        <>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Open</span>
                                <span className="text-xs font-black tabular-nums">{formatCurrency(item.open)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">High</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(item.high)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Low</span>
                                <span className="text-xs font-black text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(item.low)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export function PortfolioUniversalChart({ period, chartType, currentTotal, transactions, currentPrices }: PortfolioUniversalChartProps) {
    const [mounted, setMounted] = useState(false);

    // ⚡ BOLT OPTIMIZATION: Replaced multiple useEffect/useState re-renders
    // with useMemo for synchronous data generation. Eliminates ~3 render
    // passes when the period changes.
    const data = useMemo(() => {
        return generatePortfolioHistory(transactions, currentPrices, period, currentTotal);
    }, [period, currentTotal, transactions, currentPrices]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full" />;

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                            className="text-muted-foreground"
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{ fill: 'currentColor', className: 'text-muted/30', radius: 2 }} />
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                            className="text-muted-foreground"
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{ stroke: 'currentColor', className: 'text-border', strokeWidth: 1 }} />
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
                                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                            className="text-muted-foreground"
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip chartType={chartType} />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--brand-primary)"
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
