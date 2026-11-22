export function splitGuideHtml(html: string): [string, string] {
  const marker = '<h2 id="s-3">';
  const idx = html.indexOf(marker);
  if (idx === -1) return [html, ''];
  return [html.slice(0, idx), html.slice(idx)];
}

export const GUIDE_PROSE_CLASS =
  'max-w-[720px] text-[16px] leading-[28px] text-text md:text-[17px] md:leading-[30px] ' +
  '[&_h2]:mt-(--space-7) [&_h2]:mb-(--space-3) [&_h2]:scroll-mt-[88px] [&_h2]:text-h2 [&_h2]:text-secondary ' +
  '[&_h3]:mt-(--space-5) [&_h3]:mb-(--space-2) [&_h3]:text-h3 [&_h3]:text-secondary ' +
  '[&_p]:mb-(--space-4) [&_a]:text-primary [&_a]:underline ' +
  '[&_ul]:mb-(--space-4) [&_ul]:list-disc [&_ul]:pl-(--space-5) ' +
  '[&_ol]:mb-(--space-4) [&_ol]:list-decimal [&_ol]:pl-(--space-5) ' +
  '[&_table]:my-(--space-5) [&_table]:w-full [&_table]:border-collapse ' +
  '[&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:p-(--space-2) [&_th]:text-left ' +
  '[&_td]:border [&_td]:border-border [&_td]:p-(--space-2) ' +
  '[&_blockquote]:my-(--space-4) [&_blockquote]:border-l-4 [&_blockquote]:border-secondary-tint [&_blockquote]:pl-(--space-4) [&_blockquote]:text-text-muted';
