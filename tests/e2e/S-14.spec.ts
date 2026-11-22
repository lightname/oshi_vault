import { expect, test } from '@playwright/test';

test('S-14 is not generated at L1 and returns 404 cleanly', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('status of 404')) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto('/ko/ip/pokemon/figure/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(errors).toEqual([]);
});
