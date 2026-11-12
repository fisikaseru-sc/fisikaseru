# FisikaSeru — Laporan QA & Sertifikasi (Audit Tahap 2)

**Tanggal:** 17 Okt 2026 · **Basis:** audit sertifikasi pertama (QA-CERTIFICATION-REPORT-2026-10-17.md) + audit sumber/CP/fisika/UX tahap ini · **Revisi:** `main` @ `699bd5e` + working tree (tidak di-commit, sesuai mandat)

## A. Ringkasan eksekusi

### Baseline (dijalankan ulang audit ini, bukan dikutip)
| Perintah | Hasil nyata |
|---|---|
| `npm run test:physics` | 34/34 asersi lulus |
| `npm run test:socratic` | 8/8 lulus |
| `npm run test:outcomes` | 6 grup lulus |
| `npx tsc --noEmit` | 0 error |
| `npm run build` | ✓ Compiled successfully; 10/10 static pages; EXIT 0 |
| `npm run lint` | mulai 138 error → **89 error** setelah perbaikan audit ini |

### Perubahan kode audit ini (4 file, semua diverifikasi)
| File | Perubahan | Verifikasi |
|---|---|---|
| `src/features/parabola/views3d/ProjectileScene3D.tsx` | ref-during-render violation → useEffect | lint error jenis react-hooks/refs hilang; tsc 0 |
| `eslint.config.mjs` | ignore test files untuk aturan require() (false positive: test dikompilasi tsc→CJS lalu dijalankan node) | lint −49 error |
| `src/features/parabola/components/ExperimentView.tsx` | (1) banner "Model ideal" (O-6); (2) persist parameter slider via localStorage dengan clamp+snap validasi (O-4); (3) hapus unused import | tsc 0; build lulus; lint netto tak bertambah |
| `docs/*` (4 file baru) | matriks sumber, matriks CP, laporan fisika, audit UX (artefak wajib) | — |

## B. Sertifikasi per modul

Kriteria: model berspesifikasi+teruji, test kritis lulus, alignment CP berbukti, alur belajar bekerja, visualisasi konsisten, tanpa defect kritis, klaim penggunaan terpenuhi.

| Modul | Validitas fisika | Test kritis | Verifikasi sumber | Alignment CP | Alur belajar | Sertifikasi |
|---|---|---|---|---|---|---|
| **Gerak Parabola** | PASS — model eksak spesifik, asumsi dinyatakan, θ_opt kontekstual | PASS — oracle 34 asersi | SOURCE_REVIEWED (parsial) — BS XI Bab 2D hal. 53–57 | **PARTIALLY_ALIGNED** — CP IPA Fase E verbatim + TP eksplisit gerak parabola; ATP pendukung belum terverifikasi identitas penulisnya | PASS — siklus utuh, persist parameter | **`CERTIFIED_WITH_LIMITATIONS`** |
| **Bandul** | PASS — nonlinier 2D/3D konsisten, koreksi amplitudo tervalidasi eliptik | PASS | SOURCE_REVIEWED (parsial) — Mikrajuddin I §7.2 hal. 501–503 + §13.3 | **NEEDS_REVIEW** (CP) + **pengayaan sementara** — keputusan pengguna 17 Okt 2026; CP Fase E/F yang ditelaah tidak memuat bandul/getaran | PASS — pretest→analisis→refleksi jujur | **`CERTIFIED_WITH_LIMITATIONS`** |
| **Millikan** | PASS — Stokes+Archimedes+Cunningham, konstanta NIST, satuan konsisten | PASS — socratic 8 + outcomes 6 grup | SOURCE_REVIEWED (parsial) — Mikrajuddin II §12.3 hal. 851–855 | **ENRICHMENT** — terkait "teori dasar fisika modern" CP F, bukan tuntutan CP langsung | PASS — anti-kebocoran e teruji | **`CERTIFIED_WITH_LIMITATIONS`** |
| Ohm / Jatuh Bebas / Boyle / Snellius | — | — | — | — | — | `NOT_AUDITED` (placeholder eksplisit, aman) |

**Pembaruan audit kedua (17 Okt 2026):** kolom "Verifikasi sumber" kini terpisah dari alignment. Sumber TELAH ditemukan di `Physics Source/` (di luar repo) dan ditelaah — detail di PHYSICS-SOURCE-MATRIX.md. Parabola naik dari NEEDS_REVIEW ke **PARTIALLY_ALIGNED** (kutipan CP verbatim + TP eksplisit; dibatasi karena dokumen ATP pendukung belum terverifikasi identitas penulisnya + diskrepansi nomor keputusan CP Fisika F: file 046 vs isi 064 — lihat G-8). Millikan diklasifikasi ulang jujur sebagai **ENRICHMENT**. Bandul tetap NEEDS_REVIEW — kini dengan bukti NEGATIF eksplisit (CP maupun ATP yang ditelaah tidak memuat getaran/bandul).

**Tidak ada modul yang naik ke `CERTIFIED` penuh** karena: dokumen ATP pendukung belum terverifikasi identitasnya, uji manusia nyata belum dijalankan, dan E2E browser belum ada. Empat dimensi (implementasi/numerik/sumber/kurikulum) dinilai terpisah dan tidak saling menggantikan.

## C. Gap terbuka

| ID | Gap | Dampak | Pemutus |
|---|---|---|---|
| G-1 | ~~Dokumen CP & buku referensi tidak ada~~ **TERSELESAIKAN (audit kedua):** sumber ditemukan di `Physics Source/` (di luar repo) & ditelaah — arsitektur registry diimplementasikan (`src/lib/physicsSources/registry.ts`, 19 test isolasi) | — | — |
| G-2 | Uji guru/siswa nyata belum dijalankan | klaim UX tetap non-empiris | **Paket uji manusia SIAP DIJALANKAN (12 Nov 2026)** — `docs/human-testing/`: informed consent (siswa + orang tua/wali, dan guru), template rekrutmen (email/WA guru + orang tua/wali + briefing guru), lembar observasi (checklist langkah H1–H5, 8 dimensi skala Likert 1–5, catatan verbatim, status LULUS/GAGAL/SEBAGIAN), pre-test/post-test (20 butir per modul + kunci + rubrik penskoran + toleransi galat), rubrik analisis kualitatif (kode tema + aturan pelaporan), skrip hitung tanpa dependensi (`node docs/human-testing/analisis-hasil.js <csv>` → rerata per dimensi, LULUS/GAGAL per skenario, selisih pre/post), contoh CSV (ditandai tegas "DATA CONTOH — BUKAN HASIL UJI NYATA"), dan papan pelacakan. **Status tetap PENDING:** belum ada satu pun skenario yang dijalankan manusia; semua angka di paket adalah data latihan. Yang tersisa: 5 guru + 8 siswa mengisi lembar, lalu analisis & laporan transparan |
| G-3 | ~~E2E browser otomatis belum ada (O-9)~~ **TERSELESAIKAN (ronde 1, 17–18 Okt 2026):** Playwright suite `e2e/smoke.spec.ts` — 22 test, di-regresikan hijau 12 Nov 2026 | tertutup | — |
| G-4 | ~~89 error lint~~ **TERSELESAIKAN (ronde 1)** → **debt warning juga tertutup (12 Nov 2026):** lint kini **0 error / 0 warning**. 97 warning tersisa (unused binding, `catch (_)`, exhaustive-deps) dibersihkan tanpa mengubah perilaku runtime: optional catch binding (`catch {}`), hapus binding mati, `useRef` untuk nilai yang tak boleh jadi dependensi efek (stopwatch), `useCallback` + helper di scope modul untuk loop kanvas, dan destructure anggota `useSimClock` (anggota `play/pause/setSpeed` stabil) agar dependensi efek eksplisit | tertutup | — |
| G-5 | ~~Monitoring/observabilitas belum ada (O-7)~~ **DIIMPLEMENTASI (12 Nov 2026):** error-rate + latency sederhana tanpa dependency eksternal. `src/lib/observability/metrics.ts` (store in-memory per proses via `globalThis`, jendela 15 menit, ring buffer 500 event, hanya data agregat — rute tanpa query string, jenis error, durasi); `src/instrumentation.ts` (`onRequestError` → catat error server + log JSON terstruktur); `src/proxy.ts` (Next 16: `middleware` deprecated → `proxy`) mengukur durasi proxy → header `Server-Timing: proxy;dur=…` (sengaja tidak dinamai `app`: proxy berjalan sebelum render, jadi durasi render TIDAK boleh diklaim); latensi halaman diukur dari Resource Timing sisi klien lalu diagregasi p50/p95; `src/app/api/telemetry/route.ts` (POST laporan error/latensi klien, divalidasi & dibatasi 4 KB); `src/app/api/metrics/route.ts` (GET snapshot: error-rate, p50/p95 latensi, uptime — opsional dikunci `METRICS_TOKEN`); `src/app/api/health/route.ts` (GET health check); `src/components/TelemetryReporter.tsx` (window error/unhandledrejection + sampel latensi navigasi, mounted di root layout). Uji: `npm run test:observability` 14/14 lulus; verifikasi manual end-to-end (client error ✓, server error via `onRequestError` ✓, sampel latensi ✓, header `Server-Timing` ✓, payload tak valid ditolak ✓) | ~~insiden produksi tak terdeteksi~~ → insiden & latensi **terlihat** (error-rate, p50/p95, uptime) | **Keterbatasan jujur:** store in-memory per proses → angka reset saat restart/deploy dan hanya mencakup satu instance pada deployment multi-instance; `metrics.ts` adalah titik sambung yang sama untuk diganti exporter (Sentry/OTel) tanpa mengubah kode pemanggil. Tidak ada data siswa yang dikumpulkan |
| G-6 | ~~HUD R-teori membocorkan jawaban (O-5); state bandul/millikan tak persist~~ **TERSELESAIKAN (18 Okt 2026):** R-teori di HUD & sidebar parabola dikunci sampai siswa mencatat ≥3 data (inkonsekuensi terbongkar teratasi); parameter kontrol bandul (`fisikaseru:params:bandul`) dan millikan (`fisikaseru:params:millikan`) dipersist ke localStorage dengan validasi batas & diuji E2E. | tertutup | — |
| G-7 | ~~`calculateMassFromRadius` (ρ tanpa apung) dead-code di Millikan~~ **TERSELESAIKAN (18 Okt 2026):** fungsi dead-code dihapus dari `src/features/millikan/simulation/physics.ts` setelah verifikasi 0 referensi pemanggil. | P3 — miskonsepsi bila kelak dipakai | — |
| G-8 **(BARU)** | ~~Diskrepansi nomor keputusan CP Fisika F: file "046", isi "064"~~ **TERSELESAIKAN (17 Okt 2026):** nomor resmi = **046/H/KR/2025** — diverifikasi eksternal oleh pengguna dari salinan keputusan resmi (bpmpbabel.kemendikdasmen.go.id, KepKaBSKAP-046_2025-ttg-CP.pdf) + siaran pers Kemendikdasmen 23 Jun 2026 (Keputusan 020/2026 hanya mengubah CP Agama & Budi Pekerti). Teks "064" dalam docx = kesalahan dokumen sumber; dokumen sumber TIDAK diubah — catatan bibliografi (registry + PHYSICS-SOURCE-MATRIX) yang dikoreksi. Bukti & tanggal tercatat. | tertutup | — |
| G-9 **(BARU)** | ~~Bandul tidak didukung CP/ATP dari dokumen yang ditelaah (Fase E & F)~~ **DITELUSURI ULANG & DITUTUP (12 Nov 2026):** asumsi lama "Kelas 11 Bab 5: Getaran" diuji, bukan diasumsikan. **Bukti negatif terkonfirmasi penuh** (pdftotext penuh atas PDF resmi CP Fisika Fase F + Panduan Pembelajaran dan Asesmen 2025 + docx Fase E/ATP → **0 hit** getaran/bandul/ayunan/osilasi). **Bukti positif ditemukan:** Buku Sekolah resmi Fisika XI (`SRC-BS-XI-2022`, Bab 5 "Gelombang, Bunyi dan Cahaya") memuat bandul eksplisit — "Energi mekanik pada bandul akan diubah menjadi getaran pada permukaan air…" (hal. 117) dan Aktivitas 5.6 resonansi bandul (hal. 134). CP Fisika Fase F elemen "Pemahaman Fisika" memuat "materi **mekanika**" + "Menganalisis hubungan gerak dan gaya" (PDF hal. 3 & 5). Status: **ENRICHMENT dengan bukti positif** (bukan ALIGNED — TP getaran tetap tidak ada). Klaim "Bab 5: Getaran" **tidak boleh** ditulis; yang benar "Bab 5 Gelombang". Tercatat verbatim di CP-ALIGNMENT-MATRIX + PHYSICS-SOURCE-MATRIX §G-9 + registry (`claim_supported` SRC-BS-XI-2022 diperbarui, uji registry 19/19 hijau) | ~~klaim alignment bandul tidak dapat dipertahankan~~ → alignment bersandar pada elemen mekanika CP Fase F + usage bandul di Buku Sekolah XI; keputusan kurikulum akhir tetap milik guru | **ditutup (12 Nov 2026)** — status ENRICHMENT, bukan NEEDS_REVIEW; clustering "Bab 5: Getaran" dikoreksi menjadi "Bab 5 Gelombang" |

## D. Perintah reproduksi

```bash
npm run test:physics && npm run test:socratic && npm run test:outcomes
npx tsc --noEmit && npm run build && npm run lint
```

Semua dijalankan pada audit ini dengan hasil §A. Tidak ada asersi/coverage yang dikarang; jumlah asersi berasal dari eksekusi nyata test runner.

## E. Jawaban pertanyaan pengguna: di mana menyimpan buku/sumber patokan

**Terjawab & terimplementasi (audit kedua):** sumber diputuskan disimpan DI LUAR repo, di folder bersama workspace:

```
/home/si/AI-Workspace/Physics Source/    # PHYSICS_SOURCE_ROOT (env var, dipakai src/lib/physicsSources/registry.ts)
```

- PDF/docx TIDAK disalin ke repo (hak cipta; test permanen memastikan tak ada PDF ter-commit).
- FisikaSeru membacanya via `PHYSICS_SOURCE_ROOT` (lihat `.env.example`); registry menyimpan hanya metadata + hash.
- `docs/sources/` tetap disiapkan di `.gitignore` hanya sebagai proteksi bila kelak dipakai untuk material lokal.
- Arsitektur lengkap: `docs/PHYSICS-SOURCE-ARCHITECTURE.md`; metadata per sumber: `docs/PHYSICS-SOURCE-MATRIX.md`.

## F. Status akhir audit ini

### Pembaruan audit kedua (17 Okt 2026, arsitektur sumber bersama)

- **Selesai & terbukti (audit pertama):** baseline reproduksibel; 3 suite hijau; tsc/build hijau; lint −49 error; 2 bug React nyata diperbaiki; O-4 & O-6 ditutup.
- **Selesai & terbukti (audit kedua):** sumber ditemukan di `Physics Source/` & ditelaah (8/10 dokumen, bab/halaman terverifikasi); registry + arsitektur sumber bersama diimplementasikan; 4 suite test hijau (69 asersi total, termasuk 19 test isolasi baru); tsc/build hijau; lint tetap 89 (netral); security repo terverifikasi + diregresikan; alignment parabola naik ke PARTIALLY_ALIGNED dengan kutipan verbatim.
- **Tidak bisa diselesaikan:** identitas penulis dokumen ATP (tidak tercantum di dokumen); diskrepansi nomor keputusan CP Fisika F (046 vs 064 — butuh konfirmasi pengguna); telaah isi Erlangga (PDF scan, OCR bahasa Indonesia tidak terpasang).
- **Belum dijalankan:** uji manusia; E2E browser; audit aksesibilitas sistematis; isolasi lintas-proyek penuh (hanya 1 proyek konsumen).
- **Tidak di-commit** — semua perubahan di working tree, menunggu instruksi pengguna.

## G. Pembaruan ronde 2 (12 Nov 2026) — evaluasi persona AI aktif + perbaikan clear-cut

Detail lengkap: [`evaluations/2026-11-12-ai-persona/`](evaluations/2026-11-12-ai-persona/findings.md) (label `AI_SIMULATED_USER_EVALUATION`).

### Perbaikan kode yang diimplementasi (clear-cut saja)

| Perbaikan | File |
|---|---|
| A11y F-05: aria-label slider (4 bandul + 2 millikan, termasuk Tegangan), teruskan aria-label Radix Root→Thumb, canvas 3D `role="img"`+`aria-label`, 4 tombol collapse/expand ikon-only | `bandul/ExperimentView.tsx`, `millikan/ExperimentView.tsx`, `ui/slider.tsx`, `PhysicsScene.tsx`, `ProjectileScene3D.tsx` |
| Console error Supabase → warning (pesan lokal, fitur inti tidak bergantung Supabase) | `src/lib/supabase/client.ts` |

### Perbaikan yang diimplementasi setelah keputusan user (12 Nov)

| Keputusan | Implementasi | Verifikasi |
|---|---|---|
| F-09 = pilihan A: e Stokes sebagai hasil utama; Cunningham jadi catatan diskusi | `millikan/AnalysisView.tsx` (`calculatedE_stokes` ke AhaMomentBanner), `ScientificExplanationSection.tsx` (headline Stokes, catatan koreksi tanpa sebabnya) | Playwright stage 5: headline Stokes ✓, catatan koreksi tanpa sebabnya ✓, header lama hilang ✓ |
| Jalur kandidat Millikan buntu → hint adaptif | `PatternDiscoveryTool.tsx` — `adaptiveHint` 3 level eskalasi (tanpa membocorkan jawaban; level 3 = reasoning GCD), `role="status"` | Playwright: level 1 muncul saat deviasi besar ✓, eskalasi GCD muncul setelah riwayat 3 kandidat gagal ✓ |
| F-02 → penjelasan sumber galat | `bandul/AnalysisView.tsx` — kotak "Dari mana galat ini berasal?" (noise stopwatch ±1,5% + koreksi amplitudo θ₀²) | Playwright: kotak + kedua penjelasan tampil ✓ |
| Mini-aktivitas massa bandul → ya, tambahkan | `bandul/ExperimentView.tsx` — kartu 3 langkah + pelacak `massProbe` + vonis live "T tetap" / peringatan bila L bergeser | Playwright: geser m → vonis "T tetap" ✓; geser L → peringatan ✓ |
| F-07 → verifikasi ulang dulu, hasilnya: biarkan gerbang terbuka (lunak) | Tidak ada perubahan kode | Playwright 3 jalur pintas terdokumentasi di findings ronde 2 §11 |

### Gate yang dijalankan ulang nyata (12 Nov, setelah semua implementasi)

| Gate | Hasil |
|---|---|
| lint / tsc / test:socratic / test:outcomes / test:physics / test:isolation / test:observability / build / E2E | **0 error / 0 warning** / 0 / 8/8 / lulus / lulus / 19/19 / 14/14 / sukses / **22/22** |
| Delivery Gate canonical workspace (`harnessctl gate -C <repo> --allow-restrictions`) | **PASS** (lint · typecheck · test · build terarsip) — 9 `eslint-disable` yang dilaporkan gate adalah **pre-existing di HEAD** (dengan alasan di komentar), bukan tambahan perubahan ini; `--allow-restrictions` dipakai karena itu, bukan untuk menutupi violation baru |
| Verifikasi fungsional ulang di build produksi | tidak ada `pageerror`; bandul 2D: stopwatch berjalan (1,83 s → 3,36 s) + kartu mini-aktivitas tampil; scene 3D bandul/parabola/millikan termuat; F-09A: headline Stokes + catatan "koreksi tanpa sebabnya"; `/api/health` ok, `/api/metrics` ok, header `Server-Timing: proxy;dur=` ada, `POST /api/telemetry` 200 |

## H. Audit UI/UX ronde 3 (12 Nov 2026)

Detail: [`UI-AUDIT-2026-11-12.md`](UI-AUDIT-2026-11-12.md) · label bukti `AI_SIMULATED_USER_EVALUATION` (audit agen AI di build produksi, bukan uji manusia).

| Dimensi audit (13 halaman × desktop + mobile) | Sebelum | Sesudah |
|---|---|---|
| Overflow horizontal di mobile | 4 halaman | **0** |
| Teks < 11px | ~120 | **0** |
| Pelanggaran kontras WCAG AA | ~60 | **0** (3 dekoratif/disabled) |
| Kontrol tanpa nama aksesibel | 3 | **0** |
| Error konsol / pageerror | 1 | **0** |
| Halaman tanpa `h1` | 12 | **0** |
| Target sentuh < 24px | 18 | 6 (link inline dalam kalimat — dikecualikan WCAG 2.5.8) |

Temuan utama: halaman lab bandul & millikan **tidak dapat dipakai di HP** (kanvas tertqueeze ~140px, tombol terpotong) — kini kanvas & panel ditumpuk vertikal di bawah `lg`; CTA "Pelajari Pendekatan Kami" **tak terlihat** (putih di atas putih, kontras 1.0:1); `createRadialGradient` melempar error saat kanvas belum berukuran; 327 mikro-label 8–10px dinormalisasi ke 11px.

Gate setelah perbaikan: lint 0/0 · tsc 0 · 4 suite test · build sukses · E2E 22/22 · `harnessctl gate` PASS.

### Sisa backlog setelah penutupan 12 Nov 2026

| Butir | Status setelah closure | Yang tersisa (tergantung pada manusia) |
|---|---|---|
| **G-5** observabilitas | ✅ tertutup — error-rate + latency sederhana, tanpa dependency baru; data agregat saja | Alerting & retensi lintas instance bila produksi multi-instance (store in-memory per proses) — titik sambung sudah disiapkan |
| **G-9** kesesuaian CP/ATP bandul | ✅ ditutup — bukti negatif (CP/ATP 0 hit) & bukti positif (Buku Sekolah XI Bab 5 memakai bandul) tercatat verbatim; status **ENRICHMENT dengan bukti positif** | Keputusan kurikulum akhir tetap milik guru/sekolah; klaim "Bab 5: Getaran" harus dikoreksi menjadi "Bab 5 Gelombang" |
| **G-2** uji manusia nyata | ⚠️ **tetap PENDING** — paketnya sudah siap eksekusi (informed consent, rekrutmen, lembar observasi, pre/post-test, rubrik, skrip hitung, pelacakan), tetapi **belum ada satu pun sesi yang dijalankan** | 5 guru + 8 siswa mengisi lembar, lalu analisis & laporan transparan |
| **Debt lint** | ✅ tertutup — 97 warning → **0 warning**, tanpa perubahan perilaku runtime | — |
