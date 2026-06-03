"use client";

import type { AtoResearchBrief, ResearchStep } from "./types";

export type ResearchUsage = {
  used: number;
  remaining: number;
  limit: number;
};

export async function runAtoResearchStream(args: {
  query: string;
  symbol?: string;
  onStep: (step: ResearchStep) => void;
  onBrief: (brief: AtoResearchBrief) => void;
  onUsage?: (usage: ResearchUsage) => void;
  onError: (message: string) => void;
}): Promise<void> {
  const response = await fetch("/api/ato/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: args.query, symbol: args.symbol, stream: true }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    args.onError(data.error || "Research request failed.");
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    args.onError("No response stream.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(line.slice(6));
        if (payload.type === "step") args.onStep(payload.step);
        if (payload.type === "brief") args.onBrief(payload.brief);
        if (payload.type === "usage" && payload.usage) {
          args.onUsage?.(payload.usage);
        }
        if (payload.type === "error") args.onError(payload.message);
      } catch {
        // skip malformed chunks
      }
    }
  }
}
