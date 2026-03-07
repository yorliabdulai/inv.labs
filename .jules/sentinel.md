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
