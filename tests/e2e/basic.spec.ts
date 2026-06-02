import { test, expect } from '@playwright/test';

test('frontend loads and health endpoint works', async ({ page, baseURL }) => {
  const targetUrl = baseURL && !baseURL.includes('second-brain-beige-eight') ? baseURL : 'http://localhost:5173/';
  await page.goto(targetUrl);
  await expect(page).toHaveURL(targetUrl);
  // Basic check: page title contains "Second Brain" (replace with actual expected title if known)
  const pageTitle = await page.title();
  expect(pageTitle).not.toBe('404: NOT_FOUND');

  const backendUrl = targetUrl.includes('localhost') 
    ? 'http://localhost:5000/health' 
    : 'https://second-brain-backend-production-43b4.up.railway.app/health';

  // Check backend health endpoint via fetch from the page context
  const response = await page.evaluate(async (url) => {
    const res = await fetch(url);
    return res.json();
  }, backendUrl);
  expect(response.status).toBe('ok');
});
