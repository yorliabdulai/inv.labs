import type { AtoAgentBrief } from "./ato-agent-service";

export type AtoAgentTradeIntent =
  | {
      kind: "stock";
      symbol: string;
      side: "BUY";
    }
  | {
      kind: "none";
      reason: string;
    };

export function deriveTradeIntent(brief: AtoAgentBrief): AtoAgentTradeIntent {
  if (brief.recommendation !== "buy") {
    return {
      kind: "none",
      reason:
        brief.recommendation === "hold"
          ? "Agent recommendation is to hold. No new simulated trade is recommended."
          : "Agent recommendation is to pass. No simulated trade is recommended.",
    };
  }

  const hint = brief.assetHint;
  const symbol = hint?.assetType === "stock" ? hint.symbol?.trim() : undefined;

  if (!symbol) {
    return {
      kind: "none",
      reason:
        "The agent could not confidently map this idea to a specific Ghana Stock Exchange symbol. Review the brief and place any simulated trades manually.",
    };
  }

  return {
    kind: "stock",
    symbol,
    side: "BUY",
  };
}

