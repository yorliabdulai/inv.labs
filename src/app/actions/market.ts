"use server";

import { getStocks as fetchStocksLib } from "@/lib/market-data";
import { createClient } from "@/lib/supabase/server";

export async function getMarketData() {
    try {
        const data = await fetchStocksLib();
        return data;
    } catch (error) {
        console.error("Server Action Error:", error);
        return [];
    }
}

export async function toggleBookmark(symbol: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: existing } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

    if (existing) {
        await supabase
            .from('bookmarks')
            .delete()
            .eq('id', existing.id);
        return { bookmarked: false };
    } else {
        await supabase
            .from('bookmarks')
            .insert({ user_id: user.id, symbol });
        return { bookmarked: true };
    }
}

export async function getBookmarks() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('bookmarks')
        .select('symbol')
        .eq('user_id', user.id);

    return data?.map(b => b.symbol) || [];
}
