import type { AtoResearchBrief } from "./research/types";
import { runDeepResearchPipeline } from "./research/pipeline";

export type AtoAgentSource = {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
};

export type AtoAgentRecommendation = "buy" | "hold" | "pass";

export type AtoAgentBrief = AtoResearchBrief;

export { serperSearch as serperSearchGhana } from "./research/serper";

export async function runAtoResearchAgent(
  userQuery: string,
  symbol?: string
): Promise<AtoResearchBrief> {
  return runDeepResearchPipeline({ userQuery, symbol });
}
