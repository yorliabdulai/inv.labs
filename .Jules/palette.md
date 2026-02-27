## 2024-05-24 - Dashboard Header Accessibility
**Learning:** Tooltip content often duplicates button aria-labels or text, causing "strict mode" violations in Playwright if not scoped correctly. When multiple elements contain the same text (e.g., a button's label and the tooltip itself), use `get_by_role('tooltip')` or scoped locators to distinguish them.
**Action:** When adding tooltips to labeled buttons, test verification scripts should specifically target the tooltip role to avoid ambiguity.
