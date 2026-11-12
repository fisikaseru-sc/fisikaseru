# Lembar Observasi Per Sesi — Uji Manusia FisikaSeru

> **Status: PENDING — belum ada sesi yang Diamati.**
> Cetak satu lembar per sesi (satu peserta + satu skenario). Isi setelah sesi, bukan saat sesi.
> Isi hanya berdasarkan apa yang benar-benar dilihat dan terdengar. Bila ada langkah yang tidak dijalankan, kosongkan dan beri tanda "tidak dijalankan".

**Cara memakai:** observer mengisi bagian A sampai E. Tabel bisa diperbesar saat dicetak pada skala 100%.

---

## A. Identitas sesi

| Isian | Nilai |
|---|---|
| Kode peserta | G___ / S___ |
| Peran | guru / siswa |
| Skenario | H1 / H2 / H3 / H4 / H5 |
| Tanggal sesi | ____ / ____ / ________ |
| Jam mulai - selesai | ______ - ______ |
| Durasi (menit) | ______ |
| Observer | ______________________ |
| Guru pendamping | ______________________ |
| Versi aplikasi (commit) | ______________________ |
| Perangkat | laptop sekolah / Chromebook / milik peserta |
| Browser | Chrome versi ______________ |
| Jaringan | normal / lambat / lain: ____________ |
| Sesi incognito dipakai? | ya / tidak |
| Persetujuan orang tua/wali sudah ditandatangani? | ya / tidak |
| Rekaman layar? | ya / tidak |
| Rekaman suara? | ya (dengan persetujuan) / tidak |

---

## B. Checklist langkah skenario

Isi kolom **Hasil aktual** dengan apa yang benar-benar terjadi, bukan dengan apa yang seharusnya terjadi. Kolom **Status** memakai tiga nilai: LULUS, GAGAL, SEBAGIAN.

### B1. Skenario H1 — Gerak Parabola

| # | Langkah | Hasil yang diharapkan | Hasil aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Buka halaman eksperimen parabola | Scene 3D termuat, slider kecepatan, sudut, gravitasi terlihat | | | |
| 2 | Luncurkan pada 30 derajat, lalu catat data | Baris jarak muncul di tabel | | | |
| 3 | Ulangi pada 45 dan 60 derajat, kecepatan tetap | Jarak paling besar pada 45 derajat | | | |
| 4 | Muat ulang halaman | Slider dan data trial kembali muncul | | | |
| 5 | Buka tab analisis | Grafik menampilkan data yang sama, puncak terlihat di 45 derajat | | | |
| 6 | Buka refleksi | Halaman refleksi terbuka tanpa error, terisi data peserta sendiri | | | |

### B2. Skenario H2 — Bandul Sederhana

| # | Langkah | Hasil yang diharapkan | Hasil aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Buka halaman eksperimen bandul | Simulasi berjalan saat Mulai, tombol 2D dan 3D berfungsi | | | |
| 2 | Rekam 5 trial dengan panjang berbeda (0,2 sampai 1,0 m) | Tabel bertambah, data tersimpan | | | |
| 3 | Buka analisis | Banner "data contoh" tidak tampil, nilai g sekitar 9,8, galat di bawah 2 persen | | | |
| 4 | Ganti preset gravitasi, rekam trial baru, buka analisis | Galat dihitung terhadap gravitasi preset, bukan selalu terhadap Bumi | | | |
| 5 | Kosongkan data atau pakai sesi baru, buka analisis | Banner kuning "Ini adalah data contoh" tampil | | | |
| 6 | Reset simulasi di lab | Sudut dan timer kembali awal, tidak ada tombol yang menggantung | | | |

### B3. Skenario H3 — Tetes Minyak Millikan

| # | Langkah | Hasil yang diharapkan | Hasil aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Buka halaman eksperimen, sembur tetes, nyalakan tegangan | Tetes bergerak teratur, panel fisika menampilkan nilai yang masuk akal | | | |
| 2 | Rekam 5 tetes | Penghitung "Target x/5" bertambah, analisis terbuka | | | |
| 3 | Coba rekam saat tegangan mati | Peringatan jelas bahwa medan listrik belum aktif | | | |
| 4 | Analisis: tahap Cari Pola | Histogram atau tangga kuantum memperlihatkan kelompok diskret | | | |
| 5 | Selesaikan tahap penemuan | Estimasi muatan mendekati 1,602, selisih di bawah 3 persen | | | |
| 6 | Muat ulang, buka analisis lagi | Data 5 tetes kembali muncul | | | |

### B4. Skenario H4 — Persistensi dan isolasi data antar modul

| # | Langkah | Hasil yang diharapkan | Hasil aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Setelah H2 langkah 2, buka analisis millikan | Analisis millikan tidak memuat data bandul | | | |
| 2 | Kembali ke analisis bandul | Data bandul masih ada | | | |
| 3 | Periksa localStorage di DevTools | Kunci tiap modul terpisah dan formatnya JSON yang valid | | | |

### B5. Skenario H5 — Aksesibilitas dan kualitas visual

| # | Pemeriksaan | Hasil yang diharapkan | Hasil aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Navigasi dengan tombol Tab di halaman eksperimen | Tombol utama (Mulai, Rekam, Reset, slider) bisa difokuskan dan diaktifkan | | | |
| 2 | Nama kontrol yang terbaca screen reader | Tombol punya nama yang masuk akal, misalnya "Mulai" | | | |
| 3 | Keterbacaan angka dan grafik dari jarak 3 sampai 4 meter | Angka cukup besar, satuan tampil | | | |
| 4 | Performa yang dirasakan | Animasi 3D atau 2D lancar di laptop standar | | | |

---

## C. Penilaian 8 dimensi (skala Likert 1 sampai 5)

Pengisi: observer, setelah sesi. Skala:

| Nilai | Arti umum |
|---|---|
| 1 | Sangat buruk / sangat membingungkan |
| 2 | Buruk |
| 3 | Cukup |
| 4 | Baik |
| 5 | Sangat baik |

| Kode | Dimensi | 1 = | 3 = | 5 = | Nilai |
|---|---|---|---|---|---|
| D1 | Kejelasan instruksi | sangat membingungkan | cukup jelas | sangat jelas | ___ |
| D2 | Pemahaman konsep | banyak miskonsepsi | setengah paham | paham benar | ___ |
| D3 | Beban kognitif | sangat membebani | sedang | ringan | ___ |
| D4 | Kegunaan umpan balik | tidak membantu | cukup | sangat membantu | ___ |
| D5 | Keterlacakan percobaan | tidak tahu apa yang terjadi | setengah tahu | selalu tahu | ___ |
| D6 | Keterbacaan grafik dan angka | sulit dibaca | terbaca | sangat mudah dibaca | ___ |
| D7 | Keterlibatan eksplorasi | pasif, cuma mengikuti | cukup aktif | aktif mencari sendiri | ___ |
| D8 | Kepuasan umum | kecewa | cukup | sangat puas | ___ |

Keterangan isi kolom "1 = " dan "3 = " dan "5 = ": observer boleh menyesuaikan deskripsi nilai dengan kalimat yang ia dengar dari peserta, asalkan tetap konsisten antar sesi. Bila peserta sendiri penilaian (siswa mengisi sendiri di akhir sesi), pakai penilaian peserta dan tulis "diisi peserta" pada kolom observer.

---

## D. Catatan verbatim

Tulis kalimat peserta **apa adanya**. Jangan diringkas, Jangan diperbaiki, jangan ditambah. Tandai dengan tanda kutip. Kalau tidak ada kalimat yang layak dicatat, tulis "tidak ada" pada baris pertama. Baris yang kosong berarti tidak ada catatan, bukan berarti tidak ada kejadian.

| Menit | Kode | Who | Cuplikan (verbatim) | Konteks singkat |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

Kolom "Who": P = peserta, G = guru pendamping, O = observer.

---

## E. Penutup sesi

| Isian | Jawaban |
|---|---|
| Hasil skenario keseluruhan | LULUS / GAGAL / SEBAGIAN |
| Alasan singkat (1 sampai 3 kalimat) | |
| Peserta berhenti di tengah? | tidak / ya, menit ke-___ |
| Temuan yang perlu dikonfirmasi di sesi berikutnya? | |
| Temuan sementara (kode tema, lihat rubrik-analisis.md) | |
| Kelengkapan bukti (tangkapan layar direkam? ya/tidak) | |
| Observer | ______________________ Tanggal: ____________ |

---

## F. Pertanyaan validasi yang harus dijawab (opsional, tapi berguna)

Daftar lengkap ada di `docs/evaluations/2026-10-17-ai-persona/human-validation-followup.md`. Setiap temuan persona AI bisa jadi masalah nyata, bisa jadi bukan. Sesi manusia yang memutuskan.

| ID | Yang perlu diamati | Skenario | Teramati? (ya/tidak/tidak berlaku) | Jawaban singkat |
|---|---|---|---|---|
| F-01 | Peserta tersesat saat analisis dengan kurang dari 3 trial | H2 | | |
| F-02 | Galat g yang aktual tiap peserta (target di bawah 2 persen) | H2 | | |
| F-03 | Peserta menyadari angka di layar yang berbeda dari jarak yang tercatat | H1 | | |
| F-04 | Miskonsepsi "massa memengaruhi periode bandul" sebelum dan sesudah | H2 | | |
| F-06 | Reaksi terhadap pesan "belum mengisi langkah Prediksi" | H1 | | |
| F-07 | Peserta melewatkan prediksi atau menyalin angka tanpa membaca grafik | H1 | | |
| F-09 | Estimasi muatan dan selisihnya terhadap 1,602 x 10⁻¹⁹ C | H3 | | |
| F-10 | Perhitungan galat terhadap preset gravitasi non-Bumi | H2 | | |
| F-10 | Keterbacaan proyektor: minta guru menyebut apa yang terbaca dari jarak 3 meter | H5 | | |

Hanya isi baris yang benar-benar diamati. Baris kosong berarti "tidak diamati", bukan "tidak terjadi".
