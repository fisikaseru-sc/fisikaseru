import { test, expect } from "@playwright/test";

/**
 * PERSISTENSI & ISOLASI — data yang dirancang tersimpan dapat dipulihkan
 * setelah reload, dengan kunci dan format localStorage yang kompatibel;
 * state antar modul tidak bocor.
 *
 * Kontrak persistensi aktual (verifikasi langsung di source):
 * - bandul:   fisikaseru:trials:bandul        → TrialRecord {id,L,T,T2,g?}
 * - millikan: fisikaseru:trials:millikan      → TrialRecord {id,r,V,tf,tr,method,q,n}
 * - parabola: parabola-params                 → {v0,angleDeg,g,h0}
 */

test.describe("Persistensi trials (format kompatibel)", () => {
  test("bandul: data tersimpan dipulihkan di halaman analisis setelah reload", async ({ page }) => {
    // Seed data historis sesuai format yang ditulis ExperimentView.
    await page.goto("/modules/bandul/analysis", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("fisikaseru:trials:bandul", JSON.stringify([
        { id: 1, L: 0.20, T: 0.897, T2: 0.804, g: 9.80665 },
        { id: 2, L: 0.40, T: 1.268, T2: 1.608, g: 9.80665 },
        { id: 3, L: 0.60, T: 1.553, T2: 2.412, g: 9.80665 },
        { id: 4, L: 0.80, T: 1.792, T2: 3.211, g: 9.80665 },
      ]));
    });

    // Reload — data harus dipulihkan (bukan fallback demo).
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Banner "data contoh" hanya muncul bila TIDAK ada data tersimpan.
    await expect(page.getByText(/Ini adalah data contoh/i)).toHaveCount(0);

    // Tabel data menampilkan data seed (L = 0.20 m).
    await expect(page.locator("table").first()).toContainText("0.20");
  });

  test("millikan: data tersimpan dipulihkan di halaman analisis setelah reload", async ({ page }) => {
    await page.goto("/modules/millikan/analysis", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      // Minimal 5 tetes — gerbang "Data Observasi Belum Cukup" menuntut >= 5.
      localStorage.setItem("fisikaseru:trials:millikan", JSON.stringify([
        { id: 1, dropletLabel: "Tetes A", r: 1.50, V: 300, tf: 4.17, tr: 14.30, method: "dynamic", q: 4.72, n: 3 },
        { id: 2, dropletLabel: "Tetes B", r: 1.50, V: 400, tf: 4.17, tr:  6.82, method: "dynamic", q: 6.25, n: 4 },
        { id: 3, dropletLabel: "Tetes C", r: 1.20, V: 350, tf: 6.51, tr:  8.95, method: "dynamic", q: 4.61, n: 3 },
        { id: 4, dropletLabel: "Tetes D", r: 1.80, V: 450, tf: 2.89, tr:  5.61, method: "dynamic", q: 7.83, n: 5 },
        { id: 5, dropletLabel: "Tetes E", r: 1.50, V: 300, tf: 4.17, tr: 14.30, method: "dynamic", q: 4.75, n: 3 },
      ]));
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Millikan AnalysisView memakai desain multi-stage (tanpa banner demo);
    // bukti pemulihan: log data observasi menampilkan tetes seed,
    // dan bukan gerbang "data belum cukup" (yang hanya muncul bila < 5).
    await expect(page.getByText(/Belum Cukup/i)).toHaveCount(0);
    await expect(page.locator("table").first()).toContainText("Tetes A");
    await expect(page.locator("table").first()).toContainText("1.50");
  });

  test("data korup jatuh ke fallback demo, bukan crash", async ({ page }) => {
    await page.goto("/modules/bandul/analysis", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("fisikaseru:trials:bandul", JSON.stringify([{ bukan: "trial" }]));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Fallback demo ditandai eksplisit — bukan crash/blank.
    await expect(page.getByText(/Ini adalah data contoh/i)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });
});

test.describe("Isolasi antar modul", () => {
  test("data bandul tidak bocor ke analisis millikan", async ({ page }) => {
    await page.goto("/modules/bandul/analysis", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("fisikaseru:trials:bandul", JSON.stringify([
        { id: 1, L: 0.20, T: 0.897, T2: 0.804 },
      ]));
    });

    await page.goto("/modules/millikan/analysis", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Key millikan kosong → fallback demo millikan (bukan data bandul).
    // Bukti isolasi: log data memuat demo millikan (Tetes A/B/...) dan
    // TIDAK memuat nilai bandul (mis. "0.897" / "1.268" dari data L/T bandul).
    const tableText = await page.locator("table").first().innerText();
    expect(tableText).toContain("Tetes");      // demo millikan
    expect(tableText).not.toContain("0.897");  // data bandul tidak bocor
  });
});
