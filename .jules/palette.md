## 2026-06-09 - Accessible Interactive Elements
**Learning:** Generic interactive elements (like divs/motion.divs) across the app were missing keyboard support (role, tabIndex, onKeyDown) and interactive states hidden via opacity-0 group-hover:opacity-100 remain invisible to keyboard users traversing via Tab.
**Action:** Always add role='button', tabIndex={0}, onKeyDown for Enter/Space, focus-visible styles, and ensure hover-revealed elements use focus-visible:opacity-100 or group-focus-visible:opacity-100.
