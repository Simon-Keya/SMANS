import { expect, test } from "@playwright/test";

test.describe("Admin Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");
  });

  test("admin can login and access dashboard", async ({ page }) => {
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/admin");

    await expect(page.locator("h1")).toContainText("Welcome back, Administrator");
    await expect(page.locator("text=Total Students")).toBeVisible();
  });

  test("admin can create a new class", async ({ page }) => {
    // Assume already logged in
    await page.goto("http://localhost:3000/dashboard/classes");

    await page.click("text=Create Class");

    await page.fill('input[name="name"]', "Form 1A");
    await page.fill('input[name="level"]', "Form 1");
    await page.click("button[type=submit]");

    await expect(page.locator("text=Form 1A")).toBeVisible();
  });
});