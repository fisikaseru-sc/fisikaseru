/**
 * Registry config modul — peta slug → ModuleConfig.
 *
 * Menambah modul baru: buat `ModuleConfig` di folder feature-nya
 * (mis. `src/features/<slug>/config.ts`) lalu daftarkan di bawah.
 * Aplikasi (katalog, lab, analisis, refleksi) membaca konfigurasi
 * melalui `getModuleConfig` — bukan import langsung per feature.
 */

import { PARABOLA_CONFIG } from "@/features/parabola/config";

import type { ModuleConfig } from "./types";

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  parabola: PARABOLA_CONFIG,
};

/** Mengambil konfigurasi modul berdasarkan slug (undefined bila tidak ada). */
export function getModuleConfig(slug: string): ModuleConfig | undefined {
  return MODULE_CONFIGS[slug];
}

/** Semua konfigurasi modul terdaftar (untuk katalog/dashboard). */
export function listModuleConfigs(): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS);
}

export * from "./types";
