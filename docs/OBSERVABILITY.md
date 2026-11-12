# Observabilitas Produksi (G-5)

> Status: **DIIMPLEMENTASI** 12 Nov 2026. Verifikasi dilakukan oleh **agen AI, bukan manusia** (uji otomatis 14/14 + uji manual end-to-end pada `next dev` port 3312) — **belum diverifikasi pada hosting produksi**. Tidak ada uji manusia yang dijalankan untuk G-5.

Gap G-5 ("monitoring/observabilitas belum ada — insiden produksi tak terdeteksi") ditutup dengan instrumentation ringan yang **tidak menambah dependency** dan **tidak mengirim data ke pihak ketiga**.

## Peta komponen

| File | Peran |
|---|---|
| `src/lib/observability/metrics.ts` | Store in-memory: error (server + klien), sampel latensi, error-rate, p50/p95 |
| `src/instrumentation.ts` | Hook `onRequestError` — mencatat error server + menulis log JSON terstruktur |
| `src/proxy.ts` | Mengukur durasi proxy sendiri → header `Server-Timing: proxy;dur=…` (Next 16: `middleware` deprecated, kini `proxy`). Bukan durasi render — lihat catatan kejujuran di bawah |
| `src/app/api/telemetry/route.ts` | Menerima laporan error/latensi dari klien (POST) |
| `src/app/api/metrics/route.ts` | Snapshot metrik (GET) |
| `src/app/api/health/route.ts` | Health check proses (GET) |
| `src/components/TelemetryReporter.tsx` | Menangkap `window.error` / `unhandledrejection` + sampel latensi navigasi |

## Endpoint

### `GET /api/health`

```json
{ "status": "ok", "uptimeSeconds": 4213, "version": "0.1.0", "at": "2026-11-12T04:53:44.631Z" }
```

Cocok untuk load balancer/probe uptime. Tidak mengekspos konfigurasi internal.

### `GET /api/metrics`

Snapshot jendela 15 menit terakhir:

```json
{
  "ok": true,
  "windowMinutes": 15,
  "uptimeSeconds": 4213,
  "totalEvents": 2,
  "errors": { "total": 1, "server": 1, "client": 0, "errorRate": 0.5, "byCode": {}, "byPath": {} },
  "latency": { "count": 2, "p50Ms": 123.4, "p95Ms": 123.4, "maxMs": 123.4, "byPath": {} },
  "notes": ["Store in-memory per proses: ..."]
}
```

- **error-rate** = jumlah error ÷ (error + laporan aktivitas) dalam jendela.
- Akses: bila env `METRICS_TOKEN` diisi, endpoint memerlukan header `x-metrics-token` yang cocok. Bila kosong, endpoint terbuka — datanya tetap agregat.

### `POST /api/telemetry`

Dipanggil otomatis oleh `TelemetryReporter`. Dua jenis payload:

```json
{ "kind": "client_error", "message": "...", "path": "/modules/bandul/analysis" }
{ "kind": "latency", "path": "/modules/bandul/analysis", "durationMs": 123.4 }
```

Payload > 4 KB → `413`; JSON tidak valid → `400`; `kind` tak dikenal → `400`.

## Batasan yang harus diketahui (bukan disembunyikan)

1. **In-memory per proses.** Angka kembali ke nol saat restart/deploy. Pada deployment multi-instance, snapshot hanya mencakup instance yang melayani request. Untuk alerting lintas instance, `metrics.ts` adalah titik sambung yang sama — ganti isi store dengan exporter (Sentry/OTel) tanpa mengubah kode pemanggil.
2. **Data agregat saja.** Yang direkam: rute tanpa query string, jenis error, durasi. Tidak ada isi localStorage, cookie, nama siswa, atau jawaban refleksi. Pesan error dipotong 300 karakter; path dipotong 120 karakter.
3. **Pesan error sisi klien bisa memuat fragmen isi layar.** Pesan dipotong 300 karakter, tetapi bila kode aplikasi melempar error yang memuat isi layar (misalnya jawaban refleksi), fragmen itu bisa tersimpan di store. Diverifikasi 12 Nov 2026: seluruh `throw new Error(...)` di `src/` hanya memakai pesan statis ("No reply", "No response", pesan test) — tidak ada yang menyisipkan isi layar. Untuk jaminan penuh ke depan, ganti store dengan exporter yang punya kebijakan redaksi.
4. **`globalThis` dipakai untuk state.** Next.js menyusun route handler, instrumentation, dan proxy sebagai bundel terpisah; state modul biasa akan terduplikasi per bundel sehingga error server tak terlihat di `/api/metrics`. State di `globalThis` dibagi per proses.
5. **Latensi punya dua sumber dengan makna berbeda.** `Server-Timing: proxy;dur=…` mengukur waktu yang dihabiskan proxy (bukan render halaman — proxy berjalan sebelum render, jadi dinamai `proxy` dengan sengaja agar tidak disalahartikan). Durasi halaman yang dirasakan pengguna diambil dari Resource Timing sisi klien (waktu sampai respons pertama) lalu diagregasi di `/api/metrics` sebagai p50/p95. Latensi render server-side tidak diukur karena Next.js tidak menyediakan hook selesai-render di `instrumentation.ts`.

## Verifikasi yang dijalankan

| Bukti | Hasil |
|---|---|
| `npm run test:observability` | 14/14 lulus (sanitasi path, pemotongan pesan, error-rate, persentil, ring buffer, path panjang) |
| Uji manual end-to-end (`next dev`, port 3312) | error klien tercatat ✓ · error server via `onRequestError` tercatat ✓ · sampel latensi masuk ✓ · header `Server-Timing` hadir ✓ · payload tak valid ditolak ✓ |
| `GET /api/health` | 200 + JSON uptime ✓ |
| `GET /api/metrics` | 200 + snapshot konsisten dengan laporan yang dikirim ✓ |

## Cara menghubungkan dengan alerting

Contoh paling sederhana (tanpa dependency baru): cron/monitor eksternal yang mengetik `/api/health` dan `/api/metrics`, lalu mengirim alert bila `status !== "ok"` atau `errors.errorRate` melewati ambang. Untuk alerting yang kaya (grouping error, jejak stack, retensi), ganti store di `src/lib/observability/metrics.ts` dengan SDK Sentry/OTel — antarmuka `recordError` / `recordLatency` / `getMetricsSnapshot` sengaja dibuat kecil supaya titik gantinya jelas.
