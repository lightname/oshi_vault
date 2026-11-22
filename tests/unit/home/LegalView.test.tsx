import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readLegal } from '@/lib/content/content';
import { getDictionary } from '@/lib/i18n/dictionary';
import { generateMetadata as privacyMeta } from '@/app/[lang]/privacy/page';
import { generateMetadata as termsMeta } from '@/app/[lang]/terms/page';
import { LegalView } from '@/components/home/LegalView';

describe('S-13 LegalView & metadata', () => {
  it('renders legal tabs, heading, effective date, and noindex when reviewed=false', async () => {
    const dict = getDictionary('ko');
    const doc = readLegal('ko', 'privacy');
    render(<LegalView lang="ko" dict={dict} doc={doc} />);

    expect(screen.getByRole('heading', { level: 1, name: doc.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['legal.privacy'] })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['legal.terms'] })).toBeInTheDocument();
    expect(screen.getByText(/시행일/)).toBeInTheDocument();

    const pMeta = await privacyMeta({ params: Promise.resolve({ lang: 'ko' }) });
    const tMeta = await termsMeta({ params: Promise.resolve({ lang: 'ko' }) });
    expect(pMeta.robots).toEqual({ index: false, follow: true });
    expect(tMeta.robots).toEqual({ index: false, follow: true });
  });
});
