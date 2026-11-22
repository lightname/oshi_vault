import { expect, test } from '@playwright/test';

test('S-06 scan renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/scan/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('바코드로 진열장에 등록');
  expect(errors).toEqual([]);
});
