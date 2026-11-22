import type { Lang } from '@/lib/data/types';

export function LangAlternates({ map }: { map: Partial<Record<Lang, string>> }) {
  const html = JSON.stringify(map).replace(/</g, '\\u003c');
  return <script type="application/json" id="lang-alternates" dangerouslySetInnerHTML={{ __html: html }} />;
}
