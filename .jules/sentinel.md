## 2026-02-26 - IDOR in Server Actions
**Vulnerability:** Found a critical Insecure Direct Object Reference (IDOR) / Missing Authorization vulnerability in the `executeStockTrade` server action. The function trusted the `userId` passed from the client without verifying if it matched the authenticated user's session.
**Learning:** Server Actions in Next.js, while convenient, can easily lead to "trusting the client" pitfalls if developers treat them like local function calls instead of public API endpoints.
**Prevention:** Always use `supabase.auth.getUser()` (or equivalent session verification) inside every Server Action that performs sensitive operations. Never rely on user IDs passed as arguments for authorization.
