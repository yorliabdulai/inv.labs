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

export async function getMarketRankings(categories: RankingCategory[] = ['gainers']): Promise<RankedAsset[]> {
    try {
        const stocks = await getStocks();
        if (stocks.length === 0) return [];

        const activeCategories = categories.length > 0 ? categories : ['gainers'];
        const sorted = [...stocks];

        // Scoring logic
        const scored = sorted.map(s => {
            const momentumScore = (Math.abs(s.changePercent) * 0.7) + (Math.log10(s.volume + 1) * 0.3);
            const stabilityScore = 100 - Math.min(100, Math.abs(s.changePercent) * 10);

            return {
                ...s,
                momentumScore,
                stabilityScore,
                trend: s.change > 0 ? 'up' : s.change < 0 ? 'down' : 'neutral'
            } as RankedAsset;
        });

        // Multiple category logic: calculate aggregate score if needed
        // For simplicity, we just sort by the "most important" if multiple are picked,
        // or we could calculate a composite rank.
        // Composite Rank: Average of ranks across all selected categories.
        
        const getRankingsForCategory = (cat: RankingCategory) => {
            const list = [...scored];
            if (cat === 'gainers') list.sort((a, b) => b.changePercent - a.changePercent);
            else if (cat === 'momentum') list.sort((a, b) => b.momentumScore - a.momentumScore);
            else if (cat === 'stability') list.sort((a, b) => b.stabilityScore - a.stabilityScore);
            else if (cat === 'volume') list.sort((a, b) => b.volume - a.volume);
            return list.map((item, idx) => ({ symbol: item.symbol, rank: idx + 1 }));
        };

        if (activeCategories.length === 1) {
            const cat = activeCategories[0];
            if (cat === 'gainers') scored.sort((a, b) => b.changePercent - a.changePercent);
            else if (cat === 'momentum') scored.sort((a, b) => b.momentumScore - a.momentumScore);
            else if (cat === 'stability') scored.sort((a, b) => b.stabilityScore - a.stabilityScore);
            else if (cat === 'volume') scored.sort((a, b) => b.volume - a.volume);
        } else {
            // Composite Rank
            const categoryRanks = activeCategories.map(cat => getRankingsForCategory(cat));
            const compositeMap: Record<string, number> = {};
            
            scored.forEach(s => {
                let totalRank = 0;
                categoryRanks.forEach(list => {
                    const r = list.find(l => l.symbol === s.symbol)?.rank || scored.length;
                    totalRank += r;
                });
                compositeMap[s.symbol] = totalRank / activeCategories.length;
            });

            scored.sort((a, b) => compositeMap[a.symbol] - compositeMap[b.symbol]);
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
