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
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-bold text-gray-600">{payload[0].name}</p>
                    <p className="text-sm font-black" style={{ color: payload[0].payload.color }}>
                        {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-xs font-bold text-gray-700">
                                {value} ({entry.payload.value}%)
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
