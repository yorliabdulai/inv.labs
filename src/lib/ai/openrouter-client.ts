import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

export type OpenRouterChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterCompletionOptions = {
  messages: OpenRouterChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
  /** Override model list for this call */
  models?: string[];
};

type OpenRouterChoice = {
  message?: {
    content?: string | null;
    reasoning?: string | null;
    refusal?: string | null;
  };
  finish_reason?: string | null;
};

export function getOpenRouterApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;
}

/** Models to try in order — free tier can return empty content intermittently */
export function getOpenRouterModelFallbacks(): string[] {
  const primary = process.env.OPENROUTER_MODEL?.trim();
  const list = [
    primary,
    "openrouter/free",
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ].filter((m): m is string => Boolean(m));

  return [...new Set(list)];
}

export function extractOpenRouterText(data: {
  choices?: OpenRouterChoice[];
}): string | null {
  const choice = data?.choices?.[0];
  if (!choice) return null;

  const msg = choice.message;
  if (!msg) return null;

  const parts: string[] = [];
  if (typeof msg.content === "string" && msg.content.trim()) {
    parts.push(msg.content.trim());
  }
  if (typeof msg.reasoning === "string" && msg.reasoning.trim()) {
    parts.push(msg.reasoning.trim());
  }

  if (parts.length > 0) return parts.join("\n");

  if (typeof msg.refusal === "string" && msg.refusal.trim()) {
    return msg.refusal.trim();
  }

  return null;
}

function describeEmptyResponse(data: {
  choices?: OpenRouterChoice[];
  error?: { message?: string };
}): string {
  const finish = data?.choices?.[0]?.finish_reason;
  const err = data?.error?.message;
  const bits = [
    "OpenRouter returned no message content.",
    finish ? `finish_reason=${finish}` : null,
    err ? `api_error=${err}` : null,
  ].filter(Boolean);
  return bits.join(" ");
}

export async function completeOpenRouterChat(
  opts: OpenRouterCompletionOptions
): Promise<{ content: string; model: string }> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY or OPENROUTER_API_KEY is not configured.");
  }

  const models = opts.models?.length ? opts.models : getOpenRouterModelFallbacks();
  const timeoutMs = opts.timeoutMs ?? 90_000;
  let lastError = "No models attempted";

  for (const model of models) {
    for (let jsonAttempt = 0; jsonAttempt < 2; jsonAttempt++) {
      const useJsonMode = opts.jsonMode === true && jsonAttempt === 0;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const body: Record<string, unknown> = {
          model,
          temperature: opts.temperature ?? 0.4,
          max_tokens: opts.maxTokens ?? 2048,
          messages: opts.messages,
        };
        if (useJsonMode) {
          body.response_format = { type: "json_object" };
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://invlabs.com",
            "X-Title": "INV.LABS",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify(body),
        });

        const rawText = await response.text();
        let data: {
          choices?: OpenRouterChoice[];
          error?: { message?: string };
        } = {};

        try {
          data = JSON.parse(rawText) as typeof data;
        } catch {
          lastError = `Invalid JSON from OpenRouter (${model}): ${rawText.slice(0, 200)}`;
          continue;
        }

        if (!response.ok) {
          const apiErr = data?.error?.message || rawText.slice(0, 300);
          if (useJsonMode && /response_format|json/i.test(apiErr)) {
            continue;
          }
          lastError = `OpenRouter ${response.status} (${model}): ${apiErr}`;
          break;
        }

        const content = extractOpenRouterText(data);
        if (content) {
          return { content, model };
        }

        lastError = `${describeEmptyResponse(data)} [model=${model}]`;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        lastError =
          msg.includes("abort") || msg.includes("Abort")
            ? `Request timed out (${model}). Try again.`
            : `${msg} [model=${model}]`;
      } finally {
        clearTimeout(timeoutId);
      }

      if (opts.jsonMode !== true) break;
    }
  }

  throw new Error(lastError);
}
