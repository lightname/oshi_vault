import { expect, test } from '@playwright/test';

test('S-03 IP hub renders with 200, h1, and zero console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const res = await page.goto('/ko/ip/pokemon/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('포켓몬');
  expect(errors).toEqual([]);
});
