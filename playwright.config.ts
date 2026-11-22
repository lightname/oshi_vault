import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'e2e',
      testMatch: 'e2e/*.spec.ts',
    },
    {
      name: 'qa',
      testMatch: 'qa/*.spec.ts',
    },
    {
      name: 'og',
      testMatch: 'og/*.spec.ts',
    },
  ],
});
