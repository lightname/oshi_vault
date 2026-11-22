import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { config } from '@/config';
import { getDictionary } from '@/lib/i18n/dictionary';
import { submitSubscription } from '@/lib/api/subscribe';
import { _resetStoreForTest } from '@/lib/storage/store';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';

const mutableApi = config.api as { baseUrl: string; mode: 'mock' | 'live' };
const mutableGoogle = config.google as { clientId: string };

beforeEach(() => {
  window.localStorage.clear();
  _resetStoreForTest();
  mutableApi.mode = 'mock';
  mutableApi.baseUrl = '';
  mutableGoogle.clientId = '';
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('C-09 SubscribeBox & submitSubscription', () => {
  it('rejects submission when consent is unchecked', async () => {
    const res = await submitSubscription({
      idToken: 'tok',
      lang: 'ko',
      topic: 'target_price',
      consent: false,
      watches: [],
      requests: [],
    });
    expect(res).toEqual({
      ok: false,
      error: { code: 'INVALID_REQUEST', message: 'consent required' },
    });
  });

  it('expands, enforces consent before Google button, and completes mock subscription', async () => {
    const dict = getDictionary('ko');
    render(<SubscribeBox lang="ko" dict={dict} topic="target_price" />);

    fireEvent.click(screen.getByRole('button', { name: '목표가 도달 메일 받기' }));
    expect(screen.getByText(dict['subscribe.frequency'])).toBeInTheDocument();
    expect(screen.getByText(dict['subscribe.unsubscribe'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['footer.privacy'] })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/privacy\/?$/)
    );
    expect(
      screen.getByText('동의에 체크하면 Google 계정으로 계속할 수 있어요.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(
      screen.queryByText('동의에 체크하면 Google 계정으로 계속할 수 있어요.')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mock Google' }));
    await waitFor(() => {
      expect(screen.getByText('구독했어요')).toBeInTheDocument();
    });
  });

  it('displays NETWORK and UNAUTHORIZED error messages in live mode and allows retry', async () => {
    mutableApi.mode = 'live';
    mutableApi.baseUrl = 'https://api.example.com';
    const dict = getDictionary('ko');

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'expired' } }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

    render(<SubscribeBox lang="ko" dict={dict} topic="tracking_request" />);
    fireEvent.click(screen.getByRole('button', { name: '시세 추적 요청 메일 받기' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Mock Google' }));

    await waitFor(() => {
      expect(screen.getByText('네트워크 연결을 확인해 주세요.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mock Google' }));

    await waitFor(() => {
      expect(
        screen.getByText('Google 인증이 만료됐어요. 다시 시도해 주세요.')
      ).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('returns null in production when api.mode is mock', () => {
    vi.stubEnv('NODE_ENV', 'production');
    mutableApi.mode = 'mock';
    const dict = getDictionary('ko');
    const { container } = render(<SubscribeBox lang="ko" dict={dict} topic="target_price" />);
    expect(container.firstChild).toBeNull();
  });
});
