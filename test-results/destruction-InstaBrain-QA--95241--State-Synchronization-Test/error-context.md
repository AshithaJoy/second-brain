# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: destruction.spec.js >> InstaBrain QA Destruction E2E Test Suite >> 2. Multi-Tab State Synchronization Test
- Location: tests\e2e\destruction.spec.js:63:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=creator workspace')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=creator workspace')

```

```yaml
- heading "second brain ✦" [level=1]
- paragraph: for creators rebuilding in real time
- text: "⚡ Credits: 5 / 5 ✨ QA E2E Tester"
- button "🎬 pro edit bay"
- button "Logout"
- paragraph: go film the coffee before it gets cold
- button "content planner"
- button "brain dump"
- button "shoot planner"
- button "b-roll vault"
- button "growth journal"
- button "collabs CRM"
- button "AI trend scout"
- button "‹"
- text: May 2026
- button "›"
- button "+ new post"
- text: Sun Mon Tue Wed Thu Fri Sat 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 all posts
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | // Since we are running the test on the local dev server
  4   | const BASE_URL = "http://localhost:5173";
  5   | 
  6   | test.describe("InstaBrain QA Destruction E2E Test Suite", () => {
  7   |   let email;
  8   |   const password = "Password123!";
  9   | 
  10  |   test.beforeEach(async ({ page }) => {
  11  |     email = `qa_e2e_destruction_${Date.now()}@instabrain.co.in`;
  12  |     
  13  |     // Register a new test account
  14  |     await page.goto(`${BASE_URL}`);
  15  |     
  16  |     // Check if we are on the login page and switch to register
  17  |     await page.click("text=Register creator ID");
  18  |     await page.fill('input[placeholder="Elena Rostova"]', "QA E2E Tester");
  19  |     await page.fill('input[placeholder="creator@secondbrain.ai"]', email);
  20  |     await page.fill('input[placeholder="•••••••• (min 6 chars)"]', password);
  21  |     
  22  |     // Click submit
  23  |     await page.click("button:has-text('Create Creator OS Profile')");
  24  |     
  25  |     // Verify we enter the workspace
> 26  |     await expect(page.locator("text=creator workspace")).toBeVisible({ timeout: 15000 });
      |                                                          ^ Error: expect(locator).toBeVisible() failed
  27  |   });
  28  | 
  29  |   test("1. Rapid Clicking Guard Test", async ({ page }) => {
  30  |     // Navigate to Brain Dump
  31  |     await page.click("button:has-text('Brain Dump')");
  32  |     await expect(page.locator("text=all thoughts")).toBeVisible();
  33  | 
  34  |     // Click "+ new dump"
  35  |     await page.click("button:has-text('+ new dump')");
  36  |     await page.fill('input[placeholder="thought title..."]', "Rapid Click Test Title");
  37  |     
  38  |     // Type in some text
  39  |     const editor = page.locator('textarea[placeholder="let it out..."]');
  40  |     await editor.fill("This is content to test rapid clicks.");
  41  | 
  42  |     // Locate the save button
  43  |     const saveBtn = page.locator("button:has-text('Save Dump')");
  44  | 
  45  |     // Click rapid-fire 5 times to trigger double-post attempts
  46  |     await Promise.all([
  47  |       saveBtn.click(),
  48  |       saveBtn.click(),
  49  |       saveBtn.click(),
  50  |       saveBtn.click(),
  51  |       saveBtn.click()
  52  |     ]);
  53  | 
  54  |     // Give it a moment to complete requests
  55  |     await page.waitForTimeout(1000);
  56  | 
  57  |     // Verify only a single new dump is present in the list (no duplicates)
  58  |     const listItems = page.locator("text=Rapid Click Test Title");
  59  |     const count = await listItems.count();
  60  |     expect(count).toBe(1);
  61  |   });
  62  | 
  63  |   test("2. Multi-Tab State Synchronization Test", async ({ context, page }) => {
  64  |     // Open a second page/tab in the same browser context
  65  |     const page2 = await context.newPage();
  66  |     await page2.goto(`${BASE_URL}`);
  67  |     await expect(page2.locator("text=creator workspace")).toBeVisible({ timeout: 10000 });
  68  | 
  69  |     // Navigate to Brain Dump in both tabs
  70  |     await page.click("button:has-text('Brain Dump')");
  71  |     await page2.click("button:has-text('Brain Dump')");
  72  | 
  73  |     // Create a dump in Tab 1
  74  |     await page.click("button:has-text('+ new dump')");
  75  |     await page.fill('input[placeholder="thought title..."]', "Multi-Tab Share Title");
  76  |     await page.fill('textarea[placeholder="let it out..."]', "Content from Tab 1");
  77  |     await page.click("button:has-text('Save Dump')");
  78  | 
  79  |     // Check if Tab 2 receives it (either by reload or sync)
  80  |     // Reload Tab 2 to verify reload persistence works flawlessly
  81  |     await page2.reload();
  82  |     await page2.click("button:has-text('Brain Dump')");
  83  |     await expect(page2.locator("text=Multi-Tab Share Title")).toBeVisible({ timeout: 5000 });
  84  |   });
  85  | 
  86  |   test("3. Token Expiration Redirect Test", async ({ page }) => {
  87  |     // Make sure we are in the workspace
  88  |     await expect(page.locator("text=creator workspace")).toBeVisible();
  89  | 
  90  |     // Corrupt the token in localStorage
  91  |     await page.evaluate(() => {
  92  |       localStorage.setItem("sb-auth-token", "invalid-or-expired-token");
  93  |       // Or if the store is zustand:
  94  |       const authStore = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  95  |       if (authStore.state) {
  96  |         authStore.state.token = "expired-token-stub";
  97  |         localStorage.setItem("auth-storage", JSON.stringify(authStore));
  98  |       }
  99  |     });
  100 | 
  101 |     // Trigger a navigation or API call (e.g. click Growth Journal tab which makes a fetch)
  102 |     await page.click("button:has-text('Growth Journal')");
  103 | 
  104 |     // The Axios interceptor should hit a 401/403 and automatically flush the session, redirecting to login page
  105 |     await expect(page.locator("text=welcome back")).toBeVisible({ timeout: 10000 });
  106 |   });
  107 | });
  108 | 
```