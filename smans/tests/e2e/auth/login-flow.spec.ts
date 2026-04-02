// tests/e2e/auth/login-flow.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully as ADMIN and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'admin@smans.school');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/dashboard/);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    await expect(page.getByText('Administrator')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test('should redirect to login if accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login/);
  });
});