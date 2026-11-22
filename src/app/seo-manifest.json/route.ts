import { buildSeoManifest } from '@/lib/seo/manifest';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(buildSeoManifest());
}
