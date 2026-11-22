import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';
import { _resetStoreForTest } from '@/lib/storage/store';
import { fixtureCatalog, fixtureIps } from '../fixtures/catalog';

vi.mock('@/lib/data/catalogClient', () => ({
  useCatalog: () => ({ status: 'ready', data: fixtureCatalog, retry: vi.fn() }),
}));

import { ScanView } from '@/components/scan/ScanView';

describe('S-06 ScanView', () => {
  const dict = getDictionary('ko');

  beforeEach(() => {
    window.localStorage.clear();
    _resetStoreForTest();
    window.history.replaceState(null, '', '/ko/scan/');
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('matches by barcode and sums qty on repeated add', async () => {
    render(<ScanView lang="ko" dict={dict} ips={fixtureIps} hasBarcodeGuide={false} />);

    fireEvent.change(screen.getByPlaceholderText(dict['scan.manualPlaceholder']), {
      target: { value: '4521329300001' },
    });
    fireEvent.click(screen.getByRole('button', { name: dict['scan.lookup'] }));

    expect(await screen.findByText(dict['scan.matchTitle'])).toBeInTheDocument();
    expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: dict['goods.addShelf'] }));
    fireEvent.click(screen.getByRole('button', { name: dict['goods.addShelf'] }));

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('mipg.v1') ?? '{}');
      expect(saved.collection).toHaveLength(1);
      expect(saved.collection[0].goodsId).toBe('PKM-0001');
      expect(saved.collection[0].qty).toBe(4);
    });
  });

  it('shows required error on empty lookup and opens manual form on miss', async () => {
    render(<ScanView lang="ko" dict={dict} ips={fixtureIps} hasBarcodeGuide={false} />);

    fireEvent.click(screen.getByRole('button', { name: dict['scan.lookup'] }));
    expect(screen.getByText(dict['scan.required'])).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(dict['scan.manualPlaceholder']), {
      target: { value: '9999999999999' },
    });
    fireEvent.click(screen.getByRole('button', { name: dict['scan.lookup'] }));

    expect(await screen.findByText(dict['scan.missTitle'])).toBeInTheDocument();
    expect(screen.getByLabelText(dict['scan.fieldCode'])).toHaveValue('9999999999999');
  });

  it('validates each field in manual register form and saves valid entry', async () => {
    window.history.replaceState(null, '', '/ko/scan/?manual=1&name=');
    render(<ScanView lang="ko" dict={dict} ips={fixtureIps} hasBarcodeGuide={false} />);

    const submit = await screen.findByRole('button', { name: dict['scan.saveManual'] });

    // Empty name + ip + price
    fireEvent.click(submit);
    expect(screen.getAllByText(dict['scan.required']).length).toBeGreaterThanOrEqual(3);
    expect(document.activeElement).toBe(screen.getByLabelText(dict['scan.fieldName']));

    // Invalid price (0) and overly long code (>40)
    fireEvent.change(screen.getByLabelText(dict['scan.fieldName']), {
      target: { value: '한정 아크릴' },
    });
    fireEvent.change(screen.getByLabelText(dict['scan.fieldIp']), {
      target: { value: '포켓몬' },
    });
    fireEvent.change(screen.getByLabelText(dict['scan.fieldPrice']), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText(dict['scan.fieldCode']), {
      target: { value: 'x'.repeat(41) },
    });
    fireEvent.click(submit);
    expect(screen.getAllByText(dict['errors.INVALID_REQUEST']).length).toBe(2);

    // Fix price and code -> submit succeeds
    fireEvent.change(screen.getByLabelText(dict['scan.fieldPrice']), {
      target: { value: '2500' },
    });
    fireEvent.change(screen.getByLabelText(dict['scan.fieldCode']), {
      target: { value: 'ABC-123' },
    });
    fireEvent.click(submit);

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('mipg.v1') ?? '{}');
      expect(saved.collection).toHaveLength(1);
      expect(saved.collection[0].goodsId).toBeNull();
      expect(saved.collection[0].manual.name).toBe('한정 아크릴');
      expect(saved.collection[0].manual.price).toBe(2500);
    });
  });
});
