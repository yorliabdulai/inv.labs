"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { getStocks, type Stock } from "@/lib/market-data";
import { getUserMutualFundHoldings } from "@/app/actions/mutual-funds";

export interface DashboardData {
    totalEquity: number;
    cashBalance: number;
    stockMarketValue: number;
    mutualFundsValue: number;
    totalGain: number;
    totalGainPercent: number;
    dailyChange: number;
    dailyChangePercent: number;
    riskScore: number;
    riskLabel: string;
    riskColor: string;
    allocation: { name: string; value: number; color: string }[];
    recentActivity: TransactionRecord[];
    holdings: {
        symbol: string;
        name: string;
        type: 'STOCK' | 'FUND';
        value: number;
        change: number;
        changePercent: number;
    }[];
}

export interface TransactionRecord {
    id: string;
    type: 'BUY' | 'SELL' | 'FUND_BUY' | 'FUND_REDEEM';
    symbol: string;
    name: string;
    amount: number;
    units?: number;
    price?: number;
    date: string;
    status: string;
}

const SECTOR_COLORS: Record<string, string> = {
    Finance: "#4F46E5", Telecom: "#10B981", Mining: "#F59E0B",
    Energy: "#EF4444", Consumer: "#EC4899", Agriculture: "#8B5CF6",
    Technology: "#06B6D4", "Mutual Funds": "#A855F7", Cash: "#9CA3AF", Other: "#64748B",
};

const STARTING_BALANCE = 10000;

export async function getDashboardData(): Promise<DashboardData | null> {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch all raw data with individual error handling to prevent total failure
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
            supabase.from("mutual_fund_transactions").select("*, mutual_funds(fund_name)").eq("user_id", user.id),
            supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
        ]);

        const stocks = stocksResult.status === 'fulfilled' ? stocksResult.value : [];
        const stockTransactions = stockTxResult.status === 'fulfilled' ? stockTxResult.value.data || [] : [];
        const mfHoldings = mfHoldingsResult.status === 'fulfilled' ? mfHoldingsResult.value : [];
        const mfTransactions = mfTxResult.status === 'fulfilled' ? mfTxResult.value.data || [] : [];
        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;

        const priceMap = new Map(stocks.map(s => [s.symbol, s.price]));
        const changeMap = new Map(stocks.map(s => [s.symbol, s.change]));
        const changePctMap = new Map(stocks.map(s => [s.symbol, s.changePercent]));
        const sectorMap = new Map(stocks.map(s => [s.symbol, s.sector ?? "Other"]));
        const nameMap = new Map(stocks.map(s => [s.symbol, s.name]));

        // 2. Aggregate Stock Holdings
        const stockHoldingMap = new Map<string, { quantity: number; totalCost: number }>();
        stockTransactions.forEach(tx => {
            const cur = stockHoldingMap.get(tx.symbol) ?? { quantity: 0, totalCost: 0 };
            if (tx.type === "BUY") {
                cur.quantity += tx.quantity;
                cur.totalCost += tx.total_amount;
            } else {
                const avg = cur.quantity > 0 ? cur.totalCost / cur.quantity : 0;
                cur.totalCost = Math.max(0, cur.totalCost - avg * tx.quantity);
                cur.quantity = Math.max(0, cur.quantity - tx.quantity);
            }
            stockHoldingMap.set(tx.symbol, cur);
        });

        let stockMarketValue = 0;
        let stockDailyChange = 0;
        const processedHoldings: DashboardData['holdings'] = [];

        stockHoldingMap.forEach((d, sym) => {
            if (d.quantity > 0) {
                const price = priceMap.get(sym) ?? 0;
                const change = changeMap.get(sym) ?? 0;
                const mv = d.quantity * price;
                stockMarketValue += mv;
                stockDailyChange += d.quantity * change;

                processedHoldings.push({
                    symbol: sym,
                    name: nameMap.get(sym) ?? sym,
                    type: 'STOCK',
                    value: mv,
                    change: change,
                    changePercent: changePctMap.get(sym) ?? 0
                });
            }
        });

        // 3. Aggregate Mutual Funds
        const mutualFundsValue = mfHoldings.reduce((s, h) => s + (h.current_value ?? 0), 0);
        mfHoldings.forEach(h => {
            processedHoldings.push({
                symbol: h.fund_id,
                name: h.fund_name || 'Mutual Fund',
                type: 'FUND',
                value: h.current_value ?? 0,
                change: 0,
                changePercent: 0
            });
        });

        const cashBalance = profile?.cash_balance ?? STARTING_BALANCE;
        const totalEquity = stockMarketValue + mutualFundsValue + cashBalance;
        const totalGain = totalEquity - STARTING_BALANCE;
        const totalGainPercent = (totalGain / STARTING_BALANCE) * 100;

        // 4. Allocation by Sector/Class
        const allocationMap = new Map<string, number>();
        stockHoldingMap.forEach((d, sym) => {
            if (d.quantity > 0) {
                const sector = sectorMap.get(sym) ?? "Other";
                const mv = d.quantity * (priceMap.get(sym) ?? 0);
                allocationMap.set(sector, (allocationMap.get(sector) ?? 0) + mv);
            }
        });
        if (mutualFundsValue > 0) allocationMap.set("Mutual Funds", mutualFundsValue);
        if (cashBalance > 0) allocationMap.set("Cash", cashBalance);

        const allocation = Array.from(allocationMap.entries()).map(([name, value]) => ({
            name,
            value,
            color: SECTOR_COLORS[name] ?? SECTOR_COLORS["Other"]
        })).sort((a, b) => b.value - a.value);

        // 5. Recent Activity Merge
        const stockActivity: TransactionRecord[] = stockTransactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            symbol: tx.symbol,
            name: nameMap.get(tx.symbol) ?? tx.symbol,
            amount: tx.total_amount,
            units: tx.quantity,
            price: tx.price_per_share,
            date: tx.created_at,
            status: 'Completed'
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
                status: tx.status || 'Completed'
            };
        });

        const recentActivity = [...stockActivity, ...mfActivity]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        // 6. Simple Risk Score
        const totalInvested = stockMarketValue + mutualFundsValue;
        let riskScore = 0;
        let riskLabel = "Low";
        let riskColor = "text-emerald-500";

        if (totalInvested > 0) {
            const stockWeight = stockMarketValue / totalEquity;
            const concentrationWeight = Math.max(...allocation.filter(a => a.name !== "Cash").map(a => a.value / totalEquity), 0);
            riskScore = Math.round((stockWeight * 60) + (concentrationWeight * 40));
            if (riskScore > 75) { riskLabel = "Very High"; riskColor = "text-red-500"; }
            else if (riskScore > 50) { riskLabel = "Aggressive"; riskColor = "text-orange-500"; }
            else if (riskScore > 25) { riskLabel = "Moderate"; riskColor = "text-amber-500"; }
            else { riskLabel = "Conservative"; riskColor = "text-emerald-500"; }
        }

        return {
            totalEquity,
            cashBalance,
            stockMarketValue,
            mutualFundsValue,
            totalGain,
            totalGainPercent,
            dailyChange: stockDailyChange,
            dailyChangePercent: stockMarketValue > 0 ? (stockDailyChange / (stockMarketValue - stockDailyChange)) * 100 : 0,
            riskScore,
            riskLabel,
            riskColor,
            allocation,
            recentActivity,
            holdings: processedHoldings
        };

    } catch (error) {
        console.error("CRITICAL: Error fetching dashboard data:", error);
        return null;
    }
}

export async function getPortfolioHistory(period: string = '1M', currentTotal: number = STARTING_BALANCE): Promise<{ time: string; value: number; open: number; high: number; low: number; close: number }[]> {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const now = new Date();
        const dataPoints: any[] = [];

        let days = 30;
        let points = 30;
        if (period === '1D') { days = 1; points = 24; }
        else if (period === '1W') { days = 7; points = 7; }
        else if (period === '1M') { days = 30; points = 30; }
        else if (period === '3M') { days = 90; points = 45; }
        else if (period === '1Y') { days = 365; points = 52; }

        let runningValue = currentTotal;
        const msInDay = 24 * 60 * 60 * 1000;
        const totalMs = days * msInDay;
        const intervalMs = totalMs / points;

        for (let i = 0; i < points; i++) {
            const time = new Date(now.getTime() - (i * intervalMs));
            const noise = (Math.random() - 0.5) * (runningValue * 0.015);
            const close = runningValue;
            const open = runningValue - noise;
            const high = Math.max(open, close) + (Math.random() * runningValue * 0.005);
            const low = Math.min(open, close) - (Math.random() * runningValue * 0.005);

            dataPoints.unshift({
                time: period === '1D'
                    ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                value: runningValue,
                open,
                high,
                low,
                close
            });

            const drift = (currentTotal - STARTING_BALANCE) / points;
            runningValue -= drift + noise;
        }

        return dataPoints;
    } catch (error) {
        console.error("Error fetching portfolio history:", error);
        return [];
    }
}
