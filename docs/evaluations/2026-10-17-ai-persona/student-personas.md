# Student Personas S1–S8 — Hasil Evaluasi Simulatif

> Klasifikasi: AI_SIMULATED_USER_EVALUATION. Sumber: `persona-runs/S1.md` … `S8.md`.
> Status per langkah menggunakan istilah tugas; "DESK_REVIEW_ONLY" = persona menilai dari bukti teks/data, bukan interaksi langsung.

## S1 — Pemahaman rendah, mudah menyerah (H1 Parabola) — `ag/gemini-3.8-flash`

- **Tujuan dipahami**: ya — tombol besar "Luncurkan"/"Catat Data" dan kartu kesimpulan "TEBAKAN TERBAIK DATAMU: 45° / STATUS: Cocok!" memberi validasi instan.
- **TASK_SUCCESS** untuk alur inti (luncur → catat → analisis menemukan 45°).
- **Titik kebingungan:** (1) risiko lupa "Catat Data" setelah luncur (tabel 0/12); (2) pesan refleksi "Kamu belum mengisi langkah Prediksi" membuat cemas/langkah dianggap rusak; (3) pertanyaan refleksi terbuka #2–3 butuh scaffolding tinggi untuk siswa lemah.
- **Petunjuk dibutuhkan:** pengingat visual "bola sudah mendarat — catat datamu!" dan conton jawaban refleksi.

## S2 — Menengah, belajar coba-coba (H2 Bandul) — `ag/gemini-3.8-flash-low`

- **TASK_SUCCESS**: langkah 1, 2, 5, 6. **TASK_PARTIAL**: langkah 3 — R² tinggi & tanpa banner demo benar, tapi galat 3.60% gagal kriteria <2%. **DESK_REVIEW_ONLY**: langkah 4 (preset non-Bumi tidak terekam bukti).
- **Kebingungan:** "kenapa grafik 'Excellent Fit' (R²=0.9997) tapi galat > 2%?" — miskonsepsi R² tinggi = akurat.
- **Miskonsepsi potensial:** menganggap regresi rapi menjamin nilai g akurat.

## S3 — Kuat fisika, bosan langkah lambat (H3 Millikan) — `ag/gemini-3.8-flash-medium`

- Data 5 tetes terkumpul (Target 5/5); cross-check Fe=Fg vs Fe>Fg dihargai.
- **Kebingungan:** dua baris "Drop #01" di tabel (r berbeda) — "droplet sama setelah sinar-X atau duplikasi?"
- **UNOBSERVED**: tahap Cari Pola & estimasi e (terkunci pada bukti).
- **Kesimpulan benar**: data kinematika konsisten; kuantisasi belum bisa disimpulkan dari bukti.

## S4 — Pembaca grafik lemah (H1 Parabola) — `ag/gemini-3.8-flash-high`

- **Pujian spesifik**: label sumbu lengkap dengan satuan ("Sudut elevasi θ (°)", "Jarak tempuh R (m)"), keterangan "Titik = data… Garis putus = teoretis… Garis tegak = 45°", kartu ringkasan "Cocok!" — penyelamat bagi pembaca grafik lemah.
- **Kebingungan:** (1) simbol θ dan sin 2θ menakutkan; (2) HUD x=77.9 m vs R tercatat 55.6 m; (3) pesan "belum mengisi langkah Prediksi" menimbulkan keraguan alur.
- **TASK_SUCCESS** alur inti; kebingungan tidak menghalangi penyelesaian.

## S5 — Pemalu, takut salah (H2 Bandul) — `ag/gemini-3.8-flash-high`

- **Pesan yang menenangkan (diamati):** "Rekam intuisimu… jangan khawatir soal benar atau salah"; "Rekam minimal 3 trial untuk lanjut. (0/3)" — kepastian alur.
- **Titik cemas:** galat 3.60% > 2% → "panik, mengira saya salah setting, padahal R² 0.9997 Excellent Fit".
- **TASK_SUCCESS** langkah 1,2,5,6; **TASK_PARTIAL** langkah 3 (galat).
- **Petunjuk dibutuhkan:** penjelasan galat vs R²; pesan "galat >2% masih wajar dengan 5 titik — tambah titik data".

## S6 — Pemburu nilai cepat (H1 Parabola) — `ag/gemini-3.8-flash-low`

- **Celah jalan pintas yang ditemukan (relevan desain):**
  1. Prediksi bisa dilewati total — refleksi tetap terbuka (pesan "Kamu belum mengisi langkah Prediksi… Kamu tetap bisa melanjutkan").
  2. Kartu "TEBAKAN TERBAIK DATAMU: 45°" membuat siswa tinggal menyalin angka tanpa membaca grafik.
  3. Refleksi terbuka "tidak dinilai benar/salah" → jawaban asal tetap bisa "Tandai Tuntas".
- **Implikasi:** aplikasi tidak memaksa pemahaman bagi siswa yang mencoba lolos cepat — pertimbangan desain pedagogis (keputusan guru), bukan bug.

## S7 — Visual-spasial, suka 3D (H3 Millikan) — `ag/gemini-3.8-flash-medium`

- Mode Okular ("tetesan berpendar seperti bintang") dan toggle 2D/3D dihargai.
- **Kebingungan:** lompatan tabel kinematika (r, V, tf, tr, vf) → muatan q butuh jembatan visual; kolom banyak.
- **UNOBSERVED**: tahap Cari Pola/histogram tangga kuantum (terkunci pada bukti).

## S8 — Miskonsepsi persisten (H2 Bandul) — `ag/gemini-3.8-flash`

**Temuan pedagogis paling tajam dari seluruh evaluasi:**
- Persona percaya "massa beban mempengaruhi periode". Aplikasi **menyediakan slider Massa Beban (m)** tapi alur eksperimen hanya memvariasikan L — siswa tidak pernah melihat bukti empiris bahwa mengubah m TIDAK mengubah T.
- **Kesimpulan S8: aplikasi belum aktif memperbaiki miskonsepsi ini; keberadaan slider massa yang tak pernah diuji justru dapat memperkuat kecurigaan.**
- Rekomendasi S8: mini-tugas "ubah massa 50 g → 500 g pada L tetap; apakah T berubah?"
- Juga: galat 3.60% memicu keraguan "hitungan saya salah?" tanpa penjelasan sumber galat.
- **TASK_PARTIAL** keseluruhan.

## Ringkasan status

| Persona | Skenario | Status inti | Titik kebingungan dominan |
|---|---|---|---|
| S1 | H1 | TASK_SUCCESS | lupa Catat Data; pesan prediksi kosong |
| S2 | H2 | TASK_PARTIAL | R² tinggi vs galat >2% |
| S3 | H3 | TASK_PARTIAL | label Drop #01 ganda; discovery UNOBSERVED |
| S4 | H1 | TASK_SUCCESS | simbol θ; HUD x vs R |
| S5 | H2 | TASK_PARTIAL | galat >2% memicu cemas |
| S6 | H1 | TASK_SUCCESS (dengan jalan pintas) | celah skip prediksi & salin jawaban |
| S7 | H3 | TASK_PARTIAL | jembatan tabel→q; UNOBSERVED discovery |
| S8 | H2 | TASK_PARTIAL | miskonsepsi massa tidak dilenyapkan |
