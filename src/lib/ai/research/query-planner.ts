import { KNOWN_METADATA } from "@/lib/market-data";

export type PlannedQuery = {
  id: string;
  label: string;
  query: string;
  searchType?: "search" | "news";
};

export function resolveCompanyName(symbol?: string, userQuery?: string): string {
  if (symbol) {
    const meta = KNOWN_METADATA[symbol.toUpperCase()];
    if (meta?.name) return meta.name;
    return symbol;
  }
  const tickerMatch = userQuery?.match(/\b([A-Z]{2,6})\b/);
  if (tickerMatch) {
    const meta = KNOWN_METADATA[tickerMatch[1].toUpperCase()];
    if (meta?.name) return meta.name;
  }
  return userQuery?.replace(/\b(research|analyze|tell me about)\b/gi, "").trim() || "Ghana company";
}

export function planResearchQueries(args: {
  userQuery: string;
  symbol?: string;
  includeMacro?: boolean;
}): PlannedQuery[] {
  const company = resolveCompanyName(args.symbol, args.userQuery);
  const ticker = args.symbol?.toUpperCase();

  const queries: PlannedQuery[] = [
    {
      id: "overview",
      label: "Searching company overview & investor relations",
      query: `${company} Ghana Stock Exchange investor relations annual report`,
    },
    {
      id: "filings",
      label: "Searching financial statements & PDF filings",
      query: `${company} annual report OR financial statements filetype:pdf Ghana`,
    },
    {
      id: "news",
      label: "Searching recent news & earnings",
      query: `${company} earnings dividend Ghana 2025 2026`,
      searchType: "news",
    },
    {
      id: "social",
      label: "Searching indexed social & market discourse",
      query: `site:facebook.com OR site:x.com OR site:twitter.com ${company} Ghana GSE ${ticker || ""}`,
    },
    {
      id: "gse",
      label: "Searching GSE & Ghana finance coverage",
      query: `${company} ${ticker || ""} Ghana Stock Exchange share price analysis`,
    },
  ];

  if (args.includeMacro !== false) {
    queries.push({
      id: "macro",
      label: "Pulling Bank of Ghana macro context",
      query: "Bank of Ghana monetary policy rate inflation Ghana treasury bills",
    });
  }

  return queries;
}
