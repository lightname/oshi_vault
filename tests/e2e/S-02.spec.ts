import { expect, test } from '@playwright/test';

test('S-02 IP list renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/ip/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('IP별 한정판 굿즈');
  expect(errors).toEqual([]);
});
