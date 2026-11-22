import { expect, test } from '@playwright/test';

test('S-16 calculator renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/tools/premium-calculator/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('정가 대비 프리미엄 계산기');
  expect(errors).toEqual([]);
});
