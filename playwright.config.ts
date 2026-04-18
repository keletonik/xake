import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config. Tests live in e2e/. Run locally with:
 *
 *   pnpm exec playwright install  # once
 *   pnpm exec playwright test
 *
 * CI can boot the app via a web server step; this config keeps it
 * minimal and assumes the web app is already running on :3000.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: process.env.E2E_SKIP_SERVER
    ? undefined
    : {
        command: "pnpm --filter @xake/web dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
});
