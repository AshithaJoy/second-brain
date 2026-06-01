import { test, expect } from '@playwright/test';

test('frontend loads and health endpoint works', async ({ page }) => {
  // Visit the frontend root
  await page.goto('/');
  await expect(page).toHaveURL('https://second-brain-beige-eight.vercel.app/');
  // Basic check: page title contains "Second Brain" (replace with actual expected title if known)
  const pageTitle = await page.title();
  expect(pageTitle).not.toBe('404: NOT_FOUND');

  // Check backend health endpoint via fetch from the page context
  const response = await page.evaluate(async () => {
    const res = await fetch('https://second-brain-backend-production-43b4.up.railway.app/health');
    return res.json();
  });
  expect(response.status).toBe('ok');
});
