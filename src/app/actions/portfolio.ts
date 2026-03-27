"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { getUserMutualFundHoldings } from "@/app/actions/mutual-funds";

export interface PortfolioData {
    holdings: Holding[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutualFundHoldings: any[];
    cashBalance: number;
    totalValue: number;
    mutualFundsValue: number;
    totalInvested: number;
    metrics: {
        winRate: number;
        bestPosition: Holding | null;
        worstPosition: Holding | null;
        avgPositionSize: number;
        numAssetClasses: number;
        numSectors: number;
    };
    sectorPerformance: {
        name: string;
        gain: number;
        gainPct: number;
        allocation: number;
        color: string;
    }[];
}

export interface Holding {
    symbol: string;
    quantity: number;
    averageCost: number;
    totalCost: number;
    currentPrice: number;
    marketValue: number;
    gain: number;
    gainPercent: number;
    sector: string;
}

const STARTING_BALANCE = 10000;
const SECTOR_COLORS: Record<string, string> = {
    Finance: "#4F46E5", Telecom: "#10B981", Mining: "#F59E0B",
    Energy: "#EF4444", Consumer: "#EC4899", Agriculture: "#8B5CF6",
    Technology: "#06B6D4", "Mutual Funds": "#A855F7", Cash: "#9CA3AF", Other: "#64748B",
};

export async function getPortfolioData(): Promise<PortfolioData | null> {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch: DB holdings (source of truth), live stocks prices, MF holdings, profile
        const [
            holdingsResult,
            stocksDbResult,
            mfHoldingsResult,
            profileResult
        ] = await Promise.allSettled([
            // holdings table — always accurate, written atomically by execute_stock_trade
            supabase
                .from("holdings")
                .select("symbol, quantity, average_cost")
                .eq("user_id", user.id)
                .gt("quantity", 0),
            // stocks table — has latest price, sector, name from last trade upsert
            supabase
                .from("stocks")
                .select("symbol, name, sector, current_price"),
            getUserMutualFundHoldings(user.id),
            supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
        ]);

        const dbHoldings = holdingsResult.status === 'fulfilled' ? holdingsResult.value.data ?? [] : [];
        const dbStocks = stocksDbResult.status === 'fulfilled' ? stocksDbResult.value.data ?? [] : [];
        const mfHoldings = mfHoldingsResult.status === 'fulfilled' ? mfHoldingsResult.value : [];
        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;

        // Build lookup maps from the stocks table (already in DB from last trade)
        const stockPriceMap = new Map(dbStocks.map(s => [s.symbol, s.current_price]));
        const stockSectorMap = new Map(dbStocks.map(s => [s.symbol, s.sector ?? "Other"]));

        // Build holdings from the DB holdings table — no API needed
        const holdings: Holding[] = [];
        let stockMarketValue = 0;

        for (const row of dbHoldings) {
            // Use last-known price from stocks table; fall back to average cost if not found
            const currentPrice = stockPriceMap.get(row.symbol) ?? row.average_cost;
            const quantity = row.quantity;
            const totalCost = row.average_cost * quantity;
            const marketValue = currentPrice * quantity;
            const gain = marketValue - totalCost;

            holdings.push({
                symbol: row.symbol,
                quantity,
                averageCost: row.average_cost,
                totalCost,
                currentPrice,
                marketValue,
                gain,
                gainPercent: totalCost > 0 ? (gain / totalCost) * 100 : 0,
                sector: stockSectorMap.get(row.symbol) ?? "Other",
            });
            stockMarketValue += marketValue;
        }

        const mutualFundsValue = mfHoldings.reduce((s, h) => s + (h.current_value ?? 0), 0);
        const cashBalance = profile?.cash_balance ?? STARTING_BALANCE;
        const totalPortfolioValue = stockMarketValue + mutualFundsValue + cashBalance;

        const totalInvested = holdings.reduce((s, h) => s + h.totalCost, 0)
            + mfHoldings.reduce((s, h) => s + (h.total_invested ?? 0), 0);

        // Metrics
        const winners = holdings.filter(h => h.gain > 0).length;
        const winRate = holdings.length > 0 ? Math.round((winners / holdings.length) * 100) : 0;

        // Bolt: Replace O(N log N) sort with O(N) single pass loop for min/max without allocation overhead
        let bestPosition: Holding | null = null;
        let worstPosition: Holding | null = null;

        if (holdings.length > 0) {
            bestPosition = holdings[0];
            worstPosition = holdings[0];
            for (let i = 1; i < holdings.length; i++) {
                const h = holdings[i];
                if (h.gainPercent > bestPosition.gainPercent) bestPosition = h;
                if (h.gainPercent < worstPosition.gainPercent) worstPosition = h;
            }
        }

        // Sector Performance
        const sectorDataMap = new Map<string, { gain: number; cost: number; mv: number }>();
        holdings.forEach(h => {
            const cur = sectorDataMap.get(h.sector) ?? { gain: 0, cost: 0, mv: 0 };
            cur.gain += h.gain;
            cur.cost += h.totalCost;
            cur.mv += h.marketValue;
            sectorDataMap.set(h.sector, cur);
        });

        const sectorPerformance = Array.from(sectorDataMap.entries()).map(([name, d]) => ({
            name,
            gain: d.gain,
            gainPct: d.cost > 0 ? (d.gain / d.cost) * 100 : 0,
            allocation: totalPortfolioValue > 0 ? Math.round((d.mv / totalPortfolioValue) * 100) : 0,
            color: SECTOR_COLORS[name] || SECTOR_COLORS["Other"]
        }));

        const numAssetClasses = [stockMarketValue > 0, mutualFundsValue > 0, cashBalance > 0].filter(Boolean).length;

        return {
            holdings,
            mutualFundHoldings: mfHoldings,
            cashBalance,
            totalValue: stockMarketValue,
            mutualFundsValue,
            totalInvested,
            metrics: {
                winRate,
                bestPosition,
                worstPosition,
                avgPositionSize: holdings.length > 0 ? stockMarketValue / holdings.length : 0,
                numAssetClasses,
                numSectors: sectorPerformance.length,
            },
            sectorPerformance,
        };
    } catch (error) {
        console.error("Portfolio action error:", error);
        return null;
    }
}
