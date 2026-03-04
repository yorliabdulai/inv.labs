## 2024-03-03 - Avoid `useEffect` for Synchronous Data Generation
**Learning:** In React components like `PortfolioUniversalChart`, using `useEffect` with local `useState` to wrap a synchronous client-side data generation function (e.g., `generatePortfolioHistory`) causes unnecessary multiple render passes. It triggers an initial empty render, a `loading=true` render, and a final render with data.
**Action:** Always prefer `useMemo` for synchronous calculations that depend on props or local state. This runs synchronously during the first render, preventing layout shifts, eliminating "loading" flash, and cutting render cycles significantly.

## 2025-03-04 - Unused Computations Cause Unnecessary Overhead
**Learning:** Found redundant calculations in `PortfolioChart.tsx` computing unused variables (`minVal`, `maxVal`, `isPositive`, `strokeColor`). For arrays, computing values like min/max using `Math.min(...chartData.map(...))` and `Math.max(...chartData.map(...))` requires O(n) array traversal. Leaving them unused creates needless computational overhead on every render, especially with complex lists.
**Action:** Consistently remove or properly comment out dead code, specifically when they involve iterative array operations that do not affect state or rendering logic. Ensure each variable declared is actively used.
