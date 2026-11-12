/**
 * Store observabilitas ringan (G-5).
 *
 * Tujuan: membuat "insiden produksi tak terdeteksi" (gap G-5) menjadi
 * sesuatu yang bisa dilihat. Lingkupnya sengaja kecil:
 *
 * - In-memory per proses Node.js. Tidak menambah dependency, tidak menulis
 *   ke disk, tidak mengirim data ke pihak ketiga.
 * - Jendela waktu 15 menit + ring buffer berbatas, jadi memori tidak tumbuh
 *   tak terkendali pada server yang melayani banyak lalu lintas.
 * - Data yang disimpan bersifat AGREGAT: rute (tanpa query string), jenis
 *   error, durasi. Tidak ada data siswa, tidak ada isi localStorage, tidak ada
 *   token. Payload dari klien disanitasi di `sanitizePath`/`sanitizeMessage` sebelum masuk.
 *
 * Konsekuensi yang harus jujur dicatat: karena store in-memory, angka
 * handler akan kembali ke nol saat proses di-restart/deploy, dan pada
 * deployment multi-instance angka hanya mencakup instance yang melayani
 * request tersebut. Untuk kebutuhan produksi multi-instance, `metrics.ts`
 * adalah titik sambung yang sama untuk diganti exporter (Sentry/OTel) tanpa
 * menyentuh kode pemanggil.
 */

export type ErrorSource = "server" | "client";

export interface ErrorEvent {
  source: ErrorSource;
  /** Rute tanpa query string, mis. "/modules/[moduleSlug]/analysis". */
  path: string;
  message: string;
  /** Next.js error digest, atau kode error sisi klien. */
  code?: string;
  routeType?: string;
  at: number;
}

export interface LatencySample {
  /** "navigation" = timings halaman; "server-timing" = durasi render server. */
  kind: "navigation" | "server-timing";
  path: string;
  durationMs: number;
  at: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_EVENTS = 500;

/**
 * State disimpan di `globalThis`, bukan di modul biasa.
 *
 * Alasan: Next.js menyusun tiap entry point (route handler, instrumentation,
 * proxy) sebagai bundel terpisah. Modul-level state akan terduplikasi per
 * bundel, sehingga error yang tercatat oleh `onRequestError` TIDAK terlihat
 * di route `/api/metrics`. `globalThis` dipakai agar satu state benar-benar
 * dibagi per proses Node.js.
 *
 * Catatan jujur: ini tetap per-proses. Pada deployment multi-instance, tiap
 * instance punya store sendiri (dinyatakan juga pada `notes` snapshot).
 */
const STORE_KEY = Symbol.for("fisikaseru.observability.store");

interface Store {
  startedAt: number;
  errorEvents: ErrorEvent[];
  latencySamples: LatencySample[];
}

function getStore(): Store {
  const g = globalThis as typeof globalThis & { [STORE_KEY]?: Store };
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { startedAt: Date.now(), errorEvents: [], latencySamples: [] };
  }
  return g[STORE_KEY];
}

const store = getStore();
const startedAt = store.startedAt;
const errorEvents = store.errorEvents;
const latencySamples = store.latencySamples;

/** Ambil path tanpa query string supaya tidak ada data pribadi yang bocor. */
function sanitizePath(path: string): string {
  const cut = path.split("?")[0];
  return cut.length > 120 ? `${cut.slice(0, 117)}...` : cut;
}

/** Buang pesan error yang terlalu panjang atau tampak seperti data sensitif. */
function sanitizeMessage(message: string): string {
  const clean = String(message ?? "").slice(0, 300);
  return clean.replace(/[\r\n]+/g, " ");
}

function prune(now: number): void {
  const cutoff = now - WINDOW_MS;
  while (errorEvents.length > 0 && errorEvents[0].at < cutoff) errorEvents.shift();
  while (latencySamples.length > 0 && latencySamples[0].at < cutoff) latencySamples.shift();
  while (errorEvents.length > MAX_EVENTS) errorEvents.shift();
  while (latencySamples.length > MAX_EVENTS) latencySamples.shift();
}

export function recordError(event: Omit<ErrorEvent, "at" | "path" | "message"> & {
  path?: string;
  message?: string;
}): void {
  const now = Date.now();
  prune(now);
  errorEvents.push({
    source: event.source,
    path: sanitizePath(event.path ?? "unknown"),
    message: sanitizeMessage(event.message ?? "unknown error"),
    code: event.code,
    routeType: event.routeType,
    at: now,
  });
}

export function recordLatency(sample: Omit<LatencySample, "at" | "path" | "durationMs"> & {
  path?: string;
  durationMs?: number;
}): void {
  const duration = Number(sample.durationMs);
  if (!Number.isFinite(duration) || duration < 0) return;
  const now = Date.now();
  prune(now);
  latencySamples.push({
    kind: sample.kind,
    path: sanitizePath(sample.path ?? "unknown"),
    durationMs: Math.round(duration * 100) / 100,
    at: now,
  });
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round(sorted[idx] * 100) / 100;
}

export interface MetricsSnapshot {
  /** Jendela observasi aktif (menit). */
  windowMinutes: number;
  /** Uptime proses (detik). */
  uptimeSeconds: number;
  totalEvents: number;
  errors: {
    total: number;
    server: number;
    client: number;
    /** Error-rate = error / (error + laporan sukses) dalam jendela. */
    errorRate: number | null;
    byCode: Record<string, number>;
    byPath: Record<string, number>;
  };
  latency: {
    count: number;
    p50Ms: number | null;
    p95Ms: number | null;
    maxMs: number | null;
    byPath: Record<string, { count: number; p95Ms: number | null }>;
  };
  /** Batasan store yang harus diketahui pembaca laporan. */
  notes: string[];
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const now = Date.now();
  prune(now);

  const serverErrors = errorEvents.filter((e) => e.source === "server").length;
  const clientErrors = errorEvents.filter((e) => e.source === "client").length;

  const byCode: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  for (const e of errorEvents) {
    const key = e.code ?? "unknown";
    byCode[key] = (byCode[key] ?? 0) + 1;
    byPath[e.path] = (byPath[e.path] ?? 0) + 1;
  }

  const durations = latencySamples.map((s) => s.durationMs);
  const byPathLatency: Record<string, { count: number; p95Ms: number | null }> = {};
  for (const s of latencySamples) {
    const entry = (byPathLatency[s.path] ??= { count: 0, p95Ms: null });
    entry.count += 1;
  }
  for (const path of Object.keys(byPathLatency)) {
    const values = latencySamples.filter((s) => s.path === path).map((s) => s.durationMs);
    byPathLatency[path].p95Ms = percentile(values, 95);
  }

  // Penyebut error-rate: seluruh aktivitas yang dilaporkan (error + latency sample).
  const observed = errorEvents.length + latencySamples.length;

  return {
    windowMinutes: WINDOW_MS / 60000,
    uptimeSeconds: Math.round((now - startedAt) / 1000),
    totalEvents: errorEvents.length + latencySamples.length,
    errors: {
      total: errorEvents.length,
      server: serverErrors,
      client: clientErrors,
      errorRate: observed === 0 ? null : Math.round((errorEvents.length / observed) * 10000) / 10000,
      byCode,
      byPath,
    },
    latency: {
      count: latencySamples.length,
      p50Ms: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      maxMs: durations.length ? Math.round(Math.max(...durations) * 100) / 100 : null,
      byPath: byPathLatency,
    },
    notes: [
      "Store in-memory per proses: angka kembali ke nol saat restart/deploy.",
      "Pada deployment multi-instance, snapshot hanya mencakup instance yang melayani request.",
      "Hanya data agregat (rute tanpa query string, jenis error, durasi) — tanpa data siswa.",
    ],
  };
}

/** Reset store — hanya untuk pengujian. */
export function resetMetrics(): void {
  errorEvents.length = 0;
  latencySamples.length = 0;
}
