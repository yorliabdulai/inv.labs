"use client";

import { useLayoutEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import gsap from "gsap";

// Enhanced data with more realistic portfolio growth
const data = [
    { name: 'Jan', value: 10000, date: '2024-01-01' },
    { name: 'Feb', value: 10250, date: '2024-02-01' },
    { name: 'Mar', value: 10180, date: '2024-03-01' },
    { name: 'Apr', value: 10500, date: '2024-04-01' },
    { name: 'May', value: 10750, date: '2024-05-01' },
    { name: 'Jun', value: 10900, date: '2024-06-01' },
    { name: 'Jul', value: 11200, date: '2024-07-01' },
    { name: 'Aug', value: 11500, date: '2024-08-01' },
    { name: 'Sep', value: 11800, date: '2024-09-01' },
    { name: 'Oct', value: 12100, date: '2024-10-01' },
    { name: 'Nov', value: 11950, date: '2024-11-01' },
    { name: 'Dec', value: 12450, date: '2024-12-01' },
];

export function PortfolioChart() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".recharts-responsive-container", {
                opacity: 0,
                scale: 0.98,
                duration: 1,
                ease: "expo.out",
                delay: 0.1
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                            <stop offset="50%" stopColor="#4F46E5" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="colorValueStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="50%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }}
                        dy={12}
                        interval={0}
                    />
                    <YAxis
                        hide
                        domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip
                        cursor={{
                            stroke: '#4F46E5',
                            strokeWidth: 2,
                            strokeDasharray: '5 5',
                            strokeOpacity: 0.6
                        }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '16px',
                            border: '1px solid rgba(79, 70, 229, 0.1)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            padding: '16px',
                            backdropFilter: 'blur(8px)'
                        }}
                        labelStyle={{
                            color: '#374151',
                            fontWeight: 700,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                        itemStyle={{
                            color: '#1A1C4E',
                            fontWeight: 800,
                            fontSize: '14px',
                            padding: '4px 0'
                        }}
                        formatter={(value: number | undefined) => [
                            `GH₵ ${value?.toLocaleString('en-GH', { minimumFractionDigits: 2 }) ?? 0}`,
                            'Portfolio Value'
                        ]}
                        labelFormatter={(label) => `${label} 2024`}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="url(#colorValueStroke)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={2000}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
