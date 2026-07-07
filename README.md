<div align="center">
  <img src="https://raw.githubusercontent.com/fisikaseru-sc/fisikaseru/main/fisikaseru-app/public/hero-bg.png" alt="FisikaSeru Logo" width="120" style="border-radius: 20px" onerror="this.style.display='none'"/>
  
  # FisikaSeru 3.0
  **Mesin Perubahan Mental Model Fisika**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

FisikaSeru bukan sekadar platform belajar, simulasi, atau *game*. Ini adalah sebuah **mesin konfrontasi miskonsepsi** yang dirancang khusus untuk mengubah cara seseorang berpikir tentang logika alam semesta. 

Aplikasi ini dibangun menggunakan arsitektur modern untuk menjembatani kesenjangan antara simulasi abstrak dan pemahaman empiris mendalam melalui pendekatan eksperimen laboratorium yang terstruktur (persiapan → pengamatan → pengukuran → regresi matematika → refleksi Sokrates).

## ✨ Fitur Utama

- **🔬 Simulasi 2.5D Presisi Tinggi**  
  Menggunakan *engine* fisika kustom (*physics engine*) yang realistis dengan tambahan *noise* stokastik (hukum alam yang tidak sempurna) untuk mensimulasikan lingkungan laboratorium sungguhan (Bukan simulasi steril).
  
- **🧪 Domain-Driven Module Registry**  
  Arsitektur yang sangat skalabel. Setiap modul (Millikan, Bandul, Hukum Ohm) diisolasi dengan rapi dalam komponen *Feature* mandiri.
  
- **🧠 Socratic Reflection Engine**  
  Bot tutor terintegrasi yang tidak memberikan jawaban langsung, melainkan memancing logika pengguna dengan metode pertanyaan berlapis *(Socratic questioning)*.

- **📊 Analisis Regresi & Kalkulasi Dinamis**  
  Pembuatan grafik _scatter_ interaktif yang menghitung regresi linear, nilai koefisien *Cunningham*, serta ketidakpastian eksperimental *(uncertainty)* secara *real-time*.

## 🏗 Arsitektur Proyek

Sistem dipecah menggunakan pola *Feature-Driven Architecture* untuk memastikan tidak ada tumpang tindih (*overlapping*) di masa depan ketika puluhan modul baru ditambahkan:

```text
src/
├── app/                  # Routing Next.js (Halaman Wrapper Utama)
├── features/             # Logika Domain Eksperimen
│   ├── registry.tsx      # Dynamic Import Registry (Lazy Loading)
│   ├── millikan/         # Modul Tetes Minyak Millikan
│   └── bandul/           # Modul Bandul Sederhana
├── components/           # UI Reusable (Tailwind & Framer Motion)
└── lib/                  # Utilitas (Supabase Client, Token Desain)
```

## 🚀 Instalasi & Menjalankan Lokal

Pastikan Anda memiliki [Node.js](https://nodejs.org/) (minimal v18) terinstal.

1. **Clone repository ini**
   ```bash
   git clone https://github.com/fisikaseru-sc/fisikaseru.git
   cd fisikaseru/fisikaseru-app
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Supabase (Wajib untuk Login)**
   - Buat *file* `.env.local` di _root_ proyek (`fisikaseru-app/`).
   - Masukkan variabel lingkungan Anda:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://[PROYEK-ANDA].supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=[KUNCI-ANON-ANDA]
     ```
   - Jalankan *file* migrasi SQL (`supabase/migrations/001_init_schema.sql`) di *dashboard* SQL Editor Supabase Anda.

4. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

## 🤝 Berkontribusi
Jika Anda ingin berkontribusi menambah modul eksperimen baru, silakan baca dokumentasi *Pipeline* di `fisikaseru-full-pipeline.md` dan pastikan Anda mendaftarkan modul baru di `src/features/registry.tsx`.

---
*FisikaSeru — Membangun "Mental Model" yang tahan banting.*
