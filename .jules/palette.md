
## 2024-06-01 - Hover-Only Element Keyboard Accessibility
**Learning:** Elements hidden by default using `opacity-0 group-hover:opacity-100` are invisible to keyboard-only users navigating via Tab.
**Action:** Always include `focus:opacity-100` or `focus-visible:opacity-100` (along with an appropriate focus ring) and ensure an `aria-label` is present for interactive elements to ensure they become visible and are announced when they receive keyboard focus.
