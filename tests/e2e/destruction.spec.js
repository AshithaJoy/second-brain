import { test, expect } from "@playwright/test";

// Since we are running the test on the local dev server
const BASE_URL = "http://localhost:5173";

test.describe("InstaBrain QA Destruction E2E Test Suite", () => {
  let email;
  const password = "Password123!";

  test.beforeEach(async ({ page }) => {
    email = `qa_e2e_destruction_${Date.now()}@instabrain.co.in`;
    
    // Register a new test account
    await page.goto(`${BASE_URL}`);
    
    // Check if we are on the login page and switch to register
    await page.click("text=Register creator ID");
    await page.fill('input[placeholder="Elena Rostova"]', "QA E2E Tester");
    await page.fill('input[placeholder="creator@secondbrain.ai"]', email);
    await page.fill('input[placeholder="•••••••• (min 6 chars)"]', password);
    
    // Click submit
    await page.click("button:has-text('Create Creator OS Profile')");
    
    // Verify we enter the workspace
    await page.waitForURL('**/workspace', { timeout: 15000 });
await expect(page.locator('[data-test-id="dashboard"]')).toBeVisible({ timeout: 15000 });
  });

  test("1. Rapid Clicking Guard Test", async ({ page }) => {
    // Navigate to Brain Dump
    await page.click("button:has-text('Brain Dump')");
    await expect(page.locator("text=all thoughts")).toBeVisible();

    // Click "+ new dump"
    await page.click("button:has-text('+ new dump')");
    await page.fill('input[placeholder="thought title..."]', "Rapid Click Test Title");
    
    // Type in some text
    const editor = page.locator('textarea[placeholder="let it out..."]');
    await editor.fill("This is content to test rapid clicks.");

    // Locate the save button
    const saveBtn = page.locator("button:has-text('Save Dump')");

    // Click rapid-fire 5 times to trigger double-post attempts
    await Promise.all([
      saveBtn.click(),
      saveBtn.click(),
      saveBtn.click(),
      saveBtn.click(),
      saveBtn.click()
    ]);

    // Give it a moment to complete requests
    await page.waitForTimeout(1000);

    // Verify only a single new dump is present in the list (no duplicates)
    const listItems = page.locator("text=Rapid Click Test Title");
    const count = await listItems.count();
    expect(count).toBe(1);
  });

  test("2. Multi-Tab State Synchronization Test", async ({ context, page }) => {
    // Open a second page/tab in the same browser context
    const page2 = await context.newPage();
    await page2.goto(`${BASE_URL}`);
    await expect(page2.locator("text=creator workspace")).toBeVisible({ timeout: 10000 });

    // Navigate to Brain Dump in both tabs
    await page.click("button:has-text('Brain Dump')");
    await page2.click("button:has-text('Brain Dump')");

    // Create a dump in Tab 1
    await page.click("button:has-text('+ new dump')");
    await page.fill('input[placeholder="thought title..."]', "Multi-Tab Share Title");
    await page.fill('textarea[placeholder="let it out..."]', "Content from Tab 1");
    await page.click("button:has-text('Save Dump')");

    // Check if Tab 2 receives it (either by reload or sync)
    // Reload Tab 2 to verify reload persistence works flawlessly
    await page2.reload();
    await page2.click("button:has-text('Brain Dump')");
    await expect(page2.locator("text=Multi-Tab Share Title")).toBeVisible({ timeout: 5000 });
  });

  test("3. Token Expiration Redirect Test", async ({ page }) => {
    // Make sure we are in the workspace
    await expect(page.locator("text=creator workspace")).toBeVisible();

    // Corrupt the token in localStorage
    await page.evaluate(() => {
      localStorage.setItem("sb-auth-token", "invalid-or-expired-token");
      // Or if the store is zustand:
      const authStore = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      if (authStore.state) {
        authStore.state.token = "expired-token-stub";
        localStorage.setItem("auth-storage", JSON.stringify(authStore));
      }
    });

    // Trigger a navigation or API call (e.g. click Growth Journal tab which makes a fetch)
    await page.click("button:has-text('Growth Journal')");

    // The Axios interceptor should hit a 401/403 and automatically flush the session, redirecting to login page
    await expect(page.locator("text=welcome back")).toBeVisible({ timeout: 10000 });
  });
});
