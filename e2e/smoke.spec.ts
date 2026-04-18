import { expect, test } from "@playwright/test";

/**
 * Smoke flows. These assume the app is reachable at E2E_BASE_URL (or
 * localhost:3000) and Clerk is not enabled — so /app is reachable
 * without sign-in. In CI with Clerk on, a test user must be seeded.
 */

test("landing renders the XAKE mark and hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Trade with edge/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Launch workspace/i })).toBeVisible();
});

test("workspace dashboard loads", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
  await expect(page.getByText(/Paper environment/i).first()).toBeVisible();
});

test("markets page lists instruments", async ({ page }) => {
  await page.goto("/app/markets");
  await expect(page.getByText(/Markets/i).first()).toBeVisible();
  await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
});

test("paper ticket submit flow is visible", async ({ page }) => {
  await page.goto("/app/paper");
  await expect(page.getByText(/Paper ticket/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit paper order/i })).toBeVisible();
});
