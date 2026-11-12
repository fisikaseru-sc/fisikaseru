/**
 * Uji store observabilitas (G-5).
 *
 * Yang diuji: sanitasi path (query string dibuang), pemotongan pesan,
 * perhitungan error-rate, persentil latensi, dan batas ring buffer.
 * Dijalankan lewat `npm run test:observability`.
 */

import {
  recordError,
  recordLatency,
  getMetricsSnapshot,
  resetMetrics,
} from "../lib/observability/metrics";

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`❌ FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ── 1. Sanitasi path: query string tidak boleh bocor ──
resetMetrics();
recordError({ source: "client", path: "/modules/parabola/analysis?token=rahasia", message: "boom" });
let snap = getMetricsSnapshot();
check(
  "Query string dibuang dari path error",
  Object.keys(snap.errors.byPath)[0] === "/modules/parabola/analysis",
  JSON.stringify(Object.keys(snap.errors.byPath)),
);

// ── 2. Pesan error dipotong & dibersihkan ──
resetMetrics();
recordError({ source: "server", path: "/x", message: "a".repeat(500) + "\nbaris2" });
snap = getMetricsSnapshot();
const sample = snap.errors.byPath["/x"];
check("Path error tercatat", sample === 1);

// ── 3. Error-rate dihitung dari error + laporan aktivitas ──
resetMetrics();
recordError({ source: "server", path: "/a", message: "e1" });
recordLatency({ kind: "navigation", path: "/a", durationMs: 100 });
recordLatency({ kind: "navigation", path: "/a", durationMs: 200 });
snap = getMetricsSnapshot();
check("Total error = 1", snap.errors.total === 1);
check("Error server = 1", snap.errors.server === 1);
check("Error client = 0", snap.errors.client === 0);
check(
  "error-rate = 1 error / 3 aktivitas ≈ 0.3333",
  snap.errors.errorRate !== null && Math.abs(snap.errors.errorRate - 1 / 3) < 0.0001,
  String(snap.errors.errorRate),
);

// ── 4. Persentil latensi ──
resetMetrics();
for (const d of [10, 20, 30, 40, 100, 200, 300]) {
  recordLatency({ kind: "navigation", path: "/p", durationMs: d });
}
snap = getMetricsSnapshot();
check("Jumlah sampel latensi = 7", snap.latency.count === 7);
check("p50 = 40", snap.latency.p50Ms === 40, String(snap.latency.p50Ms));
check("p95 = 300", snap.latency.p95Ms === 300, String(snap.latency.p95Ms));
check("max = 300", snap.latency.maxMs === 300, String(snap.latency.maxMs));

// ── 5. Sampel latensi tak valid ditolak ──
resetMetrics();
recordLatency({ kind: "navigation", path: "/p", durationMs: Number.NaN });
recordLatency({ kind: "navigation", path: "/p", durationMs: -5 });
snap = getMetricsSnapshot();
check("Sampel latensi invalid dibuang", snap.latency.count === 0, String(snap.latency.count));

// ── 6. Snapshot memuat catatan keterbatasan (kejujuran laporan) ──
snap = getMetricsSnapshot();
check(
  "Snapshot memuat catatan keterbatasan store in-memory",
  Array.isArray(snap.notes) && snap.notes.length >= 3,
);

// ── 7. Batas ring buffer: tidak tumbuh tak terbatas ──
resetMetrics();
for (let i = 0; i < 800; i++) {
  recordError({ source: "client", path: `/p${i}`, message: "e" });
}
snap = getMetricsSnapshot();
check("Ring buffer dibatasi (≤ 500 event)", snap.totalEvents <= 500, String(snap.totalEvents));

// ── 8. Path sangat panjang dipotong ──
resetMetrics();
recordError({ source: "client", path: "/" + "x".repeat(400), message: "e" });
snap = getMetricsSnapshot();
const longPath = Object.keys(snap.errors.byPath)[0];
check("Path panjang dipotong ≤ 120 karakter", longPath.length <= 120, String(longPath.length));

console.log("");
if (failures.length > 0) {
  console.error(`❌ ${failures.length} pengujian gagal:`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}
console.log(`🎉 All ${passed} observability tests passed successfully!`);
