/**
 * GET /api/health — pemeriksaan kesehatan proses (G-5).
 *
 * Sengaja minimal: status, uptime, dan versi aplikasi. Tidak ada konfigurasi
 * internal, tidak ada secret — endpoint ini aman dipanggil load balancer.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      version: process.env.npm_package_version ?? "0.1.0",
      at: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
