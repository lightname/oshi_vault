import type { Currency } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';

export type ManualDraft = {
  name: string;
  ipName: string;
  price: string;
  currency: Currency;
  releaseDate: string;
  code: string;
};

export type FieldKey = 'name' | 'ip' | 'price' | 'code';
export type FieldErrors = Partial<Record<FieldKey, string>>;

export function validateManualDraft(draft: ManualDraft, dict: Dict): FieldErrors {
  const next: FieldErrors = {};
  const trimmedName = draft.name.trim();
  const trimmedCode = draft.code.trim();
  const numPrice = Number(draft.price);

  if (trimmedName.length === 0) {
    next.name = t(dict, 'scan.required');
  } else if (trimmedName.length > 120) {
    next.name = t(dict, 'errors.INVALID_REQUEST');
  }

  if (draft.ipName.trim().length === 0) {
    next.ip = t(dict, 'scan.required');
  }

  if (draft.price.trim().length === 0) {
    next.price = t(dict, 'scan.required');
  } else if (!Number.isFinite(numPrice) || numPrice <= 0 || numPrice > 10_000_000) {
    next.price = t(dict, 'errors.INVALID_REQUEST');
  }

  if (trimmedCode.length > 40) {
    next.code = t(dict, 'errors.INVALID_REQUEST');
  }

  return next;
}
