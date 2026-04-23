## 2024-05-24 - Hidden Hover-Only Actions Limit Keyboard Accessibility
**Learning:** Actions that rely purely on `group-hover:opacity-100` are completely invisible to keyboard users navigating via Tab. This is an app-specific pattern where secondary actions (like delete buttons in notifications) are functionally inaccessible.
**Action:** When implementing secondary hover actions, always pair `group-hover:opacity-100` with `focus-visible:opacity-100` and explicit standard semantic focus rings.
