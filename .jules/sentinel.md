## 2024-05-18 - Parameter Tampering in Server Actions
**Vulnerability:** The `executeStockTrade` server action blindly trusted a client-provided `price` parameter to calculate trade totals, allowing malicious users to buy stocks at artificially low prices.
**Learning:** Next.js Server Actions are public endpoints; any parameter passed from the client can be tampered with. Even if it is a "simulator", trusting client-provided prices compromises the integrity of the application.
**Prevention:** Never trust client-provided sensitive data (like prices or user IDs) in Server Actions. Always fetch the authoritative source of truth server-side before performing business logic calculations.
