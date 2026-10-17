import { test, expect } from "@playwright/test";

/**
 * HYDRATION & NAVIGASI — tidak ada hydration mismatch (React error konsol),
 * navigasi client-side antar halaman bekerja.
 */

test.describe("SSR & hydration", () => {
  for (const slug of ["parabola", "bandul", "millikan"]) {
    test(`hydration bersih di halaman refleksi ${slug} (SSR)`, async ({ page }) => {
      const hydrationErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && /hydrat|did not match|server rendered|Minified React error/i.test(msg.text())) {
          hydrationErrors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        if (/hydrat/i.test(err.message)) hydrationErrors.push(err.message);
      });

      await page.goto(`/modules/${slug}/reflection`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      expect(
        hydrationErrors,
        `hydration errors: ${hydrationErrors.join(" | ")}`,
      ).toEqual([]);
    });
  }
});

test.describe("Navigasi client-side", () => {
  test("dari katalog → modul → lab → analisis → refleksi (bandul)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/modules", { waitUntil: "domcontentloaded" });

    // Klik kartu modul Bandul Sederhana — halaman modul bandul langsung
    // me-render ExperimentView (lab) di /modules/bandul/experiment.
    await page.getByRole("link", { name: /Bandul Sederhana/i }).first().click();
    await page.waitForURL("**/modules/bandul**");
    await page.waitForLoadState("networkidle");
    // Pastikan kita berada di lab (view eksperimen termuat).
    await expect(page.getByRole("button", { name: /^Mulai/i })).toBeVisible();

    // Lab → analisis: tombol step header "4 Analisis" (hidden di <md; viewport
    // desktop default) atau link bila >= 3 trial. Klik tombol step; bila tak
    // tersedia (viewport), gunakan link header "Refleksi" untuk client-side nav.
    const stepAnalysis = page.getByRole("button", { name: /4\s*Analisis|^Analisis$/i }).first();
    if (await stepAnalysis.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await stepAnalysis.click();
      await page.waitForURL("**/modules/bandul/analysis**");
      await page.waitForLoadState("networkidle");
    } else {
      await page.goto("/modules/bandul/analysis", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
    }

    // Analisis → refleksi via link header (client-side navigation).
    await page.getByRole("link", { name: /Refleksi/i }).first().click();
    await page.waitForURL("**/modules/bandul/reflection**");
    await page.waitForLoadState("networkidle");

    expect(errors, `pageerror: ${errors.join(" | ")}`).toEqual([]);
  });
});
