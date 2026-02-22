"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AllocationChartProps {
    data?: { name: string; value: number; color: string }[];
}

export function AllocationChart({ data = [] }: AllocationChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1200}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.98)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            padding: '8px 12px',
                        }}
                        itemStyle={{ color: '#1A1C4E', fontWeight: '900', fontSize: '11px' }}
                        formatter={(value: number | undefined) => [`GH₵ ${(value ?? 0).toLocaleString()}`, 'Value']}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
