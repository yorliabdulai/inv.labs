"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AllocationChartProps {
    data?: { name: string; value: number; color: string }[];
}

const defaultData = [
    { name: 'Financial', value: 4500, color: '#4F46E5' },
    { name: 'Telecom', value: 3200, color: '#10B981' },
    { name: 'Mining', value: 1500, color: '#F59E0B' },
    { name: 'Consumer', value: 800, color: '#EC4899' },
];

export function AllocationChart({ data = defaultData }: AllocationChartProps) {
    const chartData = data && data.length > 0 ? data : defaultData;

    return (
        <div className="h-full w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1200}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: '#1A1C4E', fontWeight: '900', fontSize: '11px' }}
                        formatter={(value: number | undefined) => `GH₵ ${value?.toLocaleString() ?? 0}`}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={6}
                        formatter={(value) => (
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{value}</span>
                        )}
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
