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
| G-2 | Uji guru/siswa nyata belum dijalankan | klaim UX tetap non-empiris | protokol 5 guru + 8 siswa |
| G-3 | E2E browser otomatis belum ada (O-9) | regresi UI tak terkunci; verifikasi persist parabola di level tsc/build | Playwright suite |
| G-4 | 89 error lint tersisa (debt `any`, setState-in-effect, escape) (O-8) | technical debt; beberapa pola setState-in-effect berisiko render berantai | pengetikan + refactor bertahap |
| G-5 | Monitoring/observabilitas belum ada (O-7) | insiden produksi tak terdeteksi | error-rate + latency sederhana |
| G-6 | HUD R-teori membocorkan jawaban (O-5); state bandul/millikan tak persist | pedagogi & konteks | keputusan desain + replikasi pola persist |
| G-7 | ~~`calculateMassFromRadius` (ρ tanpa apung) dead-code di Millikan~~ **TERSELESAIKAN (18 Okt 2026):** fungsi dead-code dihapus dari `src/features/millikan/simulation/physics.ts` setelah verifikasi 0 referensi pemanggil. | P3 — miskonsepsi bila kelak dipakai | — |
| G-8 **(BARU)** | ~~Diskrepansi nomor keputusan CP Fisika F: file "046", isi "064"~~ **TERSELESAIKAN (17 Okt 2026):** nomor resmi = **046/H/KR/2025** — diverifikasi eksternal oleh pengguna dari salinan keputusan resmi (bpmpbabel.kemendikdasmen.go.id, KepKaBSKAP-046_2025-ttg-CP.pdf) + siaran pers Kemendikdasmen 23 Jun 2026 (Keputusan 020/2026 hanya mengubah CP Agama & Budi Pekerti). Teks "064" dalam docx = kesalahan dokumen sumber; dokumen sumber TIDAK diubah — catatan bibliografi (registry + PHYSICS-SOURCE-MATRIX) yang dikoreksi. Bukti & tanggal tercatat. | tertutup | — |
| G-9 **(BARU)** | Bandul tidak didukung CP/ATP dari dokumen yang ditelaah (Fase E & F) | klaim alignment bandul tidak dapat dipertahankan | **KEPUTUSAN PENGGUNA (17 Okt 2026):** posisi pedagogis sementara = **PENGAYAAN**; status kurikulum tetap `NEEDS_REVIEW` hingga dokumen pendukung ditemukan / keputusan guru. Tercatat di CP-ALIGNMENT-MATRIX. Status ini bukan bukti bandul tidak relevan — hanya bukti belum didukung sumber yang diperiksa |

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
