import { test, expect } from "@playwright/test";

/**
 * SMOKE — halaman inti terbuka tanpa error runtime fatal.
 * Konten utama terlihat dan dapat diakses.
 */

const PAGES = [
  { url: "/", titleHint: /FisikaSeru|Fisika/i },
  { url: "/modules", titleHint: /.*/ }, // katalog modul
  { url: "/modules/parabola", titleHint: /.*/ },
  { url: "/modules/bandul", titleHint: /.*/ },
  { url: "/modules/millikan", titleHint: /.*/ },
];

test.describe("Smoke: halaman inti", () => {
  for (const p of PAGES) {
    test(`halaman ${p.url} termuat tanpa error fatal`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      const res = await page.goto(p.url, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBeLessThan(400);

      // Tunggu hidrasi selesai — konten klien interaktif muncul.
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();

      // Minimal ada konten teks (bukan halaman kosong/blank).
      await expect(page.locator("body")).toHaveText(/\S/);

      expect(errors, `pageerror: ${errors.join(" | ")}`).toEqual([]);
    });
  }
});

test.describe("Smoke: halaman eksperimen & analisis (client-side, dynamic ssr:false)", () => {
  for (const slug of ["parabola", "bandul", "millikan"]) {
    test(`experiment ${slug} termuat dengan konten lab`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(`/modules/${slug}/experiment`, { waitUntil: "domcontentloaded" });
      // View dimuat via dynamic(ssr:false) — tunggu konten klien muncul.
      await page.waitForLoadState("networkidle");

      // Eksperimen harus menampilkan sesuatu — header/footer/kontrol.
      await expect(page.locator("body")).toHaveText(/\S/);
      expect(errors, `pageerror: ${errors.join(" | ")}`).toEqual([]);
    });

    test(`analysis ${slug} termuat dengan konten analisis`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(`/modules/${slug}/analysis`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      await expect(page.locator("body")).toHaveText(/\S/);
      expect(errors, `pageerror: ${errors.join(" | ")}`).toEqual([]);
    });
  }
});
