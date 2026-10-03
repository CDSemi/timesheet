import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

/*
 * Browser tests (owner decision E-9). They drive the BUILT server (dist/) through a worker-scoped
 * fixture (tests/e2e/fixtures.ts) and run on a browser that is already installed: Microsoft Edge
 * by default, so nothing is downloaded. E2E_CHANNEL=chrome or chromium overrides it; 'chromium'
 * needs `npx playwright install chromium` first. Output, traces and screenshots go to the OS
 * temporary directory, never into the repository.
 */
const CHANNELS = ['msedge', 'chrome', 'chromium'] as const;
type Channel = (typeof CHANNELS)[number];

function browserChannel(): Channel {
  const requested = process.env.E2E_CHANNEL ?? 'msedge';
  const channel = CHANNELS.find((candidate) => candidate === requested);
  if (channel === undefined) throw new Error(`E2E_CHANNEL must be one of ${CHANNELS.join(', ')}; got ${requested}`);
  return channel;
}

const channel = browserChannel();

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  outputDir: join(tmpdir(), 'timesheet-e2e-output'),
  workers: 2,
  reporter: 'list',
  forbidOnly: true,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    channel,
    headless: true,
    screenshot: 'off',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
  ],
});
