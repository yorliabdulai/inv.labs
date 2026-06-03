## 2026-06-03 - ARIA labels for icon-only buttons
**Learning:** Interactive icon-only elements within dynamic or absolute-positioned flows (like onboarding tours and modals) are often overlooked for accessibility. Missing ARIA labels render them invisible to screen readers, and lacking focus-visible states makes keyboard navigation difficult.
**Action:** Always add descriptive `aria-label` attributes and consistent `focus-visible:ring-2` utility classes to any icon-only `<button>` components to ensure parity across mouse and keyboard/assistive technologies.
