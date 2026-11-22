import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '@/config';
import { getIps } from '@/lib/data/catalog';

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngSize(filePath: string): { width: number; height: number } {
  const buf = fs.readFileSync(filePath);
  expect(buf.subarray(0, 8).equals(PNG_SIG)).toBe(true);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('T-20 OG images size check', () => {
  it('verifies all default and active IP OG images are valid 1200x630 PNGs', () => {
    const dir = path.join(process.cwd(), 'public/images/og');
    const activeIps = getIps().filter((ip) => ip.goodsCount >= 1);
    const files: string[] = [];
    for (const lang of config.locales) {
      files.push(`og-default-${lang}.png`);
      for (const ip of activeIps) {
        files.push(`og-ip-${ip.slug}-${lang}.png`);
      }
    }

    expect(files.length).toBe(3 + activeIps.length * 3);
    for (const f of files) {
      const full = path.join(dir, f);
      expect(fs.existsSync(full), `missing ${f}`).toBe(true);
      expect(readPngSize(full), `bad size for ${f}`).toEqual({ width: 1200, height: 630 });
    }
  });
});
