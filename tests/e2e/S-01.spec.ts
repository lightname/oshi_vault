import { expect, test } from '@playwright/test';

test('S-01 home renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('정가 대비 지금 얼마인지, 거래가로 확인하세요');
  expect(errors).toEqual([]);
});
