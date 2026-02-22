"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { getStocks, Stock } from "@/lib/market-data";
import { getUserMutualFundHoldings } from "@/app/actions/mutual-funds";

export interface PortfolioData {
    holdings: Holding[];
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

        const [
            stocksResult,
            stockTxResult,
            mfHoldingsResult,
            mfTxResult,
            profileResult
        ] = await Promise.allSettled([
            getStocks(),
            supabase.from("transactions").select("*").eq("user_id", user.id),
            getUserMutualFundHoldings(user.id),
            supabase.from("mutual_fund_transactions").select("*").eq("user_id", user.id),
            supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
        ]);

        const stocks = stocksResult.status === 'fulfilled' ? stocksResult.value : [];
        const stockTransactions = stockTxResult.status === 'fulfilled' ? stockTxResult.value.data || [] : [];
        const mfHoldings = mfHoldingsResult.status === 'fulfilled' ? mfHoldingsResult.value : [];
        const mfTransactions = mfTxResult.status === 'fulfilled' ? mfTxResult.value.data || [] : [];
        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;

        const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));
        const sectorMap = new Map(stocks.map(s => [s.symbol, s.sector ?? "Other"]));

        // 1. Aggregate Stock Holdings
        let cash = STARTING_BALANCE;
        const holdingMap = new Map<string, { quantity: number; totalCost: number }>();

        // Stock Transactions
        stockTransactions.forEach(tx => {
            const cur = holdingMap.get(tx.symbol) ?? { quantity: 0, totalCost: 0 };
            if (tx.type === "BUY") {
                cur.quantity += tx.quantity;
                cur.totalCost += tx.total_amount;
                cash -= tx.total_amount;
            } else {
                const avg = cur.quantity > 0 ? cur.totalCost / cur.quantity : 0;
                cur.totalCost = Math.max(0, cur.totalCost - avg * tx.quantity);
                cur.quantity = Math.max(0, cur.quantity - tx.quantity);
                cash += tx.total_amount;
            }
            holdingMap.set(tx.symbol, cur);
        });

        // Mutual Fund Transactions affect cash
        mfTransactions.forEach((tx: any) => {
            if (tx.transaction_type === "buy") cash -= tx.net_amount;
            else cash += tx.net_amount;
        });

        const holdings: Holding[] = [];
        let stockMarketValue = 0;
        holdingMap.forEach((d, sym) => {
            if (d.quantity > 0) {
                const price = priceMap.get(sym) ?? 0;
                const mv = d.quantity * price;
                const gain = mv - d.totalCost;
                holdings.push({
                    symbol: sym,
                    quantity: d.quantity,
                    averageCost: d.totalCost / d.quantity,
                    totalCost: d.totalCost,
                    currentPrice: price,
                    marketValue: mv,
                    gain,
                    gainPercent: (gain / d.totalCost) * 100,
                    sector: sectorMap.get(sym) ?? "Other",
                });
                stockMarketValue += mv;
            }
        });

        const mutualFundsValue = mfHoldings.reduce((s, h) => s + (h.current_value ?? 0), 0);
        const totalValue = stockMarketValue;
        const totalInvested = holdings.reduce((s, h) => s + h.totalCost, 0) + mfHoldings.reduce((s, h) => s + (h.total_invested ?? 0), 0);

        // Metrics
        const winners = holdings.filter(h => h.gain > 0).length;
        const winRate = holdings.length > 0 ? Math.round((winners / holdings.length) * 100) : 0;
        const sortedByGain = [...holdings].sort((a, b) => b.gainPercent - a.gainPercent);
        const bestPosition = sortedByGain[0] || null;
        const worstPosition = sortedByGain[sortedByGain.length - 1] || null;

        // Sector Performance
        const sectorDataMap = new Map<string, { gain: number; cost: number; mv: number }>();
        holdings.forEach(h => {
            const cur = sectorDataMap.get(h.sector) ?? { gain: 0, cost: 0, mv: 0 };
            cur.gain += h.gain;
            cur.cost += h.totalCost;
            cur.mv += h.marketValue;
            sectorDataMap.set(h.sector, cur);
        });

        const totalPortfolioValue = stockMarketValue + mutualFundsValue + cash;
        const sectorPerformance = Array.from(sectorDataMap.entries()).map(([name, d]) => ({
            name,
            gain: d.gain,
            gainPct: (d.gain / d.cost) * 100,
            allocation: Math.round((d.mv / totalPortfolioValue) * 100),
            color: SECTOR_COLORS[name] || SECTOR_COLORS["Other"]
        }));

        const numAssetClasses = [stockMarketValue > 0, mutualFundsValue > 0, cash > 0].filter(Boolean).length;
        const numSectors = sectorPerformance.length;

        return {
            holdings,
            mutualFundHoldings: mfHoldings,
            cashBalance: profile?.cash_balance ?? cash, // Use profile if sync available, else computed
            totalValue: stockMarketValue,
            mutualFundsValue,
            totalInvested,
            metrics: {
                winRate,
                bestPosition,
                worstPosition,
                avgPositionSize: holdings.length > 0 ? stockMarketValue / holdings.length : 0,
                numAssetClasses,
                numSectors
            },
            sectorPerformance
        };
    } catch (error) {
        console.error("Portfolio action error:", error);
        return null;
    }
}
