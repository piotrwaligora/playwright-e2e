import { defineConfig, devices } from '@playwright/test';

/** Set CI=true (GitHub Actions does it automatically) to get CI behaviour locally. */
const isCI = !!process.env.CI;

/**
 * Playwright configuration: https://playwright.dev/docs/test-configuration
 * Every value can be overridden per project or per test.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fails the CI run if a `test.only` was committed by mistake
  forbidOnly: isCI,
  // The application is a public demo app, so one retry on CI absorbs network hiccups.
  // Locally a failure shows up immediately.
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,

  // Console progress + HTML report (open it with `npm run report`)
  reporter: [['list'], ['html', { open: 'never' }]],

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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Firefox is disabled for now: Playwright's Firefox fails to start on the author's Windows machine
    // ("side-by-side configuration is incorrect", dependent assembly mozglue).
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
