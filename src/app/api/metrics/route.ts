/**
 * GET /api/metrics — snapshot observabilitas (G-5).
 *
 * Mengembalikan agregat: jumlah error (server + klien), error-rate dalam
 * jendela 15 menit, dan latensi p50/p95.
 *
 * Akses: bila `METRICS_TOKEN` diset di environment, endpoint ini memerlukan
 * header `x-metrics-token` yang cocok. Bila token tidak diset, endpoint tetap
 * terbuka — data yang diekspos tetap agregat (rute tanpa query string, jenis
 * error, durasi) tanpa data siswa.
 */

import { NextResponse } from "next/server";
import { getMetricsSnapshot } from "@/lib/observability/metrics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.METRICS_TOKEN;
  if (expected) {
    const provided = request.headers.get("x-metrics-token");
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const snapshot = getMetricsSnapshot();
  return NextResponse.json(
    { ok: true, ...snapshot },
    { headers: { "Cache-Control": "no-store" } },
  );
}
