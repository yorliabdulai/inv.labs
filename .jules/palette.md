## 2026-05-14 - Add ARIA labels to temporary flows
**Learning:** Icon-only control elements in dynamic or temporary flows (like onboarding tours or hover-visible notification delete buttons) frequently lack `aria-label`s compared to standard app buttons.
**Action:** Always verify keyboard accessibility and explicit `aria-label` attributes on any newly introduced popovers, modals, or tour steps even if they only exist temporarily in the DOM.
