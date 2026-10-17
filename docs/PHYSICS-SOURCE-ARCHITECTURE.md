# FisikaSeru — Arsitektur Sumber Fisika Bersama

**Tanggal:** 17 Okt 2026 · **Status: IMPLEMENTED & TESTED** (19/19 regression test, `npm run test:isolation`)

## 1. Diagram arsitektur aktual

```text
/home/si/AI-Workspace/
├── Physics Source/                      ← SUMBER BERSAMA (read-only, DI LUAR repo)
│   ├── CP_2025_BSKAP_046H_KR_IPA.docx            [CURRICULUM_OFFICIAL]
│   ├── CP_2025_BSKAP_046H_KR_Fisika_Fase_F.docx  [CURRICULUM_OFFICIAL] ⚠ diskrepansi no. keputusan
│   ├── Analisis_CP_IPA_Fisika_Kelas_X_Fase_E.docx [ATP_OR_TEACHING_PLAN]
│   ├── Analisis_CP_Fisika_Fase_F_TP_ATP.docx      [ATP_OR_TEACHING_PLAN]
│   ├── Format_Modul_Ajar.docx                    [ATP_OR_TEACHING_PLAN, template kosong]
│   ├── Panduan_Pembelajaran_dan_Asesmen_2025.pdf [ASSESSMENT_GUIDANCE]
│   ├── Fisika_BS_KLS_XI.pdf                      [TEXTBOOK]
│   ├── Fisika_Kelas_XI_Erlangga.pdf              [TEXTBOOK, hasil scan]
│   ├── Fisika_Dasar_I_Mikrajuddin_Abdullah.pdf   [REFERENCE_BOOK]
│   └── Fisika_Dasar_II_Mikrajuddin_Abdullah.pdf  [REFERENCE_BOOK]
│
└── Codingan/Pribadi/FisikaSeru/         ← PROYEK (kepemilikan penuh)
    ├── src/…                            kode simulasi, UI, test
    ├── src/lib/physicsSources/registry.ts   ← JEMBATAN satu-satunya (read-only)
    ├── supabase/migrations/             database (cloud, milik proyek)
    ├── docs/                            audit, matriks, sertifikasi (milik proyek)
    └── .env.local                       PHYSICS_SOURCE_ROOT=/home/si/AI-Workspace/Physics Source
```

## 2. Keputusan yang diimplementasikan

| Keputusan (§1 prompt) | Implementasi | Bukti |
|---|---|---|
| Sumber bersama di `Physics Source/`, di luar repo | PDF/docx tidak pernah disalin; registry hanya menyimpan nama file + metadata | test: "Semua path sumber berada di luar repo" |
| Path eksternal dapat dikonfigurasi | `PHYSICS_SOURCE_ROOT` env var + default internal; resolver `resolvePhysicsSourceRoot()` di `src/lib/physicsSources/registry.ts` | test: env var, default, blank, missing |
| Path ber-spasi didukung | `Physics Source` (ada spasi) — diuji untuk default DAN env var | 2 test lulus |
| Path hilang → pesan membantu, non-fatal | error string menyebut env var + "Simulasi tetap berjalan"; resolver tidak pernah melempar exception | test lulus |
| Bukan database operasional bersama | registry hanya metadata yang ditelaah auditor; tidak ada indexing/cache/file write | test: registry.ts read-only |
| Tidak hardcode path di banyak file | 1 konstanta `DEFAULT_ROOT` + 1 env var; seluruh resolusi lewat satu fungsi | grep: hanya registry.ts |
| Jangan scan dokumen tiap request | registry memuat metadata hasil telaah audit (statis), bukan isi dokumen; tidak ada pembacaan PDF runtime | desain + test |

## 3. Alur baca sumber

1. **Audit-time (offline, oleh auditor/manusia):** dokumen dibaca dari `Physics Source/` (pdftotext/python-docx/OCR) → hasil telaah (bab, halaman, klaim, keterbatasan) dicatat di `REVIEWED_SOURCES` (registry.ts) + `docs/PHYSICS-SOURCE-MATRIX.md`.
2. **Runtime (opsional):** aplikasi memanggil `resolvePhysicsSourceRoot(process.env)` untuk tahu apakah sumber tersedia. `getSourceMeta(id)` memberi metadata klaim. **Tidak ada pembacaan isi PDF saat request.**
3. **Gagal akses:** dilaporkan sebagai data (`available: false` + pesan); tidak ada fallback ke dokumen lain; tidak ada kenaikan status validasi.

## 4. Kepemilikan & isolasi per proyek

| Artefak | Lokasi | Kepemilikan |
|---|---|---|
| Kode + konfigurasi | repo FisikaSeru | FisikaSeru |
| Database operasional | Supabase cloud (project sendiri; `NEXT_PUBLIC_SUPABASE_URL` env) | FisikaSeru |
| Data eksperimen siswa | `localStorage` browser per-siswa + tabel `trials` Supabase project ini | FisikaSeru |
| Migration | `supabase/migrations/001_init_schema.sql` | FisikaSeru |
| Test suite | `src/tests/` + `src/features/**/__tests__` | FisikaSeru |
| Audit, matriks, sertifikasi | `docs/*` | FisikaSeru |
| Sumber referensi | `Physics Source/` (shared, read-only) | workspace (bukan proyek) |

Isolasi lintas-proyek penuh **belum dapat diuji** — hanya ada satu proyek konsumen (FisikaSeru). Yang terverifikasi: FisikaSeru membaca sumber tanpa menulis ke sana, dan tidak ada artefak proyek yang bocor ke folder bersama (test + inspeksi manual). Proyek fisika lain di workspace (mis. `science-explorer-portfolio`) tidak diperiksa — di luar scope.

## 5. Keamanan dokumen & hak cipta

- PDF buku berhak cipta (Erlangga/BS/Mikrajuddin) **tidak ter-commit** — diverifikasi `git ls-files` (test otomatis).
- `.gitignore` menambah `docs/sources/` (proteksi jika kelak dipakai untuk material lokal).
- `.env.example` mendokumentasikan `PHYSICS_SOURCE_ROOT`.
- Registry menyimpan **hash 16-hex SHA-256** untuk identifikasi versi — bukan isi dokumen.
- Klaim `claim_supported` berupa ringkasan telaah (kutipan pendek seperlunya), bukan reproduksi isi.

## 6. Risiko & batas

| Risiko | Mitigasi/status |
|---|---|
| `DEFAULT_ROOT` hardcoded ke mesin ini | Env var menimpa default; test memastikan resolusi env-var benar. Di mesin lain, set `PHYSICS_SOURCE_ROOT`. |
| Diskrepansi nomor keputusan CP (file 046 vs isi 064) | Terdokumentasi di registry limitations + CP-ALIGNMENT-MATRIX; butuh konfirmasi sumber resmi BSKAP |
| Erlangga PDF scan → teks tak terekstrak | Status PARTIALLY_REVIEWED; hanya daftar isi via OCR; tidak dipakai untuk klaim konten |
| Registry bisa basi bila file sumber berubah hash | Test memverifikasi file ada; perbandingan hash penuh 64-hex bisa ditambah bila perlu |

## 7. Cara menambah sumber baru

1. Taruh file di `Physics Source/` (jangan di repo).
2. Telaah dokumen (pdftotext/python-docx/OCR), catat bab/halaman + keterbatasan ekstraksi.
3. Tambah entri ke `REVIEWED_SOURCES` di `src/lib/physicsSources/registry.ts`: status jujur (`DISCOVERED` bila baru ditemukan; `REVIEWED` hanya bila dibaca penuh), hash 16-hex, tanggal, proses reviewer.
4. Perbarui `docs/PHYSICS-SOURCE-MATRIX.md` + test count di `src/tests/sourceIsolation.test.ts` (`REVIEWED_SOURCES.length`).
5. Jalankan `npm run test:isolation`.
