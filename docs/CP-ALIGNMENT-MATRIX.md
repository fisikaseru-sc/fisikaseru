# FisikaSeru — Matriks Alignment Capaian Pembelajaran

**Tanggal:** 17 Okt 2026 (audit kedua — kutipan kini VERBATIM dari dokumen sumber) · **Sumber:** `Physics Source/` (di luar repo)

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
| Phase/class | Di-klaim design.md sebagai "Kelas 11, Bab 5: Getaran" — **TIDAK TERVERIFIKASI** |
| CP reference | CP Fisika Fase F 2025 (`CP_2025_BSKAP_046H_KR_Fisika_Fase_F.docx`, SRC-CP-FISIKA-F-2025) |
| Verbatim excerpt | Rumusan Pemahaman Fisika Fase F lengkap telah dibaca: "Menganalisis hubungan gerak dan gaya…; membuat karya… hukum fluida…; menganalisis konsep kalor dan termodinamika…; menganalisis gejala gelombang…; mengevaluasi rangkaian listrik; menganalisis fenomena elektromagnetik; menganalisis teori dasar fisika modern…; serta menerapkan teori dasar digital…" — **getaran/osilasi/bandul TIDAK termuat** |
| Source location | CP Fisika F, bagian "Capaian Pembelajaran — Fase F" |
| TP mapping | Tidak ada TP bandul di ATP Fase F (11 TP, tidak memuat getaran). Catatan: ATP IPA Fase E juga tidak memuat getaran. Referensi materi: Mikrajuddin I Bab 7 (mendukung fisika bandul secara ilmiah, bukan sebagai bukti CP) |
| Activity mapping | Pretest → Experiment → Analyze (T² vs L) → Reflect — pedagogis kuat, tapi TANPA tautan CP terverifikasi |
| Assessment evidence | Regresi T² vs L → g terukur; refleksi miskonsepsi |
| Gap | **Tidak ada dukungan CP/TP untuk bandul pada Fase E maupun F dari dokumen yang ditelaah.** Kemungkinan: materi bandul berada di Fase E fisika SMA kelas X pada kurikulum sebelumnya, atau di dokumen CP yang belum tersedia di `Physics Source/` |
| Interpretation | Modul tetap layak secara pedagogis (miskonsepsi FCI terdokumentasi; keterampilan proses terintegrasi), tapi klaim "Kelas 11 Bab 5 Getaran" dari design.md TIDAK dapat dipertahankan sebagai alignment — Erlangga XI (buku Kelas XI yang tersedia) justru TIDAK memuat bab getaran |
| Review status | **NEEDS_REVIEW** (kesesuaian CP) + **posisi pedagogis sementara: PENGAYAAN** — keputusan pengguna 17 Okt 2026. Modul tetap dapat dipakai untuk eksplorasi/simulasi/penyelidikan ilmiah TANPA mengklaim sebagai tuntutan CP langsung. Status kurikulum baru diperbarui bila dokumen pendukung ditemukan atau keputusan guru dibuat. Dimensi lain (implementasi/numerik/sumber) tetap Verified sesuai laporan audit |

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
