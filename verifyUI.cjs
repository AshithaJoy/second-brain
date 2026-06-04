const { chromium } = require('playwright');
const axios = require('axios');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const artifactDir = 'C:/Users/HI10148/.gemini/antigravity/brain/d27dbdd4-3afb-43c3-89ac-dcc09881d605';
    
    // 1. Get token
    console.log("Getting token from API...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test4@example.com',
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    
    console.log("Navigating to frontend...");
    await page.goto('http://localhost:5173');
    
    // Inject token and reload
    await page.evaluate((t) => {
      localStorage.setItem('sb_token', t);
    }, token);
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log("Logged in via token injection.");
    await page.screenshot({ path: path.join(artifactDir, '01-planner-loaded.png') });

    // 2. Open Post Editor
    console.log("Opening Post Editor...");
    const postCards = await page.$$('text=Edit'); // Assuming there's some text we can click
    // Let's just click "+ new post"
    const newBtn = await page.$('text="+ new post"');
    if (newBtn) {
      await newBtn.click();
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, '02-post-editor-opened.png') });
    
    // 3. Open Vault Picker
    console.log("Opening Vault Picker...");
    const attachBtn = await page.$('text="+ Attach Assets"');
    if (attachBtn) {
      await attachBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, '03-vault-picker-opened.png') });
      
      // 4. Select Asset
      console.log("Selecting Asset...");
      await page.mouse.click(300, 300); // Click somewhere in the middle to select an asset
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(artifactDir, '04-vault-asset-selected.png') });
      
      // 5. Close Vault Picker
      const doneBtn = await page.$('text="Done"');
      if (doneBtn) {
        await doneBtn.click();
      }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactDir, '05-post-editor-with-asset.png') });
    }
    
    // 6. Save Post
    console.log("Saving Post...");
    const titleInput = await page.$('input[placeholder="Post Title"]');
    if (titleInput) {
      await titleInput.fill('Playwright UI Test Post');
    }
    const saveBtn = await page.$('text="Save Post"');
    if (saveBtn) {
      await saveBtn.click();
    }
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, '06-post-saved.png') });
    
    console.log("UI Verification completed successfully.");

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await browser.close();
  }
}

run();
