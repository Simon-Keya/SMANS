import { expect, test } from "@playwright/test";

test.describe("Parent Flow E2E", () => {
  test("parent can view children's invoices", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[name="email"]', "parent@example.com");
    await page.fill('input[name="password"]', "parent123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/parent");

    await page.goto("http://localhost:3000/dashboard/parent/invoices");

    await expect(page.locator("text=Invoices")).toBeVisible();
    await expect(page.locator("text=Pending")).toBeVisible(); // assume data exists
  });
});