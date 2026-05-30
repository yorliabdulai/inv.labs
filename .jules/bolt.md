## 2024-03-03 - Avoid `useEffect` for Synchronous Data Generation
**Learning:** In React components like `PortfolioUniversalChart`, using `useEffect` with local `useState` to wrap a synchronous client-side data generation function (e.g., `generatePortfolioHistory`) causes unnecessary multiple render passes. It triggers an initial empty render, a `loading=true` render, and a final render with data.
**Action:** Always prefer `useMemo` for synchronous calculations that depend on props or local state. This runs synchronously during the first render, preventing layout shifts, eliminating "loading" flash, and cutting render cycles significantly.

## 2025-03-04 - Unused Computations Cause Unnecessary Overhead
**Learning:** Found redundant calculations in `PortfolioChart.tsx` computing unused variables (`minVal`, `maxVal`, `isPositive`, `strokeColor`). For arrays, computing values like min/max using `Math.min(...chartData.map(...))` and `Math.max(...chartData.map(...))` requires O(n) array traversal. Leaving them unused creates needless computational overhead on every render, especially with complex lists.
**Action:** Consistently remove or properly comment out dead code, specifically when they involve iterative array operations that do not affect state or rendering logic. Ensure each variable declared is actively used.

## 2024-05-18 - Input Debouncing for Expensive Local List Filters
**Learning:** Frequent React state updates attached to fast-typing text inputs can cause performance jank, especially when those states are dependency triggers for `useMemo` hooks that filter large data lists. Every keystroke triggers an evaluation of the full dataset.
**Action:** Always wrap text inputs driving local array filters in a debounce hook (e.g., `useDebounce`) to decouple the rapid keystroke re-renders from the expensive array filtering operations.

## 2024-05-20 - Memoizing Expensive Computations inside Render
**Learning:** O(n) array reduction computations placed directly in the React render body block the main thread and execute on every state change, even unrelated ones (like tab switches or hovers). In `PortfolioPage.tsx`, computing `totalInvested`, `bestPosition`, `worstPosition`, `avgPositionSize`, `totalSectorValue`, and `maxAbs` directly inside the render loop triggered expensive recalculations on every interaction.
**Action:** Always wrap expensive synchronous O(n) aggregations (like `.reduce` or `.map`) inside `useMemo` hooks to memoize them. Alternatively, if the computation is required inside `.map`, extract static portions outside the loop or restructure to compute once.

## 2025-03-05 - O(n) String Reductions Inside React Component Render Cycle
**Learning:** Found an `O(n)` string reduction (`stock.symbol.split("").reduce(...)`) used to generate a random seed for sparklines directly inside `StockRow`'s `useMemo` dependency array calculation. While `useMemo` attempts to limit re-renders, the function itself is completely isolated logic. If `StockRow` is rendered hundreds of times per page (which it is), the inline function declaration and closure adds unnecessary overhead.
**Action:** Extract stateless algorithmic functions (like seed generators) OUTSIDE of the React component body to avoid redeclaring the function on every render and to allow V8 to better optimize it.

## 2025-03-05 - React.memo for Primitive Presentation Components
**Learning:** The `KeyMetrics` component takes only primitive values (numbers) as props but was re-rendering unnecessarily whenever its parent (`DashboardHeader`) or higher-level contexts updated.
**Action:** Wrap purely presentational components that receive only primitive props (numbers, strings, booleans) in `React.memo` to prevent cascading re-renders across the dashboard.
## 2025-03-05 - Avoid new Date().getTime() in Array.prototype.sort()
**Learning:** Instantiating `new Date(dateString).getTime()` inside an `Array.prototype.sort()` callback causes significant performance overhead (O(N log N)). It is much faster to use lexicographical string comparison (`a.date < b.date ? -1 : 1`) for ISO 8601 date strings. Additionally, avoid sorting an already sorted array again when extracting recent items; instead, use `[...array].reverse()`.
**Action:** Always prefer lexicographical string comparisons for ISO 8601 timestamps in `sort()` blocks instead of converting them to Date instances. Use `.reverse()` if an array is already sorted and simply needs to be inverted.
