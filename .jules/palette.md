## 2024-05-17 - Keyboard Focus Hidden by Opacity
**Learning:** Interactive elements styled with `opacity-0 group-hover:opacity-100` remain invisible to keyboard-only users who navigate via Tab because hover states are not triggered by focus.
**Action:** Always append `focus:opacity-100` to elements that are hidden by default but meant to appear on hover, ensuring they become visible when keyboard focus lands on them.
