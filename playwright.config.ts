import { defineConfig, devices, type Project } from '@playwright/test';

/** Set CI=true (GitHub Actions does it automatically) to get CI behaviour locally. */
const isCI = !!process.env.CI;

/** Browser projects run the UI and hybrid tests; API tests have their own project. */
const browser = (name: string, device: string): Project => ({
  name,
  testIgnore: '**/api/**',
  use: { ...devices[device] },
});

/**
 * Playwright configuration: https://playwright.dev/docs/test-configuration
 * Every value can be overridden per project or per test.
 */
export default defineConfig({
  testDir: './tests',

  // Parallelism on one machine: 2 worker processes, each with its own browser.
  // Tests from every file are spread over both workers. The tested app is a free demo
  // server, so more workers would mostly slow it down. On CI the suite is also split
  // across machines with --shard (see .github/workflows/tests.yml).
  fullyParallel: true,
  workers: 2,

  // Fails the CI run if a `test.only` was committed by mistake
  forbidOnly: isCI,
  // The application is a public demo app, so one retry on CI absorbs network hiccups.
  // Locally a failure shows up immediately.
  retries: isCI ? 1 : 0,

  // Locally: console progress + HTML report (open it with `npm run report`).
  // On CI: console progress, annotations in the GitHub UI, and a "blob" per shard.
  // The blobs of all shards are merged into one HTML report afterwards.
  reporter: isCI ? [['list'], ['github'], ['blob']] : [['list'], ['html', { open: 'never' }]],

  // Web-first assertions such as toBeVisible() retry for up to 5 s (Playwright default)
  expect: { timeout: 5_000 },

  use: {
    // Relative URLs in page.goto() and request.post() use this address
    baseURL: process.env.BASE_URL ?? 'https://thinking-tester-contact-list.herokuapp.com',

    // A single click(), fill()... or page.goto() fails at that step instead of using up the whole test timeout
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    // Debugging artefacts are kept only for failed tests
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // API tests do not open a browser, so they run once instead of once per browser
    { name: 'api', testDir: './tests/api' },
    browser('chromium', 'Desktop Chrome'),
    browser('webkit', 'Desktop Safari'),
    // Firefox runs on CI (Linux). Locally it is off: Playwright's Firefox fails to start on the
    // author's Windows machine ("side-by-side configuration is incorrect", dependent assembly mozglue).
    ...(isCI ? [browser('firefox', 'Desktop Firefox')] : []),
  ],
});
