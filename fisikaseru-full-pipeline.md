# FisikaSeru 3.0 — Full Product Pipeline
## Idea → Scope → User Flow → PRD → ERD → Architecture → Wireframe → Task Breakdown → Prompt Spec → Coding

> **Status:** Living Document · Single Source of Truth  
> **Stance:** Hybrid 2.5D (2D core + selective scientific 3D) · MVP = Satu Modul Sempurna dulu  
> **Filosofi:** "Bangun proof that the masterpiece works, bukan masterpiece dulu"

---

## Daftar Isi

- [PHASE 0 — IDEA](#phase-0--idea)
- [PHASE 1 — SCOPE](#phase-1--scope)
- [PHASE 2 — USER FLOW](#phase-2--user-flow)
- [PHASE 3 — PRD (Full)](#phase-3--prd-full)
- [PHASE 4 — ERD + OAuth](#phase-4--erd--oauth)
- [PHASE 5 — ARCHITECTURE](#phase-5--architecture)
- [PHASE 6 — WIREFRAME](#phase-6--wireframe)
- [PHASE 7 — TASK BREAKDOWN](#phase-7--task-breakdown)
- [PHASE 8 — PROMPT SPEC](#phase-8--prompt-spec)
- [PHASE 9 — CODING SPEC](#phase-9--coding-spec)

---

# PHASE 0 — IDEA

## 0.1 Problem Statement

```
MASALAH INTI:
┌─────────────────────────────────────────────────────────────────┐
│  Siswa SMA Indonesia bisa menghapal rumus T = 2π√(L/g)          │
│  tapi tidak bisa menjawab:                                      │
│  "Apa yang terjadi pada bandul di Bulan?"                       │
│                                                                 │
│  Ini bukan masalah informasi.                                   │
│  Ini masalah MENTAL MODEL yang salah.                           │
└─────────────────────────────────────────────────────────────────┘
```

**Root Cause:**
- Fisika diajarkan sebagai kumpulan rumus, bukan sistem logika alam
- Lab fisika sekolah: mahal, pecah, tidak tersedia, tidak bisa diulang
- Platform digital (PhET, dll): bagus tapi abstrak — tidak ada konfrontasi miskonsepsi
- Tidak ada jembatan antara "simulasi" dan "pemahaman mendalam"

**Insight Kunci (dari riset FCI / Force Concept Inventory):**
```
62% siswa SMA percaya: "beban berat = bandul lebih cepat" (SALAH)
71% siswa percaya: "gaya = kecepatan" (SALAH)
58% percaya: "tegangan listrik = arus" (SALAH)

Setelah lulus SMA → miskonsepsi ini TETAP ADA
karena mereka tidak pernah dikonfrontasi dengan datanya sendiri.
```

## 0.2 Vision

> **FisikaSeru adalah mesin perubahan mental model fisika.**  
> Bukan platform belajar. Bukan simulasi. Bukan game.  
> **Mesin yang mengubah cara seseorang berpikir tentang alam semesta.**

## 0.3 Hypothesis

```
JIKA siswa:
  1. Membuat prediksi eksplisit sebelum eksperimen
  2. Mengumpulkan data nyata (dengan noise realistis)
  3. Menemukan sendiri pola matematika dari datanya
  4. Dikonfrontasi langsung: prediksi vs hasil
  5. Dipaksa merekonstruksi mental model dengan kata-katanya sendiri

MAKA:
  → Miskonsepsi berubah (bukan sekadar "tahu" fakta baru)
  → Pemahaman menjadi transferable ke konteks baru
  → Siswa mengingat konsep jauh lebih lama
```

## 0.4 Keputusan Founder: 2.5D bukan full 3D

**Ruling (Final, tidak berubah untuk MVP):**

| Aspek | Keputusan | Alasan |
|---|---|---|
| Visual core | **2D interaktif** | Lebih cepat, lebih jelas, lebih ringan |
| 3D kapan? | **Hanya jika spatial intuition kritis** | Pedagogically justified, bukan estetis |
| Style | **Stylized scientific realism** | Bukan game, bukan PhET clone |
| Benchmark | **Apple Education × scientific instrument** | Clean, fast, tactile |
| MVP scope | **1 modul sempurna (Bandul)** | Proof of concept sebelum scale |

---

# PHASE 1 — SCOPE

## 1.1 MVP Scope (Apa yang DIBANGUN di v1.0)

```
✅ DALAM SCOPE MVP:
├── 1 modul: Bandul Matematis (2.5D)
├── Auth: Google OAuth + Magic Link (Supabase)
├── UU PDP consent flow (wajib untuk minor)
├── 7-Stage Learning Loop (Steps 1-6 + Reflect)
├── Noise injection (Gaussian 1.5%)
├── Regresi linear + R² gating
├── AI Tutor Mode 1 (Micro-Hint — rule-based)
├── AI Tutor Mode 2 (Socratic — templated dialogue)
├── Confrontation Card (Step 5 Reflect)
├── PDF Report generation (async queue)
├── Basic Flashcard (Free tier)
├── Eureka Card (shareable image)
└── PWA basics (installable, shell cached)

❌ TIDAK DALAM SCOPE MVP (defer ke v1.1+):
├── Modul lain (semua defer)
├── AI Tutor Mode 3 (LLM-based — terlalu komplex)
├── Concept Network / DAG
├── Spaced Repetition (Leitner)
├── HOTS Bank Soal (defer ke setelah Pro launched)
├── Classroom Link (defer ke v1.2)
├── DOCX export (defer ke v1.1)
├── Offline PWA (defer ke v1.1)
├── ClickHouse analytics
└── Adaptive difficulty engine
```

## 1.2 User Segments

```
PRIMARY (MVP focus):
┌──────────────────────────────────────────────────────────┐
│  SISWA SMA KELAS 11-12                                   │
│  • Sedang belajar Fisika untuk UTBK                     │
│  • Memiliki HP Android mid-range (3-4GB RAM)            │
│  • Koneksi 4G tidak stabil                              │
│  • Motivasi: nilai ujian + rasa ingin tahu              │
└──────────────────────────────────────────────────────────┘

SECONDARY (v1.1+):
├── Mahasiswa S1 Sains/Teknik (Fisika Dasar)
├── Guru SMA (Classroom Link feature)
└── Siswa SMP kelas 9 (materi awal)
```

## 1.3 Success Metrics (MVP)

```
ACTIVATION:
├── Completion Rate Step 1-6: > 60%
├── Eureka Rate (R² > 0.75): > 65%
└── Misconception Correction: > 70% (prediksi salah → rekonstruksi benar)

ENGAGEMENT:
├── D1 Retention: > 30%
├── D7 Retention: > 15%
└── Share Rate (Eureka Card): > 10%

LEARNING:
└── Post-session conceptual test score: > 2x pre-session score

VALIDATION (before v1.1 build):
└── 50 siswa organic (bukan paid/forced) selesaikan modul Bandul
    dan bisa menjawab "bandul di Bulan" dengan benar
```

---

# PHASE 2 — USER FLOW

## 2.1 High-Level User Journey Map

```
NEW USER JOURNEY:
═══════════════════════════════════════════════════════════

[Landing Page]
     │ "Coba Gratis" atau "Masuk dengan Google"
     ▼
[Google OAuth / Magic Link]
     │
     ▼
[Consent Screen — UU PDP]
     │ Setuju → Lanjut
     │ Tolak → tidak bisa lanjut (explain why)
     │ Umur < 13? → Email verifikasi orang tua
     ▼
[Global Onboarding — 60 detik]
     │ Scene 1: Kalibrasi kontrol device
     │ Scene 2: Galileo moment (dua bola jatuh)
     │ Scene 3: Kenalan AI Tutor
     │ Scene 4: Pilih level (SMP/SMA/Kuliah)
     ▼
[Catalog / Beranda]
     │ [MVP: hanya Bandul yang tersedia]
     │ Klik SimCard "Misteri Bandul"
     ▼
[LAB SESSION — 7 Stage Loop]
     │
     ├── Step 1: Pemicu Intuisi
     │   └── "Jika tali 2× panjang, lebih cepat atau lambat?"
     │       → Prediksi disimpan (TIDAK ada feedback sekarang)
     │
     ├── Step 2: Setup & Kalibrasi
     │   └── Slider L, Massa, Sudut
     │       → Preview 2.5D berubah real-time
     │
     ├── Step 3: Eksperimen
     │   └── Interaksi bandul, stopwatch, rekam data
     │       → 5 trial minimum → tabel terisi
     │
     ├── Step 4: Analisis
     │   └── Scatter plot T² vs L
     │       → Drag regression line → R² real-time
     │       → AI Tutor jika R² < 0.75 setelah 3×
     │       → Gating: R² > 0.75 untuk lanjut
     │
     ├── Step 5: Reflect & Reconstruct ← PALING PENTING
     │   └── Confrontation Card muncul:
     │       "Prediksimu: [lebih cepat]"
     │       "Hasilmu: T hanya bergantung L dan g"
     │       → Socratic dialogue 3 pertanyaan
     │       → User merekonstruksi mental model sendiri
     │
     └── Step 6: Report & Reward
         └── Generate PDF (async)
             → Eureka Card (shareable)
             → Flashcard ringkasan
             → Upsell HOTS soal (1 preview gratis)
             ↓
         [Kembali ke Catalog] atau [Share ke sosmed]

═══════════════════════════════════════════════════════════
RETURNING USER:
[Login] → [Catalog] → [Resume / Modul Baru]
                            ↑
                      (setelah v1.1: lebih banyak modul)
```

## 2.2 Auth Flow Detail

```
AUTH FLOW (OAuth + UU PDP):
══════════════════════════════════════════════════════════

[Halaman Login]
     │
     ├─── [Masuk dengan Google]
     │         │
     │         ▼
     │    [Google OAuth Popup]
     │         │ authorized
     │         ▼
     │    [Supabase auth/callback]
     │         │
     │         ├── User BARU?
     │         │     │
     │         │     ▼
     │         │   [Consent Screen — TERPISAH dari OAuth]
     │         │     │ Form: nama, tahun lahir, checkbox consent
     │         │     │ Bahasa plain: "Kami simpan email untuk..."
     │         │     │
     │         │     ├── Umur < 13 tahun?
     │         │     │     └── [Kirim email ke orang tua]
     │         │     │           → Orang tua klik link verifikasi
     │         │     │           → User menunggu (polling)
     │         │     │
     │         │     └── Umur ≥ 13?
     │         │           └── [Simpan consent ke DB]
     │         │                 → user.consent_at = NOW()
     │         │                 → user.consent_version = 'v1.0'
     │         │
     │         └── User LAMA?
     │               │
     │               ├── Consent version outdated?
     │               │     └── Re-consent screen
     │               └── OK → masuk langsung
     │
     └─── [Magic Link / Email]
               │
               ▼
          [Masukkan email]
               │
               ▼
          [Supabase kirim magic link]
               │
               ▼
          [User klik link di email]
               │
               ▼
          [Callback → sama seperti OAuth flow di atas]

POST-AUTH ROUTING:
├── Belum onboarding → /onboarding
├── Sudah onboarding → /catalog
└── Ada session yang belum selesai → prompt "Lanjutkan sesi?"
```

## 2.3 AI Tutor Decision Flow

```
AI TUTOR TRIGGER FLOW (Per Session):
═══════════════════════════════════════════════════

                [Step 4: User drag regression line]
                              │
                    ┌─────────┴──────────┐
                    │  Attempt counter   │
                    └─────────┬──────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
          Attempt 1-2    Attempt 3-4    Attempt 5+
               │              │              │
          [No action]   [MODE 1:         [MODE 2:
                         Micro-Hint]     Socratic]
                              │              │
                         Visual arrow   3-step Socratic
                         highlights     dialogue card
                         target area         │
                              │         [User jawab]
                              │              │
                         [User adjust]  [Validate]
                              │              │
                    ┌─────────┴──────────────┘
                    │
                    ▼
               R² > 0.75?
                    │
            ┌───────┴───────┐
           YES              NO
            │               │
        [Step 5]       Attempt 6+:
                    "Mau lihat contoh?"
                      [Ya] → show demo
                      [Tidak] → keep trying
```

## 2.4 Monetization Trigger Flow

```
MONETIZATION DECISION TREE:
═══════════════════════════════════════════

[Step 6: Session Complete]
        │
        ├── [Generate Eureka Card] ──── Always shown
        │
        ├── [PDF Download] ──────────── Always available
        │       └── After download: "Mau versi Word?"
        │               └── → Soft upsell modal
        │
        ├── [HOTS Soal Preview]
        │       └── Tampilkan 1 soal gratis
        │               └── Setelah jawab: "9 soal lagi →"
        │                       └── → Upgrade modal
        │
        └── [Eureka Card Share]
                └── User bagikan ke IG/WA
                        └── "Terima kasih! 7 hari Pro gratis →"
                                └── → Auto-activate trial
```

---

# PHASE 3 — PRD (Full)

## 3.1 Overview

| Field | Value |
|---|---|
| Product | FisikaSeru 3.0 |
| Version | MVP 1.0 |
| Scope | 1 modul (Bandul) + Full Learning Infrastructure |
| Platform | Web (Next.js PWA) |
| Target | SMA Kelas 11-12, Indonesia |
| Model | Freemium (Free: simulasi + PDF · Pro: HOTS + DOCX) |
| Region | ap-southeast-1 (Singapura) |

## 3.2 PRD-01: Onboarding

### Functional Requirements

**FR-01.1 — Global Onboarding (First Session Only)**
- Sistem HARUS mendeteksi first-time user dan menjalankan onboarding sebelum catalog
- Onboarding terdiri dari 4 scene, total durasi ≤ 75 detik
- Pengguna DAPAT skip scene 1-3, TIDAK DAPAT skip scene 4 (level selection)
- Progress onboarding disimpan — jika ditutup, resume dari scene terakhir

**FR-01.2 — Scene 1: Device Calibration (0-20 detik)**
- Tampilkan objek 3D sederhana (kubus/bola)
- User harus melakukan: drag, pinch-zoom, tap/klik minimal 1× masing-masing
- Sistem detect input method: touch/mouse/keyboard → simpan ke session
- Skip tersedia setelah 8 detik

**FR-01.3 — Scene 2: Galileo Moment (20-45 detik)**
- Tampilkan 2 bola (massa berbeda) jatuh bersamaan
- Pertanyaan: "Mana yang jatuh lebih dulu?"
- User pilih → keduanya jatuh bersamaan → micro-celebration
- Tujuan: plant cognitive conflict, bukan mengajar

**FR-01.4 — Scene 3: AI Tutor Intro (45-65 detik)**
- Avatar AI Tutor muncul
- Dialog: "Aku bukan guru. Aku akan nanya pertanyaan, bukan kasih jawaban."
- User tap/klik "Mengerti" untuk lanjut

**FR-01.5 — Scene 4: Level Selection (wajib)**
- 3 pilihan: SMP / SMA / Kuliah
- Pilihan ini memengaruhi: bahasa AI Tutor, complexity tooltip, default difficulty
- Tidak bisa di-skip
- Simpan ke `users.level`

### Non-Functional Requirements

- Semua scene: ukuran aset ≤ 500KB total
- Render first scene: < 1.5 detik
- Works tanpa JavaScript disabled (graceful fallback text)

---

## 3.3 PRD-02: Authentication & Consent

### Functional Requirements

**FR-02.1 — Google OAuth**
- Implementasi via Supabase Auth
- Scope minimal: email, profile (tidak minta akses Drive/Calendar/dll)
- State parameter untuk CSRF protection
- Redirect URI whitelist: hanya domain produksi + localhost dev

**FR-02.2 — Magic Link**
- Fallback untuk user tanpa Google account
- Link valid: 1 jam, single-use
- Email template: bahasa Indonesia, branding FisikaSeru

**FR-02.3 — Consent Screen (UU PDP — WAJIB)**
- Muncul setelah auth berhasil, sebelum akses apapun
- Terpisah dari OAuth consent (bukan bundle)
- Konten wajib dalam bahasa Indonesia yang mudah dipahami:
  - Data apa yang dikumpulkan
  - Untuk apa digunakan
  - Siapa yang bisa akses
  - Cara hapus akun
- Tombol "Setuju" dan "Tidak Setuju" ukuran sama (tidak dark pattern)
- Jika "Tidak Setuju": user dilog-out, data tidak disimpan

**FR-02.4 — Verifikasi Orang Tua (umur < 13 tahun)**
- Deteksi dari birth_year input di consent screen
- Kirim email ke orang tua dengan link verifikasi
- Link valid: 48 jam
- User tidak bisa akses apapun sampai verifikasi selesai
- Tampilkan status: "Menunggu konfirmasi dari [email orang tua]"

**FR-02.5 — Session Management**
- Session token: JWT via Supabase, expire 7 hari
- Auto-refresh: 1 jam sebelum expire jika user aktif
- Concurrent session: maksimal 3 device
- Logout: invalidate semua token, hapus IndexedDB cache

### Security Requirements

- CSRF: state parameter wajib di OAuth flow
- XSS: Content Security Policy header ketat
- Rate limiting: `/api/auth/*` = 10 req/menit per IP
- HTTPS only: HSTS header, redirect HTTP → HTTPS

---

## 3.4 PRD-03: Lab Session (Core Experience)

### Functional Requirements

**FR-03.1 — Session Lifecycle**
- Satu session = satu user × satu modul × satu waktu
- Session dibuat saat user klik "Mulai Lab"
- Checkpoint otomatis setiap 30 detik ke IndexedDB (offline resilience)
- Checkpoint dikirim ke server saat koneksi kembali
- Session "abandoned" jika tidak aktif > 24 jam

**FR-03.2 — Step 1: Knowledge Activation**
- Pertanyaan 1 butir, pilihan 2-3 opsi
- Jawaban disimpan: `sessions.prediction_data`
- Tidak ada feedback sekarang (feedback di Step 5)
- Auto-advance jika tidak ada aksi dalam 90 detik (log sebagai "skip")

**FR-03.3 — Step 2: Setup**
- Slider L: range 0.20–2.00m, step 0.05m, default 0.75m
- Dropdown massa: [50g, 100g, 200g, 500g], default 100g
- Slider sudut: range 5°–15°, default 10°
- Preview berubah real-time (latency ≤ 100ms dari slider event)
- Tombol "Mulai" aktif hanya setelah ≥ 1 variabel diubah dari default
- Constraint warning muncul jika slider mendekati 15° (batas atas)

**FR-03.4 — Step 3: Experiment**
- Physics model: `T_true = 2π × √(L / 9.80665)`
- Noise injection: `T_obs = T_true + N(0, (0.015 × T_true)²)`
- Stopwatch: hitung 10 ayunan → T_obs = total / 10
- Rekam data: tambah row ke `LiveDataTable`
- Progress indicator: "3/5 trial"
- Tombol "Analisis" aktif setelah 5 trial
- Data disimpan ke `trials` table via POST /api/trials

**FR-03.5 — Step 4: Analysis**
- Default axis: T² (Y) vs L (X)
- Scatter plot: D3.js, titik draggable untuk outlier removal
- Regression line: drag dua endpoint
- R² display: real-time update saat drag
- Gating: R² > 0.75 → "Lanjut ke Refleksi" aktif
- AI Tutor trigger: R² < 0.75 setelah 3 percobaan

**FR-03.6 — Step 5: Reflect & Reconstruct**
- Confrontation Card: wajib tampil, tidak bisa di-skip (minimum 4 detik tampil)
- Konten: prediksi user (dari Step 1) vs hasil eksperimen
- AI Tutor Mode 2: 3 pertanyaan Socratic sekuensial
- Reconstruct Input: user ketik/pilih kesimpulan
- Validator: input harus mengandung kata kunci konsep yang benar
- Maksimal 3 attempt → jika gagal: guided reveal (bukan diberi langsung)
- Simpan ke `sessions.reflection_data`

**FR-03.7 — Step 6: Report & Reward**
- Trigger generate PDF: POST /api/reports/queue
- UI status: spinner dengan pesan "Sedang menyusun laporan..."
- Update via Supabase Realtime (WebSocket) saat PDF selesai
- Download link: signed URL, valid 7 hari
- Eureka Card: generate client-side (canvas API) → download/share
- Badge display: "Penemu Galileo"
- 1 soal HOTS preview (hardcoded untuk MVP)

### Non-Functional Requirements

- Physics accuracy: deviasi < 0.1% vs kalkulasi manual
- Step transition animation: ≤ 200ms
- Data loss prevention: semua trial data tersimpan sebelum page close (beforeunload handler)
- Accessibility: semua kontrol operable via keyboard

---

## 3.5 PRD-04: 2.5D Simulation (Bandul)

### Functional Requirements

**FR-04.1 — Rendering Mode Decision**
- Modul Bandul: **2D canvas dengan perspektif depth cue** (bukan full 3D)
- Alasan: bandul adalah konsep spatial sederhana; 2D sudah cukup, lebih ringan
- "2.5D" = 2D objek + subtle shadow + depth gradient background
- Style: stylized scientific realism (clean, instrumen lab, bukan kartun)

**FR-04.2 — Bandul Visual Spec**
- Tali: garis dengan thickness gradient (lebih tebal di atas)
- Beban: lingkaran dengan drop shadow + material sheen
- Lintasan ayunan: arc ghost trail (fade out, warna biru transparan)
- Busur derajat: tampil saat Setup, hilang saat Eksperimen
- Frame lab: minimal — background abu-abu gradient, papan data di sisi kanan

**FR-04.3 — Physics Visualization**
- Vektor gaya gravitasi (panah ke bawah): toggle-able
- Vektor gaya tegangan tali (panah sepanjang tali): toggle-able
- Nilai T real-time: teks overlay di samping beban
- Stopwatch: digital display, besar, mudah terbaca

**FR-04.4 — Constraint Visualization**
- Jika sudut > 15°: tali dan beban berubah warna merah
- Overlay warning: "Sudut terlalu besar — aproksimasi tidak berlaku"
- Simulasi pause otomatis
- "Atur Ulang" button muncul

**FR-04.5 — Performance Spec**
- Target device: Android mid-range, RAM 3GB, Chrome 120+
- FPS target: 60fps pada device target
- Jika FPS < 30: reduce arc trail length, disable shadows
- Canvas size: responsive, max 800×600px logical
- Memory: ≤ 50MB untuk canvas + physics state

### 3D Exception (kapan pakai Three.js/R3F)

```
Untuk MVP Bandul: TIDAK pakai Three.js/R3F
Pakai Canvas 2D API langsung.

Three.js/R3F digunakan HANYA untuk modul yang
membutuhkan spatial intuition yang tidak bisa
dicapai dengan 2D:
  - Millikan (depth dalam tabung vakum)
  - Medan listrik/magnet (field lines 3D)
  - Planetary motion (orbital mechanics)
  - Interferensi cahaya (wavefront 3D)
```

---

## 3.6 PRD-05: AI Tutor (Rule-Based MVP)

### Functional Requirements

**FR-05.1 — Mode 1: Micro-Hint**

Trigger conditions (ANY of):
- R² < 0.75 setelah attempt ke-3
- User tidak ada aksi di Step 4 > 3 menit

Behavior:
- Tampilkan animasi panah yang menunjuk ke area target regresi
- Area target = zona ±0.1 R² dari solusi optimal, dirender sebagai band hijau transparan
- Bubble teks: "Garismu sudah dekat! Coba geser ujung kanan ke arah ini →"
- Auto-dismiss setelah 6 detik atau saat user mulai drag
- Cooldown: tidak muncul lagi dalam 90 detik

**FR-05.2 — Mode 2: Socratic Dialogue**

Trigger conditions (ANY of):
- R² < 0.75 setelah attempt ke-5
- User klik tombol "Minta Bantuan" (selalu tersedia)

Behavior:
- Card dialog muncul (tidak fullscreen, tidak block canvas)
- 3 pertanyaan sekuensial untuk modul Bandul:
  1. "Titik data mana yang paling jauh dari garismu? Coba hover ke titik-titik itu."
  2. "Bandingkan trial ke-{{anomaly_trial}} dengan yang lain — apa yang beda?"
  3. "Kalau kamu hapus trial itu, apa yang berubah pada R²?"
- Setiap pertanyaan: user harus klik "Saya sudah coba" untuk lanjut
- User TIDAK harus menjawab benar — cukup acknowledge
- Setelah pertanyaan ke-3: user kembali ke canvas (bukan diberi jawaban)

**FR-05.3 — Mode 2B: Reflection Partner (Step 5 only)**

Trigger: otomatis saat Step 5 dimulai (selalu aktif)

Behavior:
- Pertanyaan 1: "Prediksimu [X]. Datamu bilang [Y]. Kenapa bisa berbeda?"
  - User pilih dari 3 opsi reasoning (tidak ketik bebas untuk MVP)
- Pertanyaan 2: "Kalau bandul di Bulan (g=1.6), apa yang berubah pada T?"
  - User pilih: "T lebih besar / lebih kecil / sama saja"
- Pertanyaan 3: "Jadi T bergantung pada apa saja?"
  - User centang dari daftar: [L] [m] [g] [θ] [udara]
  - Validasi: harus centang L dan g, tidak boleh centang m
- Feedback: setelah submit jawaban ke-3, baru ada konfirmasi

### Non-Functional Requirements

- AI Tutor response time: < 300ms (tidak ada network call, semua rule-based)
- Tutor tidak boleh muncul lebih dari 3× dalam satu sesi (spam prevention)
- Selalu ada tombol "Tutup" yang visible dan mudah ditekan
- Tutor tidak menghalangi canvas atau data table

---

## 3.7 PRD-06: PDF Report Engine

### Functional Requirements

**FR-06.1 — Async Queue**
- User klik "Generate Laporan" → POST /api/reports/queue
- Response immediate (< 200ms): `{ job_id: "xxx" }`
- UI switch ke state "Menyusun laporan..." dengan animated progress bar
- Frontend subscribe ke Supabase Realtime channel: `report-jobs:{job_id}`
- Saat status = "completed": tombol download muncul

**FR-06.2 — PDF Content**
- Template per-modul (bandul.tex)
- Sections: Cover → Prediksi Awal → Tujuan → Landasan Teori → Data Tabel → Grafik → Analisis → Rekonstruksi Mental Model → Kesimpulan → Pertanyaan Refleksi Lanjutan
- Grafik: di-generate server-side dari data trials (Chart.js server render atau D3 node)
- Logo FisikaSeru di footer setiap halaman
- Bahasa: Indonesia

**FR-06.3 — Worker Spec**
- Platform: Railway.app (Docker, Node 20 + TexLive slim)
- Compiler: pdflatex (primary), Typst (fallback)
- Sandbox: subprocess dengan network disabled, /tmp isolated
- Timeout: 90 detik per job
- On timeout: update status = "failed", kirim notifikasi ke user
- Concurrent jobs: 3 per instance, auto-scale ke 2 instances jika queue > 10

**FR-06.4 — Storage**
- Upload ke Supabase Storage bucket: `reports/`
- Path: `reports/{user_id}/{session_id}/{timestamp}.pdf`
- Signed URL: valid 7 hari
- Cleanup: hapus file > 30 hari (cron job)

### Non-Functional Requirements

- PDF generation p90: < 30 detik
- PDF generation p99: < 90 detik
- Error rate: < 0.5%
- File size: < 2MB per report

---

## 3.8 PRD-07: Monetization (MVP Scope)

### Free Tier
- Semua simulasi (1 modul MVP)
- Full 7-Stage Learning Loop
- AI Tutor Mode 1 & 2
- PDF report (3/bulan, watermark logo)
- Basic flashcard (static)
- Eureka Card (shareable)
- 1 soal HOTS preview per modul

### Pro Tier (v1.1 — tidak di MVP build)
- Unlimited PDF (no watermark)
- DOCX export
- Full HOTS bank (10 soal/modul)
- AI Tutor Mode 3 (LLM-based deep Socratic)
- Smart Flashcard (spaced repetition)
- Progress tracking lintas modul
- Offline mode (PWA)

### Trigger Points (yang dibangun di MVP)
1. **Post-Eureka**: setelah R² > 0.75 → "Mau tahu cara jawab soal UTBK ini?"
2. **Post-HOTS preview**: setelah 1 soal gratis → "9 soal lagi..."
3. **Post-Share**: share Eureka Card → 7 hari trial gratis

---

## 3.9 PRD-08: Performance & Infrastructure

### Performance Budget (Hard Limits)

| Metrik | Limit | Consequence jika gagal |
|---|---|---|
| Initial JS bundle | < 400KB gzipped | CI build fail |
| Total initial load | < 2MB | CI build fail |
| Time to Interactive | < 3s (4G) | Block deploy |
| Canvas first paint | < 1.5s setelah modul dibuka | Bug ticket P1 |
| Physics step | < 5ms/frame | Optimize atau reduce complexity |
| API response (non-PDF) | < 300ms p95 | Alert + investigate |
| PDF generation | < 30s p90 | Alert + investigate |

### Infrastructure (MVP)

```
Komponen         Platform              Biaya estimasi
─────────────────────────────────────────────────────
Frontend         Vercel (Free tier)    $0
Database         Supabase (Free tier)  $0 (up to 500MB)
Auth             Supabase Auth         $0
Storage          Supabase Storage      $0 (up to 1GB)
Queue            Upstash Redis         $0 (free tier)
PDF Worker       Railway               ~$5/bulan
Analytics        PostHog Cloud         $0 (1M events/bulan)
Error tracking   Sentry               $0 (free tier)
CDN              Cloudflare           $0
─────────────────────────────────────────────────────
Total MVP        ~$5/bulan
```

### Security

- HTTPS only (HSTS)
- CSP header: `default-src 'self'; script-src 'self' 'unsafe-eval'` (minimal)
- Rate limiting: auth endpoints 10/menit, API 100/menit
- Input validation: Zod schema untuk semua API input
- SQL injection: Supabase ORM (parameterized queries)
- CORS: whitelist hanya domain produksi

---

# PHASE 4 — ERD + OAuth

## 4.1 Entity Relationship Diagram (Full)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    FISIKASERU 3.0 — ERD                                 ║
║                    Auth: Google OAuth via Supabase                       ║
╚══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH LAYER                                │
│                                                                         │
│  auth.users (managed by Supabase — JANGAN modifikasi langsung)         │
│  ┌───────────────────────────────────────────────┐                     │
│  │  id            UUID  PK                       │                     │
│  │  email         TEXT  UNIQUE                   │  ← dari Google OAuth │
│  │  email_confirmed_at  TIMESTAMPTZ              │                     │
│  │  created_at    TIMESTAMPTZ                    │                     │
│  │  raw_app_meta  JSONB  { provider: 'google' }  │                     │
│  │  raw_user_meta JSONB  { name, avatar_url }    │  ← dari Google      │
│  └───────────────────────────────────────────────┘                     │
│                           │ 1:1                                         │
│                           │ trigger: on INSERT ke auth.users           │
│                           │ → auto-create public.users                  │
│                           ▼                                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  TABLE: public.users                                     │
│  (profile & compliance layer di atas auth.users)         │
├──────────────────────────────────────────────────────────┤
│  id               UUID        PK  FK → auth.users.id     │
│  email            TEXT        NOT NULL (copy dari auth)  │
│  display_name     TEXT                                   │
│  avatar_url       TEXT                                   │
│  level            TEXT        DEFAULT 'sma'              │
│                   CHECK IN ('smp','sma','kuliah')        │
│  birth_year       INTEGER                                │
│  parent_email     TEXT        (nullable, jika < 13 thn)  │
│  parent_verified  BOOLEAN     DEFAULT false              │
│  parent_token     TEXT        (token verifikasi ortu)    │
│  consent_at       TIMESTAMPTZ (null = belum consent)     │
│  consent_version  TEXT        (e.g., 'v1.0')             │
│  onboarding_done  BOOLEAN     DEFAULT false              │
│  onboarding_level TEXT        (level pilihan scene 4)    │
│  created_at       TIMESTAMPTZ DEFAULT NOW()              │
│  updated_at       TIMESTAMPTZ DEFAULT NOW()              │
│  deleted_at       TIMESTAMPTZ (soft delete — UU PDP)     │
└──────────────┬───────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       │ 1:N            │ 1:N
       ▼                ▼
┌──────────────┐   ┌─────────────────────┐
│ subscriptions│   │    sessions         │
├──────────────┤   ├─────────────────────┤
│ id      UUID │   │ id           UUID   │
│ user_id UUID │   │ user_id      UUID   │
│         FK──→│   │              FK──→  │
│ plan    TEXT │   │ module_id    TEXT   │
│ CHECK IN     │   │ seed         INT    │
│ ('monthly',  │   │ difficulty   TEXT   │
│  'semester', │   │ current_step INT    │
│  'annual',   │   │ status       TEXT   │
│  'student',  │   │ CHECK IN     ('active',│
│  'trial')    │   │   'completed',      │
│ status  TEXT │   │   'abandoned')      │
│ CHECK IN     │   │                     │
│ ('active',   │   │ prediction_data     │
│  'expired',  │   │   JSONB             │
│  'cancelled',│   │ {                   │
│  'trial')    │   │   question_id: str  │
│ trial_ends   │   │   selected: 'A'|'B' │
│   TIMESTAMPTZ│   │   time_ms: 4230     │
│ started_at   │   │   hover_seq: ['B',  │
│   TIMESTAMPTZ│   │              'A']   │
│ expires_at   │   │ }                   │
│   TIMESTAMPTZ│   │                     │
│ payment_     │   │ reflection_data     │
│   provider   │   │   JSONB             │
│   TEXT       │   │ {                   │
│ payment_ref  │   │   confronted: bool  │
│   TEXT       │   │   q1_answer: str    │
│ created_at   │   │   q2_answer: str    │
│   TIMESTAMPTZ│   │   q3_checked: []    │
└──────────────┘   │   reconstruct: str  │
                   │   attempts: int     │
                   │ }                   │
                   │                     │
                   │ final_r2   DECIMAL  │
                   │ accuracy_pct DECIMAL│
                   │ classroom_link_id   │
                   │            UUID     │
                   │ started_at TIMESTAMPTZ│
                   │ completed_at TIMESTAMPTZ│
                   │ last_active TIMESTAMPTZ│
                   └────────┬────────────┘
                            │
               ┌────────────┼────────────┐
               │            │            │
               │ 1:N        │ 1:1        │ 1:N
               ▼            ▼            ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐
│ TABLE: trials   │  │TABLE: reports│  │ TABLE: ai_tutor_logs│
├─────────────────┤  ├──────────────┤  ├─────────────────────┤
│ id        UUID  │  │ id     UUID  │  │ id           UUID   │
│ session_id UUID │  │ session_id   │  │ session_id   UUID   │
│  FK──────────→  │  │        UUID  │  │  FK────────────→    │
│ trial_no  INT   │  │  FK────────→ │  │ step_id      INT    │
│ variables JSONB │  │ user_id UUID │  │ mode         TEXT   │
│ {               │  │  FK────────→ │  │ trigger      TEXT   │
│  L: 0.75,       │  │ job_id  TEXT │  │ dialogue_idx INT    │
│  m: 100,        │  │ status  TEXT │  │ user_response TEXT  │
│  theta: 10      │  │ CHECK IN     │  │ dismissed    BOOLEAN│
│ }               │  │ ('queued',   │  │ created_at   TIMESTAMPTZ│
│ measured_value  │  │  'processing'│  └─────────────────────┘
│   DECIMAL(10,6) │  │  'completed' │
│ true_value      │  │  'failed')   │
│   DECIMAL(10,6) │  │ format  TEXT │
│ noise_applied   │  │ pdf_url TEXT │
│   DECIMAL(10,8) │  │ expires_at   │
│ derived         │  │   TIMESTAMPTZ│
│   JSONB         │  │ compiler TEXT│
│ {T_sq: 2.34}   │  │ error_msg TEXT│
│ is_anomaly BOOL │  │ created_at   │
│ recorded_at     │  │   TIMESTAMPTZ│
│   TIMESTAMPTZ   │  │ completed_at │
└─────────────────┘  │   TIMESTAMPTZ│
                     └──────────────┘

┌─────────────────────────────────────────────────┐
│  TABLE: flashcards                              │
├─────────────────────────────────────────────────┤
│  id           UUID    PK                        │
│  user_id      UUID    FK → public.users.id      │
│  session_id   UUID    FK → sessions.id (nullable)│
│  module_id    TEXT    NOT NULL                  │
│  card_type    TEXT    CHECK IN ('basic','sr')   │
│  content      JSONB                             │
│  {                                              │
│    front:  "Rumus periode bandul?",             │
│    back:   "T = 2π√(L/g)",                     │
│    formula: "T = 2\\pi\\sqrt{L/g}",            │
│    concept: "isochronisme"                      │
│  }                                              │
│  -- Spaced Repetition fields (untuk Pro):       │
│  leitner_box    INT     DEFAULT 1               │
│  next_review_at TIMESTAMPTZ                     │
│  interval_days  INT     DEFAULT 1               │
│  ease_factor    DECIMAL DEFAULT 2.5             │
│  review_count   INT     DEFAULT 0               │
│  created_at     TIMESTAMPTZ DEFAULT NOW()       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TABLE: classroom_links  (v1.2 feature)         │
├─────────────────────────────────────────────────┤
│  id           UUID    PK                        │
│  teacher_id   UUID    FK → public.users.id      │
│  module_id    TEXT    NOT NULL                  │
│  code         TEXT    UNIQUE  NOT NULL          │
│  title        TEXT                              │
│  is_active    BOOLEAN DEFAULT true              │
│  notify_email TEXT                              │
│  student_count INT    DEFAULT 0                 │
│  created_at   TIMESTAMPTZ DEFAULT NOW()         │
│  expires_at   TIMESTAMPTZ                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TABLE: eureka_shares                           │
├─────────────────────────────────────────────────┤
│  id           UUID    PK                        │
│  session_id   UUID    FK → sessions.id          │
│  user_id      UUID    FK → public.users.id      │
│  platform     TEXT    ('instagram','whatsapp',  │
│                        'twitter','download')    │
│  trial_pro_activated BOOLEAN DEFAULT false      │
│  shared_at    TIMESTAMPTZ DEFAULT NOW()         │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  VIEWS (computed, tidak disimpan)                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  VIEW: user_pro_status                                   │
│  SELECT u.id, u.email,                                   │
│    CASE                                                  │
│      WHEN s.status = 'active' AND s.expires_at > NOW()   │
│        THEN 'pro'                                        │
│      WHEN s.status = 'trial' AND s.trial_ends_at > NOW() │
│        THEN 'trial'                                      │
│      ELSE 'free'                                         │
│    END AS tier                                           │
│  FROM public.users u                                     │
│  LEFT JOIN subscriptions s ON s.user_id = u.id          │
│    AND s.status IN ('active', 'trial')                   │
│  ORDER BY s.created_at DESC;                             │
│                                                          │
│  VIEW: session_summary                                   │
│  SELECT s.id, s.module_id, s.status,                     │
│    COUNT(t.id) as trial_count,                           │
│    s.final_r2, s.accuracy_pct,                           │
│    s.started_at, s.completed_at                          │
│  FROM sessions s                                         │
│  LEFT JOIN trials t ON t.session_id = s.id               │
│  GROUP BY s.id;                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 4.2 OAuth Flow dengan Supabase (Sequence Diagram)

```
Browser          Supabase Auth       Google OAuth        public.users DB
   │                  │                   │                    │
   │ signInWithOAuth() │                   │                    │
   ├─────────────────►│                   │                    │
   │                  │ redirect to       │                    │
   │◄─────────────────┤ Google OAuth URL  │                    │
   │                  │                   │                    │
   │ [User di Google: Pilih akun, setujui scope]               │
   │────────────────────────────────────►│                    │
   │                  │ authorization code│                    │
   │                  │◄──────────────────┤                    │
   │                  │ exchange code for │                    │
   │                  │ access_token      │                    │
   │                  ├──────────────────►│                    │
   │                  │◄──────────────────┤                    │
   │                  │ get user profile  │                    │
   │                  ├──────────────────►│                    │
   │                  │◄──────────────────┤                    │
   │                  │ { email, name, picture }               │
   │                  │                                        │
   │                  │ INSERT auth.users (if new)             │
   │                  ├───────────────────────────────────────►│
   │                  │ TRIGGER: handle_new_user()             │
   │                  │ → INSERT public.users                  │
   │                  │   (id, email, display_name, avatar)    │
   │                  │◄───────────────────────────────────────┤
   │                  │                                        │
   │ JWT session token│                                        │
   │◄─────────────────┤                                        │
   │                  │                                        │
   │ [redirect ke /auth/callback]                              │
   │                                                           │
   │ CHECK: users.consent_at IS NULL?                         │
   │   YES → redirect ke /consent                             │
   │   NO  → CHECK onboarding_done?                           │
   │           NO  → /onboarding                              │
   │           YES → /catalog                                  │
```

## 4.3 RLS Policies (Row Level Security)

```sql
-- ════════════════════════════════════════════
-- Semua tabel HARUS ada RLS
-- ════════════════════════════════════════════

-- users: hanya bisa akses data sendiri
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_access" ON public.users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role bypass (untuk admin + worker)
CREATE POLICY "service_role_access" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────

-- sessions: akses hanya sesi milik sendiri
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_owner" ON public.sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────

-- trials: akses via sessions yang dimiliki
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trials_via_session" ON public.trials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = trials.session_id
        AND sessions.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────

-- reports: akses hanya laporan milik sendiri
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_owner" ON public.reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────

-- subscriptions: read-only untuk user, write untuk service_role
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_read" ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_write_service" ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────

-- flashcards: akses kartu milik sendiri
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flashcards_owner" ON public.flashcards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════
-- TRIGGER: Auto-create public.users on auth signup
-- ════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

# PHASE 5 — ARCHITECTURE

## 5.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Cloudflare CDN    │
                    │   (static assets,   │
                    │   edge cache, DDoS) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Vercel Edge       │
                    │   (Next.js 15)      │
                    │   ┌──────────────┐  │
                    │   │ App Router   │  │
                    │   │ RSC + API    │  │
                    │   │ Routes       │  │
                    │   └──────────────┘  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Supabase    │   │  Upstash Redis   │   │  Railway.app     │
│  (Singapura) │   │  (Queue + Cache) │   │  (PDF Worker)    │
│              │   │                  │   │                  │
│  • Auth      │   │  Bull job queue  │   │  Node 20 +       │
│  • PostgreSQL│   │  for PDF jobs    │   │  TexLive slim +  │
│  • Storage   │   │                  │   │  Typst           │
│  • Realtime  │   │                  │   │                  │
│  • Edge Fn   │   │                  │   │  Pulls jobs from │
│              │   │                  │   │  Redis queue     │
└──────────────┘   └──────────────────┘   └──────────────────┘
        │
        ▼
┌──────────────┐
│  PostHog     │
│  (Analytics) │
│  + Sentry    │
│  (Errors)    │
└──────────────┘
```

## 5.2 Frontend Architecture

```
Next.js App (apps/web/src/)
│
├── APP LAYER (next/app)
│   ├── Server Components (RSC)  ← data fetching, no JS sent
│   ├── Client Components ('use client')  ← interaktif
│   └── API Routes (Edge Runtime)  ← server-side logic
│
├── STATE LAYER
│   ├── Zustand (global client state)
│   │   ├── lab.store  ← step machine, trials, prediction
│   │   ├── ui.store   ← modal, sidebar, toast
│   │   └── user.store ← auth, pro status (cached)
│   └── TanStack Query (server state)
│       ├── module blueprints (static, stale 24h)
│       ├── session data (stale 30s)
│       └── report status (stale 5s, polling)
│
├── PHYSICS LAYER (runs in main thread — Canvas 2D API)
│   ├── usePhysicsLoop (requestAnimationFrame, 60fps)
│   ├── pendulumPhysics.ts (deterministic model)
│   └── noiseInjector.ts (Gaussian, seeded PRNG)
│
└── RENDER LAYER
    ├── Canvas 2D (bandul — MVP)
    │   └── ctx.clearRect → drawRope → drawBob → drawArc
    └── [R3F/Three.js — modul future yang butuh 3D]
```

## 5.3 Physics Loop (Bandul — Canvas 2D)

```
┌─────────────────────────────────────────────────────────┐
│  PHYSICS LOOP (60fps via requestAnimationFrame)         │
│                                                         │
│  State:                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  theta      : current angle (rad)               │   │
│  │  omega      : angular velocity (rad/s)          │   │
│  │  L          : string length (m) — from user     │   │
│  │  g          : 9.80665 m/s²                      │   │
│  │  t          : elapsed time (s)                  │   │
│  │  swingCount : jumlah ayunan selesai             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Per frame (dt = 1/60 s):                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  // Euler integration (cukup akurat untuk UI)   │   │
│  │  alpha = -(g/L) * sin(theta)                    │   │
│  │  omega = omega + alpha * dt                     │   │
│  │  theta = theta + omega * dt                     │   │
│  │                                                 │   │
│  │  // Detect zero-crossing (untuk hitung ayunan)  │   │
│  │  if (sign(theta) != prevSign && crossedZero):   │   │
│  │    swingCount++                                 │   │
│  │    if swingCount == 10: stopAndRecord()         │   │
│  │                                                 │   │
│  │  // Render                                      │   │
│  │  x_bob = pivot.x + L_px * sin(theta)           │   │
│  │  y_bob = pivot.y + L_px * cos(theta)           │   │
│  │  drawScene(ctx, x_bob, y_bob, theta)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  NOISE INJECTION (hanya saat "Rekam Data"):             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  T_true = 2π × √(L / g)                        │   │
│  │  ε = gaussianNoise(0, 0.015 × T_true)           │   │
│  │  T_obs = T_true + ε                             │   │
│  │  // T_obs yang dikirim ke tabel & server        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 5.4 Data Flow: Trial Recording

```
[User klik "Rekam Data"]
         │
         ▼
[noiseInjector.ts]
  T_obs = T_true + gaussian(σ=1.5%)
         │
         ▼
[Optimistic UI update]
  → tambah row ke LiveDataTable (local state)
  → progress dots update
         │
         ▼ (async, non-blocking)
[POST /api/trials]
  Body: { session_id, trial_no, variables, measured_value, true_value, noise_applied }
         │
         ▼
[API Route Handler]
  → validate (Zod schema)
  → INSERT trials WHERE session_id verified (RLS)
  → return { id, recorded_at }
         │
         ▼
[TanStack Query invalidate]
  → refetch session summary
```

## 5.5 PDF Async Pipeline (Sequence)

```
User      Next.js API    Upstash Redis    Railway Worker    Supabase    Browser
 │             │               │                │              │           │
 │ POST queue  │               │                │              │           │
 ├────────────►│               │                │              │           │
 │             │ enqueue job   │                │              │           │
 │             ├──────────────►│                │              │           │
 │             │ return job_id │                │              │           │
 │◄────────────┤               │                │              │           │
 │             │               │                │              │           │
 │ [UI: spinner + "Menyusun laporan..."]         │              │           │
 │             │               │                │              │           │
 │ [Subscribe Supabase Realtime: report-jobs:{job_id}]         │           │
 │─────────────────────────────────────────────────────────────────────────►
 │             │               │                │              │           │
 │             │               │ dequeue job    │              │           │
 │             │               ├───────────────►│              │           │
 │             │               │                │ build PDF    │           │
 │             │               │                │ (30-90s)     │           │
 │             │               │                │              │           │
 │             │               │                │ upload PDF   │           │
 │             │               │                ├─────────────►│           │
 │             │               │                │ signed URL   │           │
 │             │               │                │◄─────────────┤           │
 │             │               │                │              │           │
 │             │               │                │ UPDATE reports           │
 │             │               │                │ status='completed'       │
 │             │               │                ├─────────────►│           │
 │             │               │                │              │           │
 │             │               │                │ Realtime broadcast       │
 │             │               │                │              ├──────────►│
 │             │               │                │              │           │
 │ [UI: tombol "Unduh PDF" muncul]                              │           │
 │◄────────────────────────────────────────────────────────────────────────┤
```

---

# PHASE 6 — WIREFRAME

## 6.1 Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo FisikaSeru]                    [Masuk] [Coba Gratis →]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         Lab Fisika di Genggamanmu                               │
│         ─────────────────────────                               │
│     Buktikan Hukum Newton. Timbang Elektron.                    │
│         Hitung Gravitasi dari Kamarmu.                          │
│                                                                 │
│         [  ▶ Coba Gratis — Tanpa Daftar  ]                     │
│                                                                 │
│    ┌────────────────────────────────────────────┐              │
│    │                                            │              │
│    │   [GIF/Video: animasi bandul berayun,      │              │
│    │    tabel data terisi, grafik muncul,       │              │
│    │    eureka animation]                       │              │
│    │                                            │              │
│    └────────────────────────────────────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  💡 Bukan hafal rumus  │  🔬 Lab virtual nyata  │  🧠 AI Tutor │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   "Saya akhirnya ngerti kenapa bandul nggak bergantung          │
│    sama beratnya. Data saya sendiri yang buktiin."              │
│    — Rafi, Kelas 11 SMAN 3 Bandung                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6.2 Consent Screen

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]          Sebelum Mulai...                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Hei [Nama]! Sebelum kamu eksplorasi, kami perlu               │
│  beberapa informasi dari kamu.                                  │
│                                                                 │
│  Tahun Lahir: [____]                                           │
│                                                                 │
│  ─────────────────────────────────────────────                 │
│  Data yang kami simpan:                                         │
│  • Email kamu (untuk login)                                     │
│  • Hasil eksperimen (untuk laporan kamu)                        │
│  • Progress belajar (agar bisa lanjut di sesi berikutnya)      │
│                                                                 │
│  Kami TIDAK menjual data ke pihak ketiga.                      │
│  Kami TIDAK menampilkan iklan.                                  │
│                                                                 │
│  Kamu bisa hapus akunmu kapan saja di Settings.                │
│                                                                 │
│  [Baca Kebijakan Privasi lengkap →]                            │
│                                                                 │
│  ☐ Saya setuju dengan ketentuan di atas                       │
│                                                                 │
│  [    Tidak Setuju    ]     [    Setuju & Lanjut ▶    ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6.3 Catalog / Beranda

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  FisikaSeru        [Progres] [Profil]  [🔍]             │
├──────────────────────────────────────────────────────────────── │
│ Mekanika  │  Listrik  │  Modern  │  Termal  │  Semua           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mulai dari sini 👇                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔥 POPULER MINGGU INI                 [Lihat Semua]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │[GIF bandul] │  │[GIF circuit]│  │[GIF drop]   │    │   │
│  │  │ Mekanika    │  │  Listrik    │  │  Mekanika   │    │   │
│  │  │ Misteri     │  │ Rangkaian   │  │ Jatuh Bebas │    │   │
│  │  │ Bandul      │  │    Ohm      │  │             │    │   │
│  │  │ ⏱ ~13 mnt  │  │ ⏱ ~10 mnt  │  │ ⏱ ~8 mnt   │    │   │
│  │  │ ●○○ Mudah  │  │ [🔒 Segera] │  │ [🔒 Segera] │    │   │
│  │  │ [Mulai Lab] │  │             │  │             │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6.4 Lab Screen — Step 2 (Setup)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Catalog   Misteri Bandul    [●●○○○○] Step 2: Setup           │
├──────────────────────────────────────────────────────────────── │
│                                                                 │
│ ┌────────────────┐ ┌──────────────────────────┐ ┌──────────┐  │
│ │ KONTROL        │ │     PREVIEW              │ │  SIAP?   │  │
│ │                │ │                          │ │          │  │
│ │ Panjang Tali ? │ │                          │ │ Setelah  │  │
│ │ L  [━━━●────]  │ │    ╭─ pivot              │ │ kamu set │  │
│ │    0.75 m      │ │    │                     │ │ variabel,│  │
│ │  [0.20]  [2.00]│ │    │                     │ │ klik     │  │
│ │                │ │    │                     │ │ Mulai    │  │
│ │ Massa Beban  ? │ │   ╔╧╗                    │ │ untuk    │  │
│ │ ○ 50g          │ │   ║●║  ← beban           │ │ eksperi- │  │
│ │ ● 100g         │ │   ╚╤╝                    │ │ men!     │  │
│ │ ○ 200g         │ │    │                     │ │          │  │
│ │ ○ 500g         │ │   arc trail preview      │ │          │  │
│ │                │ │                          │ │          │  │
│ │ Sudut Awal   ? │ │   ←──────── L: 0.75m     │ │          │  │
│ │ θ [━━●──────]  │ │             ditampilkan  │ │          │  │
│ │    10°         │ │                          │ │          │  │
│ │  [5°]    [15°] │ │                          │ │          │  │
│ │                │ └──────────────────────────┘ │          │  │
│ │ ⚠️ > 15°:      │                              │          │  │
│ │ aproksimasi    │                              │ [Mulai   │  │
│ │ tidak berlaku  │                              │  Lab ▶]  │  │
│ └────────────────┘                              └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 6.5 Lab Screen — Step 3 (Experiment)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Setup   Misteri Bandul   [●●●○○○] Step 3: Eksperimen         │
├──────────────────────────────────────────────────────────────── │
│                                                                 │
│ ┌────────────────┐ ┌──────────────────────────┐ ┌────────────┐ │
│ │ INSTRUMEN      │ │      KANVAS LAB           │ │    DATA    │ │
│ │                │ │                          │ │            │ │
│ │ L: 0.75 m      │ │    ● pivot               │ │ Trial  L  T│ │
│ │ m: 100 g       │ │    │                     │ │ ─────────  │ │
│ │ θ: 10°         │ │    │                     │ │  1   0.75  │ │
│ │                │ │    │                     │ │      1.73s │ │
│ │ ─────────────  │ │    │                     │ │  2   0.75  │ │
│ │ STOPWATCH      │ │   ╔●╗  ← seret ke sudut  │ │      1.71s │ │
│ │                │ │   ╚╤╝                    │ │  3   1.00  │ │
│ │  00:00.000     │ │    │                     │ │      1.99s │ │
│ │                │ │   arc trail (biru)       │ │            │ │
│ │ [ ▶ Mulai ]    │ │                          │ │  ●●●○○     │ │
│ │ [  ■ Stop ]    │ │    Gaya:                 │ │  3/5 trial │ │
│ │ [  ↺ Reset ]   │ │    [✓] Gravitasi         │ │            │ │
│ │                │ │    [ ] Tegangan          │ │  [Rekam    │ │
│ │ Ayunan: 0/10   │ │                          │ │   Data ●]  │ │
│ │                │ │   T real-time: -- s      │ │            │ │
│ └────────────────┘ └──────────────────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 6.6 Lab Screen — Step 4 (Analysis)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Eksperimen   Analisis Data   [●●●●○○] Step 4: Analisis       │
├──────────────────────────────────────────────────────────────── │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │                    T² vs L (m)                          │    │
│ │    T²(s²)                                               │    │
│ │  4 ┤                              ● ←titik data         │    │
│ │    │                         ●                          │    │
│ │  3 ┤                    ●                               │    │
│ │    │               ●                                    │    │
│ │  2 ┤          ●                                         │    │
│ │    │                                                    │    │
│ │  1 ┤     ●                                              │    │
│ │    │                                                    │    │
│ │  0 ┼────┬────┬────┬────┬────┬────┬────                │    │
│ │       0.2  0.5  0.75 1.0  1.25 1.5  2.0  L(m)         │    │
│ │                                                         │    │
│ │   ────── garis regresi (seret ujungnya!) ──────        │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  R² = 0.82  ✅           Gradien = 4.02                        │
│  [────────────────────]  → g = 4π²/4.02 = 9.80 m/s²           │
│                                                                 │
│  [💡 Minta Bantuan AI]    [ Lanjut ke Refleksi ▶ ]            │
└─────────────────────────────────────────────────────────────────┘
```

## 6.7 Step 5 — Confrontation Card (Reflect)

```
┌─────────────────────────────────────────────────────────────────┐
│                      ✨ Momen Refleksi                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  🧠 PREDIKSIMU (tadi):                                  │  │
│  │     "Tali lebih panjang → bandul lebih cepat"           │  │
│  │                                                          │  │
│  │  ──────────────────────────────────────                 │  │
│  │                                                          │  │
│  │  📊 DATA EKSPERIMENMU:                                  │  │
│  │     T² ∝ L  (hubungan linear, R² = 0.82)               │  │
│  │     Tali panjang → T besar → lebih lambat ✓            │  │
│  │     Massa: TIDAK berpengaruh pada T                     │  │
│  │     g eksperimenmu: 9.80 m/s²                           │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🤖 AI Tutor bertanya:                                         │
│                                                                 │
│  "Kenapa tali panjang membuat bandul lebih lambat?             │
│   Apa yang sebenarnya berubah saat tali dipanjangkan?"         │
│                                                                 │
│  ○ Gaya gravitasi jadi lebih kecil                            │
│  ● Jarak yang harus ditempuh beban jadi lebih panjang         │
│  ○ Massa beban jadi lebih besar                                │
│                                                                 │
│                              [ Jawab & Lanjut ▶ ]             │
└─────────────────────────────────────────────────────────────────┘
```

## 6.8 Step 6 — Report & Reward

```
┌─────────────────────────────────────────────────────────────────┐
│                   🎉 Eureka! Kamu berhasil!                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │   🏆 Penemu Galileo      │  │  📊 Akurasi Ilmiah       │   │
│  │                          │  │                          │   │
│  │  Kamu menghitung:        │  │   g eksperimen: 9.80     │   │
│  │  g = 9.80 m/s²           │  │   g literatur:  9.81     │   │
│  │                          │  │                          │   │
│  │  dari kamarmu sendiri!   │  │   Akurasi: 99.9% ✅      │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │   📋 LAPORAN                                              │ │
│  │                                                           │ │
│  │   ⏳ Sedang menyusun laporan PDF...                      │ │
│  │   [████████░░░░░░░░░░] 45%                               │ │
│  │                                                           │ │
│  │   Estimasi: ~20 detik lagi                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────┐    ┌────────────────────────────────┐ │
│  │  📤 Bagikan Eureka  │    │  💡 Soal HOTS (preview gratis) │ │
│  │  Card ke sosmed     │    │                                │ │
│  │  → Dapat 7 hari Pro │    │  "Di planet Mars (g=3.72),    │ │
│  │    gratis!          │    │   berapa T untuk L=1m?"        │ │
│  └─────────────────────┘    │  [Lihat 9 soal lagi — Pro ▶] │ │
│                              └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 6.9 AI Tutor — Micro-Hint Mode

```
┌─────────────────────────────────────────────────────────────────┐
│         [Scatter plot — Step 4]                                 │
│                                                                 │
│    T²│                ●                                         │
│      │           ●                                              │
│      │       ●             ┌─────────────────────────────┐     │
│      │    ●                │ 💡 Garismu hampir pas!      │     │
│      │●                    │                             │     │
│      └──────────────  L    │ Coba geser ujung kanan      │     │
│                            │ sedikit ke atas ↗           │     │
│      ↑ area target         │                             │     │
│    (highlight hijau        │         R² = 0.71           │     │
│     transparan)            │         Target: > 0.75      │     │
│                            │                             │     │
│                            │              [Tutup ✕]      │     │
│                            └─────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

# PHASE 7 — TASK BREAKDOWN

## 7.1 Sprint 0 — Project Setup (Week 1)

```
SETUP TASKS:
├── [ ] Init monorepo dengan Turborepo + pnpm
├── [ ] Setup packages: shared-types, ui, config
├── [ ] Init apps/web dengan Next.js 15 + TypeScript strict
├── [ ] Init apps/pdf-worker dengan Node 20 + TypeScript
├── [ ] Setup Supabase project (ap-southeast-1)
├── [ ] Setup Upstash Redis (free tier)
├── [ ] Railway account + project setup
├── [ ] Environment variables (.env.example, Vercel config)
├── [ ] GitHub Actions: CI (lint + typecheck + test) pipeline
├── [ ] Vercel deployment: apps/web
└── [ ] Supabase migrations: init schema semua tabel

DEFINITION OF DONE:
  → `pnpm dev` berjalan lokal tanpa error
  → CI pass pada PR kosong
  → Vercel deploy berhasil (blank Next.js app)
  → Supabase tables terbuat dengan semua RLS policies
```

## 7.2 Sprint 1 — Auth & Consent (Week 2)

```
AUTH TASKS:
├── [ ] Implementasi Google OAuth via Supabase
│   ├── [ ] Konfigurasi OAuth di Google Cloud Console
│   ├── [ ] Supabase auth callback route handler
│   ├── [ ] State/CSRF protection
│   └── [ ] Session middleware (next/middleware.ts)
│
├── [ ] Magic Link flow
│   ├── [ ] Email template (bahasa Indonesia)
│   └── [ ] Callback handler
│
├── [ ] Auth trigger: auto-create public.users
│   └── [ ] SQL trigger handle_new_user()
│
├── [ ] Consent Screen (UU PDP)
│   ├── [ ] UI: form + checkbox
│   ├── [ ] Birth year input + validasi umur
│   ├── [ ] Flow < 13 tahun: kirim email orang tua
│   ├── [ ] API: POST /api/consent
│   └── [ ] Middleware: redirect ke /consent jika belum consent
│
├── [ ] Logout + session invalidation
└── [ ] Rate limiting pada auth endpoints

TESTING:
├── [ ] Unit: consent validator (birth year < 13)
├── [ ] Integration: OAuth flow E2E (Playwright)
└── [ ] Security: CSP headers check
```

## 7.3 Sprint 2 — Onboarding (Week 3)

```
ONBOARDING TASKS:
├── [ ] OnboardingOrchestrator (step machine: scene 1-4)
├── [ ] Scene 1: Device calibration
│   ├── [ ] Canvas 2D object untuk drag/tap/zoom test
│   └── [ ] Input method detection + save ke store
├── [ ] Scene 2: Galileo moment
│   ├── [ ] Animasi 2 bola jatuh bersamaan (Canvas 2D)
│   └── [ ] Prediksi UI + celebratory reveal
├── [ ] Scene 3: AI Tutor intro
│   └── [ ] Avatar + dialogue bubble
├── [ ] Scene 4: Level selection (SMP/SMA/Kuliah)
│   └── [ ] Save ke users.level via PATCH /api/users
├── [ ] Skip logic (scene 1-3 bisa skip, scene 4 tidak)
├── [ ] Onboarding state persistence (jika ditutup = resume)
└── [ ] Routing: post-onboarding → /catalog

TESTING:
├── [ ] Unit: scene state machine
└── [ ] E2E: full onboarding flow (Playwright)
```

## 7.4 Sprint 3 — Catalog (Week 4)

```
CATALOG TASKS:
├── [ ] Halaman catalog (SSG/ISR via Next.js)
├── [ ] SimCard component
│   ├── [ ] Thumbnail (static image untuk MVP, GIF setelah)
│   ├── [ ] Title B2C, durasi, difficulty, tier
│   └── [ ] "Locked" state untuk modul belum tersedia
├── [ ] Category filter (tab pills)
├── [ ] SimCardSkeleton (loading state)
├── [ ] Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
└── [ ] Navigation ke lab screen

API:
└── [ ] GET /api/modules (hardcoded untuk MVP, 1 modul)
```

## 7.5 Sprint 4 — Lab Session Core (Week 5-6)

```
LAB SESSION TASKS:
├── [ ] Session creation: POST /api/sessions
├── [ ] LabOrchestrator: step state machine (Step 1-6)
├── [ ] LabStepIndicator: progress bar
├── [ ] LabLayout: 3-kolom responsive
│
├── [ ] Step 1: Knowledge Activation
│   ├── [ ] Question + options UI
│   ├── [ ] Prediction save ke store + server
│   └── [ ] Auto-advance logic (90 detik)
│
├── [ ] Step 2: Setup
│   ├── [ ] DataSlider component (A11y: ARIA + keyboard)
│   ├── [ ] VariableDropdown (massa)
│   ├── [ ] Preview canvas (2D, real-time coupling)
│   ├── [ ] Constraint warning (sudut mendekati 15°)
│   └── [ ] "Mulai" button gating logic
│
├── [ ] Step 3: Experiment (Canvas 2D Physics)
│   ├── [ ] Pendulum physics loop (requestAnimationFrame)
│   ├── [ ] Canvas 2D rendering (tali, beban, arc trail)
│   ├── [ ] Stopwatch (10 swing counter)
│   ├── [ ] Noise injection (Gaussian, seeded PRNG)
│   ├── [ ] LiveDataTable (auto-fill)
│   ├── [ ] RecordButton (dengan micro-animation)
│   ├── [ ] POST /api/trials
│   └── [ ] Progress dots (3/5 trial)
│
├── [ ] Step 4: Analysis
│   ├── [ ] Scatter plot (D3.js, T² vs L)
│   ├── [ ] Draggable regression line (D3 drag)
│   ├── [ ] R² real-time calculation
│   ├── [ ] GradientPanel (nilai + interpretasi)
│   └── [ ] R² gating (> 0.75 untuk lanjut)
│
├── [ ] Session checkpoint (save ke IndexedDB setiap 30s)
└── [ ] beforeunload handler (cegah data loss)

TESTING:
├── [ ] Unit: physics model accuracy (deviasi < 0.1%)
├── [ ] Unit: Gaussian noise distribution
├── [ ] Unit: linear regression R² calculation
└── [ ] E2E: full Step 1-4 flow
```

## 7.6 Sprint 5 — AI Tutor + Reflect (Week 7)

```
AI TUTOR TASKS:
├── [ ] TutorTriggerEngine (rule-based evaluator)
│   ├── [ ] Trigger: R² < 0.75 setelah 3 attempt
│   ├── [ ] Trigger: timeout 3 menit di Step 4
│   └── [ ] Cooldown logic (90 detik antar trigger)
│
├── [ ] Mode 1: Micro-Hint
│   ├── [ ] Canvas overlay: target area band (hijau transparan)
│   ├── [ ] Animasi panah
│   └── [ ] Auto-dismiss logic
│
├── [ ] Mode 2: Socratic Dialogue
│   ├── [ ] Dialogue card UI (non-blocking)
│   ├── [ ] 3 pertanyaan sekuensial
│   ├── [ ] Dialogue template: bandul.templates.ts
│   └── [ ] "Saya sudah coba" acknowledgment
│
├── [ ] Step 5: Reflect & Reconstruct
│   ├── [ ] ConfrontationCard UI (full-attention, non-skippable 4 detik)
│   ├── [ ] Mode 2B: Reflection Partner
│   │   ├── [ ] Q1: pilih reasoning (3 opsi)
│   │   ├── [ ] Q2: bandul di Bulan (3 opsi)
│   │   └── [ ] Q3: centang variabel (L, m, g, θ, udara)
│   ├── [ ] Validator: L dan g harus dicentang, m tidak
│   └── [ ] Save reflection_data ke server
│
└── [ ] TutorDismissButton (selalu visible, accessible)

TESTING:
├── [ ] Unit: trigger engine rules
├── [ ] Unit: dialogue template renderer
├── [ ] Unit: reflection validator
└── [ ] Integration: full Step 4-5 dengan AI Tutor
```

## 7.7 Sprint 6 — Report Engine (Week 8)

```
PDF WORKER TASKS:
├── [ ] Dockerfile: Node 20 + TexLive slim + Typst
├── [ ] Railway deployment config
├── [ ] Bull worker setup (Upstash Redis)
├── [ ] bandul.tex template LaTeX
├── [ ] Data injector (session data → .tex placeholders)
├── [ ] Graph generation (Chart.js server-side render)
├── [ ] pdflatex compiler (sandboxed subprocess)
├── [ ] Typst fallback compiler
├── [ ] Supabase Storage upload
├── [ ] Job status update (completed/failed)
└── [ ] Error handling + retry logic

NEXT.JS API TASKS:
├── [ ] POST /api/reports/queue (enqueue job)
├── [ ] GET /api/reports/status?job_id=X
└── [ ] Supabase Realtime: broadcast saat PDF selesai

FRONTEND TASKS:
├── [ ] ReportQueue UI (spinner + progress)
├── [ ] Supabase Realtime subscriber (useSupabaseRealtime)
├── [ ] PDF download button (signed URL)
├── [ ] EurekaCard generator (Canvas API, client-side)
├── [ ] Share button (Web Share API + fallback)
└── [ ] Flashcard display (basic, static)

TESTING:
├── [ ] Unit: LaTeX template injection
├── [ ] Unit: signed URL generation
└── [ ] Integration: full queue → generate → download flow
```

## 7.8 Sprint 7 — Step 6 + Monetization Triggers (Week 9)

```
STEP 6 TASKS:
├── [ ] Badge display ("Penemu Galileo")
├── [ ] Akurasi ilmiah kalkulasi + display
├── [ ] HOTS preview (1 soal hardcoded untuk MVP)
├── [ ] Upsell trigger: post-eureka
├── [ ] UpgradeModal UI
└── [ ] Trial activation flow (post-share)

EUREKA SHARE TASKS:
├── [ ] Eureka Card visual design (Canvas API)
├── [ ] Web Share API integration
├── [ ] POST /api/eureka-shares (log + activate trial)
└── [ ] Toast: "7 hari Pro gratis diaktifkan!"
```

## 7.9 Sprint 8 — Polish + A11y + Performance (Week 10)

```
POLISH TASKS:
├── [ ] Keyboard navigation full path test
├── [ ] Screen reader audit (VoiceOver + NVDA)
├── [ ] ARIA attributes review semua komponen
├── [ ] Color contrast check (WCAG 2.1 AA)
├── [ ] Performance budget enforcement
│   ├── [ ] Bundle analysis
│   ├── [ ] Lighthouse CI (TTI < 3s)
│   └── [ ] Canvas FPS monitor
├── [ ] Error states: semua API failure scenario
├── [ ] Offline: beforeunload + IndexedDB checkpoint
├── [ ] PWA manifest + service worker (shell cache)
└── [ ] Cross-browser: Chrome, Firefox, Safari (iOS)

TESTING:
├── [ ] axe-core automated scan (0 violations)
├── [ ] Full E2E: new user → consent → onboarding →
│         catalog → lab → report → share
├── [ ] Physics accuracy regression test (100 scenarios)
└── [ ] Load test: PDF worker (10 concurrent jobs)
```

---

# PHASE 8 — PROMPT SPEC

> Prompt spec ini digunakan untuk mengarahkan AI coding assistant
> (Cursor, GitHub Copilot, Claude) dalam mengimplementasikan komponen.

## 8.1 Prompt: Physics Engine (Bandul)

```
CONTEXT:
Kamu membangun pendulum physics engine untuk FisikaSeru 3.0.
Ini adalah CANVAS 2D app (bukan Three.js/3D).
Pendekatan: "stylized scientific realism" — bersih, elegan, seperti instrumen lab.

TECH: TypeScript, React, Canvas 2D API, requestAnimationFrame

PHYSICS SPEC:
- Formula: T_true = 2π × Math.sqrt(L / 9.80665)
- Noise: T_obs = T_true + gaussian(0, 0.015 × T_true)
  - Implementasi Gaussian: Box-Muller transform
  - Seeded PRNG: Mulberry32 algorithm (reproducible per session seed)
- Simulation: Euler integration
  - alpha = -(g/L) * sin(theta)  (bukan aproksimasi sin θ ≈ θ)
  - omega += alpha * dt  (dt = 1/60)
  - theta += omega * dt
- Zero-crossing detection untuk hitung jumlah ayunan
- Auto-stop setelah 10 ayunan, T_obs dikalkulasi

CANVAS RENDERING SPEC:
- Background: #1C2333 (dark lab)
- Pivot: titik kecil 8px radius, warna #64748B
- Tali: garis putih, lebar 2px, opacity 0.9
- Beban: lingkaran 20px, fill #3B9EE2 (sky blue), shadow blur 10px
- Arc trail: path setengah lingkaran, warna rgba(59,158,226,0.15), fade
- Vektor gaya (toggle): panah merah (gravitasi) + panah putih (tegangan)
- Constraint violation: beban warna merah (#C0392B), tali bergetar ±2px

COMPONENT INTERFACE:
interface PendulumCanvasProps {
  L: number;           // panjang tali dalam meter
  m: number;           // massa dalam gram (tidak memengaruhi fisika, hanya visual)
  theta0: number;      // sudut awal dalam derajat
  isRunning: boolean;
  onSwingComplete: (T_obs: number, T_true: number, noise: number) => void;
  onConstraintViolation: () => void;
  seed: number;        // untuk reproducible noise
  showVectors?: boolean;
  width?: number;
  height?: number;
}

BUATKAN:
1. usePendulumPhysics hook (state machine + physics loop)
2. PendulumCanvas component (rendering)
3. gaussianNoise utility (Box-Muller + Mulberry32 PRNG)

JANGAN:
- Jangan pakai requestIdleCallback (butuh smooth 60fps)
- Jangan pakai useEffect untuk physics loop (pakai useRef + RAF)
- Jangan pakai aproksimasi sin θ ≈ θ (pakai sin(theta) asli)
- Jangan remount canvas pada prop change (update via ref)
```

## 8.2 Prompt: Regression Analysis + Scatter Plot

```
CONTEXT:
Implementasi Step 4 Analysis di FisikaSeru: scatter plot interaktif
dengan drag regression line dan real-time R² calculation.

TECH: TypeScript, React, D3.js v7

DATA FORMAT:
interface Trial {
  L: number;       // panjang tali (m) — independent variable
  T: number;       // periode (s)
  T_sq: number;    // T² = T * T — ini yang di-plot di Y axis
}

ANALYSIS SPEC:
- Plot: T² (Y axis) vs L (X axis) — bukan T vs L!
- Regression: least squares linear regression
  - slope = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
  - intercept = (Σy - slope·Σx) / n
  - R² = 1 - (SS_res / SS_tot)
  - dimana SS_res = Σ(y - y_pred)², SS_tot = Σ(y - ȳ)²
- User interaction: drag dua endpoint garis regresi
  - Line di-render sebagai SVG <line>
  - Dua handle circle (radius 8px) di ujung kiri dan kanan
  - Drag handle → recalculate R² untuk garis user vs data
  - R² yang ditampilkan = R² garis USER (bukan garis optimal)
  - Target R² > 0.75 untuk unlock Step 5

AI TUTOR INTEGRATION:
- Setelah attempt ke-3 dengan R² < 0.75:
  - Render band hijau transparan (opacity 0.1) sebagai "zona target"
  - Band = area antara garis optimal ± 10% gradient
  - Animasi: band pulsate (opacity 0.05 → 0.15, 1.5 detik cycle)

COMPONENT INTERFACE:
interface ScatterPlotProps {
  trials: Trial[];
  onR2Change: (r2: number, userSlope: number, userIntercept: number) => void;
  attemptCount: number;    // untuk trigger AI Tutor visual
  showTargetBand?: boolean;
}

BUATKAN:
1. linearRegression(x: number[], y: number[]): { slope, intercept, r2 }
2. ScatterPlot component dengan D3 drag interaction
3. R2Display component (badge + progress bar visual)

JANGAN:
- Jangan pakai library regresi eksternal (buat sendiri dari formula)
- Jangan re-render seluruh D3 chart saat drag (update hanya line + R²)
- Jangan pakai SVG foreignObject (accessibility issue)
```

## 8.3 Prompt: AI Tutor Trigger Engine

```
CONTEXT:
Rule-based AI Tutor trigger engine untuk FisikaSeru.
BUKAN LLM/API call — murni rule-based dengan template dialogue.

TECH: TypeScript (pure, no React dependency)

TRIGGER RULES (ordered by priority):
const TUTOR_RULES: TutorRule[] = [
  {
    id: 'onboarding_session',
    condition: (ctx) => ctx.isFirstSession,
    mode: 'guided_full',
    cooldown_ms: 0,
  },
  {
    id: 'regression_fail_3x',
    condition: (ctx) => ctx.regressionAttempts === 3 && ctx.currentR2 < 0.75,
    mode: 'micro_hint',
    cooldown_ms: 90_000,
  },
  {
    id: 'regression_fail_5x',
    condition: (ctx) => ctx.regressionAttempts === 5 && ctx.currentR2 < 0.75,
    mode: 'socratic',
    cooldown_ms: 120_000,
  },
  {
    id: 'step_timeout',
    condition: (ctx) => ctx.currentStep === 4 && ctx.timeOnStep > 180_000,
    mode: 'micro_hint',
    cooldown_ms: 120_000,
  },
  {
    id: 'step5_reflection',
    condition: (ctx) => ctx.currentStep === 5,
    mode: 'reflection_partner',
    cooldown_ms: 0,
    oneTime: true,
  },
];

CONTEXT TYPE:
interface TutorContext {
  currentStep: number;
  regressionAttempts: number;
  currentR2: number;
  timeOnStep: number;       // ms sejak masuk step
  isFirstSession: boolean;
  lastTutorAt: number;      // timestamp terakhir tutor muncul
  tutorCount: number;       // total intervensi sesi ini
  anomalyTrialNo?: number;  // trial mana yang jadi outlier
  moduleId: string;
}

interface TutorDecision {
  shouldTrigger: boolean;
  mode?: 'micro_hint' | 'socratic' | 'reflection_partner' | 'guided_full';
  dialogueKey?: string;     // key untuk lookup di template
  params?: Record<string, string | number>;  // untuk interpolasi template
}

DIALOGUE TEMPLATES (bandul.templates.ts):
const BANDUL_TEMPLATES = {
  'micro_hint.regression_fail_3x': {
    visual: 'target_band',    // render hijau transparan di scatter plot
    text: 'Garismu hampir pas! Coba geser ujung kanan sedikit ke atas ↗',
  },
  'socratic.regression_fail_5x': {
    questions: [
      'Titik data mana yang paling jauh dari garismu?',
      'Bandingkan trial ke-{{anomalyTrialNo}} dengan yang lain — apa yang beda?',
      'Kalau kamu hapus trial itu, apa yang berubah pada R²?',
    ],
  },
  'reflection_partner.step5': {
    q1: { text: 'Kenapa tali panjang membuat bandul lebih lambat?', options: [...] },
    q2: { text: 'Kalau di Bulan (g=1.6), apa yang terjadi dengan T?', options: [...] },
    q3: { text: 'T bergantung pada variabel mana?', checkboxes: ['L','m','g','θ','udara'], correct: ['L','g'] },
  },
};

BUATKAN:
1. evaluateTutorRules(context: TutorContext): TutorDecision
2. renderDialogueTemplate(key: string, params: Record<string, any>): string
3. useTutorStore (Zustand slice) untuk state tutor
4. TutorTriggerEngine component (wraps Step 4 + 5, evaluates tiap 5 detik)

CONSTRAINT:
- Max 3 intervensi per sesi (tutorCount check)
- Cooldown harus dihormati (jangan spam)
- Tutor TIDAK boleh block canvas atau data table
```

## 8.4 Prompt: Async PDF Queue

```
CONTEXT:
Implementasi async PDF generation pipeline untuk FisikaSeru.
Frontend → API Route → Redis Bull → Railway Worker → Supabase Storage.

TECH: TypeScript, Next.js API Routes, Upstash Redis (@upstash/redis + bull),
      Railway (Node 20 + Docker), Supabase Storage, Supabase Realtime

API ROUTE: POST /api/reports/queue
Request body (Zod schema):
  {
    session_id: z.string().uuid(),
    graph_base64: z.string(),     // PNG graph sebagai base64
    module_id: z.string(),
  }

Response (immediate, < 200ms):
  { job_id: string }

JOB PAYLOAD (yang masuk ke Redis queue):
  {
    job_id: string,
    user_id: string,
    session_id: string,
    module_id: string,
    graph_base64: string,
    user_name: string,
    session_data: {
      trials: Trial[],
      final_r2: number,
      accuracy_pct: number,
      prediction_data: PredictionData,
      reflection_data: ReflectionData,
    }
  }

WORKER STEPS:
1. Dequeue job dari Bull queue
2. Build graph PNG dari base64 → simpan ke /tmp/graph_{job_id}.png
3. Load bandul.tex template
4. Inject data menggunakan string interpolation ({{variable}})
   - {{user_name}}, {{date}}, {{trials_table}}, {{final_r2}},
   - {{g_value}}, {{accuracy_pct}}, {{prediction_text}},
   - {{reflection_text}}, \\includegraphics{/tmp/graph_{job_id}.png}
5. Write ke /tmp/report_{job_id}.tex
6. Run: pdflatex -interaction=nonstopmode -output-directory=/tmp /tmp/report_{job_id}.tex
   - Timeout: 60 detik
   - Jika gagal: coba Typst (fallback)
7. Upload /tmp/report_{job_id}.pdf ke Supabase Storage
8. UPDATE reports SET status='completed', pdf_url=signedUrl WHERE job_id=X
9. Cleanup /tmp files

REALTIME NOTIFICATION:
Setelah step 8, broadcast ke Supabase Realtime channel:
  channel: `report-jobs:${job_id}`
  payload: { status: 'completed', pdf_url: '...' }

ERROR HANDLING:
- pdflatex error: capture stderr, log ke Sentry, fallback ke Typst
- Typst error: mark as failed, UPDATE reports SET status='failed', error_msg=X
- Timeout (60s): cancel process, mark failed
- Upload error: retry 3×, jika gagal mark failed

BUATKAN:
1. apps/web/src/app/api/reports/queue/route.ts
2. apps/pdf-worker/src/worker.ts (Bull worker)
3. apps/pdf-worker/src/generators/pdf.generator.ts
4. apps/pdf-worker/src/compilers/pdflatex.compiler.ts
5. apps/pdf-worker/templates/modules/bandul.tex (template LaTeX)
6. apps/web/src/hooks/useSupabaseRealtime.ts
7. apps/web/src/components/report/ReportQueue.tsx

JANGAN:
- Jangan block Next.js API route menunggu PDF selesai
- Jangan simpan file PDF di Vercel (serverless, no persistent storage)
- Jangan generate PDF di Edge Runtime (Node.js built-in required)
```

## 8.5 Prompt: Supabase Auth + UU PDP Consent

```
CONTEXT:
Implementasi auth Google OAuth + Magic Link dengan Supabase,
dilanjutkan consent flow khusus UU PDP Indonesia.
Target pengguna termasuk minor (SMA = 15-18 tahun, bisa < 13 tahun).

TECH: TypeScript, Next.js 15, @supabase/ssr, Zod

FLOW:
1. User klik "Masuk dengan Google"
2. supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
3. Google OAuth → callback ke /auth/callback
4. /auth/callback: exchange code → session
5. Check public.users: consent_at IS NULL?
   → Ya: redirect ke /consent
   → Tidak: check onboarding_done
     → Tidak: redirect ke /onboarding
     → Ya: redirect ke /catalog

CONSENT SCREEN REQUIREMENTS:
- Route: /consent (protected: harus sudah auth, belum consent)
- Form fields:
  - display_name: string (minimal 2 karakter)
  - birth_year: number (1990-2015 range untuk target user)
  - checkbox: boolean (setuju dengan ToS + Privacy Policy)
- Validasi < 13 tahun (birth_year > currentYear - 13):
  - Tampilkan form tambahan: parent_email
  - POST /api/consent → kirim email verifikasi ke parent_email
  - Redirect ke /consent/waiting
- Validasi ≥ 13 tahun:
  - POST /api/consent → UPDATE users SET consent_at, consent_version, display_name
  - Redirect ke /onboarding

API: POST /api/consent
Request (Zod):
  {
    display_name: z.string().min(2).max(50),
    birth_year: z.number().int().min(1990).max(2015),
    agreed: z.literal(true),
    parent_email: z.string().email().optional(),
  }
Response:
  { requires_parent_verification: boolean }

EMAIL PARENT VERIFICATION:
- Generate secure token (crypto.randomBytes(32).toString('hex'))
- Simpan ke users.parent_token
- Kirim email via Supabase Edge Functions (atau Resend)
- Link: https://fisikaseru.id/verify-parent?token=XXX
- Route /verify-parent:
  - Lookup users by parent_token
  - UPDATE users SET parent_verified=true, consent_at=NOW()
  - Invalidate parent_token
  - Tampilkan: "Verifikasi berhasil! [nama anak] sudah bisa mulai belajar."

MIDDLEWARE (next/middleware.ts):
const PROTECTED_ROUTES = ['/catalog', '/lab', '/profile', '/progress'];
const CONSENT_REQUIRED = ['/onboarding', ...PROTECTED_ROUTES];

Logic:
- Jika unauthenticated → /login
- Jika authenticated + consent_at IS NULL → /consent
- Jika authenticated + consent + umur < 13 + parent_verified = false → /consent/waiting
- Jika authenticated + consent OK + onboarding_done = false → /onboarding
- Otherwise: lanjut

BUATKAN:
1. apps/web/src/app/(auth)/login/page.tsx
2. apps/web/src/app/auth/callback/route.ts
3. apps/web/src/app/(auth)/consent/page.tsx
4. apps/web/src/app/(auth)/consent/waiting/page.tsx
5. apps/web/src/app/verify-parent/route.ts
6. apps/web/src/app/api/consent/route.ts
7. apps/web/src/middleware.ts
8. supabase/migrations/001_users.sql (dengan trigger handle_new_user)

JANGAN:
- Jangan bundle consent dengan OAuth consent Google
- Jangan simpan birth_year lengkap jika tidak diperlukan (privacy minimization)
- Jangan skip validasi umur < 13 tahun (legal requirement)
- Jangan gunakan localStorage untuk session (gunakan Supabase SSR cookie)
```

---

# PHASE 9 — CODING SPEC

## 9.1 Folder Structure yang Harus Dibuat (MVP)

```
apps/web/src/
├── app/
│   ├── layout.tsx                 ← Root layout + providers
│   ├── page.tsx                   ← Landing page (public)
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── consent/page.tsx
│   │   ├── consent/waiting/page.tsx
│   │   └── callback/route.ts
│   │
│   ├── (main)/
│   │   ├── layout.tsx             ← Auth + consent guard
│   │   ├── catalog/page.tsx
│   │   ├── lab/[moduleId]/page.tsx
│   │   ├── lab/[moduleId]/loading.tsx
│   │   └── onboarding/page.tsx
│   │
│   └── api/
│       ├── auth/[...supabase]/route.ts
│       ├── consent/route.ts
│       ├── sessions/route.ts
│       ├── trials/route.ts
│       ├── reports/queue/route.ts
│       └── reports/status/route.ts
│
├── components/
│   ├── lab/
│   │   ├── LabOrchestrator.tsx
│   │   ├── LabStepIndicator.tsx
│   │   ├── LabLayout.tsx
│   │   ├── steps/
│   │   │   ├── Step1Trigger.tsx
│   │   │   ├── Step2Setup.tsx
│   │   │   ├── Step3Experiment.tsx
│   │   │   ├── Step4Analysis.tsx
│   │   │   ├── Step5Reflect.tsx
│   │   │   └── Step6Report.tsx
│   │   ├── controls/
│   │   │   ├── DataSlider.tsx
│   │   │   ├── InstrumentPanel.tsx
│   │   │   └── ConstraintWarning.tsx
│   │   ├── canvas/
│   │   │   ├── PendulumCanvas.tsx
│   │   │   └── VectorOverlay.tsx
│   │   ├── data/
│   │   │   ├── LiveDataTable.tsx
│   │   │   ├── ProgressDots.tsx
│   │   │   └── RecordButton.tsx
│   │   ├── analysis/
│   │   │   ├── ScatterPlot.tsx
│   │   │   ├── R2Display.tsx
│   │   │   └── GradientPanel.tsx
│   │   └── reflect/
│   │       ├── ConfrontationCard.tsx
│   │       └── SocraticDialogue.tsx
│   │
│   ├── ai-tutor/
│   │   ├── MicroHintBubble.tsx
│   │   ├── SocraticBubble.tsx
│   │   └── TutorTriggerEngine.tsx
│   │
│   ├── report/
│   │   ├── ReportQueue.tsx
│   │   └── EurekaCard.tsx
│   │
│   └── shared/
│       ├── Navbar.tsx
│       └── ToastProvider.tsx
│
├── hooks/
│   ├── useLabSession.ts
│   ├── usePendulumPhysics.ts
│   ├── useRegressionAnalysis.ts
│   ├── useAITutor.ts
│   ├── useSupabaseRealtime.ts
│   └── useProAccess.ts
│
├── stores/
│   ├── lab.store.ts
│   ├── ui.store.ts
│   └── user.store.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── physics/
│   │   ├── pendulum.ts
│   │   ├── noise.ts
│   │   └── regression.ts
│   └── ai-tutor/
│       ├── trigger-engine.ts
│       └── templates/bandul.templates.ts
│
└── middleware.ts
```

## 9.2 Key Implementation Snippets

### pendulum.ts — Physics Model

```typescript
// lib/physics/pendulum.ts

export const G = 9.80665; // m/s² — konstanta gravitasi standar

export function pendulumTruePeriod(L: number): number {
  // T = 2π√(L/g)
  return 2 * Math.PI * Math.sqrt(L / G);
}

export function validateConstraints(thetaDeg: number): boolean {
  // Aproksimasi sudut kecil valid untuk θ < 15°
  return Math.abs(thetaDeg) <= 15;
}

export function pendulumAngularAcceleration(
  theta: number, // dalam radian
  L: number,     // dalam meter
): number {
  // α = -(g/L) × sin(θ)  — TANPA aproksimasi sin θ ≈ θ
  return -(G / L) * Math.sin(theta);
}

export interface PendulumState {
  theta: number;   // radian
  omega: number;   // rad/s
  time: number;    // detik
  swingCount: number;
  prevTheta: number;
}

export function pendulumStep(state: PendulumState, L: number, dt = 1 / 60): PendulumState {
  const alpha = pendulumAngularAcceleration(state.theta, L);
  const omega = state.omega + alpha * dt;
  const theta = state.theta + omega * dt;
  const time = state.time + dt;

  // Deteksi zero crossing (beban melewati titik tengah)
  const crossed = state.prevTheta * theta < 0; // sign berubah
  const swingCount = crossed ? state.swingCount + 1 : state.swingCount;

  return { theta, omega, time, swingCount, prevTheta: theta };
}
```

### noise.ts — Gaussian Noise

```typescript
// lib/physics/noise.ts

// Mulberry32 — seeded PRNG (reproducible)
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform untuk distribusi normal
export function gaussianSample(rand: () => number): number {
  const u1 = rand();
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function injectNoise(
  trueValue: number,
  sigmaPct: number, // misalnya 0.015 untuk 1.5%
  rand: () => number,
): { observed: number; noise: number } {
  const sigma = sigmaPct * Math.abs(trueValue);
  const noise = gaussianSample(rand) * sigma;
  return {
    observed: trueValue + noise,
    noise,
  };
}
```

### regression.ts — Linear Regression

```typescript
// lib/physics/regression.ts

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((acc, yi, i) => acc + (yi - (slope * x[i] + intercept)) ** 2, 0);

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

export function computeUserLineR2(
  x: number[],
  y: number[],
  userSlope: number,
  userIntercept: number,
): number {
  const n = x.length;
  if (n < 2) return 0;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce(
    (acc, yi, i) => acc + (yi - (userSlope * x[i] + userIntercept)) ** 2,
    0,
  );
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}
```

### lab.store.ts — Zustand Store

```typescript
// stores/lab.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LabStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface Trial {
  id: string;
  trialNo: number;
  variables: { L: number; m: number; theta: number };
  measuredValue: number; // T_obs
  trueValue: number;     // T_true
  noiseApplied: number;
  derivedValues: { T_sq: number };
  isAnomaly: boolean;
  recordedAt: string;
}

export interface PredictionData {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C';
  timeMs: number;
}

interface LabStore {
  // State
  sessionId: string | null;
  moduleId: string | null;
  currentStep: LabStep;
  trials: Trial[];
  predictionData: PredictionData | null;
  seed: number;
  isPhysicsRunning: boolean;
  regressionAttempts: number;
  userR2: number;

  // Actions
  initSession: (sessionId: string, moduleId: string, seed: number) => void;
  setStep: (step: LabStep) => void;
  addTrial: (trial: Omit<Trial, 'id'>) => void;
  removeTrial: (trialNo: number) => void;
  setPrediction: (data: PredictionData) => void;
  setPhysicsRunning: (running: boolean) => void;
  incrementRegressionAttempt: () => void;
  setUserR2: (r2: number) => void;
  resetSession: () => void;
}

export const useLabStore = create<LabStore>()(
  persist(
    (set) => ({
      sessionId: null,
      moduleId: null,
      currentStep: 1,
      trials: [],
      predictionData: null,
      seed: 0,
      isPhysicsRunning: false,
      regressionAttempts: 0,
      userR2: 0,

      initSession: (sessionId, moduleId, seed) =>
        set({ sessionId, moduleId, seed, currentStep: 1, trials: [], predictionData: null }),

      setStep: (step) => set({ currentStep: step }),

      addTrial: (trial) =>
        set((state) => ({
          trials: [
            ...state.trials,
            {
              id: crypto.randomUUID(),
              ...trial,
              derivedValues: { T_sq: trial.measuredValue ** 2 },
            },
          ],
        })),

      removeTrial: (trialNo) =>
        set((state) => ({
          trials: state.trials.filter((t) => t.trialNo !== trialNo),
        })),

      setPrediction: (data) => set({ predictionData: data }),
      setPhysicsRunning: (running) => set({ isPhysicsRunning: running }),
      incrementRegressionAttempt: () =>
        set((state) => ({ regressionAttempts: state.regressionAttempts + 1 })),
      setUserR2: (r2) => set({ userR2: r2 }),
      resetSession: () =>
        set({
          sessionId: null,
          moduleId: null,
          currentStep: 1,
          trials: [],
          predictionData: null,
          seed: 0,
          isPhysicsRunning: false,
          regressionAttempts: 0,
          userR2: 0,
        }),
    }),
    {
      name: 'fisikaseru-lab-session',
      partialize: (state) => ({
        // Hanya persist data ini (checkpoint offline)
        sessionId: state.sessionId,
        moduleId: state.moduleId,
        currentStep: state.currentStep,
        trials: state.trials,
        predictionData: state.predictionData,
        seed: state.seed,
      }),
    },
  ),
);
```

### trigger-engine.ts — AI Tutor Rules

```typescript
// lib/ai-tutor/trigger-engine.ts

export type TutorMode = 'micro_hint' | 'socratic' | 'reflection_partner' | 'guided_full' | null;

export interface TutorContext {
  currentStep: number;
  regressionAttempts: number;
  currentR2: number;
  timeOnStepMs: number;
  isFirstSession: boolean;
  lastTutorTimestamp: number;
  tutorInterventionCount: number;
  anomalyTrialNo?: number;
  moduleId: string;
}

export interface TutorDecision {
  shouldTrigger: boolean;
  mode: TutorMode;
  dialogueKey?: string;
  params?: Record<string, string | number>;
}

const MAX_INTERVENTIONS_PER_SESSION = 3;
const COOLDOWN_MS = 90_000; // 90 detik

export function evaluateTutorRules(ctx: TutorContext): TutorDecision {
  const now = Date.now();
  const noDecision: TutorDecision = { shouldTrigger: false, mode: null };

  // Max intervensi per sesi
  if (ctx.tutorInterventionCount >= MAX_INTERVENTIONS_PER_SESSION) return noDecision;

  // Cooldown global
  if (now - ctx.lastTutorTimestamp < COOLDOWN_MS) return noDecision;

  // Rule 1: First session onboarding
  if (ctx.isFirstSession && ctx.currentStep <= 3) {
    return { shouldTrigger: true, mode: 'guided_full', dialogueKey: 'guided.onboarding' };
  }

  // Rule 2: Step 5 - selalu trigger reflection
  if (ctx.currentStep === 5) {
    return {
      shouldTrigger: true,
      mode: 'reflection_partner',
      dialogueKey: `reflection_partner.step5`,
      params: { moduleId: ctx.moduleId },
    };
  }

  // Rule 3: R² gagal 5× → Socratic
  if (ctx.currentStep === 4 && ctx.regressionAttempts >= 5 && ctx.currentR2 < 0.75) {
    return {
      shouldTrigger: true,
      mode: 'socratic',
      dialogueKey: `socratic.regression_fail_5x`,
      params: { anomalyTrialNo: ctx.anomalyTrialNo ?? 1 },
    };
  }

  // Rule 4: R² gagal 3× → Micro-hint
  if (ctx.currentStep === 4 && ctx.regressionAttempts >= 3 && ctx.currentR2 < 0.75) {
    return {
      shouldTrigger: true,
      mode: 'micro_hint',
      dialogueKey: `micro_hint.regression_fail_3x`,
    };
  }

  // Rule 5: Timeout 3 menit di step 4
  if (ctx.currentStep === 4 && ctx.timeOnStepMs > 180_000) {
    return {
      shouldTrigger: true,
      mode: 'micro_hint',
      dialogueKey: `micro_hint.step_timeout`,
    };
  }

  return noDecision;
}
```

## 9.3 Database Migration Files

```sql
-- supabase/migrations/000_init.sql
-- Jalankan secara berurutan via: supabase db push

-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TRIGGER FUNCTION (harus sebelum tabel users dibuat)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- TABLE: users
CREATE TABLE public.users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT NOT NULL,
  display_name     TEXT,
  avatar_url       TEXT,
  level            TEXT NOT NULL DEFAULT 'sma' CHECK (level IN ('smp','sma','kuliah')),
  birth_year       INTEGER CHECK (birth_year BETWEEN 1980 AND 2015),
  parent_email     TEXT,
  parent_verified  BOOLEAN NOT NULL DEFAULT false,
  parent_token     TEXT,
  consent_at       TIMESTAMPTZ,
  consent_version  TEXT,
  onboarding_done  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- TABLE: sessions
CREATE TABLE public.sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id        TEXT NOT NULL,
  seed             INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'L1',
  current_step     INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','completed','abandoned')),
  prediction_data  JSONB,
  reflection_data  JSONB,
  final_r2         DECIMAL(5,4),
  accuracy_pct     DECIMAL(5,2),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  last_active_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: trials
CREATE TABLE public.trials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  trial_no        INTEGER NOT NULL CHECK (trial_no > 0),
  variables       JSONB NOT NULL,
  measured_value  DECIMAL(10,6) NOT NULL,
  true_value      DECIMAL(10,6),
  noise_applied   DECIMAL(12,10),
  derived_values  JSONB,
  is_anomaly      BOOLEAN NOT NULL DEFAULT false,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, trial_no)
);

-- TABLE: reports
CREATE TABLE public.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id        TEXT UNIQUE,
  status        TEXT NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued','processing','completed','failed')),
  format        TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf','docx')),
  pdf_url       TEXT,
  expires_at    TIMESTAMPTZ,
  compiler_used TEXT,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- TABLE: subscriptions
CREATE TABLE public.subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan             TEXT NOT NULL
                   CHECK (plan IN ('monthly','semester','annual','student','trial')),
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','expired','cancelled','trial')),
  trial_ends_at    TIMESTAMPTZ,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ,
  payment_provider TEXT,
  payment_ref      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: flashcards
CREATE TABLE public.flashcards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id     UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  module_id      TEXT NOT NULL,
  card_type      TEXT NOT NULL DEFAULT 'basic' CHECK (card_type IN ('basic','sr')),
  content        JSONB NOT NULL,
  leitner_box    INTEGER NOT NULL DEFAULT 1 CHECK (leitner_box BETWEEN 1 AND 5),
  next_review_at TIMESTAMPTZ,
  interval_days  INTEGER NOT NULL DEFAULT 1,
  ease_factor    DECIMAL(3,2) NOT NULL DEFAULT 2.5,
  review_count   INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: eureka_shares
CREATE TABLE public.eureka_shares (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES public.sessions(id),
  user_id               UUID NOT NULL REFERENCES public.users(id),
  platform              TEXT CHECK (platform IN ('instagram','whatsapp','twitter','download','copy')),
  trial_pro_activated   BOOLEAN NOT NULL DEFAULT false,
  shared_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_trials_session_id ON public.trials(session_id);
CREATE INDEX idx_reports_job_id ON public.reports(job_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_flashcards_user_module ON public.flashcards(user_id, module_id);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- VIEWS
CREATE VIEW public.user_tier AS
SELECT
  u.id,
  u.email,
  CASE
    WHEN s.status = 'active' AND s.expires_at > NOW() THEN 'pro'
    WHEN s.status = 'trial' AND s.trial_ends_at > NOW() THEN 'trial'
    ELSE 'free'
  END AS tier
FROM public.users u
LEFT JOIN LATERAL (
  SELECT status, expires_at, trial_ends_at
  FROM public.subscriptions
  WHERE user_id = u.id AND status IN ('active','trial')
  ORDER BY created_at DESC
  LIMIT 1
) s ON true;

-- RLS (enable semua)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eureka_shares ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "users_self" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "sessions_owner" ON public.sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "trials_via_session" ON public.trials FOR ALL
  USING (EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "reports_owner" ON public.reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_read" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_service" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "flashcards_owner" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "eureka_owner" ON public.eureka_shares FOR ALL USING (auth.uid() = user_id);
```

## 9.4 Package.json Scripts

```json
// Root package.json
{
  "name": "fisikaseru",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > packages/shared-types/src/database.types.ts"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}

// apps/web/package.json (dependencies kunci)
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "d3": "^7.9.0",
    "framer-motion": "^11.0.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.47.0",
    "axe-playwright": "^2.0.0"
  }
}
```

## 9.5 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test
        env:
          VITEST_COVERAGE: true

      - name: Bundle size check
        run: |
          pnpm build
          # Fail if initial bundle > 400KB gzipped
          node scripts/check-bundle-size.js

      - name: Accessibility scan
        run: pnpm test:a11y  # axe-playwright
```

---

*FisikaSeru 3.0 — Full Pipeline Document*  
*Dari Idea sampai Coding — Single Source of Truth*  
*Update: tambahkan ADR di docs/adr/ untuk setiap keputusan arsitektur besar*

---

# PHASE 9 — CODING SPEC (Lanjutan)

## 9.6 LaTeX Template: Bandul

```latex
% apps/pdf-worker/templates/modules/bandul.tex
% Template laporan modul Bandul Matematis
% Placeholder: {{variable_name}} diganti oleh data-injector.ts

\documentclass[12pt,a4paper]{article}

% ─── PACKAGES ─────────────────────────────────────────────────
\usepackage[bahasa]{babel}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{booktabs}
\usepackage{array}
\usepackage{xcolor}
\usepackage{fancyhdr}
\usepackage{hyperref}
\usepackage{parskip}
\usepackage{microtype}

% ─── PAGE GEOMETRY ────────────────────────────────────────────
\geometry{
  top=2.5cm, bottom=2.5cm,
  left=3cm, right=2.5cm
}

% ─── COLORS ───────────────────────────────────────────────────
\definecolor{navyblue}{RGB}{20,33,61}
\definecolor{cobalt}{RGB}{27,79,216}
\definecolor{skyblue}{RGB}{59,158,226}
\definecolor{teal}{RGB}{13,124,107}
\definecolor{amber}{RGB}{217,119,6}

% ─── HEADER/FOOTER ────────────────────────────────────────────
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small\color{navyblue}\textbf{FisikaSeru 3.0}}
\fancyhead[R]{\small\color{gray}Laporan Eksperimen}
\fancyfoot[C]{\small\color{gray}\thepage}
\fancyfoot[R]{\small\color{gray}fisikaseru.id}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}

% ─── DOCUMENT ─────────────────────────────────────────────────
\begin{document}

% ─── COVER ────────────────────────────────────────────────────
\thispagestyle{empty}
\begin{center}
  {\color{navyblue}\rule{\linewidth}{2pt}}
  \vspace{0.5cm}

  {\Huge\bfseries\color{navyblue} LAPORAN EKSPERIMEN}\\[0.3cm]
  {\Large\color{cobalt} Misteri Bandul: Menghitung Gravitasi Bumi}\\[0.2cm]
  {\large\color{gray} Gerak Harmonis Sederhana --- Bandul Matematis}

  \vspace{0.5cm}
  {\color{navyblue}\rule{\linewidth}{1pt}}
  \vspace{0.8cm}

  \begin{tabular}{ll}
    \textbf{Nama}          & : {{user_name}} \\[0.2cm]
    \textbf{Tanggal}       & : {{date}} \\[0.2cm]
    \textbf{Modul}         & : MOD-MECH-003 \\[0.2cm]
    \textbf{Akurasi Ilmiah}& : \textbf{\color{teal}{{accuracy_pct}}\%} \\[0.2cm]
    \textbf{Nilai $R^2$}   & : {{final_r2}} \\
  \end{tabular}

  \vspace{1cm}
  {\color{amber}\rule{0.5\linewidth}{1pt}}
  \vspace{0.5cm}

  {\large\bfseries\color{amber} Nilai Gravitasi Hasil Eksperimenmu:}\\[0.3cm]
  {\Huge\bfseries\color{navyblue} $g = {{g_value}}$ m/s$^2$}\\[0.2cm]
  {\large\color{gray}Nilai literatur: $g = 9{,}81$ m/s$^2$}
\end{center}

\newpage

% ─── 1. PREDIKSI AWAL ─────────────────────────────────────────
\section{Prediksi Awalku (Sebelum Eksperimen)}

Sebelum melakukan eksperimen, saya memprediksi:

\begin{center}
\fcolorbox{amber}{amber!10}{
  \parbox{0.85\linewidth}{
    \centering\itshape
    ``{{prediction_text}}''
  }
}
\end{center}

\noindent
Setelah melihat data, prediksi ini \textbf{{{prediction_verdict}}}.
Penjelasan lebih lanjut ada di Bagian~\ref{sec:reflect}.

% ─── 2. TUJUAN ────────────────────────────────────────────────
\section{Tujuan Eksperimen}

\begin{enumerate}
  \item Membuktikan secara empiris bahwa periode bandul ($T$) berbanding
        lurus dengan akar panjang tali ($\sqrt{L}$).
  \item Menghitung nilai percepatan gravitasi Bumi ($g$) dari kemiringan
        grafik $T^2$ versus $L$.
  \item Membuktikan bahwa massa beban \textbf{tidak} memengaruhi periode bandul.
\end{enumerate}

% ─── 3. LANDASAN TEORI ────────────────────────────────────────
\section{Landasan Teori}

Untuk bandul matematis dengan sudut ayunan kecil ($\theta < 15°$),
persamaan gerak menghasilkan gerak harmonis sederhana dengan periode:

\begin{equation}
  T = 2\pi\sqrt{\dfrac{L}{g}}
  \label{eq:periode}
\end{equation}

\noindent
di mana $T$ adalah periode (s), $L$ adalah panjang tali (m),
dan $g$ adalah percepatan gravitasi (m/s$^2$).

Dengan mengkuadratkan kedua ruas:

\begin{equation}
  T^2 = \dfrac{4\pi^2}{g} \cdot L
  \label{eq:t2_vs_L}
\end{equation}

\noindent
Persamaan ini menunjukkan bahwa grafik $T^2$ versus $L$ adalah
\textbf{linear}, dengan kemiringan (gradien):

\begin{equation}
  \text{gradien} = \dfrac{4\pi^2}{g}
  \quad\Rightarrow\quad
  g = \dfrac{4\pi^2}{\text{gradien}}
  \label{eq:g_from_gradient}
\end{equation}

\noindent
\textbf{Penting:} Massa beban ($m$) tidak muncul dalam
Persamaan~\eqref{eq:periode}. Ini berarti periode tidak bergantung
pada massa --- yang dikenal sebagai \textit{isochronisme Galileo}.

% ─── 4. SETUP & VARIABEL ──────────────────────────────────────
\section{Setup Eksperimen}

\subsection{Variabel Eksperimen}

\begin{center}
\begin{tabular}{lll}
  \toprule
  \textbf{Jenis Variabel} & \textbf{Nama} & \textbf{Nilai} \\
  \midrule
  Variabel Bebas  & Panjang Tali ($L$)    & Diubah antar-trial \\
  Variabel Terikat & Periode ($T$)        & Diukur per trial \\
  Variabel Kontrol & Massa Beban ($m$)    & {{m_value}} g \\
  Variabel Kontrol & Sudut Awal ($\theta_0$) & {{theta_value}}° \\
  Variabel Kontrol & Gravitasi ($g$)      & 9{,}80665 m/s$^2$ (referensi) \\
  \bottomrule
\end{tabular}
\end{center}

\subsection{Metode Pengukuran}

Setiap trial menggunakan metode \textbf{10 ayunan}:
waktu untuk 10 ayunan penuh ($t_{10}$) diukur, kemudian
$T = t_{10} / 10$. Metode ini mengurangi kesalahan pengukuran
sebesar faktor $\sqrt{10} \approx 3{,}16$.

% ─── 5. DATA PENGAMATAN ───────────────────────────────────────
\section{Data Pengamatan}

\begin{center}
\begin{tabular}{cccccc}
  \toprule
  \textbf{Trial} & $L$ \textbf{(m)} & $m$ \textbf{(g)} & $T_{\text{obs}}$ \textbf{(s)} & $T^2$ \textbf{(s}$^2$\textbf{)} & \textbf{Anomali?} \\
  \midrule
  {{trials_table_rows}}
  \midrule
  \multicolumn{6}{l}{\small $^*$Galat acak ($\varepsilon \sim \mathcal{N}(0,\, \sigma^2)$,
  $\sigma = 1{,}5\%\,T_{\text{true}}$) disuntikkan untuk mensimulasikan ketidakpastian nyata.} \\
  \bottomrule
\end{tabular}
\end{center}

% ─── 6. GRAFIK REGRESI ────────────────────────────────────────
\section{Grafik Analisis: $T^2$ versus $L$}

\begin{center}
  \includegraphics[width=0.85\textwidth]{{{graph_path}}}
\end{center}

\begin{center}
\fcolorbox{cobalt}{cobalt!8}{
  \parbox{0.8\linewidth}{
    \centering
    Persamaan garis regresimu: \quad
    $T^2 = {{user_slope}} \cdot L + {{user_intercept}}$\\[0.3cm]
    Koefisien determinasi: \quad $R^2 = {{final_r2}}$
  }
}
\end{center}

% ─── 7. ANALISIS ──────────────────────────────────────────────
\section{Analisis \& Pembahasan}

\subsection{Menghitung Gravitasi dari Gradien}

Dari grafik, diperoleh gradien:
\[
  m_{\text{grafik}} = \frac{\Delta T^2}{\Delta L} = {{user_slope}} \text{ s}^2/\text{m}
\]

Menggunakan Persamaan~\eqref{eq:g_from_gradient}:
\[
  g_{\text{eksperimen}} = \frac{4\pi^2}{{{user_slope}}} = {{g_value}} \text{ m/s}^2
\]

\subsection{Perbandingan dengan Nilai Literatur}

\begin{center}
\begin{tabular}{lcc}
  \toprule
  \textbf{Sumber} & $g$ \textbf{(m/s}$^2$\textbf{)} & \textbf{Deviasi} \\
  \midrule
  Eksperimen (hasil saya) & {{g_value}} & --- \\
  NIST / Literatur        & 9{,}8067   & {{deviation_pct}}\% \\
  \bottomrule
\end{tabular}
\end{center}

\noindent
Deviasi sebesar {{deviation_pct}}\% dapat disebabkan oleh:
(1) galat acak pengukuran waktu,
(2) gesekan udara yang diabaikan dalam model,
(3) tali dianggap ideal (tak bermassa, tak elastis).

% ─── 8. REKONSTRUKSI MENTAL MODEL ────────────────────────────
\section{Rekonstruksi Mental Modelku}
\label{sec:reflect}

\subsection{Apa yang Berubah dari Pemahamanku?}

\begin{center}
\fcolorbox{amber}{amber!10}{
  \parbox{0.85\linewidth}{
    \textbf{Sebelum eksperimen, saya pikir:}\\
    \itshape ``{{prediction_text}}''
  }
}
\end{center}

\vspace{0.5cm}

\begin{center}
\fcolorbox{teal}{teal!10}{
  \parbox{0.85\linewidth}{
    \textbf{Setelah melihat data eksperimen saya, saya sekarang paham bahwa:}\\
    \itshape ``{{reconstruction_text}}''
  }
}
\end{center}

% ─── 9. KESIMPULAN ────────────────────────────────────────────
\section{Kesimpulan}

Berdasarkan eksperimen ini, dapat disimpulkan:

\begin{enumerate}
  \item Periode bandul berbanding lurus dengan $\sqrt{L}$,
        dibuktikan oleh grafik $T^2$ vs $L$ yang linear ($R^2 = {{final_r2}}$).
  \item Nilai percepatan gravitasi Bumi yang diperoleh adalah
        $g = {{g_value}}$ m/s$^2$, dengan akurasi \textbf{{{accuracy_pct}}\%}
        dibandingkan nilai literatur.
  \item Massa beban \textbf{tidak memengaruhi} periode bandul
        (isochronisme Galileo --- telah dibuktikan oleh data).
\end{enumerate}

% ─── 10. PERTANYAAN REFLEKSI LANJUTAN ────────────────────────
\section{Pertanyaan Refleksi Lanjutan}

Untuk memperdalam pemahamanmu, coba jawab pertanyaan-pertanyaan berikut:

\begin{enumerate}
  \item Di planet Mars, percepatan gravitasi $g_{\text{Mars}} = 3{,}72$ m/s$^2$.
        Jika kamu membawa bandul dengan $L = 1{,}00$ m ke Mars,
        berapakah periodenya? Bandingkan dengan periode di Bumi.

  \item Galileo Galilei menemukan isochronisme bandul sekitar tahun 1602.
        Menurutmu, mengapa penemuan ini revolusioner pada zamannya?

  \item Jika tali bandul kamu bukan tali ideal (melainkan pegas yang bisa meregang),
        bagaimana persamaan $T = 2\pi\sqrt{L/g}$ akan berubah?
\end{enumerate}

% ─── DAFTAR PUSTAKA ───────────────────────────────────────────
\begin{thebibliography}{9}
  \bibitem{halliday}
    Halliday, D., Resnick, R., \& Krane, K. S. (2010).
    \textit{Physics} (5th ed., Vol. 1). Wiley.

  \bibitem{serway}
    Serway, R. A., \& Jewett, J. W. (2018).
    \textit{Physics for Scientists and Engineers} (10th ed.). Cengage Learning.

  \bibitem{nist}
    NIST. (2024). \textit{CODATA Value: Standard acceleration of gravity}.
    \url{https://physics.nist.gov/cgi-bin/cuu/Value?gn}

  \bibitem{galileo}
    Drake, S. (1978).
    \textit{Galileo at Work: His Scientific Biography}. University of Chicago Press.
\end{thebibliography}

\vspace{1cm}
{\color{navyblue}\rule{\linewidth}{1pt}}
\begin{center}
  \small\color{gray}
  Laporan ini dibuat otomatis oleh \textbf{FisikaSeru 3.0} · fisikaseru.id \\
  Hasil eksperimen asli milikmu --- data, grafik, dan analisis berasal dari
  percobaanmu sendiri.
\end{center}

\end{document}
```

## 9.7 Komponen: PendulumCanvas (Implementasi Lengkap)

```typescript
// components/lab/canvas/PendulumCanvas.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { pendulumStep, validateConstraints, G } from '@/lib/physics/pendulum';
import { mulberry32, injectNoise } from '@/lib/physics/noise';
import type { PendulumState } from '@/lib/physics/pendulum';

// ─── TYPES ──────────────────────────────────────────────────────
export interface PendulumCanvasProps {
  L: number;              // panjang tali (meter)
  mGram: number;          // massa beban (gram) — hanya visual
  theta0Deg: number;      // sudut awal (derajat)
  isRunning: boolean;
  onSwingComplete: (params: {
    T_obs: number;
    T_true: number;
    noise: number;
    swingCount: number;
  }) => void;
  onConstraintViolation: () => void;
  seed: number;
  showGravityVector?: boolean;
  showTensionVector?: boolean;
  width?: number;
  height?: number;
}

// ─── CONSTANTS ──────────────────────────────────────────────────
const PIVOT = { x: 0.5, y: 0.12 };   // relative to canvas
const SCALE_PX_PER_M = 180;           // pixels per meter
const BOB_RADIUS = 18;
const TRAIL_LENGTH = 60;              // frames untuk arc trail
const SIGMA_PCT = 0.015;              // 1.5% noise

// ─── COLORS ─────────────────────────────────────────────────────
const COLORS = {
  bg:           '#1C2333',
  bgGradientEnd:'#131926',
  pivot:        '#64748B',
  rope:         'rgba(255, 255, 255, 0.88)',
  bob:          '#3B9EE2',
  bobGlow:      'rgba(59, 158, 226, 0.35)',
  bobConstraint:'#C0392B',
  trail:        'rgba(59, 158, 226, 0.12)',
  gravity:      '#EF4444',
  tension:      'rgba(255, 255, 255, 0.7)',
  text:         'rgba(255,255,255,0.6)',
  degreeArc:    'rgba(255,255,255,0.15)',
};

// ─── COMPONENT ──────────────────────────────────────────────────
export function PendulumCanvas({
  L, mGram, theta0Deg, isRunning,
  onSwingComplete, onConstraintViolation,
  seed, showGravityVector = false,
  showTensionVector = false,
  width = 600, height = 520,
}: PendulumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<PendulumState>({
    theta: (theta0Deg * Math.PI) / 180,
    omega: 0, time: 0, swingCount: 0, prevTheta: 0,
  });
  const rafRef   = useRef<number>(0);
  const trailRef = useRef<Array<{ x: number; y: number }>>([]);
  const randRef  = useRef(mulberry32(seed));
  const startTRef = useRef<number>(0); // waktu mulai (untuk hitung T_obs)

  // ─── PHYSICS & ANIMATION LOOP ──────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const pivot = { x: W * PIVOT.x, y: H * PIVOT.y };
    const L_px  = L * SCALE_PX_PER_M;
    const state = stateRef.current;

    // Advance physics
    if (isRunning) {
      const next = pendulumStep(state, L, 1 / 60);

      // Cek zero-crossing (selesai 1 ayunan)
      const crossed = state.theta * next.theta < 0 && state.swingCount < next.swingCount;
      if (crossed && next.swingCount % 1 === 0) {
        // Setelah 10 ayunan — hitung T_obs dengan noise
        if (next.swingCount === 10) {
          const elapsed = next.time - startTRef.current;
          const T_true  = elapsed / 10; // rata-rata per ayunan dari simulasi
          const { observed: T_obs, noise } = injectNoise(T_true, SIGMA_PCT, randRef.current);
          onSwingComplete({ T_obs, T_true, noise, swingCount: 10 });
          // Reset untuk trial berikutnya
          stateRef.current = {
            theta: (theta0Deg * Math.PI) / 180,
            omega: 0, time: 0, swingCount: 0,
            prevTheta: (theta0Deg * Math.PI) / 180,
          };
          startTRef.current = 0;
          trailRef.current = [];
          return;
        }
      }

      stateRef.current = next;
      if (startTRef.current === 0 && isRunning) startTRef.current = next.time - 1 / 60;
    }

    // Bob position
    const s = stateRef.current;
    const bob = {
      x: pivot.x + L_px * Math.sin(s.theta),
      y: pivot.y + L_px * Math.cos(s.theta),
    };

    // Trail
    trailRef.current.push({ ...bob });
    if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.shift();

    // ── RENDER ────────────────────────────────────────────────

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, COLORS.bg);
    grad.addColorStop(1, COLORS.bgGradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Arc trail
    if (trailRef.current.length > 2) {
      ctx.beginPath();
      ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
      trailRef.current.forEach((pt, i) => {
        if (i === 0) return;
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = COLORS.trail;
      ctx.lineWidth   = BOB_RADIUS * 2;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();
    }

    // Constraint check
    const isViolation = !validateConstraints(theta0Deg);

    // Rope
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(bob.x, bob.y);
    ctx.strokeStyle = isViolation
      ? 'rgba(192, 57, 43, 0.9)'
      : COLORS.rope;
    ctx.lineWidth = 2.5;
    ctx.lineCap   = 'round';
    ctx.stroke();

    // Gravity vector
    if (showGravityVector) {
      const vLen = 60;
      drawArrow(ctx, bob.x, bob.y, bob.x, bob.y + vLen, COLORS.gravity, 'g');
    }

    // Tension vector
    if (showTensionVector) {
      const dx = pivot.x - bob.x;
      const dy = pivot.y - bob.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const vLen = 50;
      drawArrow(
        ctx, bob.x, bob.y,
        bob.x + (dx / len) * vLen,
        bob.y + (dy / len) * vLen,
        COLORS.tension, 'T',
      );
    }

    // Bob glow
    const glowGrad = ctx.createRadialGradient(
      bob.x, bob.y, 0,
      bob.x, bob.y, BOB_RADIUS * 2.5,
    );
    glowGrad.addColorStop(0, COLORS.bobGlow);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, BOB_RADIUS * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Bob circle
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, BOB_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = isViolation ? COLORS.bobConstraint : COLORS.bob;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bob shine
    ctx.beginPath();
    ctx.arc(bob.x - BOB_RADIUS * 0.3, bob.y - BOB_RADIUS * 0.3, BOB_RADIUS * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();

    // Pivot point
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.pivot;
    ctx.fill();

    // Violation overlay
    if (isViolation) {
      ctx.fillStyle = 'rgba(192, 57, 43, 0.08)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(192, 57, 43, 0.85)';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Sudut melebihi batas aproksimasi', W / 2, H - 24);
    }

    // Length label
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`L = ${L.toFixed(2)} m`, pivot.x + 12, (pivot.y + bob.y) / 2);

    rafRef.current = requestAnimationFrame(draw);
  }, [L, theta0Deg, isRunning, showGravityVector, showTensionVector,
      onSwingComplete, onConstraintViolation]);

  // ─── EFFECTS ────────────────────────────────────────────────
  useEffect(() => {
    // Reset state when L or theta0 changes
    stateRef.current = {
      theta: (theta0Deg * Math.PI) / 180,
      omega: 0, time: 0, swingCount: 0,
      prevTheta: (theta0Deg * Math.PI) / 180,
    };
    trailRef.current = [];
    startTRef.current = 0;
  }, [L, theta0Deg]);

  useEffect(() => {
    // Reset PRNG when seed changes
    randRef.current = mulberry32(seed);
  }, [seed]);

  useEffect(() => {
    // Check constraint on theta0 change
    if (!validateConstraints(theta0Deg)) {
      onConstraintViolation();
    }
  }, [theta0Deg, onConstraintViolation]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // Canvas DPR scaling for crisp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx?.scale(dpr, dpr);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Simulasi Bandul Matematis — tekan Tab untuk akses kontrol"
      role="img"
      className="rounded-xl"
    />
  );
}

// ─── HELPERS ────────────────────────────────────────────────────
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  label: string,
) {
  const dx  = x2 - x1;
  const dy  = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux  = dx / len;
  const uy  = dy / len;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Arrowhead
  const headLen = 10;
  const angle   = Math.PI / 6;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * (ux * Math.cos(angle) - uy * Math.sin(angle)),
    y2 - headLen * (uy * Math.cos(angle) + ux * Math.sin(angle)),
  );
  ctx.lineTo(
    x2 - headLen * (ux * Math.cos(angle) + uy * Math.sin(angle)),
    y2 - headLen * (uy * Math.cos(angle) - ux * Math.sin(angle)),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Label
  ctx.fillStyle = color;
  ctx.font      = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, x2 + 6, y2 + 4);
}
```

## 9.8 API Route: POST /api/trials

```typescript
// app/api/trials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ─── SCHEMA ─────────────────────────────────────────────────────
const TrialSchema = z.object({
  session_id:     z.string().uuid(),
  trial_no:       z.number().int().positive().max(20),
  variables:      z.object({
    L:     z.number().min(0.1).max(3.0),
    m:     z.number().positive(),
    theta: z.number().min(1).max(20),
  }),
  measured_value: z.number().positive(),
  true_value:     z.number().positive(),
  noise_applied:  z.number(),
  derived_values: z.object({ T_sq: z.number() }).optional(),
  is_anomaly:     z.boolean().default(false),
});

// ─── HANDLER ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } }, { status: 401 });
    }

    // Parse + validate
    const body = await req.json();
    const parsed = TrialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Data tidak valid.', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Verify session belongs to user (RLS handles this but explicit check for better error)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', data.session_id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Sesi tidak ditemukan.' } },
        { status: 404 },
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: { code: 'SESSION_INACTIVE', message: 'Sesi sudah tidak aktif.' } },
        { status: 409 },
      );
    }

    // Insert trial
    const { data: trial, error: insertError } = await supabase
      .from('trials')
      .insert({
        session_id:     data.session_id,
        trial_no:       data.trial_no,
        variables:      data.variables,
        measured_value: data.measured_value,
        true_value:     data.true_value,
        noise_applied:  data.noise_applied,
        derived_values: data.derived_values ?? { T_sq: data.measured_value ** 2 },
        is_anomaly:     data.is_anomaly,
      })
      .select('id, recorded_at')
      .single();

    if (insertError) {
      // Duplicate trial_no
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: { code: 'DUPLICATE_TRIAL', message: 'Nomor trial sudah ada.' } },
          { status: 409 },
        );
      }
      throw insertError;
    }

    // Update session last_active_at
    await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', data.session_id);

    return NextResponse.json({
      data: { id: trial.id, recorded_at: trial.recorded_at },
      meta: { timestamp: new Date().toISOString() },
    }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/trials]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server.' } },
      { status: 500 },
    );
  }
}
```

## 9.9 Hook: useLabSession

```typescript
// hooks/useLabSession.ts
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLabStore } from '@/stores/lab.store';
import type { Trial } from '@/stores/lab.store';

// ─── CREATE SESSION ──────────────────────────────────────────────
async function createSession(moduleId: string) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const res  = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module_id: moduleId, seed }),
  });
  if (!res.ok) throw new Error('Gagal membuat sesi');
  return res.json() as Promise<{ data: { id: string; seed: number } }>;
}

// ─── RECORD TRIAL ────────────────────────────────────────────────
async function recordTrial(sessionId: string, trial: Omit<Trial, 'id'>) {
  const res = await fetch('/api/trials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id:     sessionId,
      trial_no:       trial.trialNo,
      variables:      trial.variables,
      measured_value: trial.measuredValue,
      true_value:     trial.trueValue,
      noise_applied:  trial.noiseApplied,
      derived_values: trial.derivedValues,
      is_anomaly:     trial.isAnomaly,
    }),
  });
  if (!res.ok) throw new Error('Gagal menyimpan trial');
  return res.json();
}

// ─── HOOK ────────────────────────────────────────────────────────
export function useLabSession(moduleId: string) {
  const qc = useQueryClient();
  const { sessionId, trials, initSession, addTrial, setStep } = useLabStore();

  // Create session mutation
  const { mutateAsync: startSession, isPending: isStarting } = useMutation({
    mutationFn: () => createSession(moduleId),
    onSuccess: ({ data }) => {
      initSession(data.id, moduleId, data.seed);
    },
  });

  // Record trial mutation (optimistic)
  const { mutateAsync: saveTrial, isPending: isSaving } = useMutation({
    mutationFn: (trial: Omit<Trial, 'id'>) => {
      if (!sessionId) throw new Error('Tidak ada sesi aktif');
      return recordTrial(sessionId, trial);
    },
    onMutate: (trial) => {
      // Optimistic update — tambah ke store sebelum server konfirmasi
      addTrial(trial);
    },
    onError: (_, trial) => {
      // Rollback jika gagal
      useLabStore.getState().removeTrial(trial.trialNo);
    },
  });

  // Anomaly detection: trial yang > 2σ dari median
  const detectAnomaly = useCallback((newMeasured: number): boolean => {
    if (trials.length < 3) return false;
    const values = trials.map(t => t.measuredValue);
    const mean   = values.reduce((a, b) => a + b, 0) / values.length;
    const std    = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    return Math.abs(newMeasured - mean) > 2 * std;
  }, [trials]);

  return {
    sessionId,
    trials,
    isStarting,
    isSaving,
    startSession,
    saveTrial,
    detectAnomaly,
    canAnalyze: trials.length >= 5,
  };
}
```

## 9.10 Komponen: ConfrontationCard

```typescript
// components/lab/reflect/ConfrontationCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/stores/lab.store';

interface ConfrontationCardProps {
  moduleId:       string;
  finalR2:        number;
  gValue:         number;
  accuracyPct:    number;
  onContinue:     () => void;
}

// Teks prediksi per opsi (untuk modul Bandul)
const PREDICTION_TEXTS: Record<string, string> = {
  A: 'Tali lebih panjang → bandul lebih cepat',
  B: 'Tali lebih panjang → bandul lebih lambat',
  C: 'Panjang tali tidak memengaruhi kecepatan bandul',
};

const VERDICT: Record<string, { text: string; color: string }> = {
  A: { text: 'tidak sesuai dengan data', color: 'text-amber-400' },
  B: { text: 'sesuai dengan data! ✓',    color: 'text-teal-400'  },
  C: { text: 'tidak sesuai dengan data', color: 'text-amber-400' },
};

export function ConfrontationCard({
  moduleId, finalR2, gValue, accuracyPct, onContinue,
}: ConfrontationCardProps) {
  const { predictionData } = useLabStore();
  const [readDuration, setReadDuration] = useState(0);
  const [canContinue, setCanContinue]   = useState(false);
  const MIN_READ_SEC = 4; // minimum 4 detik membaca

  const prediction = predictionData?.selectedOption ?? 'B';
  const predText   = PREDICTION_TEXTS[prediction];
  const verdict    = VERDICT[prediction];

  useEffect(() => {
    const interval = setInterval(() => {
      setReadDuration(d => {
        const next = d + 1;
        if (next >= MIN_READ_SEC) {
          setCanContinue(true);
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-[#1E293B] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#14213D] px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">✨ Momen Refleksi</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Bandingkan prediksimu dengan data yang kamu kumpulkan sendiri
          </p>
        </div>

        <div className="p-6 space-y-4">

          {/* Prediksi awal */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">
              🧠 Prediksimu Tadi
            </p>
            <p className="text-white text-sm italic">"{predText}"</p>
            <p className={`text-xs mt-1 ${verdict.color}`}>
              Prediksi ini {verdict.text}
            </p>
          </div>

          {/* Hasil eksperimen */}
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-wide mb-2">
              📊 Data Eksperimenmu
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">R² (kualitas regresi)</span>
                <p className="text-white font-mono font-bold">{finalR2.toFixed(3)}</p>
              </div>
              <div>
                <span className="text-slate-400">g yang kamu temukan</span>
                <p className="text-white font-mono font-bold">{gValue.toFixed(2)} m/s²</p>
              </div>
              <div>
                <span className="text-slate-400">Akurasi ilmiah</span>
                <p className="text-teal-400 font-bold">{accuracyPct.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-slate-400">g literatur</span>
                <p className="text-white font-mono">9.81 m/s²</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-teal-500/20">
              <p className="text-teal-300 text-xs">
                ✓ Massa beban TIDAK memengaruhi T — dibuktikan oleh datamu sendiri
              </p>
            </div>
          </div>

          {/* Progress bar minimum read */}
          <AnimatePresence>
            {!canContinue && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cobalt-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(readDuration / MIN_READ_SEC) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{ backgroundColor: '#3B9EE2' }}
                  />
                </div>
                <p className="text-slate-500 text-xs text-center">
                  Baca dulu {MIN_READ_SEC - readDuration} detik lagi...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            onClick={canContinue ? onContinue : undefined}
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all
              ${canContinue
                ? 'bg-[#1B4FD8] hover:bg-[#1B4FD8]/90 text-white cursor-pointer'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
          >
            {canContinue ? 'Lanjut ke Pertanyaan Refleksi →' : '...'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
```

## 9.11 next.config.ts

```typescript
// apps/web/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Strict mode ────────────────────────────────────────────
  reactStrictMode: true,

  // ─── Security Headers ────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',          value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for WASM (future)
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.posthog.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // ─── Images ──────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // ─── Experimental ────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['framer-motion', 'd3'],
  },

  // ─── Webpack — WASM support (untuk Rapier di modul 3D future) ─
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
```

## 9.12 middleware.ts (Auth Guard)

```typescript
// apps/web/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Routes yang butuh auth
const AUTH_REQUIRED = ['/catalog', '/lab', '/profile', '/progress', '/reports', '/flashcards'];
// Routes yang butuh consent (subset dari AUTH_REQUIRED)
const CONSENT_REQUIRED = AUTH_REQUIRED;
// Routes khusus auth (redirect ke /catalog jika sudah login)
const AUTH_ONLY = ['/login'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // ── Setup Supabase client dengan cookie ──────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name: string) => req.cookies.get(name)?.value,
        set:    (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Refresh session (penting untuk SSR)
  const { data: { user } } = await supabase.auth.getUser();

  // ── Redirect jika sudah login ke halaman auth-only ────────────
  if (AUTH_ONLY.some(r => path.startsWith(r)) && user) {
    return NextResponse.redirect(new URL('/catalog', req.url));
  }

  // ── Auth required routes ──────────────────────────────────────
  if (AUTH_REQUIRED.some(r => path.startsWith(r))) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', path);
      return NextResponse.redirect(loginUrl);
    }

    // ── Consent check ─────────────────────────────────────────
    if (CONSENT_REQUIRED.some(r => path.startsWith(r))) {
      const { data: profile } = await supabase
        .from('users')
        .select('consent_at, parent_verified, birth_year, onboarding_done')
        .eq('id', user.id)
        .single();

      if (!profile?.consent_at) {
        return NextResponse.redirect(new URL('/consent', req.url));
      }

      // Umur < 13: cek parent verification
      const currentYear = new Date().getFullYear();
      const age = profile.birth_year ? currentYear - profile.birth_year : 99;
      if (age < 13 && !profile.parent_verified) {
        return NextResponse.redirect(new URL('/consent/waiting', req.url));
      }

      // Onboarding check
      if (!profile.onboarding_done && !path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }
  }

  return res;
}

export const config = {
  // Jalankan middleware pada semua route kecuali static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|fonts|manifest.json|api/auth).*)',
  ],
};
```

## 9.13 turbo.json

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_FF_CONCEPT_NETWORK",
    "NEXT_PUBLIC_FF_CLASSROOM_LINK"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"]
    },
    "test:a11y": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

---

# APPENDIX: Decision Log

## Keputusan Arsitektur yang Final (Tidak Boleh Diubah Tanpa ADR)

| # | Keputusan | Alasan | Tanggal |
|---|---|---|---|
| 1 | Canvas 2D untuk Bandul (bukan Three.js) | Pedagogically sufficient; 70% lebih cepat load; lebih sedikit bug; Three.js untuk modul yang butuh spatial 3D sesungguhnya | MVP |
| 2 | Rapier WASM reserve untuk modul 3D masa depan | Overhead terlalu besar untuk bandul sederhana; Canvas 2D + Euler integration cukup akurat | MVP |
| 3 | Supabase ap-southeast-1 (Singapura) | UU PDP Indonesia: data harus di regional ASEAN; tidak boleh US/EU server | MVP |
| 4 | Async PDF (Bull Queue) — TIDAK synchronous | PDF generation bisa 5-90 detik; blocking akan membuat UX buruk; queue pattern standar industri | MVP |
| 5 | AI Tutor rule-based (bukan LLM) untuk MVP | LLM: biaya, latency, unpredictability; rule-based: cepat, gratis, predictable, testable | MVP |
| 6 | Step 5 Reflect TIDAK boleh di-skip | Ini adalah inti dari conceptual change — tanpa ini, FisikaSeru sama saja dengan simulasi biasa | MVP |
| 7 | Consent screen TERPISAH dari OAuth Google | UU PDP Indonesia mensyaratkan consent eksplisit untuk data processing; bukan bundle dengan OAuth | MVP |
| 8 | Monorepo Turborepo + pnpm | Code sharing antara web + worker; type safety end-to-end; satu CI pipeline | MVP |
| 9 | RLS di semua tabel (Supabase) | Security by default; tidak ada tabel yang bisa diakses tanpa otentikasi | MVP |
| 10 | Prediction disimpan TANPA feedback sampai Step 5 | Feedback prematur menghilangkan cognitive conflict yang menjadi engine dari conceptual change | MVP |

---

## Checklist Sebelum Setiap PR Merge

```
CODE QUALITY:
[ ] TypeScript: tidak ada `any`, tidak ada `@ts-ignore`
[ ] ESLint: 0 error, 0 warning
[ ] Tests: semua pass (unit + integration yang relevan)
[ ] Physics accuracy: jika menyentuh physics code, test deviasi < 0.1%

ACCESSIBILITY:
[ ] Komponen baru: lulus axe-core (0 violations)
[ ] Interactive element: bisa diakses via keyboard
[ ] ARIA labels: semua input dan canvas punya aria-label

PERFORMANCE:
[ ] Bundle size tidak naik signifikan (> 10KB gzipped)
[ ] Canvas render: tidak ada layout thrashing (batchRead/Write)
[ ] API calls: tidak ada N+1 query

SECURITY:
[ ] Input baru: divalidasi dengan Zod sebelum DB insert
[ ] API route baru: ada auth check di awal handler
[ ] Tidak ada secret di client-side code

UU PDP:
[ ] Data baru yang dikumpulkan: ada justifikasi + dicatat di privacy policy
[ ] Tidak ada data yang dikirim ke server third-party tanpa consent
```

---

*FisikaSeru 3.0 — Full Pipeline Document*
*Idea → Scope → User Flow → PRD → ERD → Architecture → Wireframe → Task Breakdown → Prompt Spec → Coding*
*Versi: 1.0 Final · 2025 · fisikaseru.id*
