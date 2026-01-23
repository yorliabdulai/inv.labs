"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ data, color }: { data: number[], color: string }) {
    const chartData = data.map((val, i) => ({ i, val }));

    return (
        <div className="w-full h-full min-h-[30px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
