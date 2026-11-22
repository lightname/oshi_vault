import { expect, test } from '@playwright/test';

test('S-13 privacy and terms render with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res1 = await page.goto('/ko/privacy/');
  expect(res1?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('개인정보처리방침');

  const res2 = await page.goto('/ko/terms/');
  expect(res2?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('이용약관');
  expect(errors).toEqual([]);
});
