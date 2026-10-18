# Checklist Uji Manusia Nyata — Validasi Lanjutan

> **Status: PENDING — belum ada satu pun skenario yang dijalankan manusia nyata.**
> Klasifikasi hasil evaluasi persona AI: `AI_SIMULATED_USER_EVALUATION` (lihat `findings.md`).
> Sumber skenario resmi: `docs/HUMAN-TESTING-PROTOCOL.md` (target 5 guru fisika + 8 siswa SMA kelas XI).
> Petunjuk: jalankan langkah berurutan, isi kolom Hasil Aktual. **Jangan mengarang hasil — kosongkan bila tidak dijalankan.**

## Prasyarat sesi uji

- [ ] Chrome terbaru, laptop standar (bukan mobile), jaringan normal
- [ ] Sesi incognito/private (localStorage kosong) kecuali skenario menentukan lain
- [ ] Build yang diuji dicatat commit-nya: ________ (disarankan `5faba98` atau lebih baru setelah triase F-01–F-08)

## Fokus validasi tambahan — berasal dari temuan persona AI (F-01–F-10)

Temuan persona AI **belum tentu masalah nyata** — gunakan sesi manusia untuk mengonfirmasi/menolak:

| ID | Pertanyaan validasi untuk peserta manusia | Skenario |
|---|---|---|
| F-01 | (Jika bug belum diperbaiki) Apakah peserta tersesat saat analisis dengan <3 trial (angka g=0/galat 0%)? | H2 |
| F-02 | Apakah peserta yang merekam 5 trial mendapat galat <2%? Berapa galat aktual tiap peserta? (Prediksi simulasi: ~54% gagal) | H2 |
| F-03 | Apakah peserta menyadari/terganggu HUD x pasca-mendarat ≠ R tercatat? | H1 |
| F-04 | Apakah peserta dengan miskonsepsi "massa mempengaruhi T" berubah setelah sesi? (pretest vs post) | H2 |
| F-06 | Bagaimana reaksi peserta terhadap pesan "belum mengisi langkah Prediksi"? (netral/cemas/menghentikan) | H1 |
| F-07 | Apakah peserta melewatkan prediksi? Apakah kartu "45°" disalin tanpa membaca grafik? (observasi) | H1 |
| F-09 | Selesaikan tahap Cari Pola → estimasi e; catat estimasi & galat vs 1,602×10⁻¹⁹ C (kriteria <3%) | H3 |
| F-10 | Preset gravitasi non-Bumi (H2 langkah 4): apakah galat dihitung benar terhadap g preset? | H2 |
| F-10 | Keterbacaan proyektor & screen reader: minta guru menggambar/deskripsikan apa yang terbaca dari jarak 3–4 m | H5 |

## Lembar pencatatan peserta

| Peserta | Peran (G1–G5 / S1–S8) | Skenario | Tanggal | Durasi | Hasil (LULUS/GAGAL/SEBAGIAN) | Catatan kunci | F-IDs terkonfirmasi |
|---|---|---|---|---|---|---|---|
| 1. | | | | | | | |
| 2. | | | | | | | |
| 3. | | | | | | | |
| 4. | | | | | | | |
| 5. | | | | | | | |
| 6. | | | | | | | |
| 7. | | | | | | | |
| 8. | | | | | | | |
| 9. | | | | | | | |
| 10. | | | | | | | |
| 11. | | | | | | | |
| 12. | | | | | | | |
| 13. | | | | | | | |

## Setelah sesi

1. Bandingkan frekuensi temuan manusia vs frekuensi simulatif persona AI (tabel `findings.md`) — tandai tiap temuan: TERKONFIRMASI / DITOLAK / TIDAK TERAMATI.
2. Simpan formulir terisi sebagai laporan bertanggal baru di `docs/evaluations/` (jangan menimpa laporan ini).
3. Baru setelah 5 guru + 8 siswa nyata menyelesaikan skenario, status G-2 (`docs/QA-CERTIFICATION-REPORT.md`) dapat ditinjau ulang.
