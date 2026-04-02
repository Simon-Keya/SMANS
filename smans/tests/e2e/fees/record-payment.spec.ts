// tests/e2e/fees/record-payment.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Fees - Record Payment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'accountant@smans.school');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should successfully record a payment', async ({ page }) => {
    await page.goto('/dashboard/fees');

    // Click on Record Payment button
    await page.click('button:has-text("Record Payment")');

    // Fill payment form
    await page.selectOption('select[name="studentId"]', { label: 'John Doe' }); // adjust selector
    await page.fill('input[name="amount"]', '8500');
    await page.selectOption('select[name="paymentMethod"]', 'MPESA');
    await page.fill('input[name="transactionRef"]', 'MPESA_TEST_998877');

    await page.click('button:has-text("Submit Payment")');

    // Success message
    await expect(page.getByText(/Payment recorded successfully/i)).toBeVisible();

    // Verify in payment list
    await page.goto('/dashboard/fees/payments');
    await expect(page.getByText('8500')).toBeVisible();
  });

  test('should show validation error for invalid amount', async ({ page }) => {
    await page.goto('/dashboard/fees');

    await page.click('button:has-text("Record Payment")');
    await page.fill('input[name="amount"]', '-100');
    await page.click('button:has-text("Submit Payment")');

    await expect(page.getByText(/Amount must be positive/i)).toBeVisible();
  });
});