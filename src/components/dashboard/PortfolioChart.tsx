"use client";

import { useState, useLayoutEffect, useRef } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
    ComposedChart, Cell
} from "recharts";
import gsap from "gsap";
import { BarChart3, TrendingUp } from "lucide-react";

export interface PortfolioDataPoint {
    label: string;
    value: number;
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, startingValue, chartType }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload as PortfolioDataPoint;
        const val = item.value;
        const change = val - startingValue;
        const changePct = ((change / startingValue) * 100).toFixed(2);

        return (
            <div className="bg-card border border-border p-4 rounded-xl shadow-premium text-foreground min-w-[200px] backdrop-blur-md">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 border-b border-border pb-2">
                    {label}
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Position Value</span>
                        <span className="text-sm font-bold tabular-nums">GH₵ {val.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Change</span>
                        <span className={`text-xs font-bold tabular-nums ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePct}%)
                        </span>
                    </div>
                    {chartType === 'candle' && item.open !== undefined && (
                        <div className="pt-2 mt-2 border-t border-border space-y-1.5">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Open</span>
                                <span className="text-xs font-bold tabular-nums text-foreground">{item.open.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">High</span>
                                <span className="text-xs font-bold text-emerald-500 tabular-nums">{item.high?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Low</span>
                                <span className="text-xs font-bold text-red-500 tabular-nums">{item.low?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

interface PortfolioChartProps {
    data?: PortfolioDataPoint[];
    period?: string;
    startingValue?: number;
    chartType: 'area' | 'bar' | 'candle';
}

export function PortfolioChart({
    data = [],
    period = '1M',
    startingValue = 10000,
    chartType
}: PortfolioChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".portfolio-chart-container", {
                opacity: 0,
                y: 8,
                duration: 0.6,
                ease: "expo.out",
            });
        }, containerRef);
        return () => ctx.revert();
    }, [data, chartType]);

    // If no data, show a flat starting line
    // OPTIMIZATION (Bolt): Redundant O(n) array iterations for calculating unused variables
    // (minVal, maxVal, isPositive, strokeColor) were removed to prevent blocking the main thread
    // and reduce unnecessary component render overhead.
    const chartData = data.length > 0 ? data : [
        { label: 'Start', value: startingValue, date: '' },
        { label: 'Now', value: startingValue, date: '' },
    ];

    const renderChartContent = () => {
        // Shared theme colors for Recharts
        const gridColor = "var(--border)";
        const tickColor = "var(--muted-foreground)";
        const cursorColor = "var(--background)";

        switch (chartType) {
            case 'candle':
                return (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.4} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: tickColor }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip startingValue={startingValue} chartType={chartType} />} cursor={{ stroke: tickColor, strokeWidth: 1, strokeOpacity: 0.2 }} />
                        <Bar dataKey="high" fill="transparent">
                            {chartData.map((entry, index) => {
                                const isUp = (entry.close ?? entry.value) >= (entry.open ?? entry.value);
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isUp ? "#10b981" : "#ef4444"}
                                        stroke={isUp ? "#10b981" : "#ef4444"}
                                        strokeWidth={1}
                                    />
                                );
                            })}
                        </Bar>
                        <Bar dataKey="value" barSize={12}>
                            {chartData.map((entry, index) => {
                                const isUp = (entry.close ?? entry.value) >= (entry.open ?? entry.value);
                                return (
                                    <Cell
                                        key={`cell-candle-${index}`}
                                        fill={isUp ? "#10b981" : "#ef4444"}
                                        radius={2}
                                    />
                                );
                            })}
                        </Bar>
                    </ComposedChart>
                );
            case 'bar':
                return (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridColor} opacity={0.4} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip startingValue={startingValue} chartType={chartType} />} cursor={{ fill: 'var(--muted)', opacity: 0.3, radius: 8 }} />
                        <Bar
                            dataKey="value"
                            fill="url(#barGrad)"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            animationDuration={1000}
                        />
                    </BarChart>
                );
            case 'area':
            default:
                return (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="areaIndigoFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.4} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip startingValue={startingValue} chartType={chartType} />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#areaIndigoFill)"
                            animationDuration={1500}
                            dot={false}
                            activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 3, stroke: 'var(--background)' }}
                        />
                    </AreaChart>
                );
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[320px] portfolio-chart-container relative">
            <ResponsiveContainer width="100%" height="100%">
                {renderChartContent()}
            </ResponsiveContainer>
        </div>
    );
}
