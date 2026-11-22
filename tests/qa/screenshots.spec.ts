import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { getQaRoutes } from './routes';

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

const OUT = path.join(process.cwd(), 'out');

function routeExists(p: string): boolean {
  if (p === '/__missing__/') return fs.existsSync(path.join(OUT, '404.html'));
  const clean = p.replace(/^\//, '');
  const f = clean === '' ? path.join(OUT, 'index.html') : path.join(OUT, clean, 'index.html');
  return fs.existsSync(f);
}

for (const vp of VIEWPORTS) {
  test(`capture QA screenshots at ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    const dir = path.join(process.cwd(), 'qa/screenshots', String(vp.width));
    fs.mkdirSync(dir, { recursive: true });
    for (const r of getQaRoutes()) {
      if (!routeExists(r.path)) continue;
      await page.goto(r.path, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(dir, `${r.screen}-${r.lang}.png`),
        fullPage: true,
      });
    }
  });
}
