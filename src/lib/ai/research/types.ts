export type AtoAgentRecommendation = "buy" | "hold" | "pass";

export type CitationType = "pdf" | "news" | "social" | "official" | "web";

export type ResearchStepStatus = "pending" | "running" | "done" | "error";

export type ResearchStep = {
  id: string;
  label: string;
  status: ResearchStepStatus;
};

export type AtoCitation = {
  index: number;
  title: string;
  url: string;
  excerpt?: string;
  type: CitationType;
  date?: string;
};

export type MacroContext = {
  policyRate: number;
  effectiveDate: string;
  sourceUrl: string;
  sefdPdfUrl?: string;
};

export type AtoResearchBrief = {
  subject: string;
  whatItDoes: string;
  latestFinancialSignal: string;
  recommendation: AtoAgentRecommendation;
  reasoning: string;
  markdownSummary: string;
  assetHint?: {
    assetType: "stock" | "mutual_fund" | "unknown";
    symbol?: string;
    name?: string;
  };
  sources: Array<{ title: string; url: string; snippet?: string; date?: string }>;
  citations: AtoCitation[];
  macroContext?: MacroContext;
  researchSteps?: ResearchStep[];
  gseQuote?: { symbol: string; price: number; changePercent: number };
};

export type ResearchUsagePayload = {
  used: number;
  remaining: number;
  limit: number;
};

export type ResearchProgressEvent =
  | { type: "step"; step: ResearchStep }
  | { type: "brief"; brief: AtoResearchBrief }
  | { type: "usage"; usage: ResearchUsagePayload }
  | { type: "error"; message: string };

export type SerperSource = {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
};
