import { test, expect } from "@playwright/test";

// Since we are running the test on the local dev server
const BASE_URL = "http://localhost:5173";

async function clickTab(p, name) {
  await p.evaluate((n) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim().toLowerCase() === n.toLowerCase());
    if (btn) btn.click();
  }, name);
}

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
    await expect(page.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 15000 });

    // Skip onboarding wizard
    const skipBtn = page.getByTestId("creator-dna-skip");
    await skipBtn.waitFor({ state: "visible", timeout: 15000 });
    await skipBtn.click();
    await expect(skipBtn).not.toBeVisible();
  });

  test("1. Rapid Clicking Guard Test", async ({ page }) => {
    // Navigate to Brain Dump
    await page.waitForTimeout(3000);
    await page.locator("[data-test-id='tab-dump']").click();

    // Click "+ new dump"
    await page.click("button:has-text('+ new dump')");
    // Fill title
    await page.fill('input[placeholder="title..."]', "Rapid Click Test Title");
    await page.keyboard.press('Enter');
    // Fill content
    const editor = page.locator('textarea[placeholder="unfiltered thoughts here..."]');
    await editor.fill("This is content to test rapid clicks.");

    // Locate the save button
    const saveBtn = page.locator("button:has-text('Save Dump')");

    // Click rapid-fire 5 times to trigger double-post attempts
    await Promise.all([
      saveBtn.click({ force: true }),
      saveBtn.click({ force: true }),
      saveBtn.click({ force: true }),
      saveBtn.click({ force: true }),
      saveBtn.click({ force: true })
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
    await page2.goto("http://localhost:5173");
    await expect(page2.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 10000 });

    // Skip onboarding wizard on second tab if visible
    const skipBtn2 = page2.getByTestId("creator-dna-skip");
    try {
      await skipBtn2.waitFor({ state: "visible", timeout: 1000 });
      await skipBtn2.click();
      await expect(skipBtn2).not.toBeVisible();
    } catch (e) {
      // Already skipped or not visible, proceed
    }

    // Navigate to Brain Dump in both tabs
    await page.waitForTimeout(3000);
    await page.locator("[data-test-id='tab-dump']").click();
    await page2.waitForTimeout(3000);
    await page2.locator("[data-test-id='tab-dump']").click();

    // Create a dump in Tab 1
    await page.click("button:has-text('+ new dump')");
    await page.fill('input[placeholder="title..."]', "Multi-Tab Share Title");
    await page.keyboard.press('Enter');
    await page.fill('textarea[placeholder="unfiltered thoughts here..."]', "Content from Tab 1");
    await page.click("button:has-text('Save Dump')");

    // Check if Tab 2 receives it (either by reload or sync)
    // Reload Tab 2 to verify reload persistence works flawlessly
    await page2.reload();
    await page2.locator("[data-test-id='tab-dump']").click();
    await expect(page2.locator("text=Multi-Tab Share Title")).toBeVisible({ timeout: 5000 });
  });

  test("3. Token Expiration Redirect Test", async ({ page }) => {
    // Make sure we are in the workspace
    await expect(page.getByTestId("workspace-dashboard")).toBeVisible();

    // Corrupt the token in localStorage
    await page.evaluate(() => {
      localStorage.setItem("sb_token", "corrupted-token-string");
      // Or if the store is zustand:
      const authStore = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      if (authStore.state) {
        authStore.state.token = "expired-token-stub";
        localStorage.setItem("auth-storage", JSON.stringify(authStore));
      }
    });

    // Perform a navigation or API call to trigger Axios interceptor
    await page.reload();

    // The Axios interceptor should hit a 401/403 and automatically flush the session, redirecting to login page
    // Using a longer timeout to account for double-reloads and the splash screen
    await expect(page.locator("text=welcome back")).toBeVisible({ timeout: 20000 });
  });
});
