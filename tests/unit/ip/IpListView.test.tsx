import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDictionary } from '@/lib/i18n/dictionary';
import { IpListView } from '@/components/ip/IpListView';
import { fixtureIps } from '../fixtures/catalog';

describe('S-02 IpListView', () => {
  it('renders IP cards with category chips, counts, and links to S-03', () => {
    const dict = getDictionary('ko');
    render(<IpListView lang="ko" dict={dict} ips={fixtureIps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('IP별 한정판 굿즈');
    expect(screen.getByText('포켓몬')).toBeInTheDocument();
    expect(screen.getByText('치이카와')).toBeInTheDocument();
    expect(screen.getByText('게임')).toBeInTheDocument();
    expect(screen.getByText('캐릭터')).toBeInTheDocument();

    const ipLinks = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h) => h?.includes('/ko/ip/'));
    expect(ipLinks).toEqual(['/ko/ip/pokemon', '/ko/ip/chiikawa']);
  });
});
