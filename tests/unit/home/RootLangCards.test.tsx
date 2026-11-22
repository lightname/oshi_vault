import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import rootMessages from '@/messages/root.json';
import { RootLangCards } from '@/components/home/RootLangCards';

const CARDS = [
  {
    lang: 'ko' as const,
    name: rootMessages['root.ko.name'],
    desc: rootMessages['root.ko.desc'],
    suggest: rootMessages['root.ko.suggest'],
  },
  {
    lang: 'en' as const,
    name: rootMessages['root.en.name'],
    desc: rootMessages['root.en.desc'],
    suggest: rootMessages['root.en.suggest'],
  },
  {
    lang: 'ja' as const,
    name: rootMessages['root.ja.name'],
    desc: rootMessages['root.ja.desc'],
    suggest: rootMessages['root.ja.suggest'],
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('S-00 RootLangCards', () => {
  it('renders ko, en, ja links in fixed order and highlights matching navigator.language', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('ja-JP');
    render(<RootLangCards cards={CARDS} />);

    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/ko/', '/en/', '/ja/']);
    expect(screen.getByText('おすすめ')).toBeInTheDocument();
    expect(screen.queryByText('추천')).not.toBeInTheDocument();
  });

  it('shows no highlight chip when navigator.language is unsupported', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR');
    render(<RootLangCards cards={CARDS} />);

    expect(screen.queryByText('추천')).not.toBeInTheDocument();
    expect(screen.queryByText('Suggested')).not.toBeInTheDocument();
    expect(screen.queryByText('おすすめ')).not.toBeInTheDocument();
  });
});
