"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type MutualFundNAVHistory } from "@/lib/mutual-funds-data";
import { useState } from "react";

interface MutualFundChartProps {
    navHistory: MutualFundNAVHistory[];
    fundName: string;
}

const PERIODS = [
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1Y", days: 365 },
    { label: "All", days: 9999 },
];

export function MutualFundChart({ navHistory, fundName }: MutualFundChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("1M");

    // Filter data based on selected period
    const period = PERIODS.find((p) => p.label === selectedPeriod);
    const filteredData = navHistory
        .slice(-period!.days)
        .map((item) => ({
            date: new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
            nav: parseFloat(item.nav_value.toString()),
            fullDate: item.date,
        }));

    // Calculate performance
    const firstNav = filteredData[0]?.nav || 0;
    const lastNav = filteredData[filteredData.length - 1]?.nav || 0;
    const change = lastNav - firstNav;
    const changePercent = firstNav > 0 ? (change / firstNav) * 100 : 0;
    const isPositive = change >= 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-bold text-gray-600 mb-1">{payload[0].payload.fullDate}</p>
                    <p className="text-sm font-black text-indigo-600">
                        GH₵{payload[0].value.toFixed(4)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Period Selector & Performance */}
            <div className="flex items-center justify-between">
                <div>
                    <div className={`text-2xl font-black ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {selectedPeriod} Performance
                    </div>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {PERIODS.map((period) => (
                        <button
                            key={period.label}
                            onClick={() => setSelectedPeriod(period.label)}
                            className={`px-3 py-2 rounded-lg text-xs font-black transition-all min-w-[44px] ${selectedPeriod === period.label
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "text-gray-500 hover:text-indigo-600 hover:bg-white"
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            style={{ fontSize: "10px", fontWeight: "bold" }}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: "10px", fontWeight: "bold" }}
                            tickLine={false}
                            domain={["auto", "auto"]}
                            tickFormatter={(value) => `₵${value.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="nav"
                            stroke={isPositive ? "#10B981" : "#EF4444"}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: isPositive ? "#10B981" : "#EF4444" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
