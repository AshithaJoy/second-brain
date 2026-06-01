import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "https://second-brain-beige-eight.vercel.app",
    // Use the system's Google Chrome instead of downloading large browser packages
    channel: "chrome",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
});
