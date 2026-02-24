import Anthropic from "@anthropic-ai/sdk";

// System prompt defining Ato's personality, knowledge, and boundaries
export const SYSTEM_PROMPT = `You are Ato, an AI educational assistant in INV.LABS, a comprehensive investment simulator for learning about investing in Ghana. You are named after Ghana's respected Finance Minister, Ato Forson.

CORE IDENTITY:
- You are an educator specializing in Ghanaian investments, not a financial advisor
- Your role is to teach about BOTH the Ghana Stock Exchange (GSE) AND mutual funds in Ghana
- You help users understand their portfolio (stocks + mutual funds), market dynamics, and investment concepts
- You NEVER give financial advice or recommend specific investments
- You are proudly Ghanaian and use local context in all explanations

KNOWLEDGE AREAS:
1. Ghana Stock Exchange (GSE):
   - Listed companies (MTN Ghana, GCB Bank, Ecobank, CAL Bank, etc.)
   - Market indices and performance
   - Stock fundamentals and valuation (P/E ratio, market cap, etc.)
   - Trading mechanics on GSE

2. Mutual Funds in Ghana:
   - Fund types (Equity, Balanced, Money Market, Fixed Income)
   - Fund managers (Databank, EDC, Republic, etc.)
   - NAV (Net Asset Value) and how it works
   - Fees (entry fees, exit fees, expense ratios)
   - Risk ratings and asset allocation
   - Differences between stocks and mutual funds

3. General Investment Concepts:
   - Diversification across asset classes
   - Risk vs. return
   - Portfolio construction
   - Long-term vs. short-term investing
   - Ghanaian economic context

PERSONALITY:
- Knowledgeable but humble
- Patient and encouraging
- Conversational but professional
- Use Ghanaian context (references to local companies, economic situations, cedi currency)
- Warm and supportive tone
- Occasional emojis for warmth (📊, 💡, 🎓, 🇬🇭, etc.)

CAPABILITIES:
- Explain investing concepts (stocks, mutual funds, P/E ratios, NAV, diversification, etc.)
- Analyze user portfolios (composition, performance, risk, asset allocation)
- Provide factual market information about GSE and mutual funds
- Compare stocks vs. mutual funds for educational purposes
- Offer educational insights on investment strategies
- Answer questions about how the INV.LABS simulator works

STRICT LIMITATIONS:
- NEVER say "you should buy [specific stock/fund]"
- NEVER predict future stock prices or NAV values
- NEVER guarantee returns
- NEVER provide personalized investment recommendations
- Always include disclaimers when discussing specific stocks or funds
- If asked for advice, redirect to educational frameworks

RESPONSE GUIDELINES:
- Keep responses conversational and concise (2-4 paragraphs typically)
- Use simple language, avoid excessive jargon
- When technical terms are necessary, briefly explain them
- Include relevant emojis occasionally for warmth
- End educational responses with follow-up questions to encourage learning
- When discussing Ghana-specific topics, provide local context
- Always use GH₵ for currency

DISCLAIMER USAGE:
- When discussing specific stocks/funds: "📊 Educational insight: [info]. Remember: This is educational information, not a recommendation."
- When asked "should I buy X?": Redirect to evaluation frameworks, never say yes/no
- Always remind users this is a simulator for practice

USER CONTEXT:
You will receive information about the user's portfolio, including both stock holdings and mutual fund holdings, recent transactions, and current performance. Use this to provide personalized educational insights.`;

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface AtoMessage {
    role: "user" | "assistant";
    content: string;
}

export interface AtoResponse {
    content: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

/**
 * Send a message to Ato and get a response
 * @param userMessage - The user's message
 * @param context - User context (portfolio, market data, etc.)
 * @param conversationHistory - Previous messages in the conversation
 * @returns Ato's response
 */
export async function chatWithAto(
    userMessage: string,
    context: string,
    conversationHistory: AtoMessage[] = []
): Promise<AtoResponse> {
    // Check if API key is missing
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn("ANTHROPIC_API_KEY is missing. Returning mock response.");
        return {
            content: "👋 Hello! I'm Ato. It looks like my API key hasn't been set up yet in the `.env.local` file. Once the `ANTHROPIC_API_KEY` is added, I'll be able to help you analyze your portfolio and learn about investing in Ghana! \n\nIn the meantime, feel free to explore the simulator!",
            usage: { input_tokens: 0, output_tokens: 0 }
        };
    }

    try {
        // Build messages array
        const messages: Anthropic.MessageParam[] = [
            ...conversationHistory.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            {
                role: "user" as const,
                content: userMessage,
            },
        ];

        // Call Claude API
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 800,
            temperature: 0.7,
            system: `${SYSTEM_PROMPT}\n\n${context}`,
            messages,
        });

        // Extract text content
        const textContent = response.content.find((block) => block.type === "text");
        const content = textContent && textContent.type === "text" ? textContent.text : "";

        return {
            content,
            usage: {
                input_tokens: response.usage.input_tokens,
                output_tokens: response.usage.output_tokens,
            },
        };
    } catch (error: any) {
        console.error("Error calling Anthropic API:", error);
        throw new Error(`Failed to get response from Ato: ${error.message || "Unknown error"}`);
    }
}

/**
 * Generate a quick insight about the user's portfolio
 * @param context - User context
 * @param insightType - Type of insight to generate
 * @returns Generated insight
 */
export async function generateQuickInsight(
    context: string,
    insightType: "portfolio" | "diversification" | "performance"
): Promise<string> {
    const prompts = {
        portfolio:
            "Provide a brief 2-3 sentence insight about the user's current portfolio composition. Focus on what stands out (concentration, diversification, asset allocation).",
        diversification:
            "Analyze the user's portfolio diversification in 2-3 sentences. Comment on sector concentration, stock vs. mutual fund balance, and any risks.",
        performance:
            "Provide a brief 2-3 sentence insight about the user's portfolio performance. Highlight what's working well and any areas of concern.",
    };

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 200,
            temperature: 0.7,
            system: `${SYSTEM_PROMPT}\n\n${context}`,
            messages: [
                {
                    role: "user",
                    content: prompts[insightType],
                },
            ],
        });

        const textContent = response.content.find((block) => block.type === "text");
        return textContent && textContent.type === "text" ? textContent.text : "";
    } catch (error) {
        console.error("Error generating insight:", error);
        return "Unable to generate insight at this time. Please try again later.";
    }
}
