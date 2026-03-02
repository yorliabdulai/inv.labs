
## 2024-05-19 - Removed redundant heavy data fetching in Dashboard Charts
**Learning:** The \`PortfolioUniversalChart\` was calling a server action \`getPortfolioHistory\` which in turn called \`getDashboardData\` just to extract the \`totalEquity\`. Since \`getDashboardData\` was *already* being called in the parent \`DashboardPage\`, this resulted in fetching all stocks, mutual funds, transactions, and holdings from the database twice during initial dashboard load.
**Action:** Always check if a component's required context/data can be passed as props from a parent that has already fetched it, rather than re-fetching from a server action inside a client component.

## 2024-05-18 - Avoid cache: 'no-store' on Heavily Used Data Fetch Functions
**Learning:** Using `cache: 'no-store'` inside a foundational data-fetching utility (like `getStocks` which interacts with an external API) completely disables Next.js edge caching and bypasses request-level memoization. This creates an N+1 network request anti-pattern when multiple Server Actions or React Server Components call it during a single render pass or user request.
**Action:** Replace `cache: 'no-store'` with `next: { revalidate: 60 }` (or similar appropriate interval) to leverage Next.js caching, and wrap the data-fetching function in React's `cache()` to ensure CPU parsing and mapping work is only performed once per request cycle.
