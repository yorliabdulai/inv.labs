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
                            backgroundColor: '#121417',
                            borderRadius: '1px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                            padding: '12px 16px',
                        }}
                        itemStyle={{ color: '#F9F9F9', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        formatter={(value: any) => [`GH₵ ${(value ?? 0).toLocaleString()}`, 'Ledger Value']}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
