# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/header_a11y.spec.ts >> DashboardHeader Accessibility and Interaction
- Location: tests/header_a11y.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder('Query Market Indices...')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder('Query Market Indices...')

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - navigation [ref=e6]:
            - button "previous" [disabled] [ref=e7]:
              - img "previous" [ref=e8]
            - generic [ref=e10]:
              - generic [ref=e11]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e12]:
              - img "next" [ref=e13]
          - img
        - generic [ref=e15]:
          - link "Next.js 16.1.4 (stale) Webpack" [ref=e16] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
            - img [ref=e17]
            - generic "There is a newer version (16.2.4) available, upgrade recommended!" [ref=e19]: Next.js 16.1.4 (stale)
            - generic [ref=e20]: Webpack
          - img
      - generic [ref=e21]:
        - dialog "Runtime Error" [ref=e22]:
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]:
                - generic [ref=e29]: Runtime Error
                - generic [ref=e30]:
                  - button "Copy Error Info" [ref=e31] [cursor=pointer]:
                    - img [ref=e32]
                  - button "No related documentation found" [disabled] [ref=e34]:
                    - img [ref=e35]
                  - button "Attach Node.js inspector" [ref=e37] [cursor=pointer]:
                    - img [ref=e38]
              - generic [ref=e47]:
                - text: Your project's URL and Key are required to create a Supabase client! Check your Supabase project's API settings to find these values
                - link "https://supabase.com/dashboard/project/_/settings/api" [ref=e48] [cursor=pointer]:
                  - /url: https://supabase.com/dashboard/project/_/settings/api
            - generic [ref=e49]:
              - generic [ref=e50]:
                - paragraph [ref=e52]:
                  - img [ref=e54]
                  - generic [ref=e58]: src/lib/supabase/proxy.ts (20:40) @ updateSession
                  - button "Open in editor" [ref=e59] [cursor=pointer]:
                    - img [ref=e61]
                - generic [ref=e64]:
                  - generic [ref=e65]: "18 | })"
                  - generic [ref=e66]: 19 |
                  - generic [ref=e67]: "> 20 | const supabase = createServerClient("
                  - generic [ref=e68]: "| ^"
                  - generic [ref=e69]: 21 | process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  - generic [ref=e70]: 22 | process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                  - generic [ref=e71]: "23 | {"
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - paragraph [ref=e74]:
                    - text: Call Stack
                    - generic [ref=e75]: "23"
                  - button "Show 21 ignore-listed frame(s)" [ref=e76] [cursor=pointer]:
                    - text: Show 21 ignore-listed frame(s)
                    - img [ref=e77]
                - generic [ref=e79]:
                  - generic [ref=e80]:
                    - text: updateSession
                    - button "Open updateSession in editor" [ref=e81] [cursor=pointer]:
                      - img [ref=e82]
                  - text: src/lib/supabase/proxy.ts (20:40)
                - generic [ref=e84]:
                  - generic [ref=e85]:
                    - text: proxy
                    - button "Open proxy in editor" [ref=e86] [cursor=pointer]:
                      - img [ref=e87]
                  - text: src/proxy.ts (14:31)
          - generic [ref=e89]: "1"
          - generic [ref=e90]: "2"
        - contentinfo [ref=e91]:
          - region "Error feedback" [ref=e92]:
            - paragraph [ref=e93]:
              - link "Was this helpful?" [ref=e94] [cursor=pointer]:
                - /url: https://nextjs.org/telemetry#error-feedback
            - button "Mark as helpful" [ref=e95] [cursor=pointer]:
              - img [ref=e96]
            - button "Mark as not helpful" [ref=e99] [cursor=pointer]:
              - img [ref=e100]
    - generic [ref=e106] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e107]:
        - img [ref=e108]
      - generic [ref=e111]:
        - button "Open issues overlay" [ref=e112]:
          - generic [ref=e113]:
            - generic [ref=e114]: "0"
            - generic [ref=e115]: "1"
          - generic [ref=e116]: Issue
        - button "Collapse issues badge" [ref=e117]:
          - img [ref=e118]
  - alert [ref=e120]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('DashboardHeader Accessibility and Interaction', async ({ page }) => {
  4  |     // Navigate to the dashboard page
  5  |     // Note: In a real environment, we'd need to mock authentication or bypass it.
  6  |     // For this verification script, we assume the page can render or we mock the necessary parts if needed.
  7  |     // Since we can't easily bypass auth in this environment without more setup,
  8  |     // we will check if we can render the component in isolation or if we can access the page.
  9  |     // However, given the constraints, we will try to navigate to the dashboard.
  10 |     // If auth blocks us, we might need to adjust our strategy or assume the dev server handles it.
  11 |
  12 |     // BUT, since we are just verifying the static attributes and interactions added to the code,
  13 |     // and we might hit auth walls, we can also inspect the code structure if we were doing unit tests.
  14 |     // For an E2E test, let's try to hit the page. If it redirects to login, we'll see.
  15 |
  16 |     // Assuming the dev server is running on localhost:3000
  17 |     await page.goto('http://localhost:3000/dashboard');
  18 |
  19 |     // Wait for the header to be visible.
  20 |     // If we are redirected to login, this might fail.
  21 |     // Let's assume we might be redirected to login.
  22 |     if (page.url().includes('/login')) {
  23 |         console.log('Redirected to login. Verification might be limited without auth.');
  24 |         // If we could log in, we would. For now, let's just log this state.
  25 |         // In a real CI/CD, we'd have a test user.
  26 |     } else {
  27 |         // 1. Verify Search Input Accessibility
  28 |         const searchInput = page.getByPlaceholder('Query Market Indices...');
> 29 |         await expect(searchInput).toBeVisible();
     |                                   ^ Error: expect(locator).toBeVisible() failed
  30 |         await expect(searchInput).toHaveAttribute('aria-label', 'Search market indices');
  31 |
  32 |         // 2. Verify Bell Button Accessibility
  33 |         const bellButton = page.getByRole('button', { name: 'Notifications' });
  34 |         await expect(bellButton).toBeVisible();
  35 |         await expect(bellButton).toHaveAttribute('aria-label', 'Notifications');
  36 |
  37 |         // 3. Verify Tooltip Interaction
  38 |         // Hover over the bell button to trigger the tooltip
  39 |         await bellButton.hover();
  40 |
  41 |         // Wait for the tooltip content to appear
  42 |         const tooltip = page.getByRole('tooltip', { name: 'Notifications' });
  43 |         // or finding by text if role isn't explicitly set on the content by Radix (it usually provides accessible name)
  44 |         const tooltipText = page.getByText('Notifications');
  45 |
  46 |         // Check if "Notifications" text becomes visible
  47 |         await expect(tooltipText).toBeVisible();
  48 |
  49 |         // 4. Verify Focus Style (Visual check via screenshot, but we can check CSS class if needed)
  50 |         await bellButton.focus();
  51 |         // We can't easily check 'focus-visible' state computation in playwright assertions without screenshot or complex eval.
  52 |         // We'll rely on the screenshot for visual confirmation of the focus ring.
  53 |     }
  54 |
  55 |     // Take a screenshot for visual verification
  56 |     await page.screenshot({ path: 'verification-header-a11y.png', fullPage: true });
  57 | });
  58 |
```