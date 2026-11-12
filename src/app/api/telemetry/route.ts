/**
 * POST /api/telemetry — menerima laporan error sisi klien & sampel latensi.
 *
 * Dipanggil dari `src/components/TelemetryReporter.tsx` memakai
 * `navigator.sendBeacon` (tahan unload) atau `fetch(..., keepalive)`.
 *
 * Batas keamanan & ukuran:
 * - Body harus JSON dengan `kind` yang dikenal; field lain diabaikan.
 * - Pesan error dipotong 300 karakter dan query string dibuang (lihat metrics.ts).
 * - Tanpa autentikasi, tapi data yang disimpan agregat & tanpa PII.
 */

import { NextResponse } from "next/server";
import { recordError, recordLatency } from "@/lib/observability/metrics";

const MAX_BODY_BYTES = 4096;

type ClientReport =
  | { kind: "client_error"; message?: string; path?: string; code?: string }
  | { kind: "latency"; path?: string; durationMs?: number; metric?: string };

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload terlalu besar" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON tidak valid" }, { status: 400 });
  }

  const report = parsed as ClientReport;
  if (!report || typeof report !== "object" || typeof report.kind !== "string") {
    return NextResponse.json({ ok: false, error: "field kind wajib diisi" }, { status: 400 });
  }

  if (report.kind === "client_error") {
    recordError({
      source: "client",
      path: report.path,
      message: report.message,
      code: report.code,
    });
    return NextResponse.json({ ok: true });
  }

  if (report.kind === "latency") {
    recordLatency({
      kind: "navigation",
      path: report.path,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "kind tidak dikenal" }, { status: 400 });
}
