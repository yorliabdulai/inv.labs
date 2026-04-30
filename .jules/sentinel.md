## 2024-05-24 - Server Action IDOR and Parameter Tampering
**Vulnerability:** The `executeStockTrade` server action blindly trusted client-provided `userId`, `price`, `totalCost`, and `fees` parameters. This enabled Insecure Direct Object Reference (IDOR), allowing users to execute trades on behalf of others, and parameter tampering, allowing users to manipulate stock prices and avoid trading fees.
**Learning:** Next.js Server Actions act as open API endpoints. Accepting sensitive IDs or calculation results from the client without server-side re-verification creates critical security bypasses.
**Prevention:** Always authenticate the caller securely via `supabase.auth.getUser()` inside the server action. Recalculate all financial amounts, fees, and real-time prices server-side instead of relying on client-side calculations.

## 2026-03-02 - Mutual Funds Actions IDOR
**Vulnerability:** Similar to the stock trading vulnerability, multiple mutual fund Server Actions (`buyMutualFundUnits`, `redeemMutualFundUnits`, `getUserMutualFundHoldings`, `getUserMutualFundTransactions`) accepted a client-provided `userId` parameter and executed queries or mutations on behalf of that user. This is an Insecure Direct Object Reference (IDOR) vulnerability that allowed any user to view or modify another user's mutual fund data.
**Learning:** The IDOR vulnerability pattern observed in stock trading extends to mutual fund actions. All Server Actions acting on behalf of a user need robust server-side authentication.
**Prevention:** Consistently use `supabase.auth.getUser()` within all user-specific Server Actions to verify identity, completely ignoring any `userId` passed from the client.

## 2026-03-03 - Exposing Backend Stack Traces and Error Details via API
**Vulnerability:** The ATO (AI) API endpoints (`/api/ato/chat`, `/api/ato/conversations`, `/api/ato/insights`) were exposing `error.stack` and raw backend `error.message` directly to the client when a generic 500 Internal Server Error occurred.
**Learning:** Exposing detailed internal error messages and stack traces in production API responses leaks sensitive backend implementation details (directory structures, code logic, dependencies). This can aid attackers in crafting targeted exploits.
**Prevention:** In Next.js App Router API route handlers, always catch exceptions and log the full error details securely on the server-side (e.g., via `console.error` or a logging service). Ensure the JSON response returned to the client contains only safe, generic error messages (e.g., "An unexpected error occurred while processing your request.") unless it's a specific, handled error with a non-500 status code designed for the client.

## 2026-03-04 - Exposing Error Object in Global Error Boundary
**Vulnerability:** The global error boundary component (`src/app/error.tsx`) was rendering the raw `error.message` value directly to the client UI (`<p>{`> FATAL: ${error.message}`}</p>`). This causes the underlying server error strings to be exposed directly in the browser.
**Learning:** Even if error details are sanitized at the API layer, exposing the raw error object properties in global Next.js error boundaries (`error.tsx`) defeats the purpose, as Next.js might pass detailed errors from Server Components to this boundary in development or if errors bubble up unexpectedly in production.
**Prevention:** In client-side error boundaries, always render generic user-friendly strings (e.g., "System exception encountered") instead of raw `error.message` or `error.stack` to avoid unintentional information leakage. Use `error.digest` as a secure reference code for debugging logs.

## 2024-05-18 - Prevented Server Action Error Leakage
**Vulnerability:** Supabase Server Actions (`src/app/actions/gamification.ts`) were exposing raw `error.message` from the database directly to the client. This leaked internal PostgreSQL error strings on failures.
**Learning:** Exposing unhandled database or server-side error messages in Server Actions leaks sensitive schema or implementation details. It can be easily overlooked since actions appear like simple function calls, but they act as network endpoints.
**Prevention:** In Server Actions, catch and log raw database errors on the server side (using `console.error`) and return generic, safe error strings to the client (e.g., "Failed to update course progress").

## 2024-05-24 - Server Action Error Disclosure
**Vulnerability:** Directly returning backend `error.message` inside the catch block of Server Actions (e.g., `stocks.ts`) to the client UI.
**Learning:** In Next.js App Router, whatever is returned from a Server Action is exposed to the client. Throwing raw database or external API errors can leak internal infrastructure details or query syntax.
**Prevention:** Catch errors gracefully in Server Actions, log the raw error securely on the server using `console.error`, and return a static, generic, user-friendly message (e.g., 'Trade execution failed. Please try again.') to the client.

## 2024-03-08 - Fix Negative Quantity Vulnerabilities in Trading Actions
**Vulnerability:** Trading and mutual fund actions allowed negative quantities/amounts (e.g., `quantity <= 0`), which could bypass cost calculations and improperly manipulate user cash balances or asset holdings.
**Learning:** Even if client-side validation exists, server actions (`src/app/actions/*`) must explicitly validate numeric inputs for logical correctness and sanity bounds.
**Prevention:** Always enforce strict bounds (like `> 0`) on financial transactions (trade quantities, investments, redeem units) server-side before processing any database or balance logic.

## 2026-03-09 - [CRITICAL] Authorization Bypass in Stock Selling
**Vulnerability:** The `executeStockTrade` server action did not verify if a user owned sufficient shares of a stock before allowing a `SELL` order, allowing users to sell infinite shares and gain artificial cash balances.
**Learning:** Financial transactions require strict server-side state validation of ownership (e.g., verifying holdings) prior to execution, as client-side checks can be bypassed and parameters tampered with.
**Prevention:** Always aggregate and verify historical transaction quantities server-side to enforce ownership before processing a sell or transfer order.

## 2024-05-18 - [Prevent Internal Error Leakage in AI Route]
**Vulnerability:** The ATO chat API route (`src/app/api/ato/chat/route.ts`) was only masking `error.message` for strict `status === 500` HTTP codes, leaving other 5xx range errors (like 502 Bad Gateway, 503 Service Unavailable) vulnerable to returning raw backend error strings directly to the client.
**Learning:** Hardcoded single status checks (like `=== 500`) are often insufficient for overarching server-error handling boundaries, as infrastructure layers or downstream services (like Supabase or Anthropic) can throw various 5xx status codes that carry sensitive stack details.
**Prevention:** Use range-based checks (`status >= 500`) to blanket-catch all server-side exceptions and enforce generic error messages uniformly, ensuring no internal telemetry is ever exposed.

## 2025-03-01 - [HIGH] Fix Stock Trade Execution Pipeline and Atomicity
**Vulnerability:** The trade execution pipeline in `src/app/actions/stocks.ts` suffered from a Time-of-Check to Time-of-Use (TOCTOU) race condition and silent failures. Specifically, inserting a transaction with an unknown stock symbol caused a silent foreign key violation. Furthermore, performing separate Javascript `await` calls for validating balance, creating a transaction, and updating profiles/holdings without a Postgres transaction block meant the system could get into an inconsistent state (e.g., deducting balance without a transaction record or a double-spend concurrency vulnerability).
**Learning:** Supabase JS methods (`.insert`, `.update`) do not throw exceptions on failure; they return an `{ error }` object which must be manually checked and thrown. To enforce true database atomicity and prevent race conditions for multi-step financial operations, the logic must be executed inside a single PostgreSQL RPC (stored procedure).
**Prevention:** Always migrate critical multi-step financial transactions to PostgreSQL RPCs. Ensure all external references (e.g., dynamic API stock data) are explicitly upserted to satisfy foreign keys before transactions. Handle Supabase errors by explicitly throwing `if (error)` and catch them in a secure wrapper that logs the raw error internally while returning a generic error string to the user.

## 2026-04-30 - Insecure CRON Authentication Checks
**Vulnerability:** CRON API endpoints bypassed authentication if the NODE_ENV was not 'production' or if the CRON_SECRET environment variable was undefined.
**Learning:** Checking 'process.env.NODE_ENV === 'production'' or allowing access when a secret is falsy (e.g., `if (cronSecret && ...)`) creates dangerous default-open states, leaving server-side background tasks exposed to unauthorized execution.
**Prevention:** Always enforce strong authentication in all environments. Check that the secret exists and exactly matches the provided header: `if (!cronSecret || authHeader !== \`Bearer ${cronSecret}\`)`.
