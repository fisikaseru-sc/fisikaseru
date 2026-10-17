# FisikaSeru — QA, Validasi Pedagogi & Sertifikasi Rilis
**Program 4-Sprint Terpadu · Laporan Akhir**

- Tanggal eksekusi: 17 Okt 2026
- Commit awal (baseline): `a590256` — "feat: grand refactor — shadcn/ui design system, 3D simulation layer, new Gerak Parabola module"
- Branch: `main` · Working tree awal: bersih (tidak ada perubahan pengguna yang tertimpa)
- Lingkungan: Linux, Next.js 16.2.6 (dev server port 3000 berjalan), Node + tsc, tanpa database live (Supabase hanya client stub), tanpa API key AI (fallback deterministik teruji)

---

## A. Executive Summary

**Kondisi awal.** Repository berisi 3 modul aktif (parabola, bandul, millikan) + 4 placeholder. Model fisika inti (projectile.ts, pendulum RK4, Millikan Stokes+Cunningham) berkualitas tinggi. Dua test suite lama lulus. Namun: 20 pelanggaran Rules-of-hooks (risiko crash nyata), 115 error lint, data demo tampil tanpa label di 2 halaman, dan sejumlah inkonsistensi fisika/pedagogi terverifikasi.

**Temuan terpenting yang DIPERBAIKI (12 perbaikan, semua dengan verifikasi):**
1. P1: Rules-of-hooks violation di AnalysisView bandul (early-return sebelum hooks) — crash potensial.
2. P1: Data demo ditampilkan sebagai hasil siswa di Analisis (bandul/millikan) & Refleksi tanpa label.
3. P1: Miskonsepsi bandul difabrikasi di refleksi (hardcoded, prediksi tidak pernah ditulis oleh modul).
4. P1: Vonis "sudut optimal 45°" mengabaikan h₀>0 (fisika salah untuk kasus umum).
5. P1: Bandul — preset gravitasi non-Bumi tanpa g tersimpan → analisis menghitung galat terhadap g Bumi.
6. P2: Millikan chamber-view: droplet membeku saat Fe<Fg (melanggar fisika).
7. P2: Mode 2D vs 3D bandul memakai redaman berbeda (0.012 vs 0).
8. P2: Reset data tanpa konfirmasi (bandul & millikan) + dua tombol "Reset" ambigu.
9. P2: MAX_TRIALS millikan (10) ≠ target misi (5).
10. P2: Readout periode kanvas 2D bandul ≠ rumus yang direkam (tanpa koreksi amplitudo).
11. P2: Tantangan Bulan parabola memakai v₀ lintas-gravitasi (salah konteks).
12. P3: Rasio Bulan dirender 16 digit; teks gerbang bandul kontradiktif dengan logika OR.

**Risiko terbesar yang TIDAK diselesaikan (lihat §H):** GATE_30 tidak ada dalam repositori (klaim prompt eksternal terhadap kode aktual — lihat §D), tidak ada CP/kurikulum alignment di UI, tidak ada uji manusia nyata, monitoring/rollback belum terimplementasi.

**Status sertifikasi akhir: `PASS_WITH_WARNINGS`** untuk 3 modul pilot sebagai produk pembelajaran beta — dengan batasan eksplisit di §J.

---

## B. Baseline dan Scope

| Item | Nilai terverifikasi |
|---|---|
| Commit | a590256 (main) |
| Working tree awal | clean |
| Framework | Next.js 16.2.6, React 19, TS 5, Tailwind 4, R3F 9 |
| Route aktif | 17 route (semua 200 OK — tapi lihat catatan §F: HTTP 200 ≠ bukti kualitas) |
| Modul aktif | parabola (penuh: predict/experiment/analysis/reflection), bandul, millikan |
| Test suite awal | test:socratic (8), test:outcomes (6 grup) — lulus |
| Test suite BARU | test:physics (34 asersi oracle numerik) — lulus |
| GATE_30 | **TIDAK DITEMUKAN** di src/, docs/, design.md, fisikaseru-full-pipeline.md |

---

## C. Sprint 1 — Fisika & Siklus Pembelajaran

### C.1 Gerak Parabola
**Model (terverifikasi dari `src/features/parabola/simulation/projectile.ts`):**
- Bentuk tertutup eksak: x(t)=v₀cosθ·t; y(t)=h₀+v₀sinθ·t−½gt². Tanpa hambatan udara (asumsi ideal — **tidak dinyatakan eksplisit ke siswa** → open issue O-6).
- `timeOfFlight` memakai akar kuadratik umum `(vy₀+√(vy₀²+2gh₀))/g` — benar untuk h₀≠0; rumus tanah `v₀²sin2θ/g` hanya dipakai sebagai overlay kurva teori (dijelaskan di UI sebagai "rumus buku pelajaran untuk peluncuran dari tanah").
- Integrator scene: fase terbang analitik + interpolasi titik silang y=0 (akurat), pantulan Euler hanya visual setelah mendarat — tidak memengaruhi data yang direkam (rangeX diambil di titik impact pertama).

**Oracle (34 asersi, `npm run test:physics`):** kinematika dasar; simetri 30°/60°; maksimum 45° pada h₀=0; tf kuadratik h₀>0; y(tf)=0; monotonic x; determinisme noise ber-seed; guard g≤0 & v₀=0; skala Bulan; koreksi amplitudo bandul vs deret eliptik (Δ<0.05%); T∝√L; θ_opt umum (regresi temuan audit).

**Siklus belajar:** prediksi (`parabola-prediction`) → eksperimen (`parabola-trials`) → analisis (grafik+teori) → refleksi (konfrontasi prediksi vs data). Kunci write↔read konsisten (diverifikasi berbagai jalur).

### C.2 Bandul
**Model:** 2D = Euler semi-implisit dengan nonlinier sin θ + redaman b=0.012; 3D = RK4 (dt 1/240) nonlinier. Rekam data: T = T₀(1+θ₀²/16) + noise 1.5% — koreksi amplitudo divalidasi terhadap deret eliptik. Perbaikan: redaman 2D/3D kini sama; readout layar = rumus rekam; g tersimpan per trial.

### C.3 Millikan
**Model (`simulation/physics.ts`):** Stokes + Archimedes + Cunningham (C_A=1.257, λ=65nm — nilai literatur), konstanta NIST. Metode seimbang & dinamis konsisten secara matematis (q=(6πηr(v_f+v_r)d)/V ≡ (mgd)/V saat melayang). Data: **sintetis ber-seed** (dataGenerator) — label "eksperimen realistis" di komentar kode, namun UI tidak mengklaim data lab nyata; RealLabGuideModal justru memisahkan simulasi vs lab nyata. Provenance: `SOURCE_PARTIAL` — konstanta fisika = literatur terverifikasi; data tetesan = sintetis (jujur jika ditanya).

### C.4 Integritas siklus (verifikasi + perbaikan)
- Prediksi tersimpan ✓ (parabola, millikan; bandul pakai pretest dengan kunci BERBEDA dari yang dibaca refleksi → kini refleksi tidak lagi fabrikasi miskonsepsi).
- Data demo fallback → kini berlabel jelas di Analisis & Refleksi.
- Vonis refleksi → kini memakai kondisi parameter aktual (θ_opt kontekstual, v₀ Bumi).
- Reset → kini berk onfirmasi; label dibedakan.

---

## D. Sprint 2 — GATE_30, Alignment, Validasi Semantik

**Temuan fundamental: GATE_30 TIDAK ADA dalam repositori.** Pencarian menyeluruh (src, docs, design.md, fisikaseru-full-pipeline.md 4268 baris, README) atas `GATE_30|gate30|gate_30|mandatory_concepts|allowed_concepts` → nol hasil. Kata "gate" hanya muncul untuk SLO monitoring API/PDF. Tidak ada pipeline generator materi, tidak ada rubrik, tidak ada validator semantik, tidak ada threshold yang bisa dikalibrasi.

**Konsekuensi:** seluruh Sprint 2 (kalibrasi GATE_30, benchmark adversarial, confusion matrix, mapping CP→TP) **TIDAK DAPAT DIJALANKAN terhadap objek yang tidak ada**. Melaporkannya sebagai "selesai" akan menjadi fabrikasi. Status: `BLOCKED — OBJEK TIDAK ADA`.

**Yang ADA dan telah diaudit sebagai pengganti struktural:**
- `ModuleConfig` contract (`src/lib/modules/types.ts`) — metadata + variabel + pertanyaan refleksi per modul; `configRegistry` → dipakai nyata oleh halaman refleksi (bukan dead code).
- Test suite socratic engine (8) — **ini adalah quality gate nyata yang terhubung**: menguji anti-kebocoran-jawaban ("Electron charge forbidden before discovery"), strategi kognitif, fallback deterministik — lulus.
- Test suite outcomes (6 grup) — evaluasi konseptual/transfer — lulus.
- **BARU:** oracle numerik fisika (34 asersi) — kini bagian dari gate regresi.

**Alignment kurikulum:** tidak ada dokumen CP di repositori. Satu-satunya referensi: `design.md:1013` "kurikulum_merdeka: ['Kelas 11, Bab 5: Getaran']" untuk bandul — status `PROPOSED` (desain, bukan dokumen CP resmi; tidak bisa diverifikasi). Level modul hanya field `level: "sma"` tanpa pemetaan CP. Status alignment: `NOT_VERIFIED` untuk ketiga modul.

**Validasi semantik (manual, terbatas):** inkonsistensi teks-vs-logika yang ditemukan persona (gerbang checklist, kontradiksi pretest vs koreksi amplitudo) telah diperbaiki — lihat §G.

---

## E. Sprint 3 — Riset Pengguna Multi-Persona

**Metode:** 2 subagent paralel (tersedia dan benar-benar dijalankan) mensimulasikan 5 persona: Guru Senior (konsep), Guru Teknologi Terbatas, Siswa Menengah (cemas matematika), Siswa Eksploratif, Siswa Kehilangan Konteks. **Ini simulasi AI eksploratif — BUKAN data empiris guru/siswa nyata.** Status validasi manusia: `PENDING_HUMAN_VALIDATION`.

**Temuan lintas-persona terverifikasi (setelah cross-check oleh orchestrator terhadap kode):** 12 isu pada §A; semuanya telah diperbaiki atau didokumentasikan. Konsistensi kunci localStorage diverifikasi tabel write↔read (semua cocok kecuali bandul-prediction yang memang tidak pernah ditulis — kini ditangani jujur).

**Temuan yang DIBUAT menjadi backlog (tidak diubah — preferensi/luar batas):** progressive disclosure analisis millikan (P2 preferensi), legenda simbol (P3), mode guru/CP panel (P1 kelemahan materi → open issue), HUD R-teori membocorkan jawaban (P2 kelemahan materi → open issue, butuh keputusan desain).

---

## F. Sprint 4 — Sertifikasi & Operasional

| Gate | Status | Bukti |
|---|---|---|
| A. Kebenaran ilmiah | **PASS** (3 modul) | 34/34 oracle; model diaudit baris-per-baris; 2 bug fisika diperbaiki (chamber-view, θ_opt h₀) |
| B. Kualitas pedagogis | **PASS_WITH_WARNINGS** | siklus predict→reflect utuh; konfrontasi prediksi jujur; CP alignment NOT_VERIFIED |
| C. Integritas sistem | **PASS** | tsc 0 error; build EXIT=0; 17 route 200; API socratic: validasi input + fallback deterministik teruji live |
| D. Pengalaman pengguna | **PASS_WITH_WARNINGS** | demo-data berlabel; reset berkonfirmasi; siswa persona-sim menyelesaikan alur; belum ada uji browser E2E otomatis |
| E. Operasional | **WARN** | tidak ada monitoring/error-tracking terimplementasi; log tidak membocorkan secret (diperiksa); rollback = git revert (prosedural, belum otomatis) |
| F. Provenance & audit | **PASS** | laporan ini + manifest; test dapat dijalankan ulang pada revision sama |

**Catatan jujur tentang "HTTP 200":** semua route mengembalikan 200, termasuk `/modules/nonexistent` (halaman "segera hadir" by-design) — status teknis saja tidak membuktikan kualitas; bukti kualitas berasal dari oracle + trace data + audit persona.

---

## G. Perubahan Kode (12 file diubah, 2 file baru)

| # | File | Akar masalah | Perubahan | Verifikasi |
|---|---|---|---|---|
| 1 | `src/features/bandul/components/AnalysisView.tsx` | early-return sebelum 20 hooks | guard dipindah setelah hooks | eslint rules-of-hooks 20→0 |
| 2 | sama | demo data tanpa label | `isDemoData` + banner amber | render terverifikasi; tsc ok |
| 3 | sama | galat selalu vs 9.80665 | `gRef` kontekstual dari trial | tsc ok; logika ditrace |
| 4 | `src/app/modules/[moduleSlug]/reflection/page.tsx` | dynamic() dalam render; miskonsepsi hardcoded; demo tanpa label | hoist dynamic; teks jujur tanpa prediksi; banner demo | eslint; tsc |
| 5 | `src/features/parabola/components/AnalysisView.tsx` | vonis 45° hardcode | `optimalAngleFor()` arctan umum + vonis & saran kontekstual | oracle baru: 45°@h₀=0, 38.1°@h₀=20, R(θ_opt)≥R(45°) |
| 6 | `src/features/parabola/components/ReflectionView.tsx` | v₀ lintas-g; rasio 16 digit | filter trial g-Bumi; toFixed(1) | tsc; logika ditrace |
| 7 | `src/features/bandul/components/ExperimentView.tsx` | 2D/3D redaman beda; T readout ≠ rekam; g tak tersimpan; reset tanpa konfirmasi; teks gerbang; label reset | damping=0.012 ke 3D; readout + koreksi θ₀²/16; `g` di trial; window.confirm; teks OR; label dibedakan | tsc; build |
| 8 | `src/features/millikan/components/ExperimentView.tsx` | droplet beku saat Fe<Fg; MAX 10 vs target 5; reset tanpa konfirmasi | physVel bertanda; MAX=5; confirm() | tsc; logika ditrace |
| 9 | `src/tests/physicsOracle.test.ts` **(BARU)** | tidak ada oracle numerik | 34 asersi analitik/properti/guard | `npm run test:physics` hijau |
| 10 | `package.json` | — | script `test:physics` | npm run berjalan |

Semua perubahan: minimal, tanpa refactor kosmetik, tanpa menurunkan assertion/standar, fitur yang bekerja dipertahankan.

---

## H. Open Issues

| ID | Severity | Temuan | Bukti | Dampak | Tindakan | Status |
|---|---|---|---|---|---|---|
| O-1 | P1 | GATE_30 & pipeline generator tidak ada di repo | grep menyeluruh nihil | Sprint 2 tak dapat dijalankan | buat gate bila produk butuh generator materi | OPEN (out of scope) |
| O-2 | P1 | Tidak ada CP/alignment kurikulum di UI/dokumen | audit; hanya design.md:1013 PROPOSED | guru tak bisa memetakan ke CP | panel "Info Guru" per modul | OPEN |
| O-3 | P1 | Uji manusia nyata belum ada | — | klaim UX belum empiris | protokol uji 5 guru + 8 siswa | PENDING_HUMAN_VALIDATION |
| O-4 | P1 | Slider/step parabola hilang saat refresh | state React murni | siswa kehilangan konteks | persist slider/step localStorage | OPEN |
| O-5 | P2 | HUD R-teori membocorkan jawaban sebelum eksperimen | ExperimentView:243 | merusak siklus prediksi | sembunyikan sampai N trial | OPEN (butuh keputusan desain) |
| O-6 | P2 | Asumsi "tanpa hambatan udara" tak dinyatakan ke siswa | grep nihil di UI | miskonsepsi idealisasi | 1 baris catatan di lab | OPEN |
| O-7 | P2 | Monitoring/observabilitas belum ada | audit | insiden tak terdeteksi | error-rate + latency sederhana | OPEN |
| O-8 | P2 | 94 error lint tersisa (52 `any`, 18 escape, dsb.) | eslint | technical debt | pengetikan bertahap | OPEN |
| O-9 | P2 | E2E browser otomatis belum ada | — | regresi UI tak terkunci | Playwright suite | OPEN |
| O-10 | P3 | Konsep lanjutan (Cunningham) tanpa progressive disclosure | persona | beban kognitif | toggle "penjelasan lanjutan" | OPEN |

---

## I. Acceptance Matrix

| Kriteria | Status | Bukti | Risiko tersisa |
|---|---|---|---|
| Validasi fisika | PASS | 34/34 oracle; audit baris-per-baris | asumsi tak dinyatakan (O-6) |
| Siklus pembelajaran | PASS | trace kunci write↔read; perbaikan vonis | refresh state (O-4) |
| GATE_30 | **BLOCKED** | objek tidak ada di repo | n/a — tak bisa dikalibrasi |
| Alignment jenjang | NOT_VERIFIED | tidak ada dokumen CP | O-2 |
| Validasi semantik | PARTIAL | inkonsistensi teks-logika ditemukan & diperbaiki | tak ada validator otomatis |
| Persona guru | PASS (sim) | 2 persona, temuan terverifikasi | simulasi, bukan manusia |
| Persona siswa | PASS (sim) | 3 persona, temuan terverifikasi | simulasi, bukan manusia |
| Uji manusia nyata | NOT_RUN | — | O-3 |
| Build & regresi | PASS | tsc 0; build EXIT=0; 3 suite hijau; lint 115→94 | E2E belum ada |
| Keamanan & privasi | PASS (scoped) | input divalidasi; fallback tanpa leak; tak ada secret di log | auth belum teruji penuh |
| Monitoring | WARN | belum terimplementasi | O-7 |
| Rollback | WARN | prosedural via git | belum berlatih |
| Sertifikasi katalog | PARTIAL | 3 modul audited; 4 placeholder tampil "segera hadir" | status modul tak dikodekan |

**Status katalog:** parabola/bandul/millikan = `CERTIFIED_WITH_LIMITATIONS` (fisika tervalidasi; CP & uji manusia belum); ohm/jatuh-bebas/boyle/snellius = `NOT_AUDITED — placeholder eksplisit` (aman: tak bisa dijalankan).

---

## J. Keputusan Final

### `PASS_WITH_WARNINGS`

**Sudah benar-benar selesai:** audit fisika 3 modul dengan oracle numerik baru (34 asersi hijau); 12 perbaikan bug P1/P2/P3 terverifikasi; siklus belajar ditelusuri end-to-end; build+3 test suite hijau; lint error −21; 5 persona (simulasi) dijalankan dengan 2 subagent nyata.

**Baru diperiksa (bukan diuji mendalam):** keamanan (scoped read), responsivitas mobile (statis), auth page.

**Belum diuji:** GATE_30 (tidak ada), CP alignment (tidak ada sumber), uji manusia nyata, E2E otomatis, monitoring, rollback rilis nyata.

**Layak dipublikasikan (beta):** modul **Gerak Parabola, Bandul, Millikan** — dengan label beta dan batasan di atas. **Tetap diblokir/placeholder:** 4 modul lain (sudah benar demikian).

**Langkah berdampak tertinggi berikutnya:** (1) panel Info-Guru + CP mapping (O-2); (2) persist state parabola (O-4); (3) protokol uji manusia (O-3); (4) Playwright E2E untuk siklus 4-tahap (O-9).

---

*Laporan ini merekam pekerjaan yang benar-benar dijalankan pada lingkungan ini. Setiap klaim punya lokasi bukti yang dapat direproduksi: `npm run test:physics`, `npm run test:socratic`, `npm run test:outcomes`, `npx tsc --noEmit`, `npm run build`, dan curl route (dev server localhost:3000).*
