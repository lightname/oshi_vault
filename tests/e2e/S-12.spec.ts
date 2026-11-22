import { expect, test } from '@playwright/test';

test('S-12 about renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/about/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('데이터 출처와 계산 방법');
  expect(errors).toEqual([]);
});
