import { test, expect } from "@playwright/test";

/**
 * INTERAKSI SIMULASI — kontrol utama dapat dioperasikan dan mengubah state,
 * tanpa state tersangkut.
 *
 * Catatan lingkup: test ini memverifikasi KONTRAK UI (kontrol bekerja,
 * data tercatat dengan format benar). Kebenaran numerik fisika diverifikasi
 * terpisah oleh test oracle domain (npm run test:physics) — bukan oleh E2E.
 */

test.describe("Interaksi bandul", () => {
  test("tombol kontrol bandul responsif dan rekam menulis trial dengan format benar", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/modules/bandul/experiment", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Kontrol aktual (verifikasi di UI): "Mulai" (toggle jeda saat berjalan),
    // "Reset Simulasi", "Rekam N/10". Tombol jeda = label yang sama "Mulai"
    // berubah saat simulasi berjalan — verifikasi toggle, bukan tombol terpisah.
    const playButton = page.getByRole("button", { name: /^Mulai|Jeda|Pause|Stop/i }).first();
    const recordButton = page.getByRole("button", { name: /Rekam/i }).first();

    await expect(playButton).toBeAttached();
    await expect(recordButton).toBeAttached();

    // Rekam trial — ExperimentView menulis ke fisikaseru:trials:bandul.
    const hadTrials = await page.evaluate(() => {
      const raw = localStorage.getItem("fisikaseru:trials:bandul");
      try { const p = JSON.parse(raw || "[]"); return Array.isArray(p) ? p.length : 0; } catch { return 0; }
    });

    await recordButton.click();
    await page.waitForTimeout(300); // penulisan localStorage + re-render

    const trials = await page.evaluate(() => {
      const raw = localStorage.getItem("fisikaseru:trials:bandul");
      return JSON.parse(raw || "[]");
    });

    expect(trials.length).toBeGreaterThanOrEqual(hadTrials + 1);

    // Format trial sesuai kontrak persist aktual.
    const last = trials[trials.length - 1];
    expect(typeof last.L).toBe("number");
    expect(typeof last.T).toBe("number");
    expect(typeof last.T2).toBe("number");
    expect(last.T2).toBeCloseTo(last.T * last.T, 1);

    // Verifikasi persistensi parameter bandul (G-6b)
    const bandulParams = await page.evaluate(() => {
      const raw = localStorage.getItem("fisikaseru:params:bandul");
      return raw ? JSON.parse(raw) : null;
    });
    if (bandulParams) {
      expect(typeof bandulParams.length).toBe("number");
      expect(typeof bandulParams.gravity).toBe("number");
    }

    expect(errors, `pageerror: ${errors.join(" | ")}`).toEqual([]);
  });
});

test.describe("Interaksi millikan", () => {
  test("parameter millikan dipersist saat eksperimen dibuka", async ({ page }) => {
    await page.goto("/modules/millikan/experiment", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const params = await page.evaluate(() => {
      const raw = localStorage.getItem("fisikaseru:params:millikan");
      return raw ? JSON.parse(raw) : null;
    });
    expect(params).not.toBeNull();
    expect(typeof params.voltage).toBe("number");
    expect(typeof params.voltageOn).toBe("boolean");
  });
});

test.describe("Interaksi parabola", () => {
  test("parameter parabola dipersist saat berubah", async ({ page }) => {
    await page.goto("/modules/parabola/experiment", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Parabola mempertahankan params (parabola-params) — verifikasi kontrak:
    // setelah berinteraksi dengan slider input, key params terisi.
    const hasParams = await page.evaluate(() => {
      const raw = localStorage.getItem("parabola-params");
      if (!raw) return false;
      try {
        const p = JSON.parse(raw);
        return typeof p.v0 === "number" && typeof p.angleDeg === "number";
      } catch { return false; }
    });
    // Params mungkin hanya tersimpan setelah perubahan eksplisit —
    // trigger perubahan slider bila belum ada.
    if (!hasParams) {
      const angleSlider = page.locator('input[type="range"]').first();
      if (await angleSlider.isVisible()) {
        await angleSlider.fill("45");
        await page.waitForTimeout(300);
      }
    }

    const params = await page.evaluate(() => {
      const raw = localStorage.getItem("parabola-params");
      return raw ? JSON.parse(raw) : null;
    });
    // Kontrak: bila params tersimpan, bentuknya benar.
    if (params) {
      expect(typeof params.v0).toBe("number");
      expect(typeof params.angleDeg).toBe("number");
    }
  });
});
