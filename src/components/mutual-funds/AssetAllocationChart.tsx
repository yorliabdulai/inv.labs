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

export function AssetAllocationChart({ allocation }: AssetAllocationChartProps) {
    const data = [
        { name: "Stocks", value: allocation.stocks, color: COLORS.stocks },
        { name: "Bonds", value: allocation.bonds, color: COLORS.bonds },
        { name: "Cash", value: allocation.cash, color: COLORS.cash },
    ].filter((item) => item.value > 0);

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

    return (
        <div className="h-64">
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
                        formatter={(value, entry: any) => (
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest px-2">
                                {value} <span className="text-muted-foreground ml-1">({entry.payload.value}%)</span>
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
