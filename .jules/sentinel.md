## 2024-05-24 - Server Action IDOR and Parameter Tampering
**Vulnerability:** The `executeStockTrade` server action blindly trusted client-provided `userId`, `price`, `totalCost`, and `fees` parameters. This enabled Insecure Direct Object Reference (IDOR), allowing users to execute trades on behalf of others, and parameter tampering, allowing users to manipulate stock prices and avoid trading fees.
**Learning:** Next.js Server Actions act as open API endpoints. Accepting sensitive IDs or calculation results from the client without server-side re-verification creates critical security bypasses.
**Prevention:** Always authenticate the caller securely via `supabase.auth.getUser()` inside the server action. Recalculate all financial amounts, fees, and real-time prices server-side instead of relying on client-side calculations.

## 2026-03-02 - Mutual Funds Actions IDOR
**Vulnerability:** Similar to the stock trading vulnerability, multiple mutual fund Server Actions (`buyMutualFundUnits`, `redeemMutualFundUnits`, `getUserMutualFundHoldings`, `getUserMutualFundTransactions`) accepted a client-provided `userId` parameter and executed queries or mutations on behalf of that user. This is an Insecure Direct Object Reference (IDOR) vulnerability that allowed any user to view or modify another user's mutual fund data.
**Learning:** The IDOR vulnerability pattern observed in stock trading extends to mutual fund actions. All Server Actions acting on behalf of a user need robust server-side authentication.
**Prevention:** Consistently use `supabase.auth.getUser()` within all user-specific Server Actions to verify identity, completely ignoring any `userId` passed from the client.
