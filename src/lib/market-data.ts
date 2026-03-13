import { cache } from 'react';

export interface Stock {
    symbol: string;
    name: string; // Full company name (fallback to symbol if not available)
    price: number;
    change: number;
    changePercent: number;
    sector: string;
    volume: number;
}

export const GSE_API_BASE = "https://dev.kwayisi.org/apis/gse";

// Static metadata map for common GSE stocks to enhance the API data
// The API /live endpoint only gives Ticker, Price, Change, Volume
export const KNOWN_METADATA: Record<string, { name: string; sector: string }> = {
    "MTNGH": { name: "MTN Ghana", sector: "Telecom" },
    "GCB": { name: "GCB Bank", sector: "Finance" },
    "EGH": { name: "Ecobank Ghana", sector: "Finance" },
    "SCB": { name: "Standard Chartered", sector: "Finance" },
    "CAL": { name: "CAL Bank", sector: "Finance" },
    "EGL": { name: "Enterprise Group", sector: "Insurance" },
    "GOIL": { name: "Ghana Oil Company", sector: "Energy" },
    "TOTAL": { name: "Total Petroleum", sector: "Energy" },
    "FML": { name: "Fan Milk Ltd", sector: "Consumer" },
    "UNIL": { name: "Unilever Ghana", sector: "Consumer" },
    "BOPP": { name: "Benso Oil Palm", sector: "Agriculture" },
    "GLD": { name: "NewGold ETF", sector: "ETF" },
    "ACCESS": { name: "Access Bank", sector: "Finance" },
    "ADB": { name: "Agricultural Development Bank", sector: "Finance" },
    "AGA": { name: "AngloGold Ashanti", sector: "Mining" },
    "ALW": { name: "Aluworks", sector: "Industrial" },
};

interface Quote {
    name: string;   // Ticker Symbol e.g. "MTNGH"
    price: number;
    change: number;
    volume: number;
}

// Memoize fetching during a single React render pass to avoid duplicate work.
// NOTE: cache() is scoped to a single React render/request — NOT shared across Server Actions.
const getStocksData = async (): Promise<Stock[]> => {
    try {
        const res = await fetch(`${GSE_API_BASE}/live`, {
            // Cache at Next.js edge for 60 seconds to prevent hammering the upstream API
            // while providing reasonably fresh data
            next: { revalidate: 60 },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`GSE API Error (${res.status}):`, errorText);
            throw new Error(`Failed to fetch market data: ${res.status}`);
        }

        const quotes: Quote[] = await res.json();

        return quotes.map((quote) => {
            const meta = KNOWN_METADATA[quote.name] || { name: quote.name, sector: "Other" };
            const previousPrice = quote.price - quote.change;
            const changePercent = previousPrice !== 0 ? (quote.change / previousPrice) * 100 : 0;

            return {
                symbol: quote.name,
                name: meta.name,
                sector: meta.sector,
                price: quote.price,
                change: quote.change,
                changePercent: changePercent,
                volume: quote.volume
            };
        });
    } catch (error) {
        console.error("Market data fetch error:", error);
        // Fallback to empty or handled in UI
        return [];
    }
};

const getStockData = async (symbol: string): Promise<Stock | undefined> => {
    const stocks = await getStocks();
    return stocks.find((s) => s.symbol === symbol);
};

export const getStocks = cache(getStocksData);
export const getStock = cache(getStockData);

/**
 * Direct (non-cached) stock fetch for use inside Server Actions.
 * Throws descriptively on API failure instead of silently returning undefined.
 * Do NOT use this in React components — use getStock() there instead.
 */
export async function fetchStockBySymbol(symbol: string): Promise<Stock> {
    let quotes: Quote[];
    try {
        const res = await fetch(`${GSE_API_BASE}/live`, {
            // Short cache — fresh data for trade execution, but avoids hammering the API
            next: { revalidate: 30 },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[fetchStockBySymbol] GSE API error (${res.status}): ${errorText}`);
            throw new Error(`GSE market data API returned ${res.status}. The exchange may be temporarily unavailable.`);
        }

        quotes = await res.json();
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('GSE market data API')) {
            throw err; // re-throw our descriptive error as-is
        }
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[fetchStockBySymbol] Network error fetching GSE data:`, message);
        throw new Error(`Unable to reach the GSE market data feed. Please try again later.`);
    }

    const quote = quotes.find((q) => q.name === symbol);
    if (!quote) {
        console.error(`[fetchStockBySymbol] Symbol "${symbol}" not found in GSE live feed. Available: [${quotes.map(q => q.name).join(', ')}]`);
        throw new Error(`Stock symbol "${symbol}" was not found in the live market feed.`);
    }

    const meta = KNOWN_METADATA[quote.name] || { name: quote.name, sector: "Other" };
    const previousPrice = quote.price - quote.change;
    const changePercent = previousPrice !== 0 ? (quote.change / previousPrice) * 100 : 0;

    return {
        symbol: quote.name,
        name: meta.name,
        sector: meta.sector,
        price: quote.price,
        change: quote.change,
        changePercent,
        volume: quote.volume,
    };
}
