"use client";

import { useLayoutEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import gsap from "gsap";

const data = [
    { name: 'Mon', value: 10000 },
    { name: 'Tue', value: 10150 },
    { name: 'Wed', value: 10120 },
    { name: 'Thu', value: 10300 },
    { name: 'Fri', value: 10250 },
    { name: 'Sat', value: 10450 },
    { name: 'Sun', value: 10850 },
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
        <div ref={containerRef} className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        hide
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip
                        cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                        }}
                        labelStyle={{ display: 'none' }}
                        itemStyle={{ color: '#1A1C4E', fontWeight: 900, fontSize: '12px' }}
                        formatter={(value: number | undefined) => [`GH₵ ${value?.toLocaleString() ?? 0}`, 'Value']}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
