import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Instagram Connection UI E2E Flow", () => {
  test.setTimeout(90000);

  test("Should complete full connect -> auto-sync -> dashboard -> disconnect journey", async ({ page }) => {
    // 1. Sign up a new user to start fresh and unconnected
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector("text=Register creator ID", { timeout: 15000 });
    await page.click("text=Register creator ID");

    const timestamp = Date.now();
    const email = `ig_user_${timestamp}@example.com`;

    await page.waitForSelector('[data-test-id="email-input"]', { timeout: 15000 });
    await page.fill('input[placeholder="Elena Rostova"]', "Instagram Tester");
    await page.fill('[data-test-id="email-input"]', email);
    await page.fill('[data-test-id="password-input"]', "TestPass123!");
    await page.click('[data-test-id="register-button"]');

    // Wait for dashboard dashboard to load
    await expect(page.getByTestId("workspace-dashboard")).toBeVisible({ timeout: 15000 });

    // Skip onboarding wizard
    const skipBtn = page.getByTestId("creator-dna-skip");
    await skipBtn.waitFor({ state: "visible", timeout: 15000 });
    await skipBtn.click();
    await expect(skipBtn).not.toBeVisible();

    // 2. Verify Connect Instagram Dashboard Promo Card is visible
    await page.locator("[data-test-id='tab-planner']").click();
    const promoCard = page.locator("[data-test-id='ig-dashboard-promo']");
    await expect(promoCard).toBeVisible();
    await expect(promoCard.locator("text=Connect Instagram to unlock:")).toBeVisible();
    await expect(promoCard.locator("text=✓ Creator Intelligence")).toBeVisible();
    await expect(promoCard.locator("text=✓ Content Analysis")).toBeVisible();
    await expect(promoCard.locator("text=✓ Hook Analysis")).toBeVisible();
    await expect(promoCard.locator("text=✓ AI Content Ideas")).toBeVisible();

    // 3. Navigate to Settings and verify Connected Accounts has Not Connected state
    await page.locator("[data-test-id='tab-settings']").click();
    
    const settingsTitle = page.locator("text=Connected Accounts");
    await expect(settingsTitle).toBeVisible();

    const igCardNotConnected = page.locator("[data-test-id='ig-card-not-connected']");
    await expect(igCardNotConnected).toBeVisible();
    await expect(igCardNotConnected.locator("text=Instagram Account")).toBeVisible();
    await expect(igCardNotConnected.locator("text=Not Linked")).toBeVisible();

    const connectBtn = igCardNotConnected.locator("[data-test-id='ig-connect-btn']");
    await expect(connectBtn).toBeVisible();

    // Intercept OAuth start API call to force mock redirect in E2E tests
    await page.route("**/api/instagram/oauth/start*", async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const urlObj = new URL(route.request().url());
      const state = urlObj.searchParams.get("state") || "mock_state";
      
      // Override the live URL with the mock connect URL
      body.url = `${BASE_URL}/settings?instagram_mock_connect=true&state=${state}`;
      
      await route.fulfill({
        response,
        contentType: "application/json",
        body: JSON.stringify(body)
      });
    });

    // 4. Click Connect Instagram to start OAuth simulation
    await connectBtn.click();

    // The browser should follow the simulated OAuth redirect:
    // GET /oauth/start -> callback -> settings page redirect back with instagram_connect=success
    // We wait for the Auto-Syncing state checklist to display on the frontend settings tab
    const igCardSyncing = page.locator("[data-test-id='ig-card-syncing']");
    await expect(igCardSyncing).toBeVisible({ timeout: 20000 });
    await expect(igCardSyncing.locator("text=Syncing Instagram...")).toBeVisible();
    await expect(igCardSyncing.locator("span:text-is('Profile Credentials')")).toBeVisible();
    await expect(igCardSyncing.locator("span:text-is('Recent Posts & Media')")).toBeVisible();
    await expect(igCardSyncing.locator("span:text-is('Growth Analytics')")).toBeVisible();

    // 5. Verify the Auto-Sync automatically routes the user to the Instagram Dashboard
    // Once sync completes, it automatically switches tab to "instagram"
    const igDashboardHeader = page.locator("text=Creator Dashboard");
    await expect(igDashboardHeader).toBeVisible({ timeout: 20000 });
    await expect(page.locator("text=Creator Health Index")).toBeVisible();
    await expect(page.locator("text=Opportunity Engine Findings")).toBeVisible();

    // 6. Navigate back to Settings tab and verify Connected state details
    await page.locator("[data-test-id='tab-settings']").click();

    const igCardConnected = page.locator("[data-test-id='ig-card-connected']");
    await expect(igCardConnected).toBeVisible();
    await expect(igCardConnected.locator("text=@mock_creator_partner")).toBeVisible();
    await expect(igCardConnected.locator("text=Creator Account")).toBeVisible();
    await expect(igCardConnected.locator("text=Last Synced:")).toBeVisible();
    await expect(igCardConnected.locator("text=Creator Intelligence:")).toBeVisible();
    await expect(igCardConnected.locator("text=Ready")).toBeVisible();

    // Verify Action buttons are visible on the card
    await expect(igCardConnected.locator("[data-test-id='ig-sync-btn']")).toBeVisible();
    await expect(igCardConnected.locator("[data-test-id='ig-intel-btn']")).toBeVisible();
    
    const disconnectBtn = igCardConnected.locator("[data-test-id='ig-disconnect-btn']");
    await expect(disconnectBtn).toBeVisible();

    // 7. Click Disconnect and check that the Confirmation Modal appears
    await disconnectBtn.click();
    
    const disconnectModal = page.locator("[data-test-id='ig-disconnect-modal']");
    await expect(disconnectModal).toBeVisible();
    await expect(disconnectModal.locator("text=Disconnect Instagram?")).toBeVisible();
    await expect(disconnectModal.locator("text=This will remove your Instagram access token")).toBeVisible();

    // Cancel disconnection first to test dismiss flow
    await disconnectModal.locator("button:has-text('Cancel')").click();
    await expect(disconnectModal).not.toBeVisible();
    await expect(igCardConnected).toBeVisible();

    // Open and confirm disconnection
    await disconnectBtn.click();
    await expect(disconnectModal).toBeVisible();
    await disconnectModal.locator("[data-test-id='ig-confirm-disconnect-btn']").click();

    // Verify card is back in Not Connected state
    await expect(disconnectModal).not.toBeVisible();
    await expect(page.locator("[data-test-id='ig-card-not-connected']")).toBeVisible();
  });
});
