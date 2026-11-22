import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from '@playwright/test';

const FORCE = process.argv.includes('--force');
const ROOT = process.cwd();

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/images.manifest.json'), 'utf8'));
const ipsPath = path.join(ROOT, 'src/data/generated/ips.json');
const ips = fs.existsSync(ipsPath) ? JSON.parse(fs.readFileSync(ipsPath, 'utf8')) : [];

const targets = [];
for (const [id, item] of Object.entries(manifest)) {
  const ext = path.extname(item.src).toLowerCase();
  targets.push({
    file: path.join(ROOT, 'public', item.src.replace(/^\//, '')),
    width: item.width,
    height: item.height,
    label: id,
    mime: ext === '.png' ? 'image/png' : 'image/webp',
  });
}

const brandIcons = [
  { file: 'src/app/icon.png', width: 512, height: 512, label: 'icon.png', mime: 'image/png' },
  { file: 'src/app/apple-icon.png', width: 180, height: 180, label: 'apple-icon.png', mime: 'image/png' },
  { file: 'public/icons/icon-192.png', width: 192, height: 192, label: 'icon-192.png', mime: 'image/png' },
  { file: 'public/icons/icon-512.png', width: 512, height: 512, label: 'icon-512.png', mime: 'image/png' },
];
for (const b of brandIcons) targets.push({ ...b, file: path.join(ROOT, b.file) });

for (const lang of ['ko', 'en', 'ja']) {
  targets.push({
    file: path.join(ROOT, `public/images/og/og-default-${lang}.png`),
    width: 1200,
    height: 630,
    label: `og-default-${lang}.png`,
    mime: 'image/png',
  });
  for (const ip of ips) {
    if (ip.goodsCount < 1) continue;
    const name = `og-ip-${ip.slug}-${lang}.png`;
    targets.push({
      file: path.join(ROOT, 'public/images/og', name),
      width: 1200,
      height: 630,
      label: name,
      mime: 'image/png',
    });
  }
}

function writeSvgs() {
  const colorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect x="6" y="6" width="52" height="52" rx="14" fill="#3B2F6B"/><path d="M32 16 L36.5 27.5 L48 32 L36.5 36.5 L32 48 L27.5 36.5 L16 32 L27.5 27.5 Z" fill="#C2410C"/><circle cx="51" cy="32" r="3" fill="#E4DFD7"/></svg>\n`;
  const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect x="6" y="6" width="52" height="52" rx="14" fill="#FFFFFF"/><path d="M32 16 L36.5 27.5 L48 32 L36.5 36.5 L32 48 L27.5 36.5 L16 32 L27.5 27.5 Z" fill="#3B2F6B"/><circle cx="51" cy="32" r="3" fill="#3B2F6B"/></svg>\n`;
  for (const [rel, body] of [
    ['public/images/brand/logo-symbol.svg', colorSvg],
    ['public/images/brand/logo-symbol-mono.svg', monoSvg],
  ]) {
    const f = path.join(ROOT, rel);
    if (!FORCE && fs.existsSync(f)) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body, 'utf8');
  }
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function solidPng(w, h, r = 0xe4, g = 0xdf, b = 0xd7) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const row = Buffer.alloc(1 + w * 3);
  row[0] = 0;
  for (let x = 0; x < w; x++) { row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b; }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function renderCanvas(page, w, h, label, mime) {
  const dataUrl = await page.evaluate(({ w, h, label, mime }) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#E4DFD7';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5E5A6B';
    const fs = Math.max(10, Math.round(Math.min(w, h) / 10));
    ctx.font = `bold ${fs}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, h / 2 - fs * 0.65);
    ctx.fillText(`${w}×${h}`, w / 2, h / 2 + fs * 0.65);
    return c.toDataURL(mime, 0.9);
  }, { w, h, label, mime });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function run() {
  writeSvgs();
  const pending = targets.filter((t) => FORCE || !fs.existsSync(t.file));
  const icoPath = path.join(ROOT, 'src/app/favicon.ico');
  const needIco = FORCE || !fs.existsSync(icoPath);
  if (pending.length === 0 && !needIco) return;

  let browser = null;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    for (const t of pending) {
      fs.mkdirSync(path.dirname(t.file), { recursive: true });
      const buf = await renderCanvas(page, t.width, t.height, t.label, t.mime);
      fs.writeFileSync(t.file, buf);
    }
    if (needIco) {
      const sizes = [16, 32, 48];
      const pngs = [];
      for (const s of sizes) {
        pngs.push({ size: s, data: await renderCanvas(page, s, s, 'OV', 'image/png') });
      }
      fs.mkdirSync(path.dirname(icoPath), { recursive: true });
      fs.writeFileSync(icoPath, buildIco(pngs));
    }
  } catch {
    for (const t of pending) {
      fs.mkdirSync(path.dirname(t.file), { recursive: true });
      fs.writeFileSync(t.file, solidPng(t.width, t.height));
      console.warn(`[placeholders] fallback png: ${path.relative(ROOT, t.file)}`);
    }
    if (needIco) {
      const pngs = [16, 32, 48].map((s) => ({ size: s, data: solidPng(s, s) }));
      fs.mkdirSync(path.dirname(icoPath), { recursive: true });
      fs.writeFileSync(icoPath, buildIco(pngs));
      console.warn('[placeholders] fallback png: src/app/favicon.ico');
    }
  } finally {
    if (browser) await browser.close();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
