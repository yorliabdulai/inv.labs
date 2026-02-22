"use client";

import { useState, useLayoutEffect, useRef } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import gsap from "gsap";
import { BarChart3, TrendingUp } from "lucide-react";

export interface PortfolioDataPoint {
    label: string;
    value: number;
    date: string;
}

interface PortfolioChartProps {
    data?: PortfolioDataPoint[];
    period?: string;
    startingValue?: number;
}

export function PortfolioChart({ data = [], period = '1M', startingValue = 10000 }: PortfolioChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

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

    const minVal = Math.min(...chartData.map(d => d.value));
    const maxVal = Math.max(...chartData.map(d => d.value));
    const isPositive = chartData[chartData.length - 1]?.value >= startingValue;
    const strokeColor = isPositive ? '#10B981' : '#EF4444';
    const fillId = isPositive ? 'areaGreenFill' : 'areaRedFill';
    const strokeId = isPositive ? 'strokeGreen' : 'strokeRed';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const change = val - startingValue;
            const changePct = ((change / startingValue) * 100).toFixed(2);
            return (
                <div style={{
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: 14,
                    border: '1px solid rgba(79,70,229,0.08)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '14px 18px',
                    minWidth: 160
                }}>
                    <p style={{ color: '#6B7280', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        {label}
                    </p>
                    <p style={{ color: '#1A1C4E', fontWeight: 900, fontSize: 15, marginBottom: 2 }}>
                        GH₵ {val.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ color: change >= 0 ? '#10B981' : '#EF4444', fontWeight: 800, fontSize: 12 }}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePct}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[280px] flex flex-col gap-3">
            {/* Chart type toggle */}
            <div className="flex justify-end">
                <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
                    <button
                        onClick={() => setChartType('area')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${chartType === 'area' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        <TrendingUp size={12} /> Area
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${chartType === 'bar' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}
                    >
                        <BarChart3 size={12} /> Bar
                    </button>
                </div>
            </div>

            <div className="portfolio-chart-container flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                        <AreaChart data={chartData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGreenFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="areaRedFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="strokeGreen" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="strokeRed" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#EF4444" />
                                    <stop offset="100%" stopColor="#DC2626" />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                dy={8}
                            />
                            <YAxis hide domain={[minVal * 0.995, maxVal * 1.005]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={`url(#${strokeId})`}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill={`url(#${fillId})`}
                                animationDuration={1200}
                                animationEasing="ease-out"
                                dot={false}
                                activeDot={{ r: 5, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }}
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.9} />
                                    <stop offset="100%" stopColor={isPositive ? '#059669' : '#DC2626'} stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                dy={8}
                            />
                            <YAxis hide domain={[minVal * 0.99, maxVal * 1.01]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                fill="url(#barGrad)"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
