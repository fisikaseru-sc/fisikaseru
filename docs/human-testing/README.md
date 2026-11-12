# Paket Uji Manusia — FisikaSeru

> **Status: PENDING — belum ada satu pun skenario H1–H5 yang dijalankan manusia nyata.**
>
> Yang sudah ada di sini adalah **alatnya**: formulir persetujuan, ajakan rekrutmen, lembar observasi, pre-test dan post-test, rubrik analisis, skrip penghitung, dan papan pelacakan.
> Yang **belum** ada adalah hasilnya. Tidak ada angka, kutipan, nama, atau temuan dalam paket ini yang berasal dari uji manusia. Semua data contoh ditandai tegas sebagai data latihan.

---

## 1. Kenapa paket ini ada

Pada `docs/QA-CERTIFICATION-REPORT.md` bagian C, gap **G-2** masih terbuka:

> Uji guru/siswa nyata belum dijalankan, sehingga klaim UX tetap non-empiris.

Skenario sudah ada di `docs/HUMAN-TESTING-PROTOCOL.md` (H1–H5, tabel hasil masih kosong). Yang belum ada adalah instrumen yang bisa langsung dipakai: tidak ada persetujuan, tidak ada lembar observasi terstruktur, tidak ada butir pre/post-test, tidak ada rubrik analisis, dan tidak ada alat menghitung.

Paket ini menutup sisi "alatnya". **Paket ini tidak menutup sisi "hasilnya".** Status G-2 tetap PENDING sampai ada manusia sungguhan yang mengisi lembar ini.

---

## 2. Isi paket

| Berkas | Isi | Dipakai saat |
|---|---|---|
| `README.md` | Indeks paket, alur kerja, cara menjalankan skrip | Sekarang, sebagai peta |
| `informed-consent.md` | Persetujuan siswa (ditandatangani orang tua/wali) dan persetujuan guru | Sebelum sesi dimulai |
| `recruitment.md` | Template ajakan untuk guru (email + WhatsApp), pesan untuk orang tua/wali, briefing guru | Sebelum rekrutmen |
| `lembar-observasi.md` | Lembar per sesi: checklist langkah H1–H5, 8 dimensi skala Likert 1–5, catatan verbatim, status LULUS/GAGAL/SEBAGIAN | Selama dan sesudah sesi |
| `pretest-posttest.md` | 20 butir per modul (12 konsep + 8 persepsi), kunci jawaban, rubrik penskoran, toleransi galat | Sebelum dan sesudah sesi |
| `rubrik-analisis.md` | Kode tema T1–T10, aturan pelaporan yang tidak boleh dilanggar, template tabel ringkasan | Sesudah data terkumpul |
| `analisis-hasil.js` | Skrip Node.js tanpa dependensi: rerata per dimensi, jumlah LULUS/GAGAL/SEBAGIAN per skenario, selisih pre/post | Sesudah CSV terkumpul |
| `analisis-hasil.md` | Dokumentasi cara pakai skrip, skema kolom CSV, dan cara membaca keluarannya | Sekarang, sebagai panduan |
| `contoh/hasil-contoh.csv` | Data fiktif untuk menguji skrip. Baris pertama berbunyi "DATA CONTOH — BUKAN HASIL UJI NYATA" | Hanya untuk latihan |
| `tracking.md` | Papan pelacakan: peran, status, checklist kesiapan, rencana cadangan bila responden kurang | Sepanjang kegiatan |

---

## 3. Struktur folder

```
docs/human-testing/
├── README.md                 berkas ini
├── informed-consent.md       persetujuan siswa (orang tua/wali) dan guru
├── recruitment.md            ajakan guru & orang tua + briefing guru
├── lembar-observasi.md       lembar observasi per sesi (siap cetak)
├── pretest-posttest.md       butir pre/post-test, kunci, rubrik penskoran
├── rubrik-analisis.md        kode tema, aturan pelaporan, template ringkasan
├── analisis-hasil.js         skrip analisis (Node.js, tanpa dependensi)
├── análisis-hasil.js         alias nama file sesuai perintah di atas
├── analisis-hasil.md         dokumentasi skrip, skema kolom CSV, cara membaca keluaran
└── contoh/
    └── hasil-contoh.csv      DATA CONTOH — BUKAN HASIL UJI NYATA
```

---

## 4. Alur kerja dari awal sampai akhir

1. **Isi kekosongan.** Lengkapi bagian **[ISI SEBELUM DICETAK]** di `informed-consent.md` (nama lembaga, penanggung jawab, nomor kontak pengunduran, waktu kegiatan). Formulir yang belum terisi berarti belum ada persetujuan, jadi sesi belum boleh dimulai.
2. **Rekrut guru.** Pakai email dan WhatsApp dari `recruitment.md`. Target 5 guru fisika SMA.
3. **Rekrut siswa dan orang tua.** Pesan untuk orang tua/wali di `recruitment.md` bagian 4. Kumpulkan formulir persetujuan sebelum hari-H.
4. **Briefing untuk guru.** Kirim bagian 5 `recruitment.md` ke guru, idealnya dibaca bersama 10 menit sebelum sesi. Guru akan memandu, bukan memberi jawaban.
5. **Siapkan bahan.** Cetak `pretest-posttest.md` (pre-test dan post-test), `lembar-observasi.md` satu per sesi, dan persetujuan. Pastikan laptop memakai Chrome terbaru dengan localStorage kosong.
6. **Jalankan sesi.** Urut: pre-test (5–8 menit), sesi aplikasi (25–35 menit), post-test (5–8 menit) sebelum ada koreksi apa pun. Observer mengisi lembar observasi dan merekam layar. Rekam suara hanya bila ada persetujuan eksplisit.
7. **Kumpulkan data.** Pindahkan hasil lembar ke CSV dengan skema pada `analisis-hasil.js`. Isi kolom `sumber_data` dengan `NYATA` untuk data uji sungguhan.
8. **Analisis.** Jalankan skrip di bawah, lalu gunakan rubrik pada `rubrik-analisis.md` untuk tema dan pelaporan.
9. **Tulis laporan baru bertanggal** di `docs/evaluations/`, tanpa menimpa berkas lama. Baru setelah itu status G-2 layak ditinjau ulang.

---

## 5. Cara menjalankan skrip analisis

Skrip memakai modul bawaan Node.js saja, tanpa `npm install` dan tanpa dependensi luar. Node 18 atau lebih baru sudah cukup.

```bash
# dengan berkas hasil uji sungguhan
node docs/human-testing/analisis-hasil.js path/ke/hasil.csv

# ringkas (tanpa tabel per skenario)
node docs/human-testing/analisis-hasil.js path/ke/hasil.csv --ringkas

# berkas contoh untuk mencoba mekanismenya
node docs/human-testing/analisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv
```

Nama file `análisis-hasil.js` (dengan huruf beraksen) juga ada sebagai alias, karena beberapa perintah di dokumen ini memakai nama itu:

```bash
node docs/human-testing/análisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv
```

**Cara kerja skrip.** Skrip membaca CSV hasil uji, menghitung rerata tiap dimensi (delapan dimensi skala Likert), menghitung jumlah LULUS, GAGAL, dan SEBAGIAN per skenario, menghitung selisih rata-rata pre-test dan post-test per skenario, lalu menandai baris yang bermasalah (nilai di luar rentang, skenario atau status yang tidak dikenal). Skrip juga memperingatkan bila menemukan baris bertanda `CONTOH` dan tidak diam-diam memperlakukannya sebagai data nyata.

**Contoh keluaran nyata.** Perintah berikut dijalankan pada 12 November 2026 memakai berkas `contoh/hasil-contoh.csv`. **Seluruh angka di bawah ini berasal dari data fiktif untuk latihan, bukan hasil uji manusia.**

```
$ node docs/human-testing/analisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv
Analisis Hasil Uji Manusia — FisikaSeru
================================================================

Peringatan umum: angka di bawah hanya bermakna sebagai hasil uji bila
baris sumber_data bernilai NYATA. Data CONTOH tidak boleh dilaporkan
sebagai bukti kemampuannya.

File sumber : docs/human-testing/contoh/hasil-contoh.csv
Waktu baca  : 2026-11-12

*** PERINGATAN: BARIS JUDUL PADA FILE SUMBER ***
    "DATA CONTOH — BUKAN HASIL UJI NYATA"
    Jika ini file contoh, angka di bawah ini BUKAN hasil uji nyata.

Ringkasan berkas
  Baris data terbaca        : 15
  Responden unik            : 9
  Baris sumber_data = CONTOH: 15
  Baris sumber_data = NYATA : 0
  Baris tanpa label sumber : 0

*** PERINGATAN: 15 baris ditandai CONTOH.
    Angka di bawah ini adalah data fiktif untuk latihan.
    JANGAN dipindahkan ke laporan hasil uji.

1. Status skenario per skenario
   Skenario     LULUS   GAGAL   SEBAGIAN   Total
   H1               4       0          1       5
   H2               1       3          1       5
   H3               2       0          2       4
   H5               0       0          1       1

2. Rata-rata skala Likert per dimensi (skala 1..5)
   Dimensi                          Rerata   Nilai _min  _max
   Kejelasan instruksi                   3.33      15   2    4
   Pemahaman konsep                      3.20      15   2    4
   Beban kognitif (5 = ringan)           2.93      15   2    4
   Kegunaan umpan balik                  3.40      15   2    4
   Keterlacakan percobaan                3.53      15   2    5
   Keterbacaan grafik & angka            3.40      15   2    4
   Keterlibatan eksplorasi               3.73      15   3    5
   Kepuasan umum                         3.53      15   2    5

3. Rata-rata dimensi per skenario
   Dimensi                                 H1      H2      H3      H5
   Kejelasan instruksi                   3.60    3.00    3.50    3.00
   Pemahaman konsep                      3.40    2.60    3.50    4.00
   Beban kognitif (5 = ringan)           3.40    2.40    2.75    4.00
   Kegunaan umpan balik                  3.80    3.00    3.50    3.00
   Keterlacakan percobaan                4.00    3.00    3.50    4.00
   Keterbacaan grafik & angka            3.80    3.00    3.50    3.00
   Keterlibatan eksplorasi               4.20    3.20    4.00    3.00
   Kepuasan umum                         3.80    2.80    4.25    3.00

4. Pre-test vs post-test (skor 0..20 per modul)
   Skenario  Rata-rata pre  Rata-rata post   Selisih    N
   H1                   9.80           15.20      +5.4    5
   H2                   9.00           12.00        +3    5
   H3                  10.00           15.50      +5.5    4
   H5                  15.00           15.00        +0    1
   SEMUA                9.93           14.20     +4.27   15

   Arah perubahan: naik 14 / sama 1 / turun 0 (dari 15 pasangan pre/post yang terisi)
   Catatan: "naik" di sini hanya berarti skor post lebih tinggi.
   Itu belum otomatis berarti hasil belajar lebih baik — angka ini harus dibaca
   catatan observasi (lihat rubrik-analisis.md).

5. Durasi sesi (menit)
   Rerata 29.7 | terpendek 24 | terpanjang 35

================================================================
Akhir laporan. Angka di atas tidak lebih kuat daripada cara data dikumpulkan.
Jangan menyimpulkan lebih dari jumlah peserta dan mutu catatan yang ada.
Lihat rubrik-analisis.md untuk aturan pelaporan.
```

---

## 6. Skema CSV (versi singkat)

Skema lengkap ada di header `analisis-hasil.js`. Satu baris = satu sesi (satu peserta + satu skenario).

| Kolom | Isi |
|---|---|
| `id_responden` | Kode pseudonim, misalnya G1 atau S3 |
| `peran` | guru atau siswa |
| `skenario` | H1, H2, H3, H4, atau H5 |
| `tanggal` | YYYY-MM-DD |
| `durasi_menit` | Durasi sesi |
| `status` | LULUS, GAGAL, atau SEBAGIAN |
| `skor_pre`, `skor_post` | Skor modul 0 sampai 20 (lihat `pretest-posttest.md`) |
| `d1_kemenjelasan` … `d8_kepuasan` | Skala Likert 1 sampai 5 untuk delapan dimensi |
| `sumber_data` | `NYATA` atau `CONTOH`. Wajib diisi. |
| `catatan` | Teks bebas |

---

## 7. Aturan yang berlaku untuk semua orang yang memakai paket ini

1. **Jangan mengarang hasil.** Baris kosong berarti belum dijalankan, bukan "gagal".
2. **Jangan menandai data contoh sebagai data nyata.** Berkas di `contoh/` hanya untuk menguji skrip. Skrip akan memperingatkan bila menemukan baris bertanda `CONTOH`.
3. **Nama asli tidak boleh masuk di lembar observasi, CSV, atau laporan.** Pakai kode. Kunci kode disimpan terpisah oleh koordinator.
4. **Rekam suara hanya dengan persetujuan eksplisit.** Tanpa itu, observer menulis catatan saja.
5. **Peserta boleh berhenti kapan saja.** Sesi yang tidak selesai dicatat sebagai "tidak selesai", bukan sebagai gagal, dan tidak dihitung dalam rata-rata pre/post.
6. **Guru tidak boleh membocorkan jawaban.** Panduan lengkap ada di `recruitment.md` bagian 5.
7. **Kesimpulan tidak boleh lebih besar dari bukti.** Lihat aturan pelaporan di `rubrik-analisis.md`.
8. **Status G-2 tetap PENDING** sampai ada sesi manusia sungguhan yang tercatat di `tracking.md` dan dilaporkan di `docs/evaluations/`.

---

## 8. Berkas acuan lain

| Berkas | Isi |
|---|---|
| `docs/HUMAN-TESTING-PROTOCOL.md` | Skenario H1–H5, langkah demi langkah, kriteria lulus |
| `docs/QA-CERTIFICATION-REPORT.md` bagian C | Gap G-2 dan status gap lain |
| `docs/evaluations/2026-10-17-ai-persona/human-validation-followup.md` | Daftar pertanyaan validasi F-01–F-10 dari temuan persona AI |
| `docs/LEARNING-UX-AUDIT.md` | Klaim UX yang masih non-empiris dan perlu diuji manusia |
