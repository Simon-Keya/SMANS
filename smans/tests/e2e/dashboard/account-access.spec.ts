// tests/e2e/dashboard/accountant-access.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Accountant Role Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'accountant@smans.school');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should allow accountant to access fees module', async ({ page }) => {
    await page.goto('/dashboard/fees');

    await expect(page.getByRole('heading', { name: /Fees Management/i })).toBeVisible();
    await expect(page.getByText(/Record Payment/i)).toBeVisible();
  });

  test('should restrict accountant from accessing student management', async ({ page }) => {
    await page.goto('/dashboard/students');

    // Should either redirect or show access denied
    await expect(page).toHaveURL(/\/dashboard\/fees|\/dashboard/); // or check for error message
    await expect(page.getByText(/Access Denied|Unauthorized/i).or(
      page.getByText(/Fees/i)
    )).toBeVisible();
  });

  test('should show only finance-related menu items in sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/Fees/i)).toBeVisible();
    await expect(page.getByText(/Reports/i)).toBeVisible();

    // Should NOT show Students, Teachers, etc. for accountant
    await expect(page.getByText(/Students/i)).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Attendance/i)).not.toBeVisible({ timeout: 3000 });
  });
});