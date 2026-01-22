"use server";

import { getStocks as fetchStocksLib } from "@/lib/market-data";

export async function getMarketData() {
    try {
        const data = await fetchStocksLib();
        return data;
    } catch (error) {
        console.error("Server Action Error:", error);
        return [];
    }
}
