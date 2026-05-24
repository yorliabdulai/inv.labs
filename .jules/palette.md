## 2026-05-24 - Keyboard Accessibility on Hover-Only Elements
**Learning:** Interactive elements hidden behind `group-hover:opacity-100` without focus styles are invisible and inaccessible to keyboard users navigating via Tab.
**Action:** Always include `focus:opacity-100` or `focus-visible:opacity-100` along with proper focus rings (`focus-visible:ring-2`) and explicit `aria-label` attributes on such elements to ensure they appear when focused and are properly announced by screen readers.
