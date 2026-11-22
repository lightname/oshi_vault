import { config } from '@/config';
import type { ErrorCode } from '@/lib/data/types';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string> } };

export async function apiFetch<T>(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown }
): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(`${config.api.baseUrl}${path}`, {
      method: init.method,
      signal: ctrl.signal,
      credentials: 'omit',
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const json = (await res.json()) as ApiResult<T>;
    if (
      typeof json !== 'object' ||
      json === null ||
      typeof (json as { ok?: unknown }).ok !== 'boolean'
    ) {
      return { ok: false, error: { code: 'INTERNAL', message: 'bad envelope' } };
    }
    return json;
  } catch {
    return { ok: false, error: { code: 'NETWORK', message: 'network' } };
  } finally {
    clearTimeout(timer);
  }
}
