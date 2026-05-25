
## 2026-05-25 - Keyboard Accessibility for Hover-only Actions
**Learning:** Elements hidden by default using opacity-0 group-hover:opacity-100 are invisible to keyboard-only users navigating via Tab.
**Action:** Always include focus-visible:opacity-100 along with standard focus rings to ensure these interactive elements become visible and clearly focused when they receive keyboard focus.
