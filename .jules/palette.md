## 2026-05-23 - Accessible Onboarding Tours
**Learning:** Temporary or dynamic overlays like onboarding tours often get missed for accessibility checks, leaving icon-only controls (like X or Back) inaccessible to screen readers and keyboard users.
**Action:** Always ensure absolute-positioned, z-indexed dynamic flows have descriptive `aria-label`s and `focus-visible` utility rings.
