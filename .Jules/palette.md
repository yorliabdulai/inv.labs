## 2026-02-28 - Dashboard Header Accessibility Improvement
**Learning:** Found that some interactive UI elements designed as icon-only actions or user avatars were missing semantic HTML (e.g., using `div` instead of `button`) and lacked `aria-label`s for screen readers. While Tailwind handles the visual styling, native HTML semantics are critical for keyboard and assistive tech accessibility.
**Action:** Always prefer semantic HTML tags like `<button>` for interactive elements over styled `<div>`s, and ensure all icon-only buttons have descriptive `aria-label`s.
