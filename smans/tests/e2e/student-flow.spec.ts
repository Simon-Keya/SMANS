import { expect, test } from "@playwright/test";

test.describe("Student Flow E2E", () => {
  test("student can view results", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[name="email"]', "student@example.com");
    await page.fill('input[name="password"]', "student123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/student");

    await page.goto("http://localhost:3000/dashboard/student/results");

    await expect(page.locator("text=Your Results")).toBeVisible();
    await expect(page.locator("text=Term 1")).toBeVisible();
  });
});