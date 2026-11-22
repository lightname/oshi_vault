import { expect, test } from '@playwright/test';

test('S-15 404 returns 404 with h1 and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('status of 404')) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto('/__missing__/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h2')).toHaveCount(3);
  expect(errors).toEqual([]);
});
