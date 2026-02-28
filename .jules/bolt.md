## 2025-02-28 - Isolated Clock State in DashboardHeader
**Learning:** `DashboardHeader.tsx` contained a `setInterval` triggering state updates every 1000ms. Because this state was at the root of `DashboardHeader`, it forced the entire header component (including multiple Lucide icons and nested layouts) to re-render every second.
**Action:** Always extract frequently updating state (like clocks or timers) into isolated leaf components (e.g., `<Clock />`) to prevent parent components from unnecessarily re-rendering.
