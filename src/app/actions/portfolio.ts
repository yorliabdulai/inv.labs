"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { getUserMutualFundHoldings } from "@/app/actions/mutual-funds";
import { getStocks } from "@/lib/market-data";

import { TransactionRecord } from "@/lib/portfolio-utils";

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
    historicalTransactions: TransactionRecord[];
    pendingOrders: any[];
    currentPrices: Record<string, number>;
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

        // Fetch: DB holdings (source of truth), live stocks prices, MF holdings, profile, and all transactions
        const [
            holdingsResult,
            stocksDbResult,
            stockTxResult,
            mfHoldingsResult,
            mfTxResult,
            profileResult
        ] = await Promise.allSettled([
            supabase
                .from("holdings")
                .select("symbol, quantity, average_cost")
                .eq("user_id", user.id)
                .gt("quantity", 0),
            getStocks(),
            supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true }),
            getUserMutualFundHoldings(user.id),
            supabase
                .from("mutual_fund_transactions")
                .select("*, mutual_funds(fund_name)")
                .eq("user_id", user.id)
                .order("transaction_date", { ascending: true }),
            supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
        ]);

        const dbHoldings = holdingsResult.status === 'fulfilled' ? holdingsResult.value.data ?? [] : [];
        const liveStocks = stocksDbResult.status === 'fulfilled' ? stocksDbResult.value || [] : [];
        const stockTransactions = stockTxResult.status === 'fulfilled' ? stockTxResult.value.data ?? [] : [];
        const mfHoldings = mfHoldingsResult.status === 'fulfilled' ? mfHoldingsResult.value : [];
        const mfTransactions = mfTxResult.status === 'fulfilled' ? mfTxResult.value.data ?? [] : [];
        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;

        const stockPriceMap = new Map(liveStocks.map((s: any) => [s.symbol, s.price]));
        const stockSectorMap = new Map(liveStocks.map((s: any) => [s.symbol, s.sector ?? "Other"]));
        const stockNameMap = new Map(liveStocks.map((s: any) => [s.symbol, s.name ?? s.symbol]));

        const holdings: Holding[] = [];
        let stockMarketValue = 0;
        let stockTotalCost = 0;
        let winners = 0;
        const sectorDataMap = new Map<string, { gain: number; cost: number; mv: number }>();

        for (const row of dbHoldings) {
            const currentPrice = stockPriceMap.get(row.symbol) ?? row.average_cost;
            const quantity = row.quantity;
            const totalCost = row.average_cost * quantity;
            const marketValue = currentPrice * quantity;
            const gain = marketValue - totalCost;
            const sector = stockSectorMap.get(row.symbol) ?? "Other";

            holdings.push({
                symbol: row.symbol,
                quantity,
                averageCost: row.average_cost,
                totalCost,
                currentPrice,
                marketValue,
                gain,
                gainPercent: totalCost > 0 ? (gain / totalCost) * 100 : 0,
                sector,
            });
            stockMarketValue += marketValue;
            stockTotalCost += totalCost;
            if (gain > 0) winners++;

            const cur = sectorDataMap.get(sector) ?? { gain: 0, cost: 0, mv: 0 };
            cur.gain += gain;
            cur.cost += totalCost;
            cur.mv += marketValue;
            sectorDataMap.set(sector, cur);
        }

        const mutualFundsValue = mfHoldings.reduce((s, h) => s + (h.current_value ?? 0), 0);
        const cashBalance = profile?.cash_balance ?? STARTING_BALANCE;
        const totalPortfolioValue = stockMarketValue + mutualFundsValue + cashBalance;

        const totalInvested = stockTotalCost + mfHoldings.reduce((s, h) => s + (h.total_invested ?? 0), 0);

        const winRate = holdings.length > 0 ? Math.round((winners / holdings.length) * 100) : 0;
        const sortedByGain = [...holdings].sort((a, b) => b.gainPercent - a.gainPercent);

        const sectorPerformance = Array.from(sectorDataMap.entries()).map(([name, d]) => ({
            name,
            gain: d.gain,
            gainPct: d.cost > 0 ? (d.gain / d.cost) * 100 : 0,
            allocation: totalPortfolioValue > 0 ? Math.round((d.mv / totalPortfolioValue) * 100) : 0,
            color: SECTOR_COLORS[name] || SECTOR_COLORS["Other"]
        }));

        const numAssetClasses = [stockMarketValue > 0, mutualFundsValue > 0, cashBalance > 0].filter(Boolean).length;

        // Process unified historical transactions
        const stockActivity: TransactionRecord[] = stockTransactions.map(tx => ({
            id: tx.id,
            type: tx.type as 'BUY' | 'SELL',
            symbol: tx.symbol,
            name: stockNameMap.get(tx.symbol) ?? tx.symbol,
            amount: tx.total_amount,
            units: tx.quantity,
            price: tx.price_per_share,
            date: tx.created_at,
            status: 'Completed',
        }));

        const mfActivity: TransactionRecord[] = mfTransactions.map(tx => {
            const fundData = tx.mutual_funds as any;
            const fundName = Array.isArray(fundData) ? fundData[0]?.fund_name : fundData?.fund_name;
            return {
                id: tx.id,
                type: tx.transaction_type === 'buy' ? 'FUND_BUY' : 'FUND_REDEEM',
                symbol: tx.fund_id || 'UNKNOWN',
                name: fundName || 'Mutual Fund',
                amount: tx.net_amount || 0,
                units: tx.units || 0,
                price: tx.nav_at_transaction || 0,
                date: tx.transaction_date || new Date().toISOString(),
                status: tx.status || 'Completed',
            };
        });

        const unifiedTransactions = [...stockActivity, ...mfActivity]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Extract pending orders
        const pendingOrders = stockTransactions
            .filter(tx => tx.status === 'pending')
            .map(tx => ({
                id: tx.id,
                symbol: tx.symbol,
                name: stockNameMap.get(tx.symbol) ?? tx.symbol,
                type: tx.type,
                quantity: tx.quantity,
                limit_price: tx.limit_price,
                created_at: tx.created_at,
                total_amount: tx.total_amount
            }));

        const currentPrices: Record<string, number> = {};
        liveStocks.forEach((s: any) => { currentPrices[s.symbol] = s.price; });
        mfHoldings.forEach(h => {
             currentPrices[h.fund_id] = h.current_nav || ((h.current_value || 0) / 1);
        });

        return {
            holdings,
            mutualFundHoldings: mfHoldings,
            cashBalance,
            totalValue: stockMarketValue,
            mutualFundsValue,
            totalInvested,
            metrics: {
                winRate,
                bestPosition: sortedByGain[0] || null,
                worstPosition: sortedByGain[sortedByGain.length - 1] || null,
                avgPositionSize: holdings.length > 0 ? stockMarketValue / holdings.length : 0,
                numAssetClasses,
                numSectors: sectorPerformance.length,
            },
            sectorPerformance,
            historicalTransactions: unifiedTransactions.filter(tx => tx.status !== 'pending'), // Only show completed/cancelled in history
            pendingOrders,
            currentPrices,
        };
    } catch (error) {
        console.error("Portfolio action error:", error);
        return null;
    }
}
