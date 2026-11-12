# Findings — Ronde 2: Triase Gabungan 13 Persona (AI Simulated User Evaluation)

**Tanggal:** 12 Nov 2026 · **Label:** `AI_SIMULATED_USER_EVALUATION` (bukan uji manusia nyata)
**Basis:** bukti Playwright production build (port 3311) + output 13 persona di `persona-runs2/` (G1–G5, S1–S8).
**Frekuensi = jumlah persona (dari 13) yang menyebut temuan — BUKAN prevalensi populasi nyata.**

## Ringkasan konvergensi

| # | Temuan | Frekuensi | Keparahan | Status |
|---|---|---|---|---|
| R2-1 | Estimasi e Millikan Δ7.80% > 3% (F-09) | 6/13 | CRITICAL | **Akar masalah ditemukan** — fix menunggu keputusan user (lihat §1) |
| R2-2 | Jalur kandidat default Millikan buntu tanpa hint | 7/13 | HIGH | Keputusan pedagogis — menunggu user |
| R2-3 | Galat g non-deterministik (noise 1.5%) tanpa penjelasan sumber galat (F-02) | 6/13 | HIGH | Keputusan pedagogis — menunggu user |
| R2-4 | A11y: slider/canvas/tombol ikon-only tanpa nama aksesibel (F-05) | 8/13 | CRITICAL/HIGH | ✅ **DIPERBAIKI ronde 2** (lihat §4) |
| R2-5 | Console error Supabase di semua halaman | 13/13 | MEDIUM | ✅ **DIPERBAIKI ronde 2** (error → warn) |
| R2-6 | Mini-aktivitas massa bandul (miskonsepsi m→T) | 1/13 (S8) | HIGH | Keputusan pedagogis — menunggu user |
| R2-7 | Verifikasi ulang gerbang prediksi parabola (F-07) | 1/13 (S6) | — | Menunggu user |
| R2-8 | G-9 kesesuaian CP/ATP | indikatif | — | NEEDS_REVIEW — butuh dokumen CP/ATP resmi dari user |

## 1. R2-1 · F-09: estimasi e Δ7.80% — akar masalah TERVERIFIKASI di kode (koreksi ganda)

**Klaim persona:** estimasi e yang ditampilkan (≈1.727×10⁻¹⁹ C, Δ7.80%) gagal kriteria protokol <3%; dugaan awal persona: koreksi Cunningham tidak aktif.

**Verifikasi evaluator — justru sebaliknya: koreksi Cunningham DITERAPKAN DUA KALI.**

1. **Simulasi menghasilkan kecepatan terminal via Stokes murni, tanpa Cunningham** — `src/features/millikan/components/ExperimentView.tsx:50-61` (`millikanVelocities`): `vf = Fg / (STOKES_6PI · η · r)` — tidak ada faktor koreksi `cf`.
2. **`recordTrial` mengekstraksi q via Stokes murni juga** (6πηr·v·d/V) → karena drag simulasi = Stokes murni, q yang terekstraksi = n·e persis. Bukti data: rata-rata q/n eksperimen ≈ **1.596×10⁻¹⁹ C → Δ vs NIST hanya 0.4%** — akurat.
3. **Lapisan analisis kemudian mengalikan q dengan faktor Cunningham lagi** — `src/features/millikan/simulation/physics.ts:29` (`calculateCunninghamFactor`, C_A=1.257, λ=65nm) dan `deriveMillikanAnalysisResult` (:191) menghitung `qCorr = q·cf` → `calculatedE_corr = mean(qCorr/n)` ≈ 1.596 × 1.08 ≈ **1.727 → Δ7.80%**.
4. **UI menampilkan nilai terkoreksi-ganda ini** — `src/features/millikan/components/AnalysisView.tsx:399` (`calculatedE={calculatedE_corr}`) mengirim `calculatedE_corr` ke stage 4/5.

Kesimpulan: koreksi Cunningham memang ada dan bekerja, tetapi karena simulasi & ekstraksi q sudah Stokes-murni-konsisten, menerapkannya di analisis menjadi **koreksi ganda** yang justru memperbesar galat dari 0.4% → 7.8%.

**Pilihan perbaikan (keputusan fisika/pedagogis — menunggu user):**
- **A (disarankan):** tampilkan e dari q/n Stokes (Δ0.4%) dan jadikan koreksi Cunningham *opsional*/diskusi tambahan — konsisten dengan cara simulasi menghasilkan data. Perlu perubahan `calculatedE={calculatedE_corr}` → nilai stokes + label jelas.
- **B:** tambahkan Cunningham ke simulasi & ekstraksi q (ubah fisika recordTrial + velocities) — lebih "realistis" tetapi mengubah seluruh angka q yang sudah terekalibrasi dan lebih besar risikonya.
- **C:** biarkan, tapi tampilkan kedua nilai (stokes & corr) + penjelasan mengapa berbeda.

## 2. R2-2 · Jalur kandidat default Millikan buntu (7/13)

- **Bukti:** E2 — kandidat default q_min=3.13 memberi dev 0.22 (buntu); siswa harus mengganti kandidat ke 1.60 (dev 0.054) untuk membuka stage 4/5 (E2b berhasil).
- **Persona:** mayoritas menilai tanpa hint, siswa bisa terjebak tanpa petunjuk "deviasi masih besar → coba kandidat lain".
- **Status:** keputusan pedagogis (hint adaptif vs ubah default kandidat vs sediakan droplet n=1) — menunggu user.

## 3. R2-3 · F-02: noise 1.5% & sumber galat tidak dijelaskan (6/13)

- **Bukti:** E1 — Bumi 1.68% ✓, Bulan 4.8% ✗, Jupiter 2.46% ✓ (kriteria protokol <2%). Bulan gagal kriteria; noise 1.5% relatif pada T membuat 3 titik tidak deterministik.
- **Persona:** menyorot siswa tidak diberi penjelasan mengapa hasil beda antar-run (sumber galat: noise pengukuran + koreksi amplitudo θ₀²).
- **Status:** keputusan pedagogis (tampilkan penjelasan sumber galat? naikkan jumlah titik minimum preset non-Bumi? longgarkan kriteria Bulan?) — menunggu user.

## 4. R2-4 + R2-5 · Yang SUDAH diperbaiki ronde 2 (clear-cut)

| Perbaikan | File | Verifikasi |
|---|---|---|
| `aria-label="{label} ({unit})"` pada native range slider | `bandul/ExperimentView.tsx` (SliderField), `millikan/ExperimentView.tsx` (SliderField + slider Tegangan :1471) | audit ulang E5: 0 unlabeled range di 3 halaman |
| Teruskan `aria-label` Root→Thumb Radix (Radix tidak mewarisi otomatis) | `src/components/ui/slider.tsx` | 5 thumb parabola kini bernama ("Kecepatan awal", dst.) |
| Canvas 3D: `role="img"` + `aria-label` | `src/components/viz/three/PhysicsScene.tsx` (prop baru `ariaLabel`), `ProjectileScene3D.tsx` | scene parabola kini punya nama |
| 4 tombol collapse/expand ikon-only: `aria-label` + `aria-hidden` pada ikon | bandul `:519/:532`, millikan `:1358/:1371` | 0 tombol tanpa nama |
| Console error Supabase → warning + pesan lokal Indonesia | `src/lib/supabase/client.ts` | console kini warning, bukan error |

**Verifikasi ulang production build (E5, 12 Nov):** `bandul-step2`/`millikan-step2`/`parabola` → unlabeledRanges 0, unlabeledBtns 0; console hanya warning (Supabase) + deprecation THREE (pre-existing).

## 5. Temuan persona yang ditriase TIDAK AKURAT

- Klaim G4 "aplikasi membatasi preset non-Bumi menjadi 3 trial" — **salah**. Bukti E1 hanya merekam 3 nilai L karena desain skenario, bukan batas aplikasi; bandul tidak punya `MAX_TRIALS` (hanya Millikan punya, =5). Ini over-inferensi persona.

## 6. Gate setelah perbaikan (semua dijalankan nyata, 12 Nov)

| Gate | Hasil |
|---|---|
| `npm run lint` | 0 error (102 warning — pola lama `'_'` unused & exhaustive-deps, pre-existing) |
| `npx tsc --noEmit` | 0 error |
| `npm run test:socratic` | 8/8 lulus |
| `npm run test:outcomes` | semua grup lulus |
| `npm run test:physics` | semua asersi lulus |
| `npm run test:isolation` | 19/19 lulus |
| `npm run build` | sukses (setelah `rm -rf .next` — build turbopack gagal sekali dengan error import-map `next/font/google`, hilang setelah cache dibersihkan) |
| `npm run test:e2e` | **22/22 lulus** |
