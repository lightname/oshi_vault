import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { config } from '../../src/config';
import type { Ip, Lang } from '../../src/lib/data/types';
import koMsg from '../../src/messages/ko.json';
import enMsg from '../../src/messages/en.json';
import jaMsg from '../../src/messages/ja.json';

const DICTS: Record<Lang, Record<string, string>> = { ko: koMsg, en: enMsg, ja: jaMsg };

const FONT_LINK: Record<Lang, string> = {
  ko: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap',
  en: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
  ja: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap',
};

const FONT_FAMILY: Record<Lang, string> = {
  ko: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
  en: '"Inter", system-ui, sans-serif',
  ja: '"Noto Sans JP", "Hiragino Sans", sans-serif',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

test('generate OG images (default + active IPs)', async ({ page }) => {
  test.setTimeout(120_000);
  const root = process.cwd();
  const ips = JSON.parse(
    fs.readFileSync(path.join(root, 'src/data/generated/ips.json'), 'utf8')
  ) as Ip[];
  const activeIps = ips.filter((ip) => ip.goodsCount >= 1);

  const bgB64 = fs.readFileSync(path.join(root, 'public/images/og/og-base.png')).toString('base64');
  const logoB64 = fs
    .readFileSync(path.join(root, 'public/images/brand/logo-symbol-mono.svg'))
    .toString('base64');

  const targets: { file: string; lang: Lang; title: string; slogan: string }[] = [];
  for (const lang of config.locales) {
    const dict = DICTS[lang];
    const slogan = dict['site.slogan'];
    targets.push({
      file: `og-default-${lang}.png`,
      lang,
      title: config.site.name[lang],
      slogan,
    });
    for (const ip of activeIps) {
      const title = dict['ip.hubH1'].replace('{ip}', ip.name[lang]);
      targets.push({
        file: `og-ip-${ip.slug}-${lang}.png`,
        lang,
        title,
        slogan,
      });
    }
  }

  await page.setViewportSize({ width: 1200, height: 630 });

  for (const item of targets) {
    const html = `<!doctype html>
<html lang="${item.lang}">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${FONT_LINK[item.lang]}" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 1200px;
    height: 630px;
    position: relative;
    overflow: hidden;
    background: #3B2F6B url("data:image/png;base64,${bgB64}") center/cover no-repeat;
    font-family: ${FONT_FAMILY[item.lang]};
  }
  .logo { position: absolute; top: 64px; left: 64px; width: 64px; height: 64px; }
  .copy { position: absolute; left: 64px; bottom: 64px; width: 640px; }
  .title {
    margin: 0;
    color: #FFFFFF;
    font-size: 56px;
    font-weight: 700;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .slogan {
    margin: 18px 0 0;
    color: #D9D4E8;
    font-size: 28px;
    font-weight: 400;
    line-height: 1.35;
  }
</style>
</head>
<body>
  <img class="logo" src="data:image/svg+xml;base64,${logoB64}" alt="" width="64" height="64" />
  <div class="copy">
    <h1 class="title">${esc(item.title)}</h1>
    <p class="slogan">${esc(item.slogan)}</p>
  </div>
</body>
</html>`;
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]));
    await page.screenshot({
      path: path.join(root, 'public/images/og', item.file),
      type: 'png',
    });
  }
});
