import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Noto_Sans_KR: () => ({ className: 'font-kr' }),
  Noto_Sans_JP: () => ({ className: 'font-jp' }),
  Inter: () => ({ className: 'font-en' }),
}));

afterEach(() => {
  cleanup();
});
