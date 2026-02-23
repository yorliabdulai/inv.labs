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
    const chartData = data.length > 0 ? data : [
        { label: 'Start', value: startingValue, date: '' },
        { label: 'Now', value: startingValue, date: '' },
    ];

    const minVal = Math.min(...chartData.map(d => d.value), ...chartData.map(d => d.low ?? d.value));
    const maxVal = Math.max(...chartData.map(d => d.value), ...chartData.map(d => d.high ?? d.value));

    const isPositive = chartData[chartData.length - 1]?.value >= startingValue;
    const strokeColor = "#4F46E5"; // Unified Indigo for "Intelligence" theme

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload as PortfolioDataPoint;
            const val = item.value;
            const change = val - startingValue;
            const changePct = ((change / startingValue) * 100).toFixed(2);

            return (
                <div className="bg-[#1A1C4E] border border-white/10 p-4 rounded-2xl shadow-2xl text-white min-w-[180px] backdrop-blur-md">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                        {label}
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-slate-400">Position Value</span>
                            <span className="text-sm font-black tabular-nums">GH₵ {val.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-slate-400">Total Change</span>
                            <span className={`text-xs font-black tabular-nums ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePct}%)
                            </span>
                        </div>
                        {chartType === 'candle' && item.open !== undefined && (
                            <div className="pt-2 mt-2 border-t border-white/5 space-y-1">
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Open</span>
                                    <span className="text-xs font-bold tabular-nums">{item.open.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">High</span>
                                    <span className="text-xs font-bold text-emerald-400 tabular-nums">{item.high?.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Low</span>
                                    <span className="text-xs font-bold text-red-400 tabular-nums">{item.low?.toFixed(0)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChartContent = () => {
        switch (chartType) {
            case 'candle':
                return (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
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
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
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
                                <stop offset="5%" stopColor="#1A1C4E" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#1A1C4E" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                            dy={10}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#1A1C4E"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#areaIndigoFill)"
                            animationDuration={1500}
                            dot={false}
                            activeDot={{ r: 5, fill: "#1A1C4E", strokeWidth: 2, stroke: '#fff' }}
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
