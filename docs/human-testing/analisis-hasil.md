# Skrip Analisis Hasil — Petunjuk Pakai

> **Status: PENDING — belum ada data uji manusia yang dianalisis.**
> Skrip ini adalah alat bantu hitung. Skrip tidak melakukan uji, tidak menilai, dan tidak menyimpulkan apa pun tentang mutu aplikasi. Ia hanya menjumlahkan angka yang sudah diisi manusia.

Berkas skrip: [`analisis-hasil.js`](./analisis-hasil.js) (dengan alias `análisis-hasil.js` untuk perintah yang memakai huruf beraksen).

---

## 1. Kebutuhan

- Node.js 18 atau lebih baru. Tidak perlu `npm install`, tidak ada dependensi luar. Cukup modul bawaan `fs` dan `path`.
- Berkas CSV hasil uji, dengan skema pada bagian 3.

---

## 2. Perintah

```bash
node docs/human-testing/analisis-hasil.js <file.csv>            # laporan lengkap
node docs/human-testing/analisis-hasil.js <file.csv> --ringkas   # ringkas saja
node docs/human-testing/analisis-hasil.js                        # tampilkan cara pakai
```

Contoh dengan berkas contoh (data fiktif):

```bash
node docs/human-testing/analisis-hasil.js docs/human-testing/contoh/hasil-contoh.csv
```

Keluarannya hanya di layar. Skrip tidak menulis berkas apa pun, jadi berkas hasil uji tetap milik tim peneliti.

---

## 3. Skema kolom CSV

Satu baris = satu sesi, yaitu satu peserta pada satu skenario. Nama kolom harus sama persis dengan tabel di bawah; urutan kolom bebas.

| Kolom | Tipe | Isi | Wajib |
|---|---|---|---|
| `id_responden` | teks | Kode pseudonim, misalnya G1, S3 | ya |
| `peran` | teks | `guru` atau `siswa` | ya |
| `skenario` | teks | `H1`, `H2`, `H3`, `H4`, atau `H5` | ya |
| `tanggal` | teks | `YYYY-MM-DD` | ya |
| `durasi_menit` | angka | Durasi sesi | ya |
| `status` | teks | `LULUS`, `GAGAL`, atau `SEBAGIAN` | ya |
| `skor_pre` | angka 0–20 | Skor modul pre-test | ya |
| `skor_post` | angka 0–20 | Skor modul post-test | ya |
| `d1_kemenjelasan` | angka 1–5 | Kejelasan instruksi | ya |
| `d2_pemahaman` | angka 1–5 | Pemahaman konsep (makin tinggi makin paham) | ya |
| `d3_beban_kognitif` | angka 1–5 | Beban kognitif (5 = ringan, tidak membebani) | ya |
| `d4_umpan_balik` | angka 1–5 | Kegunaan umpan balik | ya |
| `d5_keterlacakan` | angka 1–5 | Keterlacakan percobaan | ya |
| `d6_keterbacaan` | angka 1–5 | Keterbacaan grafik dan angka | ya |
| `d7_eksplorasi` | angka 1–5 | Keterlibatan eksplorasi | ya |
| `d8_kepuasan` | angka 1–5 | Kepuasan umum | ya |
| `sumber_data` | teks | `NYATA` atau `CONTOH` | ya |
| `catatan` | teks | Catatan bebas, boleh kosong | tidak |

Aturan isi:

- **Angka kosong diabaikan**, bukan dianggap 0. Skrip menghitung rerata dari angka yang benar-benar terisi dan menampilkan jumlah nilai yang terpakai.
- **Baris judul di baris pertama boleh ada.** Baris dengan satu kolom saja dianggap baris judul, dilewati, dan memicu peringatan. Contoh: `DATA CONTOH — BUKAN HASIL UJI NYATA`.
- **Teks berkomata diapit tanda kutip**, misalnya `"Terbuntu di langkah 3, minta bantuan"`.
- **Satu peserta boleh punya beberapa baris**, satu untuk tiap skenario yang ia jalankan.

---

## 4. Yang dihitung skrip

1. **Ringkasan berkas**: jumlah baris, jumlah responden unik, jumlah baris bertanda `CONTOH` dan `NYATA`.
2. **Status per skenario**: jumlah LULUS, GAGAL, dan SEBAGIAN untuk tiap skenario H1–H5.
3. **Rata-rata per dimensi**: rerata skala Likert untuk delapan dimensi, lengkap dengan nilai terkecil dan terbesar, serta jumlah nilai yang terpakai.
4. **Rata-rata dimensi per skenario** (dilewati bila memakai `--ringkas`).
5. **Pre-test versus post-test**: rata-rata skor pre, rata-rata skor post, dan selisihnya untuk tiap skenario serta keseluruhan, ditambah arah perubahan (naik, sama, turun) dan jumlah pasangan yang terisi.
6. **Durasi sesi**: rerata, terpendek, terpanjang.
7. **Pemeriksaan kewarasan**: skrip memperingatkan bila menemukan nilai di luar rentang (skor di luar 0–20, skala Likert di luar 1–5), skenario atau status yang tidak dikenal, dan baris tanpa label `sumber_data`. Baris bermasalah tetap ditampilkan, tetapi tidak ikut dihitung.

---

## 5. Cara membaca keluarannya

- **Angka bukan bukti.** Skrip menghitung; ia tidak tahu apakah observer-nya teliti, apakah persetujuan sudah lengkap, atau apakah peserta kehilangan fokus. Lihat `rubrik-analisis.md` untuk aturan pelaporan.
- **Rerata dimensi hanya bermakna bila jumlah peserta cukup.** Bila satu skenario hanya dijalankan satu orang, tulis di laporan sebagai kasus tunggal, bukan sebagai temuan umum.
- **Selisih pre/post hanya indikator.** Karena butir pre-test dan post-test sama, sebagian kenaikan bisa berasal dari hafalan butir. Sebutkan keterbatasan ini setiap kali menyebut selisih.
- **Skor kosong bukan nol.** Bila pre-test tidak lengkap pada 12 butir atau lebih, tulis "skor pre tidak lengkap" pada kolom skor dan jangan menghitung selisih untuk peserta itu.

---

## 6. Pemisahan data contoh dan data nyata

Berkas contoh ada di `contoh/hasil-contoh.csv`. Berkas itu:

- memiliki baris pertama `DATA CONTOH — BUKAN HASIL UJI NYATA`;
- mengisi kolom `sumber_data` dengan `CONTOH` pada setiap baris;
- memuat nama-nama pseudonim dan angka yang tidak pernah ada dalam kegiatan nyata.

Skrip akan menampilkan peringatan besar bila menemukan baris bertanda `CONTOH`, sehingga data latihan tidak pernah terlihat seperti hasil uji. Berkas data nyata sebaiknya diletakkan di luar repo bila memuat catatan yang tidak ingin ikut ter-commit, atau minimal diberi nama berkas yang jelas, misalnya `hasil-uji-2026-11-20.csv`.

---

## 7. Kalau ada yang tidak beres

| Gejala | Penyebab yang mungkin | Tindakan |
|---|---|---|
| "Kolom wajib tidak ada" | Salah ejaan nama kolom, atau berkas memakai pemisah titik koma | Samakan nama kolom dengan tabel bagian 3, atau ubah pemisah ke koma |
| "Baris sumber_data = CONTOH" | Berkas contoh ikut terbaca | Jangan pakai berkas contoh untuk laporan; ganti ke berkas data nyata |
| "Nilai di luar 1..5" | Skala Likert diisi 0 atau 6, atau terisi teks | Periksa kembali lembar observasi; jangan diubah diam-diam |
| "skor_pre di luar 0..20" | Skor total modul, bukan per komponen | Skor modul maksimal 20; bila memakai skor konsep dan persepsi, jumlahkan keduanya lebih dulu |
| Baris pertama terbaca sebagai data | Tidak ada baris judul, dan baris pertama berisi satu teks | Tambahkan baris judul pada baris pertama |
