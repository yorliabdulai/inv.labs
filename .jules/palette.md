## 2026-06-08 - Hidden Focus States
**Learning:** Elements hidden by default using `opacity-0 group-hover:opacity-100` are invisible to keyboard-only users navigating via Tab because focus states do not trigger the group-hover visibility. This pattern is common across the app.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100` to ensure keyboard accessibility. Also ensure generic elements acting as custom interactives have `role=\"button\"`, `tabIndex={0}`, and `onKeyDown`.
