/**
 * Hook observabilitas sisi server (G-5).
 *
 * `onRequestError` dipanggil Next.js setiap kali server menangkap error saat
 * render, route handler, server action, atau proxy. Kita mencatat error itu
 * ke store in-memory (src/lib/observability/metrics.ts) dan menulis satu baris
 * JSON terstruktur ke log — dua-duanya tanpa dependensi eksternal.
 *
 * `register()` tidak melakukan apa-apa: Next.js memanggilnya sekali saat
 * server start, dan kita tidak butuh state global tambahan di sana.
 */

import type { Instrumentation } from "next";

export function register(): void {
  // Sengaja kosong — lihat catatan di header file.
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { recordError } = await import("@/lib/observability/metrics");

  // Tipe `error` dari Next adalah `unknown` — dinormalkan di sini agar isi
  // log tetap konsisten walau error-nya Error biasa atau objek lain.
  const err = error as { message?: string; digest?: string; stack?: string } | null | undefined;
  const message = err?.message ?? "unknown server error";
  const path = request.path ?? "unknown";

  recordError({
    source: "server",
    path,
    message,
    code: err?.digest,
    routeType: context?.routeType,
  });

  // Log terstruktur: satu baris JSON per error agar mudah diparse aggregator.
  console.error(
    JSON.stringify({
      level: "error",
      kind: "server_error",
      path,
      method: request?.method,
      routeType: context?.routeType,
      routePath: context?.routePath,
      digest: err?.digest,
      message,
      at: new Date().toISOString(),
    }),
  );
};
