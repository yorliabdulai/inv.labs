
## 2024-05-19 - Removed redundant heavy data fetching in Dashboard Charts
**Learning:** The \`PortfolioUniversalChart\` was calling a server action \`getPortfolioHistory\` which in turn called \`getDashboardData\` just to extract the \`totalEquity\`. Since \`getDashboardData\` was *already* being called in the parent \`DashboardPage\`, this resulted in fetching all stocks, mutual funds, transactions, and holdings from the database twice during initial dashboard load.
**Action:** Always check if a component's required context/data can be passed as props from a parent that has already fetched it, rather than re-fetching from a server action inside a client component.
