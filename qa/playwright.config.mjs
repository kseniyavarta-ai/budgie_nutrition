import { defineConfig, devices } from "@playwright/test";
// LIVE=1 tests the deployed site instead of the local files.
const LIVE = !!process.env.LIVE;
const baseURL = process.env.BASE_URL || (LIVE ? "https://kseniyavarta-ai.github.io/budgie_nutrition/" : "http://localhost:4173/");
export default defineConfig({
  testDir: "tests",
  timeout: 30000,
  expect: { timeout: 6000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "results/results.json" }], ["html", { outputFolder: "results/html", open: "never" }]],
  use: { ...devices["iPhone 13"], browserName: "chromium", baseURL, timezoneId: "America/Edmonton", locale: "en-CA", trace: "retain-on-failure", screenshot: "only-on-failure" },
  outputDir: "results/artifacts",
  webServer: LIVE || process.env.BASE_URL ? undefined : { command: "node serve.mjs", url: "http://localhost:4173/index.html", reuseExistingServer: true },
});
