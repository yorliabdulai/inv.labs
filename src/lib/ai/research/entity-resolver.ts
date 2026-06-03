import { KNOWN_METADATA } from "@/lib/market-data";

export type ResearchEntity = {
  symbol?: string;
  companyName: string;
  sector?: string;
  /** Primary phrases for Serper — never include Bank of Ghana here */
  searchPhrases: string[];
};

const RESEARCH_VERB =
  /\b(research|analyze|analyse|deep\s*dive|tell\s+me\s+about|look\s+into|review)\b/gi;

/** Ghana central bank — never merge into a company name */
export const BANK_OF_GHANA_LABEL = "Bank of Ghana (central bank — macro only)";

/**
 * Extract a likely GSE ticker from free-text queries like "Research ZEN".
 */
export function extractTickerFromQuery(userQuery: string): string | undefined {
  const cleaned = userQuery.replace(RESEARCH_VERB, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;

  if (/^[A-Z][A-Z0-9.-]{1,7}$/.test(cleaned)) {
    return cleaned.replace(/\./g, "").toUpperCase();
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (/^[A-Z][A-Z0-9]{1,7}$/.test(token)) {
      return token.toUpperCase();
    }
  }

  return undefined;
}

export function resolveResearchEntity(
  userQuery: string,
  symbolHint?: string
): ResearchEntity {
  const symbol = (symbolHint || extractTickerFromQuery(userQuery))?.toUpperCase();

  if (symbol) {
    const meta = KNOWN_METADATA[symbol];
    if (meta) {
      const phrases = [
        `"${meta.name}"`,
        `${meta.name} Ghana Stock Exchange`,
        `GSE ${symbol} ${meta.name}`,
      ];
      if (symbol === "ZEN" || /petroleum/i.test(meta.name)) {
        phrases.unshift('"ZEN Petroleum" OR "ZEN Petroleum Holdings"');
      }
      return {
        symbol,
        companyName: meta.name,
        sector: meta.sector,
        searchPhrases: phrases,
      };
    }

    return {
      symbol,
      companyName: symbol,
      searchPhrases: [
        `"${symbol}" Ghana Stock Exchange GSE`,
        `GSE:${symbol} OR ${symbol}.GH`,
        `${symbol} listed company Ghana`,
      ],
    };
  }

  const name =
    userQuery.replace(RESEARCH_VERB, "").replace(/\s+/g, " ").trim() || "Ghana company";

  return {
    companyName: name,
    searchPhrases: [`"${name}" Ghana Stock Exchange`, `${name} Ghana company financials`],
  };
}

export function formatEntityForSynthesis(entity: ResearchEntity): string {
  const lines = [
    "RESOLVED RESEARCH TARGET (authoritative — use exactly for the company):",
    entity.symbol
      ? `- GSE ticker: ${entity.symbol}`
      : "- GSE ticker: unknown (infer only from sources)",
    `- Company name: ${entity.companyName}`,
    entity.sector ? `- Sector: ${entity.sector}` : null,
    "",
    "IMPORTANT:",
    `- ${BANK_OF_GHANA_LABEL} appears only in the MACRO section below.`,
    "- Never invent company names by combining the ticker with Bank of Ghana (e.g. no \"ZEN Bank of Ghana\").",
    "- BoG policy rates are macro context for how Ghana's economy affects listed companies — not the company itself.",
  ].filter(Boolean);

  return lines.join("\n");
}
