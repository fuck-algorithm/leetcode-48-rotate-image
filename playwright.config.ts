import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:54321/leetcode-48-rotate-image/',
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: ['--host-resolver-rules=MAP github.com ~NOTFOUND, MAP api.github.com ~NOTFOUND'],
    },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 54321',
    url: 'http://127.0.0.1:54321/leetcode-48-rotate-image/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
