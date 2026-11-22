import Image from 'next/image';
import Link from 'next/link';
import type { LegalDoc } from '@/lib/content/content';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { GUIDE_PROSE_CLASS } from '@/components/guides/guideHtml';

type Props = {
  lang: Lang;
  dict: Dict;
  doc: LegalDoc;
};

export function LegalView({ lang, dict, doc }: Props) {
  const img = getImage('IMG-19', lang);
  const tabClass = (active: boolean) =>
    `inline-flex h-[40px] items-center border-b-2 px-(--space-3) text-small transition-colors duration-150 ${
      active
        ? 'border-secondary font-semibold text-secondary'
        : 'border-transparent text-text-muted hover:text-secondary'
    }`;

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: doc.title },
        ]}
      />

      <nav aria-label={doc.title} className="mb-(--space-6) flex gap-(--space-2) border-b border-border">
        <Link href={`/${lang}/privacy/`} className={tabClass(doc.kind === 'privacy')}>
          {t(dict, 'legal.privacy')}
        </Link>
        <Link href={`/${lang}/terms/`} className={tabClass(doc.kind === 'terms')}>
          {t(dict, 'legal.terms')}
        </Link>
      </nav>

      <section className="flex items-center justify-between gap-(--space-6)">
        <div>
          <h1 className="text-h1 text-secondary">{doc.title}</h1>
          <p className="mt-(--space-2) text-small text-text-muted tabular-nums">
            {t(dict, 'legal.effective', { date: formatDate(doc.effective, lang) })}
          </p>
        </div>
        <div className="hidden shrink-0 md:block">
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading="lazy"
            className="h-auto w-[160px] object-contain"
          />
        </div>
      </section>

      <article
        className={`mt-(--space-6) ${GUIDE_PROSE_CLASS}`}
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
}
