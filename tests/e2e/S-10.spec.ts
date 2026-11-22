import { expect, test } from '@playwright/test';

test('S-10 guides list renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/guides/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('수집 가이드');
  expect(errors).toEqual([]);
});
