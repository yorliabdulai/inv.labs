## 2026-02-28 - Dashboard Header Accessibility Improvement
**Learning:** Found that some interactive UI elements designed as icon-only actions or user avatars were missing semantic HTML (e.g., using `div` instead of `button`) and lacked `aria-label`s for screen readers. While Tailwind handles the visual styling, native HTML semantics are critical for keyboard and assistive tech accessibility.
**Action:** Always prefer semantic HTML tags like `<button>` for interactive elements over styled `<div>`s, and ensure all icon-only buttons have descriptive `aria-label`s.

## 2025-03-04 - Missing ARIA Labels on Icon-Only Actions
**Learning:** Found a recurring pattern across major dashboard views (Market, Mutual Funds, Portfolio) where icon-only action buttons (like refresh, grid view, list view toggles) lack `aria-label` attributes. Screen reader users would just hear "button" without context.
**Action:** When adding new icon-only controls or reviewing existing interactive elements, always ensure `aria-label` is included to describe the action, not just the icon (e.g., "Refresh Market Data", "Grid View").
## 2026-03-07 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons without `aria-label` attributes are inaccessible to screen readers. This pattern was observed in `WatchlistPanel` and `AlertsPanel`.
**Action:** Always ensure icon-only interactive elements (like buttons and links) have descriptive `aria-label` attributes that convey their purpose or action to assistive technologies.

## 2026-03-08 - Enhance Keyboard Navigation Focus States
**Learning:** While the custom design system handles pointer states (hover/active) well, keyboard focus states (focus-visible) were missing from core navigation components (Sidebar, DashboardHeader), making the app difficult to use via keyboard. Explicitly setting focus-visible:ring-2 focus-visible:ring-offset-2 alongside focus-visible:outline-none ensures strong visibility against the dark theme without interfering with mouse clicks.
**Action:** Always add explicit focus-visible utility classes to custom interactive elements (button, Link) that use touch-manipulation or custom background transitions, ensuring the ring and ring-offset colors contrast well with the background.

## 2026-03-09 - Missing ARIA Labels on Search Inputs
**Learning:** Visual-only search and filter inputs (using placeholder text and icons) often lack `<label>` elements or `aria-label` attributes across dashboard views (Market, Mutual Funds, Leaderboard). This makes them inaccessible to screen reader users who cannot see the placeholder text or visual context.
**Action:** Always ensure that standalone search or filter `<input>` elements have a descriptive `aria-label` attribute if they do not have an associated `<label>`.

## 2026-03-15 - Interactive List Items Accessibility
**Learning:** Interactive rows or items built with `<div>` elements lacking semantic roles (e.g., in lists like StockRow) are completely invisible to keyboard navigation, even if they have an `onClick` handler. Custom focus rings are also often missing or hidden behind default opacity behavior.
**Action:** Always add `role="button"`, `tabIndex={0}`, `onKeyDown` (handling Enter/Space), and explicit Tailwind `focus-visible` utility classes (e.g., `focus-visible:ring-[#C05E42]`) to any interactive non-button container element.
