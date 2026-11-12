# Pelacakan Ke Readiness Uji Manusia — FisikaSeru

> **Status: PENDING — belum ada recruiting, belum ada sesi, belum ada hasil.**
> Berkas ini adalah peta kerja: siapa mengerjakan apa, sampai mana, dan bukti mana yang sudah ada.
> Isi kolom "Bukti" dengan tautan atau nama berkas. Jangan isi dengan bukti yang belum ada.

---

## 1. Peta peran

| Peran | Jumlah | Tanggung jawab | Skenario |
|---|---|---|---|
| Koordinator uji | 1 | Menyusun jadwal, mencetak formulir persetujuan, menjaga kunci kode, menyusun laporan | — |
| Observer | 1–2 | Mengisi lembar observasi, merekam layar, menulis kutipan verbatim | H1–H5 |
| Guru pendamping | 5 | Mendampingi siswa, tidak membocorkan jawaban | H1–H5 |
| Siswa kelas XI | 8 | Peserta utama | H1, H2, H3 |

Target 5 guru dan 8 siswa mengikuti `docs/HUMAN-TESTING-PROTOCOL.md`. Kode peserta: G1–G5 untuk guru, S1–S8 untuk siswa. Kunci kode disimpan terpisah oleh koordinator, tidak pernah dibawa observer.

---

## 2. Tabel status pelacakan

Isi baris satu per kegiatan. Kolom "Status" memakai: BELUM, DIJADWALKAN, SELESAI, BATAL, DITUNDA.

| # | Kegiatan | Penanggung jawab | Rencana | Status | Bukti (berkas atau tautan) | Catatan |
|---|---|---|---|---|---|---|
| 1 | Paket dokumen siap | — | — | **SELESAI** | `docs/human-testing/` (berkas ini) | Dokumen alat siap; belum ada uji |
| 2 | Skrip analisis diuji dengan data contoh | — | — | **SELESAI** | Output skrip tertempel di `README.md` | Hanya menguji alat, bukan hasil uji |
| 3 | Isi **[ISI SEBELUM DICETAK]** di formulir persetujuan | Koordinator | | BELUM | | |
| 4 | Daftar lembaga sekolah yang dihubungi | Koordinator | | BELUM | | |
| 5 | Kirim email ajakan ke guru | Koordinator | | BELUM | | |
| 6 | Tindak lanjut WhatsApp | Koordinator | | BELUM | | |
| 7 | Guru menyatakan kesediaan (G1–G5) | Koordinator | | BELUM | | |
| 8 | Jadwal per sekolah | Koordinator + guru | | BELUM | | |
| 9 | Persetujuan orang tua/wali terkumpul | Guru + koordinator | | BELUM | | |
| 10 | Pencetak pre-test dan lembar observasi | Koordinator | | BELUM | | |
| 11 | Sesi H1 | | | BELUM | | |
| 12 | Sesi H2 | | | BELUM | | |
| 13 | Sesi H3 | | | BELUM | | |
| 14 | Sesi H4 | | | BELUM | | |
| 15 | Sesi H5 | | | BELUM | | |
| 16 | Pengumpulan CSV hasil | Koordinator | | BELUM | | |
| 17 | Analisis kualitatif dengan rubrik | Analis | | BELUM | | |
| 18 | Laporan bertanggal di `docs/evaluations/` | Analis | | BELUM | | |
| 19 | Tinjauan ulang status G-2 | Pengguna | Setelah ada sesi nyata | BELUM | | |

---

## 3. Checklist kesiapan sebelum mulai

### 3.1 Dokumen dan alat

- [ ] Semua berkas di `docs/human-testing/` ada dan versi terkininya dipakai.
- [ ] Bagian **[ISI SEBELUM DICETAK]** di `informed-consent.md` sudah diisi (nama lembaga, penanggung jawab, nomor kontak pengunduran, waktu kegiatan).
- [ ] `pretest-posttest.md` sudah dicetak sejumlah peserta + 2 cadangan per sesi.
- [ ] `lembar-observasi.md` sudah dicetak satu per sesi.
- [ ] Skrip `analisis-hasil.js` sudah dijalankan sekali dengan data contoh untuk memastikan tidak rusak (hasilnya tertempel di `README.md`).
- [ ] Skrip `rubrik-analisis.md` sudah dibaca observer (bagian kode tema).

### 3.2 Teknis

- [ ] Chrome terbaru terpasang di laptop yang dipakai.
- [ ] Sesi incognito atau localStorage kosong tersedia untuk tiap peserta.
- [ ] Aplikasi bisa dibuka dan dimuat dalam 10 detik di jaringan sekolah.
- [ ] Layar atau proyektor yang dipakai diuji: bisa dibaca dari jarak 3 meter (penting untuk H5).
- [ ] Perekam layar (OBS atau yang sejenis) teruji dan file tersimpan di tempat terbatas.
- [ ] Rekam suara hanya dinyalakan untuk peserta yang persetujuannya sudah ditandatangani.

### 3.3 Persetujuan dan izin

- [ ] Setiap guru sudah menandatangani Formulir B.
- [ ] Setiap siswa punya formulir persetujuan orang tua/wali yang sudah ditandatangani.
- [ ] Kunci kode (nama asli dan kode) tersimpan terpisah dari berkas yang dibawa observer.
- [ ] Nomor kontak pengunduran sudah disampaikan ke guru dan siswa.

### 3.4 Tim

- [ ] Observer tahu cara mengisi lembar observasi tanpa memandu peserta.
- [ ] Guru sudah membaca briefing di `recruitment.md` bagian 5.
- [ ] Semua orang paham aturan: tidak membocorkan jawaban, boleh berhenti kapan saja, tidak ada penilaian.

### 3.5 Pelaporan

- [ ] Disepakati siapa yang menulis laporan dan kapan.
- [ ] Disepakati bahwa laporan baru ditulis di `docs/evaluations/` dengan tanggal, tanpa menimpa berkas lama.
- [ ] Disepakati bahwa status G-2 hanya ditinjau ulang setelah ada sesi nyata, dan itu bukan berdasarkan data contoh.

---

## 4. Rencana cadangan bila responden kurang

Target 5 guru dan 8 siswa. Berikut urutan langkah kalau jumlah peserta tidak tercapai. Yang penting: **jumlah yang dikumpulkan apa adanya, tidak ditambah, dan kekurangan itu disebut terang-terangan di laporan.**

### 4.1 Prioritas skenario bila guru kurang

| Prioritas | Isi | Alasan |
|---|---|---|
| 1 | H1 (parabola) | Alur paling sederhana, cepat, dan paling mudah diamati |
| 2 | H3 (Millikan) | Pengalaman penemuan yang paling jelas terlihat |
| 3 | H2 (bandul) | Paling banyak pertanyaan validasi (F-01, F-02, F-04, F-10) |
| 4 | H5 (aksesibilitas) | Cukup satu guru yang bisa diuji sendiri |
| 5 | H4 (persistensi) | Pemeriksaan teknis, bisa digabung ke sesi lain |

Kalau guru hanya ada 2 orang: jalankan H1 dan H3 lebih dulu, baru H2, dan H4 digabung sebagai pemeriksaan teknis di akhir sesi yang sama.

### 4.2 Rencana bila siswa kurang

- Minimal **3 siswa kelas XI** sudah cukup untuk melihat apakah alur bisa dipakai. Sedikit lebih baik dari tidak ada, asal bisa dijadwalkan.
- Bila hanya 1–2 siswa, jalankan sebagai **studi kasus**, bukan sebagai temuan umum. Tulis di laporan: "berdasarkan 2 peserta, sehingga belum dapat digeneralisasi".
- Bila hanya 1 siswa, gunakan sebagai uji coba pertama (dry run) dan tulis hasilnya di lampiran sebagai catatan operasional, bukan sebagai temuan.
- Bila gagal menjadwalkan siswa kelas XI sama sekali, jangan menggantinya dengan orang dewasa yang sukarela. Data orang dewasa bukan data siswa.

### 4.3 Rencana bila sekolah menolak

- Minta persetujuan tertulis sekolah dan wali kelas, sudah termasuk di Formulir B.
- Tawarkan jadwal di luar jam pelajaran, misalnya saat jam pelajaran kosong.
- Tawarkan materi dapat dipakai di kelas mana pun, jangan hanya kelas XI, untuk menambah peluang.
- Bila tetap menolak, cari sekolah lain; jangan mengganti dengan simulasi.

### 4.4 Rencana bila ada peserta yang berhenti di tengah

- Sesi dicatat "tidak selesai", dengan menit berhenti.
- Skor pre/post peserta itu tidak dihitung dalam rata-rata pre/post.
- Kutipan dan catatan dari sesi tetap boleh dipakai, dengan catatan bahwa sesinya tidak tuntas.

### 4.5 Kalau jumlah peserta lebih sedikit tapi temuannya jelas

Bila temuannya jelas dan berulang (misalnya 3 dari 3 peserta tersesat di langkah yang sama), tulis sebagai temuan yang kuat: "pada 3 peserta yang tersedia, semua tersesat di langkah yang sama". Jangan menggeneralisasi ke "siswa pada umumnya".

---

## 5. Catatan perubahan

Setiap kali ada perubahan pada paket ini, catat di sini: tanggal, apa yang diubah, dan alasannya.

| Tanggal | Perubahan | Alasan |
|---|---|---|
| 2026-11-12 | Paket dokumen uji manusia dibuat (README, persetujuan, rekrutmen, lembar observasi, pre/post-test, rubrik, skrip analisis, pelacakan) | Gap G-2 pada `docs/QA-CERTIFICATION-REPORT.md` masih PENDING; dokumen ini menyiapkan alatnya |
| | | |
