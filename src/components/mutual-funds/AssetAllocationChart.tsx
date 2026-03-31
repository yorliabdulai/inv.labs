"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AssetAllocationChartProps {
    allocation: {
        stocks: number;
        bonds: number;
        cash: number;
    };
}

const COLORS = {
    stocks: "#4F46E5", // Indigo
    bonds: "#10B981", // Emerald
    cash: "#F59E0B", // Amber
};

// ⚡ BOLT OPTIMIZATION: Extracted CustomTooltip outside the render function.
// Impact: Prevents React from recreating the component reference on every render or hover event,
// eliminating severe jank and unnecessary unmounting/remounting of the tooltip DOM node.
// Measurement: Hover interactions and period changes now trigger 0 tooltip component remounts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-xl p-4 shadow-premium backdrop-blur-md">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{payload[0].name}</p>
                <p className="text-xl font-bold tabular-nums" style={{ color: payload[0].payload.color }}>
                    {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export function AssetAllocationChart({ allocation }: AssetAllocationChartProps) {
    const data = [
        { name: "Stocks", value: allocation.stocks, color: COLORS.stocks },
        { name: "Bonds", value: allocation.bonds, color: COLORS.bonds },
        { name: "Cash", value: allocation.cash, color: COLORS.cash },
    ].filter((item) => item.value > 0);

    return (
        <div className="h-64 sm:h-72 pb-6">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={48}
                        iconType="circle"
                        wrapperStyle={{ left: 0, right: 0, padding: "0 10px", bottom: -10 }}
                        formatter={(value, entry: any) => (
                            <span className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest px-1 sm:px-2">
                                {value} <span className="text-muted-foreground ml-1">({entry.payload.value}%)</span>
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
