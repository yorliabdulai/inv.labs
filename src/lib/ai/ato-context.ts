import { supabase } from "@/lib/supabase/client";
import { getStocks } from "@/lib/market-data";
import { getMutualFunds } from "@/app/actions/mutual-funds";
import { formatCurrency, formatPercent } from "@/lib/mutual-funds-data";

export interface UserPortfolioData {
    cashBalance: number;
    totalValue: number;
    stockHoldings: Array<{
        ticker: string;
        companyName: string;
        shares: number;
        currentPrice: number;
        currentValue: number;
        gainLossPercent: number;
        sector: string;
    }>;
    mutualFundHoldings: Array<{
        fundName: string;
        fundType: string;
        units: number;
        currentNAV: number;
        currentValue: number;
        gainLossPercent: number;
    }>;
    recentTransactions: Array<{
        date: string;
        type: string;
        quantity: number | string;
        assetName: string;
        price: number;
    }>;
    overallGainLoss: number;
    overallGainLossAmount: number;
}

/**
 * Build comprehensive user portfolio context for Ato
 * @param userId - User ID
 * @returns Formatted context string
 */
export async function buildUserPortfolioContext(
    userId: string
): Promise<string> {
    try {
        // Get user profile and cash balance
        const { data: profile } = await supabase
            .from("profiles")
            .select("cash_balance, full_name")
            .eq("id", userId)
            .single();

        const cashBalance = profile?.cash_balance || 0;
        const userName = profile?.full_name || "User";

        // Get stock holdings
        const { data: stockHoldings } = await supabase
            .from("holdings")
            .select("symbol, quantity, average_cost")
            .eq("user_id", userId);

        // Get current stock prices
        const stocks = await getStocks();
        const stocksMap = new Map(stocks.map((s) => [s.symbol, s]));

        const enrichedStockHoldings =
            stockHoldings?.map((holding) => {
                const stock = stocksMap.get(holding.symbol);
                const currentPrice = stock?.price || 0;
                const currentValue = holding.quantity * currentPrice;
                const costBasis = holding.quantity * holding.average_cost;
                const gain = currentValue - costBasis;
                const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

                return {
                    ticker: holding.symbol,
                    companyName: stock?.name || holding.symbol,
                    shares: holding.quantity,
                    currentPrice,
                    currentValue,
                    gainLossPercent: gainPercent,
                    sector: stock?.sector || "Unknown",
                };
            }) || [];

        // Get mutual fund holdings
        const { data: mfHoldings } = await supabase
            .from("user_mutual_fund_holdings")
            .select(
                `
        *,
        mutual_funds (
          fund_name,
          fund_type,
          current_nav
        )
      `
            )
            .eq("user_id", userId);

        const enrichedMFHoldings =
            mfHoldings?.map((holding: any) => {
                const currentNAV = holding.mutual_funds?.current_nav || 0;
                const currentValue = holding.units_held * currentNAV;
                const costBasis = holding.units_held * holding.average_nav;
                const gain = currentValue - costBasis;
                const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

                return {
                    fundName: holding.mutual_funds?.fund_name || "Unknown Fund",
                    fundType: holding.mutual_funds?.fund_type || "Unknown",
                    units: holding.units_held,
                    currentNAV,
                    currentValue,
                    gainLossPercent: gainPercent,
                };
            }) || [];

        // Get recent transactions (last 5)
        const { data: stockTransactions } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3);

        const { data: mfTransactions } = await supabase
            .from("mutual_fund_transactions")
            .select(
                `
        *,
        mutual_funds (fund_name)
      `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(2);

        const recentTransactions = [
            ...(stockTransactions?.map((t) => ({
                date: new Date(t.created_at).toLocaleDateString("en-GB"),
                type: t.type,
                quantity: t.quantity,
                assetName: t.symbol,
                price: t.price_per_share,
            })) || []),
            ...(mfTransactions?.map((t: any) => ({
                date: new Date(t.created_at).toLocaleDateString("en-GB"),
                type: t.transaction_type,
                quantity: t.units.toFixed(4) + " units",
                assetName: t.mutual_funds?.fund_name || "Unknown Fund",
                price: t.nav_at_transaction,
            })) || []),
        ]
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5);

        // Calculate totals
        const totalStockValue = enrichedStockHoldings.reduce(
            (sum, h) => sum + h.currentValue,
            0
        );
        const totalMFValue = enrichedMFHoldings.reduce(
            (sum, h) => sum + h.currentValue,
            0
        );
        const totalValue = cashBalance + totalStockValue + totalMFValue;

        const totalStockCost = enrichedStockHoldings.reduce(
            (sum, h) => sum + h.shares * 0, // We'd need average_cost here
            0
        );
        const totalMFCost = enrichedMFHoldings.reduce(
            (sum, h) => sum + h.units * 0, // We'd need average_nav here
            0
        );

        // Build context string
        let context = `USER PORTFOLIO CONTEXT FOR ${userName.toUpperCase()}:\n\n`;
        context += `PORTFOLIO SUMMARY:\n`;
        context += `- Cash Balance: ${formatCurrency(cashBalance)}\n`;
        context += `- Total Stock Value: ${formatCurrency(totalStockValue)} (${enrichedStockHoldings.length} positions)\n`;
        context += `- Total Mutual Fund Value: ${formatCurrency(totalMFValue)} (${enrichedMFHoldings.length} positions)\n`;
        context += `- Total Portfolio Value: ${formatCurrency(totalValue)}\n\n`;

        if (enrichedStockHoldings.length > 0) {
            context += `STOCK HOLDINGS (GSE):\n`;
            enrichedStockHoldings.forEach((h) => {
                context += `- ${h.ticker} (${h.companyName}): ${h.shares} shares @ ${formatCurrency(h.currentPrice)} = ${formatCurrency(h.currentValue)} (${formatPercent(h.gainLossPercent)})\n`;
                context += `  Sector: ${h.sector}\n`;
            });
            context += `\n`;
        } else {
            context += `STOCK HOLDINGS: None\n\n`;
        }

        if (enrichedMFHoldings.length > 0) {
            context += `MUTUAL FUND HOLDINGS:\n`;
            enrichedMFHoldings.forEach((h) => {
                context += `- ${h.fundName} (${h.fundType}): ${h.units.toFixed(4)} units @ ${formatCurrency(h.currentNAV)} = ${formatCurrency(h.currentValue)} (${formatPercent(h.gainLossPercent)})\n`;
            });
            context += `\n`;
        } else {
            context += `MUTUAL FUND HOLDINGS: None\n\n`;
        }

        if (recentTransactions.length > 0) {
            context += `RECENT TRANSACTIONS (Last 5):\n`;
            recentTransactions.forEach((t) => {
                context += `- ${t.date}: ${t.type} ${t.quantity} ${t.assetName} @ ${formatCurrency(t.price)}\n`;
            });
            context += `\n`;
        }

        context += `PORTFOLIO COMPOSITION:\n`;
        const stockPercentage =
            totalValue > 0 ? (totalStockValue / totalValue) * 100 : 0;
        const mfPercentage =
            totalValue > 0 ? (totalMFValue / totalValue) * 100 : 0;
        const cashPercentage =
            totalValue > 0 ? (cashBalance / totalValue) * 100 : 0;
        context += `- Stocks: ${stockPercentage.toFixed(1)}%\n`;
        context += `- Mutual Funds: ${mfPercentage.toFixed(1)}%\n`;
        context += `- Cash: ${cashPercentage.toFixed(1)}%\n`;

        return context;
    } catch (error) {
        console.error("Error building portfolio context:", error);
        return "USER PORTFOLIO: Unable to load portfolio data at this time.";
    }
}

/**
 * Build market context with current GSE data
 * @returns Formatted market context string
 */
export async function buildMarketContext(): Promise<string> {
    try {
        const stocks = await getStocks();

        let context = `GHANA STOCK EXCHANGE (GSE) MARKET DATA:\n\n`;
        context += `Total Stocks Listed: ${stocks.length}\n`;

        // Calculate market stats
        const gainers = stocks.filter((s) => s.changePercent > 0).length;
        const losers = stocks.filter((s) => s.changePercent < 0).length;
        const unchanged = stocks.filter((s) => s.changePercent === 0).length;

        context += `Market Breadth: ${gainers} gainers, ${losers} losers, ${unchanged} unchanged\n\n`;

        // Top 5 performers
        const topPerformers = [...stocks]
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, 5);

        context += `TOP PERFORMERS TODAY:\n`;
        topPerformers.forEach((s) => {
            context += `- ${s.symbol} (${s.name}): ${formatCurrency(s.price)} (${formatPercent(s.changePercent)})\n`;
        });

        return context;
    } catch (error) {
        console.error("Error building market context:", error);
        return "GSE MARKET DATA: Unable to load market data at this time.";
    }
}

/**
 * Build mutual funds context
 * @returns Formatted mutual funds context string
 */
export async function buildMutualFundsContext(): Promise<string> {
    try {
        const funds = await getMutualFunds();

        let context = `MUTUAL FUNDS IN GHANA:\n\n`;
        context += `Total Funds Available: ${funds.length}\n`;

        // Group by type
        const fundTypes = funds.reduce((acc, f) => {
            acc[f.fund_type] = (acc[f.fund_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        context += `Fund Types:\n`;
        Object.entries(fundTypes).forEach(([type, count]) => {
            context += `- ${type}: ${count} funds\n`;
        });

        context += `\nSAMPLE FUNDS:\n`;
        funds.slice(0, 5).forEach((f) => {
            context += `- ${f.fund_name} (${f.fund_type}): NAV ${formatCurrency(f.current_nav)}, Risk ${f.risk_rating}/5\n`;
        });

        return context;
    } catch (error) {
        console.error("Error building mutual funds context:", error);
        return "MUTUAL FUNDS: Unable to load mutual funds data at this time.";
    }
}

/**
 * Build complete context for Ato
 * @param userId - User ID
 * @returns Complete formatted context
 */
export async function buildCompleteContext(userId: string): Promise<string> {
    const [portfolioContext, marketContext, mfContext] = await Promise.all([
        buildUserPortfolioContext(userId),
        buildMarketContext(),
        buildMutualFundsContext(),
    ]);

    return `${portfolioContext}\n\n${marketContext}\n\n${mfContext}`;
}
