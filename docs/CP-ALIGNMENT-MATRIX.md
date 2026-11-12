# FisikaSeru — Matriks Alignment Capaian Pembelajaran

**Tanggal:** 17 Okt 2026 (audit kedua — kutipan VERBATIM) · **Diperbarui 12 Nov 2026 (G-9: penelusuran bukti getaran/bandul)** · **Sumber:** `Physics Source/` (di luar repo)

## Definisi status

| Status | Kriteria |
|---|---|
| ALIGNED | Kutipan CP verbatim + TP + aktivitas + asesmen terpetakan dan terverifikasi dari dokumen resmi |
| PARTIALLY_ALIGNED | Kutipan CP verbatim ada, tapi rantai TP/asesmen belum lengkap atau dokumen pendukung belum terverifikasi identitasnya |
| NEEDS_REVIEW | Ada indikasi kesesuaian tapi bukti belum cukup |
| ENRICHMENT | Materi pengayaan — bukan tuntutan CP langsung; prasyarat dijelaskan |
| NOT_ASSESSED | Belum diaudit |

## Matriks per modul

### Modul: Gerak Parabola

| Field | Isi |
|---|---|
| Module | `parabola` |
| Phase/class | **Fase E** (umumnya Kelas X SMA/MA) — sesuai CP IPA Fase E |
| CP reference | CP IPA 2025 (BSKAP) — dokumen `CP_2025_BSKAP_046H_KR_IPA.docx` (SRC-CP-IPA-2025) |
| Verbatim excerpt | "menganalisis gerak dua dimensi" (frasa dalam rumusan Pemahaman IPA Fase E). Rumusan lengkap paragraf CP Fase E: "Pada akhir Fase E, murid memiliki kemampuan sebagai berikut. Pemahaman IPA: Menerapkan prinsip klasifikasi…; menggunakan sistem pengukuran dalam kerja ilmiah; **menganalisis gerak dua dimensi**; menganalisis pemanfaatan energi alternatif…" |
| Source location | CP IPA, bagian "Capaian Pembelajaran — Fase E" (ekstraksi docx tanpa nomor halaman) |
| TP mapping | TP no. 2 (dokumen Analisis CP IPA Fisika Kelas X Fase E, Tabel 1): "Murid mampu menganalisis gerak dua dimensi menggunakan representasi matematis, grafik dan eksperimen untuk menjelaskan berbagai fenomena dalam kehidupan sehari-hari." Indikator: "Menganalisis gerak parabola menggunakan persamaan kinematika"; "Menentukan posisi, kecepatan dan waktu tempuh benda"; "Menafsirkan grafik gerak dua dimensi"; "Menyelesaikan masalah kontekstual gerak parabola." |
| Activity mapping | Predict (prediksi sudut/jangkauan) → Experiment (slider v₀/θ/g/h₀ + lintasan) → Analyze (grafik R vs θ + kurva teori) → Reflect. Dokumen ATP contoh aktivitas: "Praktikum gerak parabola menggunakan peluncur atau **simulasi PHET** serta **analisis grafik lintasan**" — modul memenuhi pola simulasi+grafik ini |
| Assessment evidence | Tabel trial localStorage + grafik + vonis refleksi berbasis data; dokumen ATP menyebut "LKPD, laporan investigasi, presentasi, tes analisis" |
| Gap | (1) Asesmen "tes analisis" formal (kuis terstruktur) belum ada di modul — refleksi terstruktur ada, tes bernomor tidak; (2) h₀>0 sebagai kasus utama buku (bola dari meja) sudah didukung — tidak ada gap konsep |
| Interpretation | Interpretasi auditor: modul memenuhi indikator TP melalui simulasi interaktif + grafik; keterampilan proses Fase E ("Mempertanyakan dan Memprediksi", "Memproses…", "Mengevaluasi dan Refleksi") terintegrasi dalam siklus 4 tahap — sesuai prinsip CP bahwa keterampilan proses tidak diturunkan menjadi tujuan terpisah |
| Review status | **PARTIALLY_ALIGNED** — CP resmi terverifikasi verbatim; dokumen ATP adalah dokumen pendukung yang PENULISNYA belum teridentifikasi (keterbatasan tercatat); asesmen formal belum lengkap |

### Modul: Bandul

| Field | Isi |
|---|---|
| Module | `bandul` |
| Phase/class | **Fase F (Kelas XI)** untuk fisika bandul — dibuku-supported lewat Buku Sekolah XI Bab 5 "Gelombang, Bunyi dan Cahaya" (SRC-BS-XI-2022). Klaim lama design.md "Kelas 11, Bab 5: Getaran" kini **TERVERIFIKASI sebagian** (buku resmi memuat bandul di Bab 5, meski bukan bab "Getaran" tersendiri) |
| CP reference | CP Fisika Fase F 2025 (SRC-CP-FISIKA-F-2025) + Panduan Pembelajaran dan Asesmen 2025 (SRC-PANDUAN-2025) + Buku Sekolah XI (SRC-BS-XI-2022) |
| Verbatim excerpt | CP Fisika Fase F, elemen "Pemahaman Fisika" (PDF hal. 3): "Pemahaman fakta, konsep, prinsip, hukum, teori, dan model pada materi **mekanika**; fluida; gelombang; termodinamika; kelistrikan dan kemagnetan; fisika modern; dan teori dasar digital". Rumusan CP Fase F (PDF hal. 5): "**Menganalisis hubungan gerak dan gaya** serta pemanfaatannya untuk menjelaskan fenomena alam…". Buku Sekolah XI Bab 5 (hal. 117): "Energi mekanik pada **bandul** akan diubah menjadi getaran pada permukaan air, kemudian getaran tersebut merambat dan membentuk gelombang" (Gambar 5.3). Buku Sekolah XI hal. 134 (Aktivitas 5.6): "Siapkan plastisin sebagai **pemberat/bandul**… **Simpangkan salah satu bandul** kemudian lepaskan, amati gerak bandul yang lain" |
| Source location | CP Fisika F (PDF hal. 3 & 5); Buku Sekolah Fisika XI Bab 5 (PDF page 138–156 → halaman cetak 115–136) |
| TP mapping | **Tetap tidak ada TP bernama "bandul/getaran".** ATP Fase F (11 TP) tidak memuat getaran; ATP IPA Fase E juga tidak. Konfirmasi negatif 12 Nov 2026: pencarian teks penuh atas PDF resmi CP Fisika Fase F **dan** Panduan Pembelajaran dan Asesmen 2025 → **0 hit** untuk getaran/bandul/ayunan/osilasi/simpangan. Yang berubah: dasar penalaran **adanya** = elemen CP "materi mekanika" + TP Fase F "menganalisis hubungan gerak dan gaya" (T = 2π√(L/g) persis berada di dalamnya), dan bandul **dibuat eksplisit sebagai objek belajar di Buku Sekolah resmi** |
| Activity mapping | Pretest → Experiment (slider L/m/θ₀/g + rekam trial) → Analyze (regresi T² vs L → g) → Reflect — **kini memiliki Activities 5.6 resmi yang analogous** (resonansi bandul di Buku Sekolah XI) dan dapat dipakai guru sebagai pembanding |
| Assessment evidence | Regresi T² vs L → g terukur (galat <2%); refleksi miskonsepsi; penjelasan sumber galat (round 2); mini-aktivitas massa |
| Gap | (1) Bandul tidak memiliki TP tersendiri → status alignment tetap **tidak eksplisit** (bukan ALIGNED); (2) buku resmi memakai bandul terutama sebagai sumber gelombang & resonansi, sementara modul memakai bandul sebagai alat ukur gravitasi — penggunaan unsurRequirements berbeda tetapi fisika intinya sama (osilasi harmonik sederhana); (3) keputusan kurikulum akhir tetap milik guru/sekolah |
| Interpretation | Klaim "Bab 5" **terbukti ada isinya** (buku resmi XI memuat bandul di Bab 5) tetapi **bukan bab getaran** — jadi tidak boleh ditulis sebagai "Bab 5: Getaran". Modul tetap **ENRICHMENT** secara formal (TP getaran tidak ada), namun kini **berpijak pada bukti positif**: elemen mekanika CP Fase F + penggunaan bandul di Buku Sekolah XI, bukan lagi hanya bukti negatif |
| Review status | **ENRICHMENT (dengan bukti positif)** —menggantikan NEEDS_REVIEW. Keputusan pedagogis sementara pengguna (17 Okt 2026): pengayaan. G-9 ditutup pada 12 Nov 2026: bukti CP/ATP negatif terkonfirmasi penuh, bukti buku sekolah positif ditemukan dan tercatat verbatim |

### Modul: Millikan

| Field | Isi |
|---|---|
| Module | `millikan` |
| Phase/class | Fase F (Kelas XI/XII) — sebagai pengayaan |
| CP reference | CP Fisika Fase F 2025 (SRC-CP-FISIKA-F-2025) |
| Verbatim excerpt | "menganalisis teori dasar fisika modern dan pengaruhnya terhadap perkembangan teknologi" (frasa Pemahaman Fisika Fase F) |
| Source location | CP Fisika F, "Capaian Pembelajaran — Fase F" |
| TP mapping | ATP Fase F TP no. 10 (Fisika Modern): submateri "Radiasi benda hitam; efek fotolistrik; dualisme gelombang-partikel; model atom; radioaktivitas; reaksi inti; energi nuklir" — **Millikan/muatan elementer tidak eksplisit**, tapi kuantisasi muatan adalah prasyarat konseptual model atom & teori kuantum |
| Activity mapping | Predict → Experiment → Analyze (kuantisasi dari data) → Reflect + transfer challenge; Mikrajuddin II §12.3 (hal. 851–855) memverifikasi skema fisika eksperimen yang disimulasikan |
| Assessment evidence | Estimasi e dari data + galat + evaluator transfer |
| Gap | Kuantisasi muatan adalah prasyarat, bukan isi eksplisit TP; eksperimen Millikan historis muncul di buku referensi (Mikrajuddin) sebagai bagian pengenalan teori kuantum |
| Interpretation | **ENRICHMENT** yang koheren dengan CP Fisika F "teori dasar fisika modern": siswa menemukan kuantisasi muatan secara induktif sebelum mempelajari model atom. Prasyarat yang sebaiknya dimiliki: medan listrik, gaya Coulomb, kinematika gaya hambat |
| Review status | **ENRICHMENT** (bukan ALIGNED) — dukungan CP tidak langsung; keterkaitan konseptual dijelaskan, bukan dipaksakan |

## Aturan integritas yang dipatuhi audit ini

1. Semua kutipan di atas **verbatim dari ekstraksi dokumen** (python-docx); frasa panjang ditandai dan tidak diparafrasa sebagai kutipan.
2. Topik buku tidak disamakan dengan tuntutan CP (bandul ada di buku Mikrajuddin sebagai materi ilmiah — itu bukan bukti CP).
3. ~~Diskrepansi nomor keputusan CP Fisika F (file: 046/H/KR/2025; isi: 064/H/KR/2025) tidak diselesaikan dengan tebakan~~ **TERSELESAIKAN (17 Okt 2026, verifikasi eksternal pengguna):** nomor resmi = 046/H/KR/2025 (salinan keputusan bpmpbabel.kemendikdasmen.go.id + siaran pers Kemendikdasmen 23 Jun 2026); teks "064" di dalam docx = kesalahan dokumen sumber. Rumusan CP yang dikutip tidak terpengaruh; dokumen sumber tidak diubah. Bukti + tanggal verifikasi dicatat di PHYSICS-SOURCE-MATRIX.md.
4. Dokumen ATP (Analisis CP…) penulisnya tidak tercantum — status parabola dibatasi PARTIALLY_ALIGNED, bukan ALIGNED, sampai identitas dokumen pendukung terverifikasi.
5. Tidak ada status yang dinaikkan tanpa bukti; bandul justru **diturunkan** dari asumsi lama "Kelas 11 Bab 5" menjadi NEEDS_REVIEW.
6. **12 Nov 2026 (G-9):** asumsi itu diuji ulang, bukan diasumsikan. Hasil: buku resmi XI memang memuat bandul di Bab 5 (verbatim di atas) tetapi **bukan** bab "Getaran" — klaim pun tidak boleh ditulis "Bab 5: Getaran". Karena CP/ATP tetap 0 hit untuk getaran/bandul, status dinaikkan dari "hanya bukti negatif" menjadi "ENRICHMENT dengan bukti positif (elemen mekanika CP Fase F + penggunaan bandul di Buku Sekolah XI)", **tidak** menjadi ALIGNED. Bukti negatif dan positif keduanya dicatat — status tidak pernah hanya satu sisi.
