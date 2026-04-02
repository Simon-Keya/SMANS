// tests/e2e/smoke/homepage.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Homepage Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Welcome to/i })).toBeVisible();
    await expect(page.getByText(/SMANS/i)).toBeVisible();
  });

  test('should show school stats on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/Enrolled Students/i)).toBeVisible();
    await expect(page.getByText(/Dedicated Teachers/i)).toBeVisible();
  });

  test('should have working login button', async ({ page }) => {
    await page.goto('/');

    await page.click('a:has-text("Access Portal")');

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should display notice board section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Latest Updates/i })).toBeVisible();
  });
});