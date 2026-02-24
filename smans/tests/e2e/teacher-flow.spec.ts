import { expect, test } from "@playwright/test";

test.describe("Teacher Flow E2E", () => {
  test("teacher can login and mark attendance", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[name="email"]', "teacher@example.com");
    await page.fill('input[name="password"]', "teacher123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/teacher");

    await page.goto("http://localhost:3000/dashboard/teacher/attendance");

    await page.click("text=Mark Attendance");

    // Assume form interaction
    await page.check('input[type="checkbox"][value="present"]'); // example
    await page.click("button[type=submit]");

    await expect(page.locator("text=Attendance marked successfully")).toBeVisible();
  });
});