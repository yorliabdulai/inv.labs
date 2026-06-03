import { fetchStockBySymbol } from "@/lib/market-data";
import type { AtoResearchBrief } from "./types";

export type LiveGseQuote = NonNullable<AtoResearchBrief["gseQuote"]>;

export async function fetchLiveGseQuote(symbol?: string): Promise<LiveGseQuote | undefined> {
  if (!symbol) return undefined;
  try {
    const stock = await fetchStockBySymbol(symbol.toUpperCase());
    return {
      symbol: stock.symbol,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("[fetchLiveGseQuote]", symbol, e);
    return undefined;
  }
}

/** Always overlay fresh GSE prices — cached briefs must not keep stale quotes */
export async function hydrateBriefWithLiveQuote(
  brief: AtoResearchBrief,
  symbol?: string
): Promise<AtoResearchBrief> {
  const sym = symbol?.toUpperCase() || brief.assetHint?.symbol?.toUpperCase() || brief.gseQuote?.symbol;
  if (!sym) return brief;

  const live = await fetchLiveGseQuote(sym);
  if (!live) return brief;

  const priceLine = `Live GSE price as of ${new Date(live.fetchedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}: GH₵${live.price.toFixed(2)} (${live.changePercent >= 0 ? "+" : ""}${live.changePercent.toFixed(2)}% vs prior close).`;

  let latestFinancialSignal = brief.latestFinancialSignal || "";
  if (!latestFinancialSignal.includes("Live GSE price")) {
    latestFinancialSignal = `${priceLine} ${latestFinancialSignal}`.trim();
  } else {
    latestFinancialSignal = latestFinancialSignal.replace(
      /Live GSE price as of [^.]+\./i,
      priceLine
    );
  }

  return {
    ...brief,
    gseQuote: live,
    latestFinancialSignal,
    assetHint: {
      assetType: "stock",
      symbol: sym,
      name: brief.assetHint?.name,
    },
  };
}
