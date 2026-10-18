# Evaluation Plan — AI Simulated User Evaluation (13 Persona)

> **Klasifikasi: `AI_SIMULATED_USER_EVALUATION` — BUKAN `HUMAN_TESTING_COMPLETE`.**
> Tanggal: 2026-10-17. Repo: `main` @ `5faba98` (production build, `next start` port 3311).
> Status uji manusia nyata: **tetap PENDING** (lihat `human-validation-followup.md`).

## 1. Model yang benar-benar digunakan

Gateway 9Router (`http://127.0.0.1:20128/v1`), uji konektivitas lulus sebelum evaluasi.
Mandat: hanya model ber-prefix `ag/`.

Kenyataan terukur (probe per model, 17 Okt 2026): **hanya keluarga `ag/gemini-3.8-flash*` yang merespons 200**. Varian lain (`ag/gemini-4-argon-high`, `ag/gemini-3.7-flash*`, `ag/gemini-3.6-flash*`, `ag/gemini-3.1-pro*`, `ag/gemini-pro-agent`) gagal 503/403 (rate limit upstream). `ag/gpt-oss-120b-medium` gagal koneksi.

Oleh karena itu SEMUA persona dijalankan pada 4 varian effort `ag/gemini-3.8-flash` (high/medium/low/default) — masih dalam prefix `ag`, tidak ada substitusi diam-diam ke provider lain. Keberagaman model lebih rendah dari rencana awal; ini keterbatasan yang jujur dicatat.

| Persona | Model aktual |
|---|---|
| G1, S4 | `ag/gemini-3.8-flash-high` |
| G2, S5 | `ag/gemini-3.8-flash-high` (batch 1) |
| G4, S3, S7 | `ag/gemini-3.8-flash-medium` |
| G3, S6 | `ag/gemini-3.8-flash-low` |
| G5, S1, S2, S8 | `ag/gemini-3.8-flash` / varian sesuai log `persona-runs/run-log.json` |

Log lengkap: `persona-runs/run-log.json` (arsip bukti di luar repo: `/tmp/opencode/persona-eval/`).

## 2. Metode evaluasi

1. **Bukti observasi aktual dikumpulkan dulu** via Playwright (Chromium) menjalankan langkah protokol H1–H5 pada production build (`localhost:3311`): 67 file bukti (screenshot PNG, innerText halaman, nilai kontrol/slider, dump localStorage, tab-order keyboard). 0 pageerror JavaScript.
2. **Setiap persona = satu panggilan LLM independen** (tanpa memori antar-persona), menerima: profil persona + skenario asli `docs/HUMAN-TESTING-PROTOCOL.md` + bukti observasi aktual skenario terkait + referensi fisika terverifikasi (R=v₀²sin2θ/g; T=2π√(L/g) + koreksi amplitudo; e NIST 1.602176634e-19 C).
3. Persona diminta eksplisit: menandai "TIDAK TERAMATI" untuk hal tanpa bukti, tidak mengarang tampilan/waktu/klik.
4. Guru (G1–G5) menilai maksimal 3 masalah + bukti + keparahan + rekomendasi; siswa (S1–S8) memberi status per langkah (TASK_SUCCESS/PARTIAL/FAILURE/DESK_REVIEW_ONLY) + titik kebingungan.
5. Temuan persona kemudian **diverifikasi ulang terhadap kode sumber** oleh evaluator sebelum masuk `findings.md` (lihat kolom "verifikasi kode").

## 3. Cakupan protokol

| Skenario | Dijalankan bukti otomatis | Dinilai persona |
|---|---|---|
| H1 Parabola | Ya (6 langkah + reload + analisis + refleksi) | G1, G2, G3, G5, S1, S4, S6 |
| H2 Bandul | Ya (6 langkah termasuk banner demo & reset) | G1, G2, G4, S2, S5, S8 |
| H3 Millikan | Parsial — 5 tetes terekam, gerbang analisis terbuka, **tahap "Cari Pola"/estimasi e TIDAK dijalankan** (masih "Terkunci") | G1, G2, G4, S3, S7 |
| H4 Isolasi | Ya (3 langkah) | G4 |
| H5 Aksesibilitas | Parsial — tab-order keyboard saja; **screen reader & proyektor TIDAK teramati** | G3, G5 |

## 4. Keterbatasan (jujur)

- Persona AI tidak mengalakan aplikasi secara interaktif — mereka menilai **bukti observasi yang dikumpulkan otomatis**. Semua klaim interaksi tetap diklasifikasikan bukti otomatis, bukan pengalaman persona langsung.
- Frekuensi temuan dari 13 persona bukan statistik populasi guru/siswa nyata.
- Tahap discovery Millikan (Cari Pola → estimasi e) dan preset gravitasi non-Bumi pada H2 langkah 4 tidak terekam buktinya — tidak dinilai.
- Hanya keluarga model tunggal (`gemini-3.8-flash*`) yang tersedia; keragaman sudut pandang antar-model tidak tercapai.
- Keterbacaan visual (ukuran font di proyektor, kontras) tidak dapat dinilai dari innerText; butuh uji manusia.
