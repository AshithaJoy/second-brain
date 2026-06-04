const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Logging in...");
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('[data-test-id="login-button"]');
  
  await page.waitForTimeout(2000);
  console.log("Logged in.");

  // Go to Planner if not already
  const plannerTab = await page.$('div:has-text("planner")');
  if (plannerTab) await plannerTab.click();
  await page.waitForTimeout(1000);

  // Take screenshot of Calendar View
  await page.screenshot({ path: '../brain/d27dbdd4-3afb-43c3-89ac-dcc09881d605/phase4-calendar-view.png' });
  console.log("Screenshot: Calendar View");

  // Click List View toggle
  const listBtn = await page.$('button:has-text("List")');
  if (listBtn) {
    await listBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '../brain/d27dbdd4-3afb-43c3-89ac-dcc09881d605/phase4-list-view.png' });
    console.log("Screenshot: List View");
  }

  // Open Post Editor Modal
  const newBtn = await page.$('button:has-text("+ new post")');
  if (newBtn) {
    await newBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '../brain/d27dbdd4-3afb-43c3-89ac-dcc09881d605/phase4-post-editor.png' });
    console.log("Screenshot: Post Editor");
  }

  await browser.close();
  console.log("Verification screenshots captured.");
})();
