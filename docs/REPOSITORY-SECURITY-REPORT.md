# FisikaSeru — Laporan Keamanan Repositori

**Tanggal:** 17 Okt 2026 · **Metode:** pemeriksaan `git ls-files`, index, staged/untracked, `.gitignore`, dan pencarian konten — dieksekusi nyata, hasil direproduksi oleh test otomatis `npm run test:isolation`.

## Status keseluruhan: `SAFE` (dengan 2 catatan remediasi opsional)

## 1. Pemeriksaan tracked files

| Pemeriksaan | Metode | Hasil |
|---|---|---|
| PDF ter-commit | `git ls-files` + filter `\.pdf$` | **NIHIL** — tidak ada PDF di Git |
| File secret/credential | `git ls-files` + filter `secret\|credential` | **NIHIL** |
| File `.env` aktual | `git ls-files` + filter `^\.env` | Hanya `.env.example` (template placeholder — aman, disengaja) |
| Database lokal (.db/.sqlite) | `git ls-files` + filter | **NIHIL** — tidak ada DB lokal sama sekali (Supabase cloud via env) |
| OCR/ekstraksi teks buku | `git ls-files` + inspeksi untracked | **NIHIL** — ekstraksi audit disimpan di `/tmp/opencode/` (di luar repo) |
| Cache/embedding sumber | inspeksi `.test-dist/` (gitignored) | hanya output kompilasi test — tidak berisi materi sumber |
| Log berisi data sensitif | inspeksi repo | tidak ada file log di repo |

**Verifikasi otomatis:** assertion "git ls-files: tidak ada PDF, .env, .db/.sqlite, atau 'secret' ter-commit" lulus dalam `npm run test:isolation` (19/19) — pemeriksaan ini kini bagian dari regresi permanen.

## 2. Staged & untracked (saat audit)

```
Staged:  (tidak ada)
Modified (unstaged):  eslint.config.mjs, package.json, .env.example, .gitignore,
                      src/features/parabola/{components/ExperimentView,views3d/ProjectileScene3D}.tsx,
                      docs/{QA-CERTIFICATION-REPORT,PHYSICS-SOURCE-MATRIX,CP-ALIGNMENT-MATRIX,PHYSICS-AUDIT-REPORT}.md
Untracked: docs/{LEARNING-UX-AUDIT,PHYSICS-SOURCE-ARCHITECTURE,REPOSITORY-SECURITY-REPORT,FINAL-VERIFICATION-REPORT}.md,
           src/lib/physicsSources/registry.ts, src/tests/sourceIsolation.test.ts
```

Tidak ada file sensitif atau berhak cipta dalam staged/untracked. Semua perubahan adalah kode/dokumentasi audit milik proyek.

## 3. `.gitignore`

Ditambahkan aturan baru (audit ini):

```gitignore
# Local-only source documents & extracted copyrighted content.
docs/sources/
```

- `Physics Source/` berada **di luar repo** — tidak perlu (dan tidak bisa) di-gitignore FisikaSeru.
- `docs/sources/` saat ini **tidak ada isinya** — aturan bersifat protektif untuk masa depan (jika pengguna kelak menaruh material lokal di sana), sesuai kebijakan Fase 4 prompt: tidak diterapkan membabi buta karena folder memang belum dipakai.
- `.env*` sudah ter-ignore sejak awal (konfigurasi Next.js default) — `.env.example` di-track secara eksplisit sebagai dokumentasi konfigurasi (praktik standar, tidak berisi secret).

## 4. PDF berhak cipta

| Dokumen | Status |
|---|---|
| Fisika_Kelas_XI_Erlangga.pdf (© 2013 Erlangga, Ni Ketut Lasmi) | DI LUAR repo (`Physics Source/`); tidak disalin, tidak di-commit, tidak di-LFS-kan |
| Fisika_BS_KLS_XI.pdf | sama |
| Fisika_Dasar_I/II_Mikrajuddin_Abdullah.pdf | sama |
| Dokumen kurikulum (CP/ATP/Panduan) | DI LUAR repo; dokumen pemerintah bebas disebar tapi tetap tidak di-commit — repo hanya memuat metadata + hash |

**Isi buku tidak direproduksi ke repo:** registry (`src/lib/physicsSources/registry.ts`) hanya memuat metadata + ringkasan klaim telaah (kutipan pendek seperlunya untuk keperluan audit, sesuai ketentuan Fase 4 butir 10). Ekstraksi teks lengkap selama audit disimpan sementara di `/tmp/opencode/psrc/` — di luar repo, di direktori temp yang disetujui.

## 5. Database & data lokal

- **Tidak ada database lokal** (tidak SQLite, tidak file .db) — diverifikasi pencarian berkas + grep kode.
- Database operasional = Supabase PostgreSQL cloud; kredensial via env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) — tidak ada di kode.
- Data eksperimen siswa: `localStorage` browser (per-siswa, per-origin) + tabel `trials` di project Supabase milik FisikaSeru — terisolasi dari proyek lain by design.
- Path database/konfigurasi **tidak menunjuk** ke `Physics Source/` — diverifikasi: satu-satunya referensi root sumber ada di `registry.ts` (read-only, diverifikasi test "registry.ts read-only").
- Migration (`supabase/migrations/001_init_schema.sql`) ter-track secara wajar (schema adalah kode proyek, bukan data produksi).

## 6. Remediasi

| Temuan | Status |
|---|---|
| Tidak ada temuan kritikal | — |
| `.env.example` memuat `GEMINI_API_KEY=your-groq-api-key` (inconsistensi nama — placeholder, bukan secret) | Catatan minor: README menyebut GEMINI_API_KEY; kode API route memakai GEMINI — tidak ada secret bocor; opsional dirapikan |
| `Zone.Identifier` files di `Physics Source/` (artefak Windows) | Di luar repo — bukan urusan Git FisikaSeru; tidak berdampak |

## 7. Batas pemeriksaan

1. Pencarian berdasar nama/ekstensi + inspeksi manual — file sensitif dengan nama menyamar (mis. `data.bin`) tidak terdeteksi oleh heuristik; namun tidak ada indikasi adanya file seperti itu (repo 141 file ter-track, seluruhnya kode/dokumentasi/konfigurasi standar Next.js).
2. Riwayat Git (`git log -p` penuh) tidak diaudit baris-per-baris — repo hanya punya 3 commit, semuanya hasil kerja sesi ini dan sebelumnya oleh agen/pengguna yang sama; tidak ada indikasi materi berhak cipta pernah masuk.
3. Remote `origin` ada (GitHub) — push TIDAK dilakukan (sesuai mandat); status "ahead 1" dari commit sebelumnya tetap tidak dipublikasikan oleh audit ini.
