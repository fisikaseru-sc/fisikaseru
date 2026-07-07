# 🌌 FisikaSeru

> **Platform Rekonstruksi Mental Model & Eksperimen Fisika Interaktif**  
> Mengubah cara siswa berpikir tentang alam semesta melalui simulasi ilmiah, visualisasi data nyata, dan AI Tutor Sokratis.

---

## 💡 Filosofi & Pendekatan Pedagogis

FisikaSeru dikembangkan bukan sekadar sebagai aplikasi simulasi rumus, melainkan sebagai **mesin perubahan mental model**. Berdasarkan riset ilmiah menggunakan instrumen seperti *Force Concept Inventory (FCI)*, banyak siswa yang mampu menghafal rumus matematis tetapi memiliki miskonsepsi fundamental mengenai fenomena fisika (misalnya, mempercayai bahwa beban berat membuat bandul mengayun lebih cepat).

FisikaSeru mengonfrontasi miskonsepsi ini secara langsung melalui **Siklus Belajar Penemuan Mandiri (Socratic Learning Loop)**:

```
                  ┌───────────────┐
                  │ 1. PREDICT    │ (Membuat hipotesis awal)
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ 2. EXPERIMENT │ (Simulasi interaktif dengan real-noise data)
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ 3. ANALYZE    │ (Plotting grafik & fitting kurva regresi)
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ 4. REFLECT    │ (Refleksi & bimbingan AI Tutor Sokratis)
                  └───────────────┘
```

---

## 🛠️ Modul Eksperimen (MVP)

### 1. Bandul Matematis (Simple Pendulum)
Mengeksplorasi hubungan parameter fisik bandul terhadap periode osilasi.
*   **Variabel bebas**: Panjang tali ($L$), massa beban ($m$), sudut simpangan awal ($\theta$), dan percepatan gravitasi ($g$).
*   **Tujuan**: Menemukan secara mandiri bahwa periode bandul hanya dipengaruhi oleh panjang tali dan gravitasi ($T = 2\pi\sqrt{L/g}$), sekaligus mengoreksi miskonsepsi tentang peran massa dan amplitudo simpangan.

### 2. Tetes Minyak Millikan (Millikan Oil Drop)
Eksperimen klasik untuk menentukan muatan dasar elektron ($e$).
*   **Variabel bebas**: Tegangan medan listrik ($V$), laju tetesan naik/turun, radius droplet minyak.
*   **Tujuan**: Mengamati perilaku tetesan minyak bermuatan di bawah pengaruh gravitasi dan gaya listrik, mengumpulkan data laju terminal, dan menganalisis bahwa muatan total pada setiap droplet selalu berkelipatan bulat dari muatan dasar elektron ($q = ne$).

---

## 🚀 Fitur Utama

*   🔬 **Scientific-Grade Simulations**: Simulasi interaktif yang dirancang dengan presisi matematis dan tambahan *noise* data realistis agar siswa merasakan proses pengumpulan data laboratorium yang sesungguhnya.
*   📈 **Interactive Data Viz & Curve Fitting**: Antarmuka analisis data terintegrasi menggunakan grafik interaktif untuk memplot data uji coba dan melakukan *curve fitting* (regresi linear/nonlinear) untuk menemukan formula fisika secara empiris.
*   🤖 **Socratic AI Tutor**: Asisten belajar AI yang diintegrasikan menggunakan Google Gemini SDK. AI ini diprogram khusus untuk menggunakan **Metode Sokratis**—membimbing siswa dengan pertanyaan-pertanyaan pemancing alih-alih memberikan jawaban langsung.
*   🔒 **Secure & Compliant Architecture**: Sistem autentikasi aman dengan Supabase (Google OAuth + Magic Link) serta kepatuhan perlindungan data (UU PDP compliance).

---

## 💻 Tech Stack

*   **Framework**: Next.js 16.2.6 (App Router) + TypeScript 5
*   **State Management**: Zustand 5.0.13 (Global client state)
*   **UI Components**: Radix UI Primitives + Tailwind CSS v4 + Lucide React
*   **Animations**: Framer Motion 12.38.0
*   **Data Visualization**: Recharts 3.8.1
*   **Database & Auth**: Supabase PostgreSQL + Supabase SSR Client
*   **AI Integration**: Google Generative AI (Gemini SDK)

---

## 📂 Struktur Repositori

```
fisikaseru/
├── public/                  # Aset statis & ikon aplikasi
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, & API Routes)
│   │   ├── api/ai/socratic  # API Route untuk diskusi Socratic AI Tutor
│   │   ├── auth/            # Halaman masuk & persetujuan data (consent)
│   │   ├── dashboard/       # Dashboard belajar siswa
│   │   └── modules/         # Halaman utama & rute modul belajar
│   │
│   ├── components/          # Komponen UI reusable
│   │   ├── landing/         # Komponen untuk Landing Page (Hero, Features, dll.)
│   │   ├── layout/          # Komponen navigasi umum (Navbar, Footer)
│   │   └── ui/              # Komponen dasar UI (badge, button, dll.)
│   │
│   ├── features/            # Fitur spesifik modul eksperimen
│   │   ├── bandul/          # Logika simulasi, views eksperimen & analisis Bandul
│   │   ├── millikan/        # Logika simulasi, views eksperimen & analisis Millikan
│   │   └── registry.tsx     # Registrasi modul-modul eksperimen aktif
│   │
│   ├── lib/                 # Utilitas & client eksternal (Supabase client)
│   └── styles/              # Global stylesheet
│
├── supabase/
│   └── migrations/          # Migrasi SQL database (skema tabel & RLS)
│
├── .env.example             # Template file environment variable
├── next.config.ts           # Konfigurasi Next.js
├── eslint.config.mjs        # Konfigurasi ESLint linter
├── postcss.config.mjs       # Konfigurasi PostCSS untuk Tailwind CSS
└── tsconfig.json            # Konfigurasi TypeScript compiler
```

---

## 🛢️ Skema Database (Supabase PostgreSQL)

Berikut adalah tabel-tabel utama yang berjalan di PostgreSQL (diatur dengan *Row Level Security* yang ketat):
1.  **`public.users`**: Menyimpan profil data siswa, termasuk level kelas (`smp`, `sma`, `kuliah`) dan catatan persetujuan kebijakan data (*compliance* UU PDP).
2.  **`public.sessions`**: Sesi pengerjaan modul belajar siswa yang merekam progres langkah (Predict, Experiment, Analyze, Reflect) serta jawaban prediksi awal dan refleksi akhir.
3.  **`public.trials`**: Titik-titik data uji coba eksperimen yang dikumpulkan oleh siswa selama simulasi (digunakan untuk plotting grafik dan curve fitting).
4.  **`public.subscriptions`**: Informasi langganan akun pengguna.

---

## ⚙️ Persiapan & Instalasi Lokal

### Prasyarat
*   Node.js (versi 20 atau lebih baru)
*   NPM (bawaan dari Node.js)
*   Akun Supabase (untuk database & autentikasi)
*   Google Gemini API Key (untuk AI Tutor)

### Langkah-Langkah

1.  **Clone Repositori**:
    ```bash
    git clone https://github.com/fisikaseru-sc/fisikaseru.git
    cd fisikaseru
    ```

2.  **Instal Dependensi**:
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**:
    Salin file `.env.example` menjadi `.env.local` di root direktori:
    ```bash
    cp .env.example .env.local
    ```
    Isi nilai-nilai berikut di dalam `.env.local`:
    ```env
    # Supabase Client Configuration
    NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

    # Google Gemini API Configuration
    GEMINI_API_KEY=your-gemini-api-key
    ```

4.  **Jalankan Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat jalannya aplikasi.

5.  **Build untuk Produksi**:
    ```bash
    npm run build
    npm run start
    ```

---

## 🤝 Kontribusi

Aplikasi ini menggunakan **ESLint** untuk menjamin konsistensi gaya penulisan kode. Jalankan perintah linter sebelum mengirim kontribusi:
```bash
npm run lint
```
