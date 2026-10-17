# Protokol Uji Manusia — FisikaSeru

> Status: **PENDING** — belum ada satu pun skenario yang dijalankan manusia.
> Tanggal dibuat: 2026-10-17. Target: 5 guru fisika + 8 siswa SMA (kelas XI).
> Setiap skenario dijalankan di: Chrome terbaru, laptop standar (bukan perangkat mobile), jaringan normal.
> Durasi sesi per modul: ±25–35 menit.

Petunjuk penguji: jalankan langkah berurutan, isi kolom **Hasil Aktual**, **Status** (LULUS/GAGAL/SEBAGIAN), dan **Catatan**. Jangan mengarang hasil — kosongkan bila tidak dijalankan.

---

## Skenario H1 — Modul Gerak Parabola (eksperimen → analisis → refleksi)

**Tujuan pengguna:** menemukan sendiri sudut luncur optimal 45° (tanpa diberi tahu) melalui data.
**Prasyarat:** localStorage kosong (sesi incognito/private).

| # | Langkah | Hasil yang diharapkan | Bukti dikumpulkan | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|---|---|
| 1 | Buka `/modules/parabola/experiment` | Scene 3D proyektil termuat, slider v₀/sudut/gravitasi terlihat | Tangkapan layar awal | | | |
| 2 | Set sudut 30°, v₀ tetap, tekan luncurkan; tekan "Catat Data" | Titik jarak (range) muncul di tabel trial | Tangkapan layar tabel | | | |
| 3 | Ulangi untuk 45° dan 60° (v₀ sama) | Range 45° > range 30° dan 60° (sesuai teori R=v₀²sin2θ/g) | Tabel 3 baris | | | |
| 4 | Reload halaman | Parameter slider & data trial **pulih** dari localStorage (tidak hilang) | Tangkapan layar setelah reload | | | |
| 5 | Buka tab Analisis | Grafik jarak vs sudut memuat data yang sama; pola puncak di 45° terlihat | Tangkapan layar grafik | | | |
| 6 | Buka Refleksi | Halaman refleksi termuat tanpa error; pertanyaan prediksi terisi data sendiri (bukan demo) | Tangkapan layar | | | |

**Kriteria lulus:** langkah 1–6 semua LULUS; siswa/guru mengonfirmasi angka 45° konsisten dengan grafik.
**Risiko yang diperhatikan:** kejelasan label satuan (m, m/s, derajat), keterbacaan grafik, konsistensi simbol θ.

---

## Skenario H2 — Modul Bandul Sederhana (g dari regresi)

**Tujuan:** menentukan g melalui regresi T² vs L, target galat < 2%.
**Prasyarat:** sesi incognito (data demo akan ditandai "data contoh" — ini yang diuji juga).

| # | Langkah | Hasil yang diharapkan | Bukti | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|---|---|
| 1 | Buka `/modules/bandul/experiment` | Simulasi bandul 2D berjalan saat "Mulai"; toggle 2D/3D berfungsi | Tangkapan layar | | | |
| 2 | Rekam 5 trial dengan L berbeda (0,2–1,0 m) | Tabel "Rekam N/10" bertambah; localStorage terisi | Tangkapan tabel | | | |
| 3 | Buka Analisis | **Tidak ada** banner "Ini adalah data contoh" (data sendiri dipakai); R² tinggi; g hitung ≈ 9,8 m/s²; galat < 2% | Tangkapan layar hasil g | | | |
| 4 | Ganti preset gravitasi non-Bumi, rekam trial baru, buka Analisis | g referensi mengikuti lab non-Bumi (galat dihitung terhadap g lab itu, bukan selalu 9,81) | Tangkapan layar | | | |
| 5 | Hapus data (atau sesi incognito baru), buka Analisis | Banner kuning "Ini adalah data contoh, bukan hasil eksperimenmu." **tampil** | Tangkapan layar banner | | | |
| 6 | Reset simulasi di lab | Sudut & timer kembali ke kondisi awal; tidak ada state tersangkut | Observasi langsung | | | |

**Kriteria lulus:** semua langkah LULUS; g hitung dalam galat < 2% untuk data Bumi.
**Kebenaran fisika (referensi terverifikasi):** T = 2π√(L/g); koreksi amplitudo T₀(1+θ₀²/16) sudah diuji oracle numerik `npm run test:physics` — uji manusia memvalidasi tampilan & alur, bukan turunan rumus.

---

## Skenario H3 — Modul Tetes Minyak Millikan (kuantisasi muatan)

**Tujuan:** menemukan kuantisasi muatan (e ≈ 1,6×10⁻¹⁹ C) melalui ≥5 tetes.
**Prasyarat:** sesi incognito.

| # | Langkah | Hasil yang diharapkan | Bukti | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|---|---|
| 1 | Buka `/modules/millikan/experiment`, sembur tetes, nyalakan tegangan | Tetes melayang/naik teratur; panel fisika menampilkan nilai masuk akal | Tangkapan layar | | | |
| 2 | Rekam 5 tetes (metode melayang atau dinamis) | "Target x/5" bertambah; setelah 5, analisis terbuka | Tangkapan layar | | | |
| 3 | Coba rekam dengan tegangan MATI | Peringatan jelas "Medan listrik belum aktif..." — bukan error/diam | Tangkapan peringatan | | | |
| 4 | Analisis → tahap "Cari Pola" | Histogram/tangga kuantum memperlihatkan kelompok diskret | Tangkapan layar | | | |
| 5 | Selesaikan tahap discovery | Estimasi e mendekati 1,602 dengan Δ% < 3% (dengan koreksi Cunningham) | Tangkapan hasil | | | |
| 6 | Reload, buka Analisis lagi | Data 5 tetes **pulih** (tidak diminta ulang) | Tangkapan setelah reload | | | |

**Kriteria lulus:** semua langkah LULUS.
**Kebenaran fisika (referensi):** e NIST 2018 = 1,602176634×10⁻¹⁹ C; konstanta η, ρ, Cunningham sudah diverifikasi audit. Validasi manusia memastikan **pengalaman penemuan** (siswa tidak diberi tahu e di depan) dan keterbacaan grafik.

---

## Skenario H4 — Persistensi & Isolasi lintas modul (guru/teknis)

| # | Langkah | Hasil yang diharapkan | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Lakukan H2 langkah 2, lalu buka `/modules/millikan/analysis` | Analisis millikan **tidak** memuat data bandul (isolasi) | | | |
| 2 | Kembali ke bandul/analysis | Data bandul masih ada (pulih) | | | |
| 3 | DevTools → Application → localStorage | Kunci `fisikaseru:trials:bandul`, `fisikaseru:trials:millikan`, `parabola-params`, `parabola-trials` terpisah & format JSON valid | | | |

---

## Skenario H5 — Aksesibilitas & kualitas visual (guru)

| # | Pemeriksaan | Hasil yang diharapkan | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|---|
| 1 | Navigasi keyboard (Tab) di halaman eksperimen | Kontrol utama (Mulai, Rekam, Reset, slider) dapat difokuskan & diaktifkan via Enter/Space | | | |
| 2 | Nama aksesibel kontrol | Screen reader / accessibility tree menyebut nama tombol bermakna ("Mulai", "Rekam 0/10") | | | |
| 3 | Keterbacaan angka & grafik pada proyektor/layar kecil | Angka cukup besar; satuan tampil | | | |
| 4 | Performa dirasakan | Animasi 3D/2D lancar tanpa jank parah di laptop standar | | | |

---

## Keterbatasan otomatisasi (jujur)

- E2E (21 test Chromium) memverifikasi kontrak UI/persistensi/hidration — **bukan** kualitas pembelajaran, kejelasan visual, atau kenyamanan fisika bagi siswa.
- Validasi fisika numerik diverifikasi oracle `test:physics` — bukan oleh E2E atau uji manusia.
- Belum ada uji Firefox/WebKit/mobile ( Chromium saja).
- Uji manusia: **semua PENDING** hingga dijalankan oleh manusia nyata.
