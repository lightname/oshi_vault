import { expect, test } from '@playwright/test';

test('S-07 collection renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/collection/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('내 진열장');
  expect(errors).toEqual([]);
});
