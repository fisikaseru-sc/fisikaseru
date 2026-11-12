# Rencana Evaluasi Ronde 2 — 13 Persona (AI Simulated User Evaluation)

**Tanggal:** 12 Nov 2026
**Status label:** `AI_SIMULATED_USER_EVALUATION` — **bukan** `HUMAN_TESTING_COMPLETE`. Uji manusia nyata tetap PENDING (lihat `../2026-10-17-ai-persona/human-validation-followup.md`).
**Mandat:** Menyelesaikan sisa backlog ronde 1 (F-02, F-05, F-07, F-09, F-10, G-9) dengan mensimulasikan ulang via model-model AI yang aktif.

## 1. Perbedaan dengan ronde 1 (17 Okt 2026) — dicatat jujur

| Aspek | Ronde 1 | Ronde 2 |
|---|---|---|
| Provider | Semua via prefix `ag/` (agent lokal) | `ag/` kini DEAD (upstream 403). User eksplisit meminta "model-model AI yang aktif" → memakai gateway 9Router dengan **fallback lintas provider** |
| Alokasi model | Seragam | Bervariasi per persona (tabel §2) — setiap output ditandai model yang dipakai di header file |
| Basis aplikasi | `next start` build produksi | Sama — `next build` OK lalu `next start -p 3311` (log `/tmp/opencode/next3311.log`), `/modules/bandul/experiment` → HTTP 200 |
| Bukti diukur | Mix manual | Terkumpul dulu via Playwright (production build) SEBELUM persona membaca bukti — persona mengevaluasi berbasis bukti terukur, bukan asumsi |
| Kredit | Tidak relevan | **Dua model kehabisan kredit mid-run** (HTTP 402): `cai/kimi-k3` & `cai/minimax-m3` → persona S7/S8 gagal pada run utama dan **di-retry dengan model fallback** (`cbai/kimi-k2.6`, `cbai/glm-5.2`). Catatan fallback tertulis jujur di header file output |

Substitusi provider ini bukan penggantian diam-diam: semua output persona menyatakan model aslinya, dan `persona-runs2/_index.json` merekam kegagalan 402 pada run utama S7/S8.

## 2. Alokasi model per persona (terverifikasi `finish_reason == "stop"` + konten wajar)

| Persona | Model | Catatan |
|---|---|---|
| G1 | `cai/glm-5.3` | |
| G2 | `cai/gpt-5.6-sol` | |
| G3 | `cai/qwen3.8-max` | |
| G4 | `cbai/glm-5.2` | |
| G5 | `cai/deepseek-v4.1-flash` | |
| S1 | `cai/kimi-k3` | run utama sukses (sebelum kredit habis) |
| S2 | `cai/minimax-m3` | run utama sukses |
| S3 | `cbai/kimi-k2.6` | |
| S4 | `cbai/minimax-m3` | |
| S5 | `cai/deepseek-v4.1-flash` | |
| S6 | `cai/claude-haiku-5.5` | menolak mengaku identitas, tapi `finish_reason=stop` |
| S7 | `cbai/kimi-k2.6` | **retry** — run utama `cai/kimi-k3` gagal 402 |
| S8 | `cbai/glm-5.2` | **retry** — run utama `cai/minimax-m3` gagal 402 |

Model yang **dihindari** setelah probe ronde 2: `cbai/deepseek-v4.1-flash` (output terpotong `length` + injeksi teks safety). Probe awal: 9 model lulus dari `config/routing_truth.json` (refresh 12 Nov: `ag/` DEAD, `cai/` & `oc/` HEALTHY, `cbai/`/`routr/`/`gh/` DEGRADED).

## 3. Skenario yang dievaluasi

Persona identik dengan ronde 1 (5 guru G1–G5, 8 siswa S1–S8; lihat `../2026-10-17-ai-persona/{teacher,student}-personas.md`). Fokus sisa backlog:

- **F-02** — bandul: galat g pada preset Bumi/Bulan/Jupiter vs kriteria protokol `<2%`; kejelasan sumber galat bagi siswa
- **F-05** — aksesibilitas (slider, canvas, tombol ikon-only) — dikonfirmasi dengan audit Playwright E3/E3b
- **F-07** — parabola: gerbang prediksi & verifikasi ulang yang diminta S6
- **F-09** — Millikan: estimasi e di stage 4/5 vs kriteria protokol Δ<3% **dengan koreksi Cunningham**
- **F-10** — Millikan: alur discovery kandidat (E2/E2b end-to-end)
- **G-9** — kesesuaian CP/ATP (butuh dokumen resmi dari user; persona hanya menilai indikatif)

## 4. Bukti terukur (sebelum persona membaca)

| ID | Isi | Hasil kunci |
|---|---|---|
| E1 (earth5/moon3/jupiter3.json) | Bandul 5 titik Bumi, 3 titik Bulan & Jupiter | Bumi g=9.9710 (galat **1.68%** ✓<2%), Bulan **4.8%**, Jupiter **2.46%** (gRef kontekstual bekerja) |
| E2/E2b | Millikan discovery end-to-end | Kandidat default q_min=3.13 → buntu (dev 0.22); iterasi ke 1.60 (dev 0.054) → discovered=true → stage 4/5 terbuka; estimasi e ≈ 1.727×10⁻¹⁹ C, **Δ vs NIST = 7.80% — GAGAL kriteria protokol <3%** |
| E3/E3b | Audit a11y 5 halaman | 6 slider tanpa aria-label (4 bandul + 2 millikan), canvas parabola tanpa nama, 2 tombol ikon-only, console error Supabase di semua halaman |

Semua JSON + screenshot: `evidence/` (disalin dari `/tmp/opencode/persona-eval2/`).

## 5. Batas validitas

1. Frekuensi temuan = jumlah persona (dari 13) yang menyebut, BUKAN statistik populasi nyata.
2. Persona LLM punya bias over-inferensi — satu contoh tertriase: klaim G4 "aplikasi membatasi preset non-Bumi 3 trial" **tidak akurat** (bukti memang hanya merekam 3 nilai L karena skenario E1, bukan batas aplikasi; bandul tidak punya batas trial).
3. Klaim fisika/keputusan pedagogis tetap butuh verifikasi kode + persetujuan user sebelum diimplementasi.
