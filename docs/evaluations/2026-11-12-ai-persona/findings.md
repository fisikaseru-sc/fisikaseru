# Findings — Ronde 2: Triase Gabungan 13 Persona (AI Simulated User Evaluation)

**Tanggal:** 12 Nov 2026 · **Label:** `AI_SIMULATED_USER_EVALUATION` (bukan uji manusia nyata)
**Basis:** bukti Playwright production build (port 3311) + output 13 persona di `persona-runs2/` (G1–G5, S1–S8).
**Frekuensi = jumlah persona (dari 13) yang menyebut temuan — BUKAN prevalensi populasi nyata.**

## Ringkasan konvergensi

| # | Temuan | Frekuensi | Keparahan | Status |
|---|---|---|---|---|
| R2-1 | Estimasi e Millikan Δ7.80% > 3% (F-09) | 6/13 | CRITICAL | ✅ **DIPERBAIKI ronde 2** — pilihan A user, lihat §7 |
| R2-2 | Jalur kandidat default Millikan buntu tanpa hint | 7/13 | HIGH | ✅ **DIPERBAIKI ronde 2** — hint adaptif (§8) |
| R2-3 | Galat g non-deterministik (noise 1.5%) tanpa penjelasan sumber galat (F-02) | 6/13 | HIGH | ✅ **DIPERBAIKI ronde 2** — penjelasan sumber galat (§9) |
| R2-4 | A11y: slider/canvas/tombol ikon-only tanpa nama aksesibel (F-05) | 8/13 | CRITICAL/HIGH | ✅ **DIPERBAIKI ronde 2** (lihat §4) |
| R2-5 | Console error Supabase di semua halaman | 13/13 | MEDIUM | ✅ **DIPERBAIKI ronde 2** (error → warn) |
| R2-6 | Mini-aktivitas massa bandul (miskonsepsi m→T) | 1/13 (S8) | HIGH | ✅ **DITAMBAHKAN ronde 2** — mini-aktivitas terarah (§10) |
| R2-7 | Verifikasi ulang gerbang prediksi parabola (F-07) | 1/13 (S6) | — | ✅ **TERVERIFIKASI Playwright** (§11) — biarkan terbuka |
| R2-8 | G-9 kesesuaian CP/ATP | indikatif | — | NEEDS_REVIEW — butuh dokumen CP/ATP resmi dari user |

## 1. R2-1 · F-09: estimasi e Δ7.80% — akar masalah TERVERIFIKASI di kode (koreksi tanpa sebabnya)

**Klaim persona:** estimasi e yang ditampilkan (≈1.727×10⁻¹⁹ C, Δ7.80%) gagal kriteria protokol <3%; dugaan awal persona: koreksi Cunningham tidak aktif.

**Verifikasi evaluator — justru sebaliknya: koreksi Cunningham DITERAPKAN DUA KALI.**

1. **Simulasi menghasilkan kecepatan terminal via Stokes murni, tanpa Cunningham** — `src/features/millikan/components/ExperimentView.tsx:50-61` (`millikanVelocities`): `vf = Fg / (STOKES_6PI · η · r)` — tidak ada faktor koreksi `cf`.
2. **`recordTrial` mengekstraksi q via Stokes murni juga** (6πηr·v·d/V) → karena drag simulasi = Stokes murni, q yang terekstraksi = n·e persis. Bukti data: rata-rata q/n eksperimen ≈ **1.596×10⁻¹⁹ C → Δ vs NIST hanya 0.4%** — akurat.
3. **Lapisan analisis kemudian mengalikan q dengan faktor Cunningham lagi** — `src/features/millikan/simulation/physics.ts:29` (`calculateCunninghamFactor`, C_A=1.257, λ=65nm) dan `deriveMillikanAnalysisResult` (:191) menghitung `qCorr = q·cf` → `calculatedE_corr = mean(qCorr/n)` ≈ 1.596 × 1.08 ≈ **1.727 → Δ7.80%**.
4. **UI menampilkan nilai terkoreksi-ganda ini** — `src/features/millikan/components/AnalysisView.tsx:399` (`calculatedE={calculatedE_corr}`) mengirim `calculatedE_corr` ke stage 4/5.

Kesimpulan: koreksi Cunningham memang ada dan bekerja, tetapi karena simulasi & ekstraksi q sudah Stokes-murni-konsisten (tidak ada slippage molekuler), menerapkannya di analisis menjadi **koreksi tanpa sebabnya** — koreksi untuk tetesan licin pada data yang sebenarnya tidak licin — yang justru memperbesar galat dari 0.4% → 7.8%. (Catatan terminologi: koreksinya hanya dieksekusi sekali — yang keliru adalah asumsi fisika di balik koreksi, yaitu asumsi slippage yang tidak terjadi.)

**Pilihan perbaikan (keputusan fisika/pedagogis):**
- **A (disarankan):** tampilkan e dari q/n Stokes (Δ0.4%) dan jadikan koreksi Cunningham *opsional*/diskusi tambahan — konsisten dengan cara simulasi menghasilkan data. Perlu perubahan `calculatedE={calculatedE_corr}` → nilai stokes + label jelas.
- **B:** tambahkan Cunningham ke simulasi & ekstraksi q (ubah fisika recordTrial + velocities) — lebih "realistis" tetapi mengubah seluruh angka q yang sudah terekalibrasi dan lebih besar risikonya.
- **C:** biarkan, tapi tampilkan kedua nilai (stokes & corr) + penjelasan mengapa berbeda.

## 2. R2-2 · Jalur kandidat default Millikan buntu (7/13)

- **Bukti:** E2 — kandidat default q_min=3.13 memberi dev 0.22 (buntu); siswa harus mengganti kandidat ke 1.60 (dev 0.054) untuk membuka stage 4/5 (E2b berhasil).
- **Persona:** mayoritas menilai tanpa hint, siswa bisa terjebak tanpa petunjuk "deviasi masih besar → coba kandidat lain".
- **Status:** ~~keputusan pedagogis~~ → **disetujui user 12 Nov: hint adaptif** (bukan ubah default kandidat, bukan droplet n=1). Diimplementasi (§8).

## 3. R2-3 · F-02: noise 1.5% & sumber galat tidak dijelaskan (6/13)

- **Bukti:** E1 — Bumi 1.68% ✓, Bulan 4.8% ✗, Jupiter 2.46% ✓ (kriteria protokol <2%). Bulan gagal kriteria; noise 1.5% relatif pada T membuat 3 titik tidak deterministik.
- **Persona:** menyorot siswa tidak diberi penjelasan mengapa hasil beda antar-run (sumber galat: noise pengukuran + koreksi amplitudo θ₀²).
**Status:** ~~keputusan pedagogis~~ → **disetujui user 12 Nov: tambahkan penjelasan sumber galat**. Diimplementasi (§7).

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

## 7. R2-1 · F-09 pilihan A — DIIMPLEMENTASI (12 Nov, keputusan user)

**Keputusan user:** pilihan A — tampilkan e Stokes (Δ0.4%) sebagai hasil utama; koreksi Cunningham jadi catatan diskusi opsional.

**Perubahan:**
- `src/features/millikan/components/AnalysisView.tsx` — `AhaMomentBanner` kini menerima `calculatedE={calculatedE_stokes}` (sebelumnya `calculatedE_corr`).
- `src/features/millikan/components/analysis/ScientificExplanationSection.tsx`:
  - Rumus stage 5 kini membaca e ≈ {calculatedE_stokes} "dari data pengukuranmu" (bukan e_corr).
  - Kartu hasil: headline = "Hasil Pengukuranmu (Hukum Stokes)" dengan Δ {errorPct_stokes} vs NIST; baris "+ Cunningham" dipindah ke tabel penjelas sebagai "Rekayasa ulang".
  - Catatan kuning baru yang jujur: di simulasi ini gerak tetesan mengikuti Stokes murni sehingga pengukuran sudah akurat, sementara koreksi Cunningham ada untuk mengompensasi tetesan yang licin (slippage) — kejadian yang tidak dimodelkan simulasi, sehingga menerapkannya melesetkan hasil; di laboratorium nyata koreksi ini memang dibutuhkan (~5% → <2%); ajakan membandingkan kedua angka dan berdiskusi.

**Verifikasi Playwright (production build, 12 Nov):** stage 5 → "Hasil Pengukuranmu (Hukum Stokes)" ✓, catatan koreksi-tanpa-sebabnya ✓, header lama "Rekomendasi (+ Cunningham)" tidak lagi ada ✓.

## 8. R2-2 · Hint adaptif kandidat buntu — DIIMPLEMENTASI (12 Nov)

`src/features/millikan/components/PatternDiscoveryTool.tsx`: memo `adaptiveHint` dengan eskalasi bertingkat, render sebagai kotak `role="status"` di bawah tips statis eksplorasi hipotesis:
- **Tidak muncul** bila sudah discovered (tidak mengganggu momen aha), belum ada usaha (belum geser kandidat/riwayat kosong), atau deviasi sudah baik.
- **Level 1** (bergeser tapi belum 2 kandidat diuji): "Kandidat ini belum konsisten. Uji kandidat lain…"
- **Level 2** (≥2 kandidat diuji / ≥2 gagal): mengarahkan membaca tabel rincian — "kandidat yang tepat membuat BANYAK titik sekaligus jatuh dekat bilangan bulat".
- **Level 3** (≥3 kandidat gagal): reasoning GCD tanpa membocorkan jawaban — "cari faktor persekutuan dari hasil bagi yang tergerombol…".

**Verifikasi Playwright:** kandidat digeser + deviasi besar → hint level 1 tampil ✓; riwayat 3 kandidat gagal (localStorage `fisikaseru:pattern-history:millikan`) → hint eskalasi GCD tampil ✓.

## 9. R2-3 · F-02 penjelasan sumber galat — DIIMPLEMENTASI (12 Nov)

`src/features/bandul/components/AnalysisView.tsx`: kotak "Dari mana galat ini berasal?" di bawah kartu galat g (hanya tampil saat regresi valid):
1. **Ketelitian stopwatch** — derau acak ±1,5% per pengukuran; makin banyak data, makin saling meniadakan (dikaitkan ke R²).
2. **Sudut ayunan besar** — T = 2π√(L/g) hanya persis untuk ayunan kecil; amplitudo besar memperpanjang T (≈ θ₀²/16) sehingga g hitung bergeser; ajakan merekam ulang dengan sudut 5–10°.

**Verifikasi Playwright:** kotak + kedua penjelasan tampil di analisis bandul dengan 3 data ✓.

## 10. R2-6 · Mini-aktivitas massa bandul — DIIMPLEMENTASI (12 Nov)

`src/features/bandul/components/ExperimentView.tsx` (langkah Pengukuran):
- Kartu "Mini-aktivitas · Apakah massa memengaruhi T?" dengan 3 langkah eksplisit (L tetap → geser m 2–3 langkah → bandingkan T).
- Pelacak state `massProbe` merekam T teoretis pada saat terakhir kali massa digeser; panel menampilkan "T @ m lama" vs "T @ m baru" secara live.
- Vonis otomatis "✓ T tetap — massa tidak memengaruhi periode!" bila kedua nilai sama (selisih <0,005 s), atau peringatan "karena L/θ₀ ikut bergeser? Kembalikan L…" bila tidak.

**Verifikasi Playwright:** kartu tampil, geser m 0.10→0.30 → 2 baris perbandingan + vonis "T tetap" ✓; kemudian geser L → peringatan konteks muncul ✓.

## 11. R2-7 · F-07 verifikasi ulang gerbang prediksi parabola (Playwright, 12 Nov)

Klaim ronde 1 (F-07): siswa bisa lanjut ke refleksi/analisis tanpa mengisi prediksi; kartu tebakan di analisis bisa disalin tanpa membaca grafik; isian refleksi tidak dinilai.

**Uji terarah (production build, 3 jalur pintas):**
1. **Akses langsung** `/modules/parabola/experiment` & `/analysis` tanpa `parabola-prediction` di localStorage → halaman terbuka penuh, tidak ada redirect.
2. **Refleksi tanpa prediksi** (3 trial seeded, prediksi kosong) → halaman refleksi tetap tampil (kartu "Prediksimu vs Temuan" kosong — vonis tidak dirender), 3 pertanyaan bisa diisi, tombol Selesai **tidak disabled**, klik → `parabola-completed` tersimpan ✓.
3. **Kartu "Tebakan terbaik datamu"** di analisis tetap tampil tanpa prediksi (menunjukkan sudut optimal dari data).

**Status gerbang:** default modul memang mengarahkan siswa ke `predict` dulu (halaman modul me-redirect ke `/modules/parabola/predict`), dan refleksi menampilkan vonis hanya bila ada prediksi. Celah tinggal: jalur pintas URL langsung & tombol Selesai tetap aktif tanpa prediksi.

**Keputusan user:** biarkan gerbang terbuka (lunak, bukan memaksa) — sesuai desain eksploratif modul; temuan dicatat sebagai karakteristik desain, bukan bug.
