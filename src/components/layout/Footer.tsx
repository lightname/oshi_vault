import Image from 'next/image';
import Link from 'next/link';
import { anyAffiliate } from '@/lib/affiliate/marketLink';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Lang } from '@/lib/data/types';
import { LanguageSelect } from './LanguageSelect';

type Props = {
  lang: Lang;
  dict: Dict;
  guideCount: number;
  year: number;
};

export function Footer({ lang, dict, guideCount, year }: Props) {
  const showAffiliate = anyAffiliate();

  return (
    <footer className="bg-secondary py-(--space-8) text-text-on-dark">
      <div className="container-main">
        <div className="grid grid-cols-1 gap-(--space-6) lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-(--space-2)">
              <Image
                src="/images/brand/logo-symbol-mono.svg"
                alt=""
                width={32}
                height={32}
                className="h-[32px] w-[32px]"
              />
              <span className="text-[20px] font-bold tracking-[-0.01em] text-text-on-dark">
                Oshi Vault
              </span>
            </div>
            <p className="mt-(--space-3) text-small text-text-on-dark-muted">
              {t(dict, 'site.slogan')}
            </p>
          </div>

          <div>
            <h2 className="text-h4 text-text-on-dark">{t(dict, 'footer.explore')}</h2>
            <ul className="mt-(--space-3) space-y-(--space-2) text-small text-text-on-dark-muted">
              <li>
                <Link href={`/${lang}/ip/`} className="hover:text-text-on-dark hover:underline">
                  {t(dict, 'nav.ip')}
                </Link>
              </li>
              {guideCount > 0 ? (
                <li>
                  <Link href={`/${lang}/guides/`} className="hover:text-text-on-dark hover:underline">
                    {t(dict, 'nav.guides')}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link
                  href={`/${lang}/tools/premium-calculator/`}
                  className="hover:text-text-on-dark hover:underline"
                >
                  {t(dict, 'nav.calculator')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/scan/`} className="hover:text-text-on-dark hover:underline">
                  {t(dict, 'nav.scan')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/collection/`}
                  className="hover:text-text-on-dark hover:underline"
                >
                  {t(dict, 'nav.collection')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/wishlist/`}
                  className="hover:text-text-on-dark hover:underline"
                >
                  {t(dict, 'nav.wishlist')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-h4 text-text-on-dark">{t(dict, 'footer.info')}</h2>
            <ul className="mt-(--space-3) space-y-(--space-2) text-small text-text-on-dark-muted">
              <li>
                <Link href={`/${lang}/about/`} className="hover:text-text-on-dark hover:underline">
                  {t(dict, 'footer.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy/`} className="hover:text-text-on-dark hover:underline">
                  {t(dict, 'footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms/`} className="hover:text-text-on-dark hover:underline">
                  {t(dict, 'footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-(--space-3) text-h4 text-text-on-dark">{t(dict, 'lang.label')}</p>
            <LanguageSelect lang={lang} label={t(dict, 'lang.label')} variant="segment" onDark />
          </div>
        </div>

        <div className="mt-(--space-7) space-y-(--space-2) border-t border-white/16 pt-(--space-5) text-small text-text-on-dark-muted">
          <p>{t(dict, 'footer.unofficial')}</p>
          {showAffiliate ? <p>{t(dict, 'footer.affiliate')}</p> : null}
          <p>{t(dict, 'footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
