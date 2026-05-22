## 2024-05-22 - Onboarding Tooltips Missing ARIA/Focus
**Learning:** Interactive icon-only elements within dynamic or absolute-positioned flows (like onboarding tours) are often overlooked for accessibility. Screen readers and keyboard users can get trapped or confused without proper labels and focus indicators.
**Action:** Always include aria-label and standard focus-visible classes on all interactive components, even temporary ones like tour navigations.
