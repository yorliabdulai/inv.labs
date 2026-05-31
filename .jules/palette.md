## 2026-05-31 - Focus Management in Absolute/Overlay Flows
**Learning:** Interactive components within temporary or absolute-positioned flows (like onboarding tours) frequently lack native keyboard focus states and screen reader labels because they sit outside the main document flow visually but not programmatically.
**Action:** Always verify keyboard focus states and add descriptive `aria-label`s to icon-only controls in modals, tours, and alerts to ensure they remain operable by screen readers and keyboard users.
