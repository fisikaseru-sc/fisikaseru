# Evidence Index — Kolektor Bukti Otomatis (Playwright)

> **Klasifikasi: `AI_SIMULATED_USER_EVALUATION` — bukti observasi otomatis, bukan interaksi pengguna nyata.**
> Dikumpulkan: 2026-10-17, production build (`next build` + `next start -p 3311`), HEAD `5faba98`, Chromium via Playwright.
> Hasil: **67 file bukti, 0 pageerror JavaScript** (`pageerrors.json` = `[]`).

## Metode

Skrip kolektor (`.collect-evidence.tmp.mjs`, scratch di luar riwayat git) menjalankan langkah-langkah `docs/HUMAN-TESTING-PROTOCOL.md` (H1–H5) terhadap aplikasi berjalan dan merekam per langkah:

- **`.png`** — tangkapan layar viewport;
- **`.txt`** — `innerText` seluruh `body` (snapshot tekstual DOM);
- **`.ls.json`** — dump lengkap `localStorage` sesi (dipotong 400 char per kunci);
- **`.json` khusus** — nilai slider, tab-order keyboard, jumlah tombol preset.

Screenshot PNG (3,3 MB total) diarsipkan di luar repo (`/tmp/opencode/persona-eval/evidence/`, ephemeral) — hanya indeks dan bukti tekstual (dipadatkan ke `evidence-summary.json`) yang disimpan di repo agar jejak audit tetap ada tanpa membebani repository.

## Pemetaan skenario → bukti

| Skenario | File bukti (prefix) | Keterangan |
|---|---|---|
| H1 Parabola | `H1-1-experiment`, `H1-launch{30,45,60}`, `H1-reload`, `H1-analysis`, `H1-reflection`, `H1-sliders.json` | 3 peluncuran (θ=30/45/60, v₀=25, g=9.81) + persist reload + analisis & refleksi |
| H2 Bandul | `H2-1-experiment`, `H2-2-running`, `H2-2b-step-pengukuran`, `H2-3-5trials`, `H2-4-analysis`, `H2-5-experiment-back`, `H2-6-fresh-analysis-demo-banner`, `H2-7-after-reset`, `H2-presets.json` | 5 trial L=0.2–1.0 m, banner demo sesi baru, reset |
| H3 Millikan | `H3-1-experiment`, `H3-1b-prediction-locked`, `H3-2-spray-okular`, `H3-2b-instruments-done`, `H3-3-voltage`, `H3-4-5drops`, `H3-5-warning-off`, `H3-6-analysis`, `H3-7-analysis-reload` | Prediksi terkunci → checklist instrumen → 5 tetes terekam (Target 5/5) → analisis + reload. **Tahap "Cari Pola" tidak dijalankan (masih Terkunci) — lihat F-09.** |
| H4 Isolasi | `H4-1-millikan-analysis`, `H4-2-bandul-analysis-recovered`, `H4-1.ls.json` | Isolasi lintas modul + pulihan data bandul |
| H5 Aksesibilitas | `H5-tab-order.json`, `H5-focus` | 12 fokus Tab pertama pada halaman eksperimen bandul (step Pretest) |

## Indeks file (67)

| File | Ukuran |
|---|---|
| `H1-1-experiment.png` | 87,794 B |
| `H1-1-experiment.txt` | 845 B |
| `H1-1.ls.json` | 74 B |
| `H1-analysis.png` | 73,818 B |
| `H1-analysis.txt` | 723 B |
| `H1-launch30.ls.json` | 214 B |
| `H1-launch30.png` | 83,733 B |
| `H1-launch30.txt` | 850 B |
| `H1-launch45.ls.json` | 328 B |
| `H1-launch45.png` | 84,375 B |
| `H1-launch45.txt` | 864 B |
| `H1-launch60.ls.json` | 442 B |
| `H1-launch60.png` | 83,047 B |
| `H1-launch60.txt` | 877 B |
| `H1-reflection.png` | 61,573 B |
| `H1-reflection.txt` | 1,480 B |
| `H1-reload.ls.json` | 442 B |
| `H1-reload.png` | 85,005 B |
| `H1-reload.txt` | 876 B |
| `H1-sliders.json` | 2 B |
| `H2-1-experiment.png` | 90,458 B |
| `H2-1-experiment.txt` | 614 B |
| `H2-2-running.png` | 90,730 B |
| `H2-2-running.txt` | 614 B |
| `H2-2b-step-pengukuran.png` | 83,429 B |
| `H2-2b-step-pengukuran.txt` | 470 B |
| `H2-3-5trials.png` | 85,509 B |
| `H2-3-5trials.txt` | 523 B |
| `H2-3.ls.json` | 555 B |
| `H2-4-analysis.png` | 94,463 B |
| `H2-4-analysis.txt` | 1,113 B |
| `H2-4.ls.json` | 555 B |
| `H2-5-experiment-back.png` | 84,028 B |
| `H2-5-experiment-back.txt` | 523 B |
| `H2-6-fresh-analysis-demo-banner.png` | 96,701 B |
| `H2-6-fresh-analysis-demo-banner.txt` | 1,289 B |
| `H2-7-after-reset.png` | 84,247 B |
| `H2-7-after-reset.txt` | 523 B |
| `H2-presets.json` | 23 B |
| `H3-1-experiment.png` | 199,468 B |
| `H3-1-experiment.txt` | 1,512 B |
| `H3-1b-prediction-locked.png` | 161,530 B |
| `H3-1b-prediction-locked.txt` | 1,182 B |
| `H3-2-spray-okular.png` | 270,406 B |
| `H3-2-spray-okular.txt` | 1,177 B |
| `H3-2b-instruments-done.png` | 256,956 B |
| `H3-2b-instruments-done.txt` | 1,032 B |
| `H3-3-voltage.png` | 148,873 B |
| `H3-3-voltage.txt` | 1,032 B |
| `H3-4-5drops.png` | 141,280 B |
| `H3-4-5drops.txt` | 1,251 B |
| `H3-4.ls.json` | 1,036 B |
| `H3-5-warning-off.png` | 134,628 B |
| `H3-5-warning-off.txt` | 1,251 B |
| `H3-6-analysis.png` | 142,615 B |
| `H3-6-analysis.txt` | 1,771 B |
| `H3-7-analysis-reload.png` | 142,615 B |
| `H3-7-analysis-reload.txt` | 1,771 B |
| `H4-1-millikan-analysis.png` | 141,037 B |
| `H4-1-millikan-analysis.txt` | 1,827 B |
| `H4-1.ls.json` | 124 B |
| `H4-2-bandul-analysis-recovered.png` | 83,975 B |
| `H4-2-bandul-analysis-recovered.txt` | 1,032 B |
| `H5-focus.png` | 91,264 B |
| `H5-focus.txt` | 614 B |
| `H5-tab-order.json` | 1,029 B |
| `pageerrors.json` | 2 B |