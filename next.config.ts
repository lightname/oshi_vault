import type { NextConfig } from 'next';
import { config } from './src/config';

if (
  process.env.CF_PAGES === '1' &&
  config.site.url.includes('REPLACE-ME') &&
  config.seo.indexLevel >= 1
) {
  throw new Error('config.site.url 미설정');
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
