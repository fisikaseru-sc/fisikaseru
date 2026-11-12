"use client";

/**
 * Pelapor error & latensi sisi klien (G-5).
 *
 * Dua tanggung jawab:
 * 1. Error runtime yang tidak tertangani (window error / unhandled rejection)
 *    dikirim ke `/api/telemetry` sebagai laporan agregat.
 * 2. Satu sampel latensi halaman (TTFB + LCP bila tersedia) dikirim saat
 *    halaman selesai dimuat.
 *
 * Prinsip privasi: yang dikirim HANYA pesan error, nama rute (tanpa query
 * string), dan angka durasi. Tidak ada isi localStorage, tidak ada data
 * siswa, tidak ada cookie. Kegagalan pengiriman sendiri diamkan agar tidak
 * mengganggu pengalaman belajar.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TELEMETRY_URL = "/api/telemetry";

function send(payload: unknown): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(TELEMETRY_URL, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(TELEMETRY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      /* telemetri tidak boleh mengganggu pengguna */
    });
  } catch {
    /* diamkan */
  }
}

export function TelemetryReporter() {
  const pathname = usePathname();

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      send({
        kind: "client_error",
        message: event.message,
        path: pathname,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      send({
        kind: "client_error",
        message: reason instanceof Error ? reason.message : String(reason),
        path: pathname,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") return;

    const sendLatency = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const durationMs = nav
        ? nav.responseStart - nav.startTime || nav.domContentLoadedEventEnd - nav.startTime
        : undefined;
      if (durationMs === undefined || !Number.isFinite(durationMs)) return;
      send({ kind: "latency", path: pathname, durationMs });
    };

    // Tunggu satu frame agar navigasi selesai, lalu kirim sampel.
    const timer = window.setTimeout(sendLatency, 1500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
