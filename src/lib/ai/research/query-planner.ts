import type { ResearchEntity } from "./entity-resolver";
import { BANK_OF_GHANA_LABEL } from "./entity-resolver";

export type PlannedQuery = {
  id: string;
  label: string;
  query: string;
  searchType?: "search" | "news";
  /** Macro-only queries skip Ghana/GSE suffix bias on Serper */
  scope?: "company" | "macro";
};

function primarySearchLabel(entity: ResearchEntity): string {
  return entity.searchPhrases[0]?.replace(/^"|"$/g, "") || entity.companyName;
}

export function planResearchQueries(args: {
  entity: ResearchEntity;
  includeMacro?: boolean;
}): PlannedQuery[] {
  const { entity } = args;
  const label = primarySearchLabel(entity);
  const ticker = entity.symbol;
  const companyQueries = entity.searchPhrases.slice(0, 2).join(" OR ");

  const queries: PlannedQuery[] = [
    {
      id: "overview",
      label: `Searching ${entity.companyName} overview & investor relations`,
      scope: "company",
      query: `${companyQueries} Ghana Stock Exchange investor relations`,
    },
    {
      id: "filings",
      label: `Searching ${entity.companyName} financial statements & filings`,
      scope: "company",
      query: `(${companyQueries}) annual report OR financial statements filetype:pdf Ghana`,
    },
    {
      id: "news",
      label: `Searching ${entity.companyName} news & earnings`,
      scope: "company",
      searchType: "news",
      query: `${label} ${ticker ? ticker + " " : ""}earnings revenue IPO Ghana 2025 2026`,
    },
    {
      id: "social",
      label: "Searching indexed social & market discourse",
      scope: "company",
      query: `site:facebook.com OR site:x.com OR site:twitter.com (${companyQueries}) Ghana GSE`,
    },
    {
      id: "gse",
      label: "Searching GSE & Ghana finance coverage",
      scope: "company",
      query: `${label} ${ticker || ""} Ghana Stock Exchange share price`,
    },
  ];

  if (args.includeMacro !== false) {
    queries.push({
      id: "macro",
      label: `Pulling ${BANK_OF_GHANA_LABEL} macro context`,
      scope: "macro",
      query: "Bank of Ghana monetary policy rate inflation treasury bills Ghana",
    });
  }

  return queries;
}
