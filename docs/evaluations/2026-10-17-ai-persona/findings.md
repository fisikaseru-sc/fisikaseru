# Findings — Triase Gabungan 13 Persona (AI Simulated User Evaluation)

> Setiap temuan diberi ID, asal persona, bukti, keparahan, frekuensi simulatif, keyakinan, dan rekomendasi.
> **Frekuensi = jumlah persona (dari 13) yang menyebut temuan — BUKAN prevalensi pada populasi guru/siswa nyata.**
> Kolom "Verifikasi evaluator" = pemeriksaan ulang terhadap kode sumber / bukti mentah yang dilakukan setelah evaluasi persona. Tidak ada perubahan kode produksi yang dilakukan (sesuai mandat — temuan dicatat untuk ditriase).

## F-01 · Bug: regresi bandul n=1 menampilkan galat 0.00% (g=0)

- **Kategori:** Bug fungsional + potensi miskonsepsi
- **Asal:** G4 (CRITICAL), dibenarkan S-umum
- **Bukti:** `H4-2-bandul-analysis-recovered.txt` — 1 trial (L=0.75) → "Gradien 0.0000, g hitung 0.0000, Galat 0.00%".
- **Verifikasi evaluator:** KONFIRMASI DI KODE. `src/features/bandul/components/AnalysisView.tsx:211` — `calculatedG > 0 ? ... : 0` mengembalikan galat 0 saat g=0; regresi slope=0 & r2=1 untuk n=1 (denom 0/ssTot 0). Pesan "minimal 3 titik" tidak ada di jalur ini.
- **Keparahan:** CRITICAL · **Frekuensi simulatif:** 1/13 · **Keyakinan:** tinggi (kode + bukti)
- **Rekomendasi:** Guard: bila `trials.length < 2` (idealnya < 3), tampilkan pesan "Data belum cukup untuk regresi" dan jangan tampilkan angka g/galat sama sekali.
- **Status (18 Okt 2026):** **TERSELESAIKAN** — guard ditambahkan di `AnalysisView.tsx` (bandul & millikan) dan `reflection/page.tsx`; data < 2 tidak lagi menampilkan g=0 atau galat 0.00% palsu.

## F-02 · Fisika/pedagogi: galat g bandul pada 5 trial melebihi kriteria protokol <2%

- **Kategori:** Potensi miskonsepsi + kriteria protokol
- **Asal:** G1, G4, S2, S5, S8 (5 persona)
- **Bukti:** Data aktual 5 trial (L=0.2–1.0): slope 3.8857 → g=10.16 m/s², galat 3.60%, R²=0.9997.
- **Verifikasi evaluator:** Simulasi Monte Carlo 300× dengan noise kode (1.5% relatif pada T): **median galat 2.18%, 54% run melebihi 2%** — bukan kebetulan; dengan 5 titik, kriteria protokol <2% akan gagal bagi ~setengah siswa. Akar: noise iid pada T bias slope karena T² bukan linear terhadap noise.
- **Keparahan:** HIGH · **Frekuensi simulatif:** 5/13 · **Keyakinan:** tinggi
- **Rekomendasi (pilihan, keputusan pengguna):** (a) turunkan noise rekam; (b) ganti kriteria protokol menjadi <5% atau minimal 8 trial; (c) ukur T sebagai rata-rata ≥3 ayunan (mengurangi noise efektif). Ini keputusan pedagogis — jangan diubah diam-diam.

## F-03 · UX/kebingungan: HUD "Fisika Real-Time" x=77.9 m setelah mendarat ≠ R tercatat

- **Kategori:** Kebingungan UI/UX + potensi miskonsepsi
- **Asal:** G1, G3, G5, S4 (4 persona)
- **Bukti:** `H1-launch60.txt` — HUD `x 77.9 m, y 0.0, |v| 0.0` sementara R tercatat 55.6 m (teori 55.2 m).
- **Verifikasi evaluator:** KONFIRMASI perilaku desain: `ProjectileScene3D` memakai bounce-and-stop (restitusi + redaman horizontal) — bola memantul/menggelinding setelah mendarat sehingga x akhir > rangeX pendaratan pertama. HUD menampilkan posisi akhir, tabel merekam titik jatuh. Tidak crash; inkonsistensi presentasi.
- **Keparahan:** MEDIUM · **Frekuensi simulatif:** 4/13 · **Keyakinan:** tinggi
- **Rekomendasi:** Setelah `rested`, bekukan HUD x pada `rangeX` (atau beri label "jarak total tempuh (termasuk pantulan)"), agar HUD konsisten dengan tabel.
- **Status (18 Okt 2026):** **TERSELESAIKAN** — Saat bola mendarat (`sceneState.rangeX !== null`), baris `R jatuh` (titik impak pertama) dimunculkan secara eksplisit di HUD fisika real-time berdampingan dengan `x` (posisi akhir).

## F-04 · Instruksi/miskonsepsi: slider Massa Beban ada tapi tidak pernah diuji alur

- **Kategori:** Potensi miskonsepsi fisika
- **Asal:** S8 (temuan paling tajam), didukung konteks G-umum
- **Bukti:** UI menyediakan slider "Massa Beban (m) 100 g [50–500 g]"; alur eksperimen & checklist hanya memandu variasi L.
- **Verifikasi evaluator:** KONFIRMASI — `ExperimentView.tsx` slider mass ada; `recordTrial` hanya pakai L, gravity, angle; tidak ada tugas/tantangan variasi massa. Fisika simulasi benar (T tak tergantung m), tapi bukti empirisnya tidak pernah diperlihatkan siswa.
- **Keparahan:** HIGH (pedagogis) · **Frekuensi simulatif:** 1/13 (tapi kategori miskonsepsi klasik) · **Keyakinan:** tinggi
- **Rekomendasi:** Tambah checklist/mini-tugas: "Ubah massa 50 g → 500 g dengan L tetap; amati T tidak berubah" — mengubah miskonsepsi menjadi pengalaman penemuan. (Keputusan kurikulum pengguna.)
- **Status (18 Okt 2026):** **TERSELESAIKAN** — Kartu panduan "Uji Miskonsepsi" ditambahkan tepat di bawah slider panel Pengukuran bandul, mengajak siswa menguji pengaruh massa terhadap periode.

## F-05 · Aksesibilitas: slider tidak dalam tab-order tahap awal; aria-label tombol step berisi newline

- **Kategori:** Aksesibilitas
- **Asal:** G5
- **Bukti:** `H5-tab-order.json` — 12 fokus pertama hanya tombol/link; tombol step ber-teks "1\nPersiapan"; `role: null`.
- **Verifikasi evaluator:** SEBAGIAN. Slider bandul = `<input type="range">` native (focusable secara HTML), tetapi berada di panel step "Pengukuran" yang belum dibuka saat pengukuran tab-order (masih step Pretest) — jadi "tidak bisa diakses keyboard" BELUM terbukti; yang terbukti: tidak terlihat di tahap awal. Radix slider parabola ber-focus via thumb (terbukti evaluator bisa mengoperasikan via keyboard saat koleksi bukti). aria-label bersih memang belum ada pada tombol step.
- **Keparahan:** MEDIUM (dengan revisan) · **Frekuensi simulatif:** 1/13 · **Keyakinan:** sedang
- **Rekomendasi:** Uji ulang tab-order pada step Pengukuran/Pengamatan; tambah `aria-label` pada tombol step; audit screen reader penuh bersama uji manusia.

## F-06 · Instruksi: pesan "Kamu belum mengisi langkah Prediksi" membingungkan/cemas

- **Kategori:** Masalah instruksi
- **Asal:** S1, S4 (2 persona)
- **Bukti:** `H1-reflection.txt` — "Kamu belum mengisi langkah Prediksi. Kalau ingin intuisimu diuji, buka dulu halaman prediksi. Kamu tetap bisa melanjutkan refleksi ini."
- **Verifikasi evaluator:** Teks persis ada di halaman refleksi. Sifatnya informatif, tapi nada "belum mengisi" dibaca persona sebagai kesalahan prosedur.
- **Keparahan:** LOW · **Frekuensi simulatif:** 2/13 · **Keyakinan:** tinggi
- **Rekomendasi:** Reformulasi positif: "Opsional: isi prediksi dulu supaya intuisimu tercatat — atau lanjutkan refleksi."
- **Status (18 Okt 2026):** **TERSELESAIKAN** — Pesan di `ReflectionView.tsx` direformulasi dengan nada ramah/afirmatif ("Langkah Prediksi Bersifat Opsional") dan ikon pemantik (Lightbulb), menghilangkan kesan salah prosedur pada siswa pemalu/cemas.

## F-07 · Pedagogi: celah jalan pintas (skip prediksi; salin jawaban kartu kesimpulan)

- **Kategori:** Masalah instruksi / desain pedagogis
- **Asal:** S6
- **Bukti:** Refleksi bisa dilanjutkan tanpa prediksi; kartu "TEBAKAN TERBAIK DATAMU: 45°" memungkinkan menyalin tanpa membaca grafik; isian refleksi "tidak dinilai benar/salah".
- **Verifikasi evaluator:** KONFIRMASI dari bukti & kode (tidak ada gerbang paksa prediksi).
- **Keparahan:** MEDIUM (tergantung tujuan guru — inquiry terbuka vs terstruktur) · **Frekuensi simulatif:** 1/13 · **Keyakinan:** tinggi
- **Rekomendasi:** Keputusan pedagogis pengguna: gerbang lunak (prediksi disarankan sebelum eksperimen) atau biarkan terbuka. Jangan diubah tanpa persetujuan.

## F-08 · UX: label droplet "Drop #01" tampil dua kali pada tabel Millikan

- **Kategori:** Kebingungan UI/UX
- **Asal:** G1, S3 (2 persona)
- **Bukti:** Tabel analisis: baris 1 & 2 keduanya "Drop #01" (r 0.97 vs 0.88 µm).
- **Verifikasi evaluator:** KONFIRMASI mekanisme: `recordTrial` menyimpan `currentDroplet.label`; setelah rekam sukses, `triggerAtomizer` menyiapkan droplet baru. Pada pengumpulan bukti, rekaman kedua dilakukan pada droplet yang sama setelah sinar-X (chargeN berubah, currentDroplet tidak) — label tetap. Jadi bukan bug indexing, melainkan konsekuensi merekam droplet sama dua kali + label tidak membedakan.
- **Keparahan:** MEDIUM · **Frekuensi simulatif:** 2/13 · **Keyakinan:** tinggi
- **Rekomendasi:** Tambah sufiks pengamatan (mis. "Drop #01 · obs 2") atau nonaktifkan rekam ulang untuk droplet yang sama sampai atomizer dipicu.
- **Status (18 Okt 2026):** **TERSELESAIKAN** — Saat merekam droplet yang sama berulang kali, ditambahkan penomoran observasi otomatis (mis. `Drop #01 (obs 2)`) sehingga data tidak lagi terkesan duplikat atau eror identifikasi.

## F-09 · Keterbatasan bukti: discovery Millikan (Cari Pola → estimasi e) tidak terekam

- **Kategori:** Butuh data tambahan (bukan temuan produk)
- **Asal:** G1, G2, G4, S3, S7 (5 persona menandai UNOBSERVED/TIDAK TERAMATI)
- **Bukti:** Analisis Millikan pada bukti berhenti di "01 Kaji Data"; tab 03 "Cari Pola" berstatus "Terkunci (Cari Pola Dulu)".
- **Keparahan:** — (gap cakupan evaluasi) · **Rekomendasi:** jalankan E2E/persona lanjutan yang menyelesaikan tahap Cari Pola → bandingkan estimasi e dengan 1.602×10⁻¹⁹ C (kriteria protokol H3.5: Δ<3%).

## F-10 · Keterbatasan bukti: H2 langkah 4 (preset non-Bumi) & H5 (screen reader, proyektor) tidak terekam

- **Kategori:** Butuh data dari pengguna nyata
- **Asal:** G1, G4, S2 (non-Bumi); G3, G5 (visual/screen reader)
- **Keparahan:** — (gap cakupan) · **Rekomendasi:** masukkan ke checklist uji manusia (lihat `human-validation-followup.md`).

## Peta prioritas tindakan (diurut berdasarkan risiko & dependensi)

| Prioritas | Temuan | Tindakan | Perlu persetujuan? |
|---|---|---|---|
| 1 | F-01 (CRITICAL) | Guard regresi <2/3 titik | Perubahan kode — ya |
| 2 | F-02 (HIGH) | Keputusan: noise/kriteria/minimum trial | Keputusan pedagogis — ya |
| 3 | F-04 (HIGH pedagogis) | Mini-tugas variasi massa | Keputusan kurikulum — ya |
| 4 | F-03, F-08 (MEDIUM) | Freeze HUD x pasca-rested; sufiks label droplet | Perubahan kode kecil — ya |
| 5 | F-06, F-07 (LOW/MEDIUM) | Nada pesan prediksi; gerbang prediksi | Ya |
| 6 | F-05 (MEDIUM) | Uji ulang tab-order step Pengukuran + aria-label | Ya |
| 7 | F-09, F-10 | Perluas pengumpulan bukti / uji manusia | — |

**Tidak ada perubahan kode produksi yang dilakukan dalam evaluasi ini.**
