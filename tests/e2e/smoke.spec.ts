import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Alkhemmy/i);
  });

  test('help center loads', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByRole('heading', { name: /help center/i })).toBeVisible();
  });
});
