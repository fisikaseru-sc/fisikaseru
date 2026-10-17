# FisikaSeru — Laporan Audit Fisika

**Tanggal:** 17 Okt 2026 · **Revisi:** `main` @ `699bd5e` + perubahan audit ini (working tree, belum di-commit) · **Auditor:** agent (eksekusi nyata, bukan ringkasan)

## Metode

Audit baris-per-baris atas tiga model fisika + eksekusi 3 test suite (`test:physics` 34 asersi, `test:socratic` 8, `test:outcomes` 6 grup) + `npx tsc --noEmit` (0 error) + `npm run build` (EXIT 0) + `npm run lint` (89 error tersisa — debt terdokumentasi).

## 1. Gerak Parabola (`src/features/parabola/simulation/projectile.ts`)

### Spesifikasi ilmiah (terverifikasi dari kode)
- **Model:** proyektil titik dalam medan gravitasi seragam, **tanpa hambatan udara**.
  - x(t) = v₀·cosθ·t; y(t) = h₀ + v₀·sinθ·t − ½gt² (bentuk tertutup eksak — bukan integrasi numerik, jadi tanpa galat diskretisasi untuk lintasan).
- **t_f** = (vy₀ + √(vy₀² + 2gh₀))/g — akar positif kuadratik, benar untuk h₀ ≠ 0. Guard: g ≤ 0 atau diskriminan < 0 → 0.
- **H_maks** = h₀ + vy₀²/(2g). **R** = vx·t_f.
- **Sudut optimum:** `optimalAngleFor()` di AnalysisView memakai rumus umum arctan kontekstual; vonis refleksi membandingkan data terhadapnya. Konstanta `OPTIMAL_ANGLE_DEG = 45` diekspor namun hanya berlaku h₀=0 — tidak dipakai untuk vonis kasus umum. Oracle: θ_opt(h₀=20, v₀=25) ≈ 38.1°; R(θ_opt) ≥ R(45°) — lulus.
- **Domain parameter (dari config):** v₀ ∈ [5,60] m/s; θ ∈ [10,80]°; g ∈ [1.6, 24.8] m/s² (Bulan–Jupiter); h₀ ∈ [0,20] m. Semua slider step-aligned.
- **Kasus ekstrem:** v₀=0 & h₀=0 → lintasan kosong (guard, diuji); g=0 → t_f=0 (guard, diuji); sudut ekstrem 10°/80° simetris range (diuji 30°/60°).
- **Noise pengukuran:** Gaussian ber-seed (Lehmer LCG + Box–Muller), σ relatif; deterministik (diuji).
- **Integrator scene:** fase terbang analitik + interpolasi impact; pantulan Euler pasca-mendarat hanya visual, tidak mengubah data tercatat (rangeX diambil di impact pertama).

### Temuan & perbaikan audit ini
| Temuan | Risiko | Status |
|---|---|---|
| Asumsi "tanpa hambatan udara" tidak pernah dinyatakan ke siswa (open issue O-6 dari audit sebelumnya) | P2 — miskonsepsi idealisasi | **DIPERBAIKI**: banner "Model ideal" ditambahkan di panel eksperimen (ExperimentView), termasuk catatan rumus tanah hanya untuk h₀=0 |
| Parameter slider hilang saat refresh (O-4) | P2 — siswa kehilangan konteks | **DIPERBAIKI**: persist `parabola-params` di localStorage, dengan validasi clamp+snap ke rentang/step config |

## 2. Bandul (`PendulumScene3D.tsx`, `ExperimentView.tsx`)

### Spesifikasi ilmiah (terverifikasi dari kode)
- **Model:** pendulum nonlinier penuh θ'' = −(g/L)·sinθ − b·θ' — **bukan** pendekatan sudut kecil. Asumsi: batang/tali massa-nol, beban titik, tanpa hambatan udara kecuali redaman model b.
- **2D:** Euler semi-implisit per frame (dt ≤ 0.05 s). **3D:** RK4 fixed-step dt = 1/240 s. Redaman kini **sama** (b=0.012) di kedua mode (perbaikan audit sebelumnya, diverifikasi ulang di baris 188 & 434).
- **Data tercatat:** T = T₀·(1 + θ₀²/16) + noise 1.5% — pendekatan deret integral eliptik orde-2. Readout kanvas, recordTrial, dan UI memakai rumus yang sama (diverifikasi 3 lokasi: baris 273, 330, 447) — konsisten.
- **Perbandingan acuan:** oracle menguji koreksi amplitudo terhadap deret eliptik lengkap — galat < 0.05% untuk θ₀ = 10° (3 nilai L). T ∝ √L diuji.
- **Batas pendekatan:** T₀(1+θ₀²/16) adalah ekspansi; pada θ₀ = 45° galatnya ~1.5% terhadap solusi eksak. Slider amplitudo membatasi θ₀, dan UI tidak mengklaim solusi eksak.
- **Energi:** redaman menghilangkan energi per ayunan — perilaku model yang benar, bukan bug.
- **Periode scene 3D:** diestimasi dari zero-crossing θ arah naik berturut-turut — metode pengukuran yang jujur (mengukur, bukan menulis rumus).

### Temuan audit ini
Tidak ditemukan bug fisika baru. Konsistensi 2D/3D, g-per-trial, dan readout=rekam semuanya terverifikasi utuh.

## 3. Tetes Minyak Millikan (`simulation/physics.ts`, `dataGenerator.ts`)

### Spesifikasi ilmiah (terverifikasi dari kode)
- **Neraca gaya:** Fg_efektif = (4/3)πr³·(ρ_oil − ρ_air)·g (gravitasi − Archimedes, benar); Fe = n·e·V/d; hambatan Stokes 6πηr·v.
- **Kecepatan terminal:** v_f = Fg/(6πηr) (jatuh, medan mati); v_r = (Fe − Fg)/(6πηr) bila Fe > Fg, selain itu 0. Konvensi tanda konsisten.
- **Muatan (dinamis):** q = 6πηr(v_f + v_r)·d/V — identik secara matematis dengan metode seimbang q = Fg·d/V saat melayang (diverifikasi aljabar: substitusi v_r). Satuan: kg·m·s⁻¹·C konsisten; hasil dalam ×10⁻¹⁹ C.
- **Konstanta:** e = 1.602176634e-19 C (NIST 2018 — nilai eksak SI); η = 1.81e-5 Pa·s (udara 20°C, literatur standar); ρ_oil = 886, ρ_air = 1.20 kg/m³; d = 5.0 mm; reticle 1.0 mm.
- **Cunningham:** C = 1 + A·λ/r, A = 1.257, λ = 65 nm. Untuk r ≈ 1 µm → cf ≈ 1.08. Bentuk standar (sering ditulis 1 + A·(l/r) dengan A ≈ 0.7–1.6 tergantung sumber; 1.257 dalam rentang literatur). Diterapkan sebagai koreksi q_corr = q·cf di dataGenerator dan analisis.
- **Rezim Stokes:** Re = ρ_air·v·r/η ≈ 1.2 · 1e-4 · 1e-6 / 1.81e-5 ≈ 7e-6 ≪ 1 — valid. Cunningham menutup breakdown kontinum pada r ~ λ.
- **Sensitivitas:** q ∝ r(v_f+v_r) → q ∝ r³ secara efektif (karena v ∝ r² via Stokes); estimateTimingUncertainty memodelkan ketidakpastian stopwatch 0.15 s. Analisis menghitung stdDev/SEM/galat% — jujur (null bila data kurang, tanpa fallback 1.602).
- **Data:** sintetis ber-seed (radius 0.80–1.15 µm, n ∈ {2..6}, noise waktu 1.5–1.8%). **Bukan reproduksi eksperimen historis** — UI memisahkan simulasi dari lab nyata (RealLabGuideModal). Klaim di README ("real-noise data") berarti noise realistis pada data sintetis — tidak mengklaim data lab historis.

### Temuan audit ini
| Temuan | Risiko | Status |
|---|---|---|
| `calculateMassFromRadius` memakai ρ_oil tanpa gaya apung — **dead code** (grep: tidak dipanggil di mana pun) | P3 — potensi miskonsepsi bila kelak dipakai untuk gaya seimbang | **DIDOKUMENTASIKAN** (tidak diubah: menghapus/mengedit kode mati di luar scope minimal; komentar tidak mengklaim pemakaian) |

## Verifikasi eksekusi (perintah nyata dijalankan audit ini)

| Perintah | Hasil |
|---|---|
| `npm run test:physics` | 🎉 34/34 asersi lulus |
| `npm run test:socratic` | 🎉 8/8 lulus |
| `npm run test:outcomes` | 🎉 6 grup lulus |
| `npx tsc --noEmit` | 0 error |
| `npm run build` | ✓ Compiled successfully, 10/10 static pages, EXIT 0 |
| `npm run lint` | 89 error / 95 warning (turun dari 138 setelah perbaikan hooks-violation nyata + ignore test-file require false-positive; sisa = debt terdokumentasi: `any`, setState-in-effect, escape — tidak diperbaiki karena butuh refactor luas) |

## 2.5 Rujukan sumber per klaim (audit kedua — sumber kini tersedia dan ditelaah)

Klaim-klaim fisika berikut kini **didukung sumber yang benar-benar dibaca** (detail di PHYSICS-SOURCE-MATRIX.md):

| Klaim | Bukti kode | Bukti sumber (bab/halaman) | Status |
|---|---|---|---|
| Parabola: vx konstan, vy=v·sinθ, vy=0 di puncak, t_total=2·t_puncak | projectile.ts + oracle 34 asersi | Buku BS Kelas XI Bab 2 "D. Gerak Parabola" hal. 53–57 (SRC-BS-XI-2022) | VERIFIED |
| Parabola: peluncuran dari ketinggian (h₀>0) sah | timeOfFlight akar kuadratik umum + oracle θ_opt(h₀=20)≈38.1° | Buku BS XI memakai kasus bola dari pinggir meja sebagai contoh utama (hal. 56) | VERIFIED |
| Bandul: F=−W·sinθ; sinθ≈θ (kecil); f=(1/2π)√(g/l) hanya fungsi L,g | PendulumScene3D nonlinier + oracle eliptik | Mikrajuddin I §7.2 hal. 501–503 (SRC-MIKRA-I) | VERIFIED |
| Bandul: simpangan besar → nonlinear θ''=−(g/L)sinθ, numerik | RK4 nonlinier scene 3D | Mikrajuddin I §13.3 hal. 1050+ (SRC-MIKRA-I) | VERIFIED |
| Millikan: qE=mg; Stokes 6πηrv; laju terminal; r=√(9ηv/2ρg); e=1,602×10⁻¹⁹ kelipatan bulat | physics.ts + socratic/outcomes test | Mikrajuddin II §12.3 hal. 851–855 (SRC-MIKRA-II) | VERIFIED |
| Millikan: gaya apung Δρ | physics.ts (Fg efektif Δρ) | Mikrajuddin mengabaikan apung (m=ρV) — FisikaSeru lebih akurat; perbedaan dicatat sebagai penguatan | VERIFIED (perbedaan dicatat) |

**Yang TIDAK didukung sumber:** buku Erlangga XI yang tersedia tidak memuat topik ketiga modul (daftar isi: Dinamika Rotasi–Pemanasan Global saja) — tidak dapat dikutip untuk klaim konten. Konstanta Cunningham (A=1.257, λ=65nm) berasal dari literatur standar, tidak dibahas di bagian buku yang ditelaah.

## Batas klaim

1. Audit pertama menelaah kode tanpa buku (saat itu belum ditemukan); audit kedua menelaah subbab relevan tiap buku — bab lain tidak diklaim ditelaah.
2. Ekstraksi PDF menurunkan simbol Yunani/berntisikit — persamaan diverifikasi dari struktur prosa + konsistensi numerik contoh soal, bukan rendering rumus utuh.
3. Erlangga berstatus PDF scan; hanya identitas + daftar isi (OCR eng) yang dibaca; tidak dipakai untuk klaim konten.
4. Perilaku numerik diverifikasi via oracle analitik/properti, bukan browser E2E (belum ada).
5. Perbaikan O-4 (persist parameter) diverifikasi via tsc/lint/build; runtime browser belum diuji E2E.
