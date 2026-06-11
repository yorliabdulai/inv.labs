## 2024-06-11 - Invisible Delete Buttons for Keyboard Users
**Learning:** Found a recurrent pattern in `NotificationBell.tsx` where the delete button is visible only on `group-hover`, rendering it inaccessible via keyboard navigation because it lacks `focus-visible:opacity-100`.
**Action:** Always include `focus-visible:opacity-100` alongside `group-hover:opacity-100` for interactive elements.
