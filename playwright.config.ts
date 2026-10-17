import { defineConfig, devices } from "@playwright/test";

/**
 * E2E FisikaSeru — menjalankan aplikasi Next.js produksi (next build + next start)
 * agar yang diuji adalah bundle yang benar-benar dideploy.
 *
 * Catatan:
 * - webServer reuseExistingServer: dev server yang sudah jalan tidak dibunuh.
 * - Hanya Chromium untuk menjaga biaya pemeliharaan rendah; tambahkan proyek
 *   firefox/webkit bila diperlukan.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3311",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next start -p 3311",
    url: "http://127.0.0.1:3311",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
