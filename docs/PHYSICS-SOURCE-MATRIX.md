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
| SRC-CP-FISIKA-F-2025 | CP_2025_BSKAP_046H_KR_Fisika_Fase_F.docx | CURRICULUM_OFFICIAL | CP Fase F (PDF hal. 3 & 5) | fisika modern; **mekanika**; keterampilan proses F | CP Fisika: "menganalisis teori dasar fisika modern…"; elemen Pemahaman Fisika memuat "materi **mekanika**" dan CP menyatakan "**Menganalisis hubungan gerak dan gaya**" (PDF hal. 3 & 5); TIDAK memuat bandul/getaran sebagai TP (konfirmasi 12 Nov 2026: pencarian penuh atas PDF resmi → 0 hit getaran/bandul/ayunan/osilasi) | millikan (pengayaan), bandul (pengayaan berpijak pada elemen mekanika) | REVIEWED — dibaca penuh. ✅ Diskrepansi 046 vs 064 **TERSELESAIKAN** (verifikasi eksternal pengguna, 17 Okt 2026): nomor resmi = **046/H/KR/2025** (salinan keputusan bpmpbabel.kemendikdasmen.go.id + siaran pers Kemendikdasmen 23 Jun 2026: Keputusan 020/2026 hanya mengubah CP Agama & Budi Pekerti). Teks "064" di dalam docx = kesalahan dokumen sumber; dokumen sumber tidak diubah. |
| SRC-ATP-IPA-E-2025 | Analisis_CP_IPA_Fisika_Kelas_X_Fase_E.docx | ATP_OR_TEACHING_PLAN | Tabel 1 baris 2; Tabel 2–5 | gerak dua dimensi | TP: "menganalisis gerak dua dimensi… representasi matematis, grafik dan eksperimen"; indikator "Menganalisis gerak parabola menggunakan persamaan kinematika"; contoh aktivitas menyebut simulasi + analisis grafik lintasan | parabola | PARTIALLY_REVIEWED — semua tabel dibaca; penulis dokumen tidak tercantum → butuh verifikasi identitas |
| SRC-ATP-FISIKA-F-2025 | Analisis_CP_Fisika_Fase_F_TP_ATP.docx | ATP_OR_TEACHING_PLAN | Tabel 1 (11 TP); Tabel 2–3 | 11 TP Fase F | TP Fisika Modern ada (no. 10) tapi TIDAK menyebut Millikan; tidak ada TP getaran/bandul | bandul (negatif), millikan (pengayaan) | PARTIALLY_REVIEWED — tabel dibaca penuh; penulis tidak tercantum |
| SRC-BS-XI-2022 | Fisika_BS_KLS_XI.pdf | TEXTBOOK | Bab 2 Kinematika "D. Gerak Parabola" hal. 53–57; **Bab 5 Gelombang, Bunyi dan Cahaya hal. 115–136 (PDF page 138–156)** | gerak parabola; **getaran & bandul** | parabola: vx=v·cosθ, vy=v·sinθ; vx konstan; vy=0 di puncak; t_total = 2·t_puncak; survei R; kasus h₀>0. **bandul (Bab 5, hal. 117): "Energi mekanik pada bandul akan diubah menjadi getaran pada permukaan air, kemudian getaran tersebut merambat dan membentuk gelombang" (Gambar 5.3); hal. 134 Aktivitas 5.6 resonansi bandul: "Siapkan plastisin sebagai pemberat/bandul… Simpangkan salah satu bandul kemudian lepaskan, amati gerak bandul yang lain"** | parabola, **bandul** | PARTIALLY_REVIEWED — pdftotext penuh; subbab parabola + Bab 5 (getaran/bandul) dibaca terfokus (Bab 5 ditambah telaah 12 Nov 2026 untuk G-9); simbol matematika terdegradasi di ekstraksi |
| SRC-MIKRA-I | Fisika_Dasar_I_Mikrajuddin_Abdullah.pdf | REFERENCE_BOOK | Bab 7 §7.2 hal. 501–503; Bab 13 §13.3 hal. 1050+ | bandul | F=−W·sinθ; sinθ≈θ; f=(1/2π)√(g/l) hanya fungsi L,g; Foucault; persamaan nonlinear diselesaikan numerik | bandul | PARTIALLY_REVIEWED — kedua subbab dibaca terfokus; simbol Yunani hilang di ekstraksi (direkonstruksi dari prosa); tahun terbit tidak terbaca |
| SRC-MIKRA-II | Fisika_Dasar_II_Mikrajuddin_Abdullah.pdf | REFERENCE_BOOK | Bab 12 §12.3 hal. 851–855 | percobaan Millikan | skema elektroda horizontal; keseimbangan qE=mg; Stokes 6πηrv; laju terminal; r=√(9ηv/2ρg); e=1,602×10⁻¹⁹ C kelipatan bulat | millikan | PARTIALLY_REVIEWED — subbab dibaca penuh; buku mengabaikan gaya apung (m=ρV), FisikaSeru memakai Δρ — dicatat sebagai penguatan |
| SRC-PANDUAN-2025 | Panduan_Pembelajaran_dan_Asesmen_2025.pdf | ASSESSMENT_GUIDANCE | 159 hal.; identitas hal. 1–3 | pedagogi umum | identitas resmi BSKAP Edisi Revisi 2025; tidak memuat topik spesifik modul — konfirmasi 12 Nov 2026 (G-9): pencarian teks penuh → 0 hit getaran/bandul/ayunan/osilasi, jadi dokumen ini bukan bukti pendukung bandul | semua (umum) | PARTIALLY_REVIEWED — identitas + pemindaian topik; isi pedagogi mendalam belum ditelaah bab-per-bab |
| SRC-ERLANGGA-XI | Fisika_Kelas_XI_Erlangga.pdf | TEXTBOOK | daftar isi (hal. iii–vi, via OCR) | — | **12 bab: Dinamika Rotasi, Elastisitas, Fluida, Kalor, Termodinamika, Gelombang×3, Optika, Pemanasan Global — TIDAK memuat parabola/kinematika/bandul/listrik-statis** | TIDAK RELEVAN untuk 3 modul saat ini | PARTIALLY_REVIEWED — PDF hasil scan; teks tak terekstrak (pdftotext 222 byte); OCR eng saja (ind tidak terpasang); hanya daftar isi + identitas |
| SRC-FORMAT-MODUL | Format_Modul_Ajar.docx | ATP_OR_TEACHING_PLAN | — | — | template kosong (5 tabel kosong) | — | DISCOVERED — tidak ada isi untuk diverifikasi |

## Rujukan verifikasi G-9 (bukti getaran/bandul, 12 Nov 2026)

Tujuan: menguji asumsi lama "Kelas 11, Bab 5: Getaran" dan mencari dokumen pendukung resmi — bukan menerima/menolak asumsi.

**Pencarian negatif (konfirmasi, bukan asumsi):**

| Dokumen | Metode | Kata kunci | Hasil |
|---|---|---|---|
| `CP_2025_BSKAP_046H_KR_Fisika_Fase_F.pdf` (CP Fisika Fase F) | `pdftotext -layout` penuh | getaran, bandul, ayunan, osilasi, simpangan | **0 hit** |
| `Panduan_Pembelajaran_dan_Asesmen_2025.pdf` (Panduan/ATP resmi) | `pdftotext -layout` penuh | getaran, bandul, ayunan, osilasi | **0 hit** |
| `Analisis_CP_IPA_Fisika_Kelas_X_Fase_E.docx` (Fase E) | ekstraksi docx | getaran, bandul, ayunan, osilasi, simpangan | **0 hit** |
| `Analisis_CP_Fisika_Fase_F_TP_ATP.docx` (11 TP) | ekstraksi docx | getaran, bandul | **0 hit** (kata "gelombang" 13×) |
| `CP_2025_BSKAP_046H_KR_IPA.docx` | ekstraksi docx | getaran | 1 hit — frasa umum "suhu, energi, gaya, getaran gelombang dan ekosistem" (konteks science, bukan TP) |

**Bukti positif (Buku Sekolah resmi):** `Fisika_BS_KLS_XI.pdf` (Alvius Tinambunan/Kemendikbudristek 2022) — **21 hit "getaran", 5 hit "bandul"**; Bab 5 "Gelombang, Bunyi dan Cahaya" (halaman cetak 115–136):

- hal. 117 (Gambar 5.3): "Energi mekanik pada bandul akan diubah menjadi getaran pada permukaan air, kemudian getaran tersebut merambat dan membentuk gelombang."
- hal. 134 (Aktivitas 5.6, resonansi): "Siapkan plastisin sebagai pemberat/bandul… Simpangkan salah satu bandul kemudian lepaskan, amati gerak bandul yang lain."

**Kesimpulan:** bandul **ada** di Buku Sekolah resmi kelas XI — tetapi di bawah Bab 5 (gelombang), **bukan** bab "Getaran" (klaim lama design.md tidak boleh ditulis demikian). Karena CP/ATP tetap 0 hit untuk getaran/bandul, status modul bandul tetap **ENRICHMENT**, namun kini dengan bukti positif (elemen "mekanika" + TP "menganalisis hubungan gerak dan gaya" pada CP Fisika Fase F) — bukan hanya bukti negatif. Modul tetap **tidak boleh** diklaim ALIGNED.

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
