// tests/e2e/dashboard/profile.spec.ts
import { expect, test } from '@playwright/test';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@smans.school');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should display user profile information correctly', async ({ page }) => {
    await page.goto('/dashboard/profile');

    await expect(page.getByRole('heading', { name: /My Profile/i })).toBeVisible();
    await expect(page.getByText('admin@smans.school')).toBeVisible();
    await expect(page.getByText(/Administrator/i, { exact: false })).toBeVisible();

    // Check for joined date and other info
    await expect(page.getByText(/Joined/i)).toBeVisible();
  });

  test('should navigate to edit profile page', async ({ page }) => {
    await page.goto('/dashboard/profile');

    await page.click('a:has-text("Edit Profile")');

    await expect(page).toHaveURL(/\/dashboard\/profile\/edit/);
    await expect(page.getByRole('heading', { name: /Edit Profile/i })).toBeVisible();
  });

  test('should show email verification status', async ({ page }) => {
    await page.goto('/dashboard/profile');

    const verifiedBadge = page.getByText(/Email verified/i);
    // Depending on your test data, either verified or not verified should appear
    await expect(verifiedBadge.or(page.getByText(/not verified/i))).toBeVisible();
  });
});