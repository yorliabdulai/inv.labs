## 2026-02-28 - Dashboard Header Accessibility Improvement
**Learning:** Found that some interactive UI elements designed as icon-only actions or user avatars were missing semantic HTML (e.g., using `div` instead of `button`) and lacked `aria-label`s for screen readers. While Tailwind handles the visual styling, native HTML semantics are critical for keyboard and assistive tech accessibility.
**Action:** Always prefer semantic HTML tags like `<button>` for interactive elements over styled `<div>`s, and ensure all icon-only buttons have descriptive `aria-label`s.

## 2025-03-04 - Missing ARIA Labels on Icon-Only Actions
**Learning:** Found a recurring pattern across major dashboard views (Market, Mutual Funds, Portfolio) where icon-only action buttons (like refresh, grid view, list view toggles) lack `aria-label` attributes. Screen reader users would just hear "button" without context.
**Action:** When adding new icon-only controls or reviewing existing interactive elements, always ensure `aria-label` is included to describe the action, not just the icon (e.g., "Refresh Market Data", "Grid View").
