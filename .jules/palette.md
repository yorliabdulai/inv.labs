## 2026-05-16 - Accessible Icon Buttons in Onboarding
**Learning:** Icon-only control elements in dynamic, temporary, or absolute-positioned flows (like onboarding tours) require explicit `aria-label` attributes and keyboard focus states (`focus-visible`) for accessibility, as they can be easily missed compared to static page content.
**Action:** Always verify that interactive custom components or icon-only buttons in transient UI flows include descriptive labels and standard focus rings (`focus-visible:ring-2`) to support screen readers and keyboard navigation.
