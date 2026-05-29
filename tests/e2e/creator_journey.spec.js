// tests/e2e/creator_journey.spec.js
import { test, expect } from '@playwright/test';

test('Creator Journey Acceptance Test', async ({ page }) => {
  // 1. Register a new account
  await page.goto('https://example.com/register');
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  await page.fill('[data-test-id="email-input"]', email);
  await page.fill('[data-test-id="password-input"]', 'TestPass123!');
  await page.click('[data-test-id="register-button"]');
  await expect(page).toHaveURL(/.*\/workspace/);

  // 2. Create Planner Post
  await page.click('[data-test-id="new-planner-button"]');
  await page.fill('[data-test-id="planner-title"]', 'My Planner');
  await page.click('[data-test-id="save-planner"]');

  // 3. Generate Hooks (simulated)
  await page.click('[data-test-id="generate-hooks"]');

  // 4. Create Shoot Plan
  await page.click('[data-test-id="new-shoot-button"]');
  await page.fill('[data-test-id="shoot-title"]', 'My Shoot');
  await page.click('[data-test-id="save-shoot"]');

  // 5. Create Brain Dump
  await page.click('[data-test-id="new-brain-dump-button"]');
  await page.fill('[data-test-id="brain-dump-content"]', 'Brain dump content');
  await page.click('[data-test-id="save-brain-dump"]');

  // 6. Run AI Rewrite (simulated)
  await page.click('[data-test-id="ai-rewrite-button"]');
  await page.waitForTimeout(2000);

  // 7. Create Collab
  await page.click('[data-test-id="new-collab-button"]');
  await page.fill('[data-test-id="collab-title"]', 'Collab Project');
  await page.click('[data-test-id="save-collab"]');

  // 8. Create Journal Entry
  await page.click('[data-test-id="new-journal-button"]');
  await page.fill('[data-test-id="journal-content"]', 'Journal entry');
  await page.click('[data-test-id="save-journal"]');

  // 9. Refresh Browser
  await page.reload();

  // 10. Logout
  await page.click('[data-test-id="logout-button"]');
  await expect(page).toHaveURL(/.*\/login/);

  // 11. Login Again
  await page.fill('[data-test-id="email-input"]', email);
  await page.fill('[data-test-id="password-input"]', 'TestPass123!');
  await page.click('[data-test-id="login-button"]');
  await expect(page).toHaveURL(/.*\/workspace/);

  // 12. Verify persisted items exist
  await expect(page.locator('[data-test-id="planner-item"][title="My Planner"]')).toBeVisible();
  await expect(page.locator('[data-test-id="shoot-item"][title="My Shoot"]')).toBeVisible();
  await expect(page.locator('[data-test-id="brain-dump-item"]')).toBeVisible();
  await expect(page.locator('[data-test-id="collab-item"][title="Collab Project"]')).toBeVisible();
  await expect(page.locator('[data-test-id="journal-item"]')).toBeVisible();
});
