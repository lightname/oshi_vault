import { expect, test } from '@playwright/test';

test('S-05 search renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/search/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('굿즈 검색');
  expect(errors).toEqual([]);
});
