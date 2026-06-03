
## 2026-05-20 - Interactive Notification Item A11y
**Learning:** Custom interactive elements (like motion.div) need role=button, tabIndex=0, and onKeyDown handlers for keyboard navigation, and elements hidden by opacity-0 must include focus-visible:opacity-100 to be accessible.
**Action:** Always add keyboard event handlers to custom buttons and ensure hover-only actions are visible on focus.
