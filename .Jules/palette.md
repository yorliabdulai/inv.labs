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

## 2025-03-09 - Keyboard Shortcut Hints Visibility
**Learning:** For keyboard shortcuts on actions (like '⌘K' for the Ato chat or floating button), adding visual hints inline within the UI component enhances discoverability. Even subtle additions like a tooltip or a small pill next to the button text guide users and encourage shortcut usage, making navigation faster.
**Action:** When an interactive element has a global keyboard shortcut associated with it, implement a visually pleasing and unobtrusive hint (like a `<kbd>` tag within a pill design) visible on hover or permanently to inform users.
