# FisikaSeru — Matriks Sumber Fisika

**Tanggal audit:** 17 Okt 2026 (audit kedua — sumber kini TERSEDIA dan DITELAAH) · **Root sumber:** `/home/si/AI-Workspace/Physics Source` (sha256 pendek per file; detail arsitektur: `PHYSICS-SOURCE-ARCHITECTURE.md`)

> **Pembaruan dari audit pertama:** audit sebelumnya melaporkan seluruh sumber "TIDAK TERSEDIA" karena mencari di dalam repo. Audit ini menemukan direktori bersama `Physics Source/` (di luar repo, sesuai keputusan arsitektur) dan **menelaah 8 dari 10 dokumen** dengan tingkat kedalaman yang berbeda dan jujur dicatat per sumber.

## Ringkasan angka aktual

| Status | Jumlah | Sumber |
|---|---|---|
| REVIEWED (dibaca penuh) | 2 | CP IPA, CP Fisika F |
| PARTIALLY_REVIEWED (dibaca terfokus pada bagian relevan) | 5 | Analisis CP E, Analisis CP F/TP/ATP, BS XI, Mikrajuddin I, Mikrajuddin II |
| PARTIALLY_REVIEWED (identitas saja) | 1 | Panduan Pembelajaran & Asesmen 2025 |
| PARTIALLY_REVIEWED (hanya daftar isi via OCR) | 1 | Erlangga XI |
| DISCOVERED (template kosong) | 1 | Format Modul Ajar |

## Matriks sumber (metadata terverifikasi)

| source_id | nama_file | jenis_sumber | bab_halaman | topik_relevan | klaim_yang_didukung | modul_terkait | status_verifikasi |
|---|---|---|---|---|---|---|---|
| SRC-CP-IPA-2025 | CP_2025_BSKAP_046H_KR_IPA.docx | CURRICULUM_OFFICIAL | CP Fase E (tanpa nomor halaman pada ekstraksi docx) | gerak dua dimensi; keterampilan proses | CP IPA Fase E Pemahaman IPA: "menganalisis gerak dua dimensi" + 6 keterampilan proses | parabola | REVIEWED — dibaca penuh (54 paragraf, python-docx) |
| SRC-CP-FISIKA-F-2025 | CP_2025_BSKAP_046H_KR_Fisika_Fase_F.docx | CURRICULUM_OFFICIAL | CP Fase F | fisika modern; keterampilan proses F | CP Fisika: "menganalisis teori dasar fisika modern…"; TIDAK memuat bandul/getaran eksplisit | millikan (pengayaan) | REVIEWED — dibaca penuh. ✅ Diskrepansi 046 vs 064 **TERSELESAIKAN** (verifikasi eksternal pengguna, 17 Okt 2026): nomor resmi = **046/H/KR/2025** (salinan keputusan bpmpbabel.kemendikdasmen.go.id + siaran pers Kemendikdasmen 23 Jun 2026: Keputusan 020/2026 hanya mengubah CP Agama & Budi Pekerti). Teks "064" di dalam docx = kesalahan dokumen sumber; dokumen sumber tidak diubah. |
| SRC-ATP-IPA-E-2025 | Analisis_CP_IPA_Fisika_Kelas_X_Fase_E.docx | ATP_OR_TEACHING_PLAN | Tabel 1 baris 2; Tabel 2–5 | gerak dua dimensi | TP: "menganalisis gerak dua dimensi… representasi matematis, grafik dan eksperimen"; indikator "Menganalisis gerak parabola menggunakan persamaan kinematika"; contoh aktivitas menyebut simulasi + analisis grafik lintasan | parabola | PARTIALLY_REVIEWED — semua tabel dibaca; penulis dokumen tidak tercantum → butuh verifikasi identitas |
| SRC-ATP-FISIKA-F-2025 | Analisis_CP_Fisika_Fase_F_TP_ATP.docx | ATP_OR_TEACHING_PLAN | Tabel 1 (11 TP); Tabel 2–3 | 11 TP Fase F | TP Fisika Modern ada (no. 10) tapi TIDAK menyebut Millikan; tidak ada TP getaran/bandul | bandul (negatif), millikan (pengayaan) | PARTIALLY_REVIEWED — tabel dibaca penuh; penulis tidak tercantum |
| SRC-BS-XI-2022 | Fisika_BS_KLS_XI.pdf | TEXTBOOK | Bab 2 Kinematika, "D. Gerak Parabola", hal. 53–57 | gerak parabola | vx=v·cosθ, vy=v·sinθ; vx konstan; vy=0 di puncak; t_total = 2·t_puncak; penyelidikan R; kasus h₀>0 (bola dari pinggir meja) | parabola | PARTIALLY_REVIEWED — pdftotext penuh; subbab parabola dibaca terfokus; simbol matematika terdegradasi di ekstraksi |
| SRC-MIKRA-I | Fisika_Dasar_I_Mikrajuddin_Abdullah.pdf | REFERENCE_BOOK | Bab 7 §7.2 hal. 501–503; Bab 13 §13.3 hal. 1050+ | bandul | F=−W·sinθ; sinθ≈θ; f=(1/2π)√(g/l) hanya fungsi L,g; Foucault; persamaan nonlinear diselesaikan numerik | bandul | PARTIALLY_REVIEWED — kedua subbab dibaca terfokus; simbol Yunani hilang di ekstraksi (direkonstruksi dari prosa); tahun terbit tidak terbaca |
| SRC-MIKRA-II | Fisika_Dasar_II_Mikrajuddin_Abdullah.pdf | REFERENCE_BOOK | Bab 12 §12.3 hal. 851–855 | percobaan Millikan | skema elektroda horizontal; keseimbangan qE=mg; Stokes 6πηrv; laju terminal; r=√(9ηv/2ρg); e=1,602×10⁻¹⁹ C kelipatan bulat | millikan | PARTIALLY_REVIEWED — subbab dibaca penuh; buku mengabaikan gaya apung (m=ρV), FisikaSeru memakai Δρ — dicatat sebagai penguatan |
| SRC-PANDUAN-2025 | Panduan_Pembelajaran_dan_Asesmen_2025.pdf | ASSESSMENT_GUIDANCE | 159 hal.; identitas hal. 1–3 | pedagogi umum | identitas resmi BSKAP Edisi Revisi 2025; tidak memuat topik spesifik modul | semua (umum) | PARTIALLY_REVIEWED — identitas + pemindaian topik; isi pedagogi mendalam belum ditelaah bab-per-bab |
| SRC-ERLANGGA-XI | Fisika_Kelas_XI_Erlangga.pdf | TEXTBOOK | daftar isi (hal. iii–vi, via OCR) | — | **12 bab: Dinamika Rotasi, Elastisitas, Fluida, Kalor, Termodinamika, Gelombang×3, Optika, Pemanasan Global — TIDAK memuat parabola/kinematika/bandul/listrik-statis** | TIDAK RELEVAN untuk 3 modul saat ini | PARTIALLY_REVIEWED — PDF hasil scan; teks tak terekstrak (pdftotext 222 byte); OCR eng saja (ind tidak terpasang); hanya daftar isi + identitas |
| SRC-FORMAT-MODUL | Format_Modul_Ajar.docx | ATP_OR_TEACHING_PLAN | — | — | template kosong (5 tabel kosong) | — | DISCOVERED — tidak ada isi untuk diverifikasi |

## Rujukan verifikasi G-8 (nomor keputusan CP)

- **Nomor resmi yang benar: 046/H/KR/2025** — dikonfirmasi oleh pengguna (17 Okt 2026) dari:
  - Salinan keputusan resmi: `https://bpmpbabel.kemendikdasmen.go.id/PPID/wp-content/uploads/2025/07/KepKaBSKAP-046_2025-ttg-CP.pdf`
  - Siaran pers Kemendikdasmen, 23 Juni 2026: Keputusan Kepala BSKAP Nomor 020 Tahun 2026 hanya mengubah CP Agama dan Budi Pekerti; mata pelajaran lain tetap mengacu pada **046/H/KR/2025**.
- Teks "NOMOR 064/H/KR/2025" di dalam file docx CP Fisika Fase F adalah **kesalahan pada dokumen sumber itu sendiri**. Dokumen sumber tidak diubah (hak cipta/otoritas BSKAP); catatan bibliografi di matriks ini dan di registry yang dikoreksi.
- Rumusan CP yang dikutip untuk alignment tidak terpengaruh penomoran — tidak ada perubahan klaim alignment.
- Tanggal verifikasi: 17 Oktober 2026; verifikator: pengguna (bukan auditor AI).

## Keterbatasan ekstraksi yang jujur dilaporkan

1. **Erlangga**: PDF scan; `pdftotext` menghasilkan 222 byte kosong. OCR tersedia hanya `eng` (data `ind` tidak terpasang) — kesalahan OCR terlihat ("EVAastishtas", "Fluida Dimammis"). Hanya daftar isi + halaman identitas yang dibaca. **Klaim konten dari buku ini tidak dibuat.**
2. **Simbol Yunani/berntisikit** pada Mikrajuddin & BS hilang di ekstraksi pdftotext — persamaan diverifikasi dari struktur prosa dan hasil numerik contoh soal, bukan dari rendering rumus yang utuh.
3. **Nomor halaman docx** (CP/ATP) tidak tersedia pada ekstraksi — rujukan memakai struktur (bab/tabel) sebagai gantinya.
4. **Diskrepansi CP Fisika F**: file bernomor 046, isi menyebut 064 — **tidak diselesaikan dengan tebakan**; butuh konfirmasi dokumen resmi BSKAP oleh pengguna.
5. Telaah buku **terfokus pada subbab relevan modul** — bab lain tidak diklaim telah ditelaah.

## Perbedaan model vs buku (dicatat, bukan konflik)

- **Millikan:** Mikrajuddin mengabaikan gaya apung (m=ρ_oil·V); FisikaSeru memakai Δρ=ρ_oil−ρ_air dan koreksi Cunningham (tidak dibahas bagian yang dibaca). FisikaSeru LEBIH akurat; perbedaan didokumentasikan di PHYSICS-AUDIT-REPORT.
- **Bandul:** buku menyajikan pendekatan sudut kecil (f=(1/2π)√(g/l)); FisikaSeru menambah redaman b dan koreksi amplitudo T₀(1+θ₀²/16) pada data — konsisten dengan §13.3 yang justru menegaskan kasus besar harus numerik.
