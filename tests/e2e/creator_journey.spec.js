// tests/e2e/creator_journey.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = "http://localhost:5173";

async function clickTab(page, name) {
  await page.evaluate((n) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim().toLowerCase() === n.toLowerCase());
    if (btn) btn.click();
  }, name);
}

test('Creator Journey Acceptance Test', async ({ page }) => {
  test.setTimeout(90000);
  page.on('dialog', dialog => dialog.accept());
  // 1. Register a new account
  await page.goto(BASE_URL);
  
  // Wait for login view to load, then switch to register
  await page.waitForSelector("text=Register creator ID", { timeout: 15000 });
  await page.click("text=Register creator ID");
  
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  
  await page.waitForSelector('[data-test-id="email-input"]', { timeout: 15000 });
  await page.fill('input[placeholder="Elena Rostova"]', "Journey Tester");
  await page.fill('[data-test-id="email-input"]', email);
  await page.fill('[data-test-id="password-input"]', 'TestPass123!');
  await page.click('[data-test-id="register-button"]');
  
  // Wait for the workspace dashboard to mount
  await expect(page.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 15000 });

  // Skip onboarding wizard
  const skipBtn = page.getByTestId("creator-dna-skip");
  await skipBtn.waitFor({ state: "visible", timeout: 15000 });
  await skipBtn.click();
  await expect(skipBtn).not.toBeVisible();

  // 2. Create Planner Post
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-planner']").click();
  await page.click("button:has-text('+ new post')");
  
  // Fill caption (placeholder="what do you want to say...")
  await page.fill('textarea[placeholder="what do you want to say..."]', 'My Planner Concept');
  await page.getByTestId("planner-save").click();
  
  // Wait for the post to appear
  await expect(page.locator("text=My Planner Concept")).toBeVisible({ timeout: 10000 });
  await page.getByTestId("planner-cancel").click();

  // 3. Create Shoot Plan
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-shoot']").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/shoot-planner-tab.png", fullPage: true });
  await page.click("button:has-text('+ new session')");
  
  // Fill title (placeholder="Enter session title")
  await page.fill('input[placeholder="Enter session title"]', 'My Awesome Shoot');
  await page.click("button:has-text('Save Shoot')");
  
  await expect(page.locator("text=My Awesome Shoot")).toBeVisible();

  // 4. Create Brain Dump
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-dump']").click();
  await page.click("button:has-text('+ new dump')");
  await page.fill('input[placeholder="title..."]', 'Midnight Thoughts Title');
  await page.keyboard.press('Enter');
  
  // Fill content (placeholder="unfiltered thoughts here...")
  await page.fill('textarea[placeholder="unfiltered thoughts here..."]', 'My Midnight Thoughts');
  await page.click("button:has-text('Save Dump')");

  await expect(page.locator("text=My Midnight Thoughts")).toBeVisible();

  // 5. Create Collab
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-collabs']").click();
  await page.click("button:has-text('+ log new collab')");
  
  // Fill brand (placeholder="Aesthetic Deskpads...")
  await page.fill('input[placeholder="Aesthetic Deskpads..."]', 'Nike Campaign');
  await page.click("button:has-text('save collab')");

  await expect(page.locator("text=Nike Campaign").first()).toBeVisible();

  // 6. Create Journal
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-journal']").click();
  await page.click("button:has-text('+ check-in this week')");
  
  // Journal uses textarea for content
  await page.fill('textarea[placeholder*="voiceovers connected more"]', 'I learned how to use Playwright properly.');
  await page.click("button:has-text('save journal entry')");

  await expect(page.locator("text=I learned how to use Playwright properly.")).toBeVisible();

  // 7. Refresh Browser to verify persistence
  await page.reload();

  // Wait for workspace to reload
  await expect(page.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 15000 });

  // 8. Logout
  await page.click("button:has-text('logout')");
  
  // Wait for login page
  await expect(page.locator("text=welcome back")).toBeVisible({ timeout: 10000 });

  // 9. Login Again
  await page.fill('[data-test-id="email-input"]', email);
  await page.fill('[data-test-id="password-input"]', 'TestPass123!');
  await page.click('[data-test-id="login-button"]');
  
  // Wait for workspace
  await expect(page.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 15000 });

  // 10. Verify persisted items exist
  await page.waitForTimeout(1000);
  await page.click("button:has-text('content planner')");
  await expect(page.locator("text=untitled post").first()).toBeVisible({ timeout: 10000 });
  
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-shoot']").click();
  await expect(page.locator("text=My Awesome Shoot")).toBeVisible();
  
  await page.waitForTimeout(3000);
  await page.locator("[data-test-id='tab-dump']").click();
  await expect(page.locator("text=My Midnight Thoughts")).toBeVisible();
});
