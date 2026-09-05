import { defineConfig, devices } from "@playwright/test";

// 🎭 Malli Kids Phase 8 — Playwright was already a project dependency
// (unused); this is the first wiring of it. Points at the app's own real
// dev server (Mongo-backed, real Better Auth sessions) rather than any
// mock — every test here exercises the real stack end-to-end.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "fa-IR",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
