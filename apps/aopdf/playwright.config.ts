import { defineConfig, devices } from '@playwright/test';

const localChromium = process.env.AOPDF_BROWSER_EXECUTABLE;

export default defineConfig({
  testDir: './tests/browser',
  timeout: 45_000,
  fullyParallel: false,
  // Both projects share one compiling dev server and memory-intensive PDF workers.
  // Serial execution prevents cross-project reloads and resource contention.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000/ao-pdf',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(localChromium
          ? { launchOptions: { executablePath: localChromium } }
          : {}),
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        ...(localChromium
          ? { launchOptions: { executablePath: localChromium } }
          : {}),
      },
    },
  ],
});
