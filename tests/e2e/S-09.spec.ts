import { expect, test } from '@playwright/test';

test('S-09 share renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/share/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('진열장 공유 카드');
  expect(errors).toEqual([]);
});
