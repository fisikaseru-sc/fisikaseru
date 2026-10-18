# Teacher Personas G1–G5 — Hasil Evaluasi Simulatif

> Klasifikasi: AI_SIMULATED_USER_EVALUATION. Sumber: `persona-runs/G1.md` … `G5.md` (arsip `/tmp/opencode/persona-eval/persona-runs/`).
> Ringkasan di bawah mengekstrak klaim kunci + status verifikasi terhadap kode/bukti oleh evaluator.

## G1 — Guru senior 22 thn, ketat konsep & notasi (`ag/gemini-3.8-flash-high`)

**Verifikasi numerik yang dilakukan G1 (semua cocok dengan bukti):**
- R teori HUD: R(30°)=55.2 m, t(30°)=2.55 s, H(60°)=23.9 m — cocok rumus.
- g regresi bandul = 4π²/3.8857 = 10.1598 m/s², galat 3.60% — cocok hitungan ulang evaluator.

**Penilaian protokol:** H1 LULUS SEBAGIAN; H2 GAGAL kriteria galat <2% (aktual 3.60%); H3 LULUS SEBAGIAN.

**3 masalah utama:**
1. **[HIGH]** Galat g bandul 3.60% > 2% (bukti: `analysis_dengan_data`). Rekomendasi: evaluasi noise 1.5% / perbanyak siklus pengukuran.
2. **[MEDIUM]** HUD "Fisika Real-Time" menampilkan x=77.9 m setelah mendarat, beda dari R tercatat 55.6 m (bukti: `trials_after_3_launches`) — siswa bingung bedakan titik jatuh vs posisi akhir (bounce-and-stop).
3. **[MEDIUM]** Label droplet duplikat "Drop #01" dua kali pada tabel Millikan.

**Tidak dapat dinilai:** visual 3D, preset non-Bumi (H2.4), histogram Cari Pola (H3.4-5), reload Millikan (H3.6).

## G2 — Guru muda tech-savvy, fokus alur PEAR (`ag/gemini-3.8-flash-high`)

**Verifikasi numerik yang dilakukan G2 (semua cocok dengan bukti):**
- H1: R(30°)=55.18 m vs data 56.0 m; R(45°)=63.71 m vs data 63.0 m; R(60°)=55.18 m → hubungan sudut komplementer & puncak 45° terbukti.
- H2: gradien 3.8857 → g = 4π²/3.8857 = 10.1599 m/s² (tampilan 10.1598 ✓); galat vs 9.8067 = **3.60% — GAGAL kriteria protokol <2%**.
- H3: notasi Fg/Fe dan E = V/d tepat (V=600 V → E=120 kV/m → d=5.0 mm).

**Penilaian positif:** alur PEAR lengkap (Pretest/Hipotesis → Eksperimen → Analisis → Refleksi + transfer Bulan = HOTS); persistensi localStorage terbukti; banner "Ini adalah data contoh…" muncul benar di sesi baru bandul; satuan konsisten.

**3 masalah utama:**
1. **[HIGH]** Galat g bandul 3.60% > 2% (bukti: `analysis_dengan_data`). Rekomendasi: reduksi noise / ubah sampling pencatatan periode. *(Konvergen dengan G1/G4 → F-02.)*
2. **[MEDIUM]** Dua baris "Drop #01" (r 0.97 vs 0.88 µm) — siswa bisa tafsir satu tetes mengecil. Rekomendasi G2: perbaiki generator ID agar increment unik. *(Catatan evaluator: mekanismenya adalah merekam droplet yang sama dua kali setelah sinar-X — label tidak diputar saat `currentDroplet` tetap; bukan bug indexing. Solusi padanan: sufiks "obs 2" / blokir rekam ulang droplet sama → F-08.)*
3. **[LOW]** Peringatan eksplisit "Medan listrik belum aktif…" tidak teramati saat rekam dengan tegangan mati pada bukti. *(Verifikasi evaluator: jalur pesan ada di `ExperimentView.tsx:789`, tetapi saat run bukti tegangan sudah ON ulang sehingga jalur itu tidak dipicu — status TIDAK TERAMATI, bukan bug terbukti.)*

**TIDAK TERAMATI:** render visual kanvas 2D/3D; langkah 4 H2 (preset Bulan/Jupiter); tahap lanjutan Millikan (grafik tangga kuantum, estimasi e, reload 5 data).

## G3 — Guru proyektor/keterbacaan (`ag/gemini-3.8-flash-low`)

**3 masalah utama:**
1. **[HIGH]** UI padat untuk proyektor: banyak angka kecil (HUD 8px, label 10px) — keberatan keterbacaan dari bangku belakang. *(Catatan evaluator: klaim ukuran font berbasis kode class `text-[8px]`/`text-[10px]` yang memang terlihat di bukti teks; namun keterbacaan riil di proyektor = TIDAK TERAMATI, butuh uji manusia.)*
2. **[MEDIUM]** HUD x=77.9 m pasca-mendarat (sama dengan G1#2).
3. **[LOW]** Diskrepansi kecil R(45°) rekaman 63.0 m vs teori 63.7 m (diskretisasi + noise pengukuran).

## G4 — Guru pembina olimpiade, presisi eksperimen (`ag/gemini-3.8-flash-medium`)

**Verifikasi numerik G4 (cocok):** regresi 5 titik → g=10.1598, galat 3.60%; koreksi amplitudo θ₀=10° ≈ +1.0019 (orde 1+θ₀²/16 rad).

**3 masalah utama:**
1. **[CRITICAL]** Regresi n=1 menampilkan gradien 0.0000, g 0.0000, **galat 0.00%** (bukti H4: bandul analysis dengan 1 trial) — miskonsepsi "1 percobaan = akurat sempurna". *Verifikasi kode: `AnalysisView.tsx:211` — `calculatedG > 0 ? ... : 0` memang mengembalikan galat 0 saat g=0; regresi `slope=0` saat denom 0 (n=1, semua x sama → ssTot=0 → r2=1). KONFIRMASI BUG tampilan.*
2. **[HIGH]** Galat g 3.60% > 2% (sama G1#1).
3. **[MEDIUM]** Peringatan "Medan listrik belum aktif" tidak teramati muncul saat rekam dengan tegangan mati pada bukti (bukti `H3-5-warning-off` menunjukkan alert Fg>Fe, bukan pesan tegangan mati). *Verifikasi evaluator: pada run tersebut tegangan sudah ON kembali (toggle kedua), sehingga pesan yang muncul memang "Droplet masih jatuh (Fg > Fe)" — kode `ExperimentView.tsx:789` punya pesan "Medan listrik belum aktif!" tetapi jalur itu tidak terekam bukti. Status: TIDAK TERAMATI, bukan bug terbukti.*

## G5 — Guru aksesibilitas & inklusi (`ag/gemini-3.8-flash-medium`)

**3 masalah utama:**
1. **[HIGH]** Slider variabel (L, m, θ, v₀) tidak muncul dalam 12 langkah pertama tab-order (bukti `H5-tab-order.json`: hanya tombol & link). *Verifikasi kode: slider bandul = `<input type="range">` native (seharusnya focusable), tapi berada di dalam panel yang harus dibuka dulu (step Pengukuran) — saat tes H5 panel masih di step Pretest sehingga slider tidak ada di DOM. Klaim "slider tidak bisa dijangkau keyboard" BELUM terbukti; yang terbukti: slider tidak terlihat pada tahap awal. Perlu uji ulang pada step Pengukuran.*
2. **[MEDIUM]** Tombol step berisi teks "1
Persiapan" (newline) tanpa aria-label bersih.
3. **[LOW]** Diskrepansi 63.0 m (data) vs 63.7 m (teks tantangan Bulan memakai 63.7 m).

## Ringkasan status tugas guru

| Persona | Skenario dinilai | Kesimpulan utama |
|---|---|---|
| G1 | H1, H2, H3 | H1 sebagian; H2 GAGAL kriteria galat; H3 sebagian |
| G2 | H1, H2, H3 | Alur PEAR kuat; discovery millikan tak teramati |
| G3 | H1, H5 | Kekhawatiran kepadatan UI (perlu validasi visual manusia) |
| G4 | H2, H3, H4 | Bug regresi n=1 (galat 0.00%); H2 gagal galat; isolasi OK |
| G5 | H5, H1 | Tab-order dasar OK; slider & aria-label perlu audit lanjut |
