/**
 * Proxy (Next.js 16 — `middleware` sudah deprecated, lihat docs/proxy.md).
 *
 * Satu-satunya tugasnya: mengukur durasi yang dihabiskan proxy itu sendiri
 * dan menuliskannya ke header `Server-Timing`.
 *
 * CATATAN JUJUR: proxy berjalan SEBELUM render, jadi durasi di sini BUKAN
 * durasi render halaman. Header sengaja dinamai `proxy;dur=…` (bukan `app`)
 * supaya tidak menyesatkan pembaca log/CDN. Durasi halaman yang dirasakan
 * pengguna diukur di sisi klien (Resource Timing → TTFB) dan dikirim ke
 * `/api/telemetry`, lalu diagregasi di `/api/metrics`.
 *
 * Proxy memang tidak boleh mengandalkan modul/globals bersama (dokumentasi
 * Next.js), jadi tidak ada state yang ditulis di sini.
 */

import { NextResponse } from "next/server";

export function proxy() {
  const startedAt = performance.now();
  const response = NextResponse.next();
  const duration = performance.now() - startedAt;
  response.headers.set("Server-Timing", `proxy;dur=${duration.toFixed(1)}`);
  return response;
}

export const config = {
  // Semua request kecuali file statis — yang relevan untuk observabilitas.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
