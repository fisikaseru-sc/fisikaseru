# FisikaSeru — Audit Alur Belajar & UX

**Tanggal:** 17 Okt 2026 · **Metode:** audit kode statis atas seluruh view per modul + laporan persona-simulasi audit sebelumnya. **Bukan uji manusia nyata.**

## Kerangka evaluasi: siklus belajar 10 tahap

Legenda: ✅ terverifikasi di kode · 🔶 parsial · ❌ tidak ada

| Tahap siklus | Parabola | Bandul | Millikan |
|---|---|---|---|
| 1. Fenomena/pertanyaan awal | ✅ PredictionView | ✅ pretest | ✅ PredictionView + PreDiscoveryModal |
| 2. Prediksi sebelum simulasi | ✅ `parabola-prediction` tersimpan & dikonfrontasikan di refleksi | 🔶 pretest ada, kunci tulis-tulis tidak pernah terjadi — ditangani jujur (refleksi tidak fabrikasi miskonsepsi) | ✅ + aturan anti-kebocoran e (test socratic: "Electron charge forbidden before discovery") |
| 3. Manipulasi variabel (rentang+satuan) | ✅ 4 slider berlabel satuan | ✅ 4 slider, 2D/3D | ✅ tegangan + pilih droplet |
| 4. Eksperimen virtual | ✅ luncur/jeda/reset, kecepatan | ✅ play/pause, stopwatch | ✅ chamber 3D, medan on/off |
| 5. Tabel data + grafik | ✅ tabel trial + grafik R vs θ | ✅ tabel T vs L | ✅ tabel q + number line |
| 6. Analisis hubungan antarvariabel | ✅ kurva teori overlay + fit | ✅ regresi T² vs L → g terukur | ✅ q terurut, pencarian kelipatan |
| 7. Perbandingan eksperimen vs teori | ✅ (overlay berlabel asumsi h₀=0) | ✅ (readout teori = rumus rekam) | ✅ e_stokes vs e_corr vs NIST |
| 8. Evaluasi ketidakpastian/asumsi | 🔶 noise ada; banner asumsi ideal **BARU** (audit ini); σ tidak ditampilkan eksplisit | 🔶 noise 1.5% ada, tidak dijelaskan ke siswa | ✅ uncRel per trial + stdDev/SEM |
| 9. Refleksi prediksi awal | ✅ konfrontasi otomatis | ✅ (jujur tanpa prediksi tersimpan) | ✅ ConfidenceRevisit + transfer challenge |
| 10. Kesimpulan + asesmen | ✅ vonis berbasis data aktual | ✅ | ✅ ScientificJourneySummary + evaluator |

## Integritas pembelajaran (didaudit ulang audit ini)

- ✅ **Prediksi tidak diganti diam-diam**: kunci localStorage write↔read ditelusuri (parabola-prediction ditulis PredictionView, dibaca ReflectionView; tidak ada penulisan jawaban benar ke kunci prediksi).
- ✅ **Data demo berlabel**: banner amber di Analisis & Refleksi bandul/millikan (perbaikan audit sebelumnya, masih ada di kode).
- ✅ **Umpan balik tak mengarang miskonsepsi**: vonis refleksi parabola memakai kondisi parameter aktual siswa; bandul jujur karena prediksi memang tidak tersimpan.
- ✅ **Model ideal vs fenomena nyata**: banner "Model ideal" parabola **BARU** (audit ini); RealLabGuideModal millikan memisahkan simulasi vs lab.
- ✅ **Grafik menyampaikan satuan/sumbu**: semua grafik Recharts berlabel satuan (m, s, m/s, ×10⁻¹⁹ C).
- ✅ **Tidak menghukum parameter sah**: guard hanya untuk input tidak fisik (g ≤ 0), bukan nilai sah dalam rentang.
- ✅ **Asesmen tertelusur ke tujuan**: setiap refleksi membaca trial + prediksi yang sama dengan yang ditulis tahap sebelumnya.

## Perbaikan UX audit ini

1. **Persistensi parameter parabola** (open issue O-4): slider v₀/θ/g/h₀ kini bertahan refresh, dengan validasi clamp+snap — siswa tidak kehilangan konteks eksperimen.
2. **Banner asumsi model ideal** (open issue O-6): siswa sekarang tahu simulasi mengabaikan hambatan udara dan rumus buku hanya berlaku h₀=0.
3. **Bug React nyata**: pelanggaran refs-during-render di ProjectileScene3D (`trailActiveRef.current = clock.running` saat render → pindah ke useEffect) — risiko perilaku render tidak konsisten.

## Temuan tersisa (diprioritaskan)

| Temuan | Risiko | Lokasi | Status |
|---|---|---|---|
| HUD "R teori" membocorkan jawaban sebelum eksperimen (O-5) | P2 — merusak siklus prediksi | `parabola/ExperimentView.tsx:~244` | OPEN — butuh keputusan desain (sembunyikan sampai N trial?) |
| State bandul/millikan juga hilang saat refresh (bandul: slider; millikan: pilihan droplet) | P2 | kedua ExperimentView | OPEN — pola persist parabola bisa direplikasi |
| Beban kognitif Cunningham tanpa progressive disclosure (O-10) | P3 | millikan analisis | OPEN |
| Uji browser nyata (responsivitas mobile, keyboard nav) belum dijalankan audit ini | P2 | — | OPEN — butuh Playwright/manual |
| Aksesibilitas: belum ada audit kontras/screen-reader sistematis | P2 | — | OPEN |

## Batas klaim

Semua verifikasi di atas berbasis pembacaan kode + test suite, **bukan** observasi pengguna. Validasi guru/siswa nyata (protokol 5 guru + 8 siswa dari laporan sebelumnya) tetap `PENDING_HUMAN_VALIDATION`.
