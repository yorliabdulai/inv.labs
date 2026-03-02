"use server";

import { getStocks, Stock } from "@/lib/market-data";

export interface RankedAsset extends Stock {
    rank: number;
    prevRank?: number;
    momentumScore: number;
    stabilityScore: number;
    trend: 'up' | 'down' | 'neutral';
}

export type RankingCategory = 'gainers' | 'momentum' | 'stability' | 'volume';

export async function getMarketRankings(category: RankingCategory = 'gainers'): Promise<RankedAsset[]> {
    try {
        const stocks = await getStocks();
        if (stocks.length === 0) return [];

        const sorted = [...stocks];

        // Scoring logic
        const scored = sorted.map(s => {
            // Momentum: High change & High volume relative to others
            // For now, localized scoring
            const momentumScore = (Math.abs(s.changePercent) * 0.7) + (Math.log10(s.volume + 1) * 0.3);

            // Stability: Low absolute change percent
            const stabilityScore = 100 - Math.min(100, Math.abs(s.changePercent) * 10);

            return {
                ...s,
                momentumScore,
                stabilityScore,
                // Simple trend based on change
                trend: s.change > 0 ? 'up' : s.change < 0 ? 'down' : 'neutral'
            } as RankedAsset;
        });

        if (category === 'gainers') {
            scored.sort((a, b) => b.changePercent - a.changePercent);
        } else if (category === 'momentum') {
            scored.sort((a, b) => b.momentumScore - a.momentumScore);
        } else if (category === 'stability') {
            scored.sort((a, b) => b.stabilityScore - a.stabilityScore);
        } else if (category === 'volume') {
            scored.sort((a, b) => b.volume - a.volume);
        }

        return scored.map((s, idx) => ({
            ...s,
            rank: idx + 1,
            // Simulate previous rank for visual movement
            prevRank: idx + 1 + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)
        }));
    } catch (error) {
        console.error("Failed to fetch market rankings:", error);
        return [];
    }
}
