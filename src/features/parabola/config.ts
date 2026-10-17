/**
 * Konfigurasi modul Gerak Parabola — implementasi `ModuleConfig`
 * (kontrak typed dari `src/lib/modules/types.ts`).
 */

import type { ModuleConfig, ModuleVariable } from "@/lib/modules/types";

// ── Variabel simulasi (slider di lab) ────────────────────────

const V0: ModuleVariable = {
  key: "v0",
  label: "Kecepatan awal (v₀)",
  unit: "m/s",
  min: 5,
  max: 60,
  step: 1,
  defaultValue: 25,
};

const SUDUT: ModuleVariable = {
  key: "sudut",
  label: "Sudut elevasi (θ)",
  unit: "°",
  min: 10,
  max: 80,
  step: 1,
  defaultValue: 30,
};

const GRAVITASI: ModuleVariable = {
  key: "gravitasi",
  label: "Gravitasi (g)",
  unit: "m/s²",
  min: 1.6,
  max: 24.8,
  step: 0.01,
  defaultValue: 9.81,
};

const H0: ModuleVariable = {
  key: "h0",
  label: "Ketinggian awal (h₀)",
  unit: "m",
  min: 0,
  max: 20,
  step: 0.5,
  defaultValue: 0,
};

// ── Konstanta numerik & preset gravitasi ─────────────────────

/** Preset gravitasi untuk tombol cepat di panel variabel. */
export const GRAVITY_PRESETS: ReadonlyArray<{ label: string; g: number; emoji: string }> = [
  { label: "Bulan", g: 1.62, emoji: "🌙" },
  { label: "Mars", g: 3.71, emoji: "🔴" },
  { label: "Bumi", g: 9.81, emoji: "🌍" },
  { label: "Jupiter", g: 24.79, emoji: "🪐" },
];

export const PARABOLA_CONFIG: ModuleConfig = {
  meta: {
    slug: "parabola",
    title: "Gerak Parabola",
    description:
      "Luncurkan proyektil 3D dengan berbagai sudut dan kecepatan, rekam jarak tempuhnya, dan temukan sendiri sudut optimal 45°.",
    level: "sma",
    estimatedMinutes: 25,
    status: "active",
    accentColor: "#D97706",
  },
  reflectionQuestions: [
    {
      key: "q1",
      q: "Dari grafik jarak vs sudut pada datamu, di sudut berapa proyektil menempuh jarak terjauh? Bandingkan dengan prediksimu di awal.",
    },
    {
      key: "q2",
      q: "Perhatikan pasangan sudut seperti 30° dan 60° — keduanya menghasilkan jarak yang hampir sama. Menurut rumus R = v₀²·sin(2θ)/g, mengapa hal ini bisa terjadi?",
    },
    {
      key: "q3",
      q: "Mengapa justru di sudut 45° jaraknya maksimal, padahal di 90° proyektil terbang paling tinggi? Apa pertukaran (trade-off) antara komponen kecepatan horizontal dan vertikal?",
    },
  ],
  constants: {
    /** Koefisien restitusi pantulan lembut saat mendarat. */
    RESTITUSI: 0.42,
    /** Redaman kecepatan horizontal tiap pantulan. */
    REDAMAN_HORIZONTAL: 0.7,
    /** Ketidakpastian relatif pengukuran jarak saat "Catat Data" (1%). */
    SIGMA_PENGUKURAN: 0.01,
    /** Maksimum percobaan yang bisa direkam. */
    MAKS_TRIAL: 12,
    /** Jarak antar penanda jarak di tanah (m). */
    SPASI_PENANDA: 5,
    /** Preset gravitasi (m/s²). */
    G_BULAN: 1.62,
    G_MARS: 3.71,
    G_BUMI: 9.81,
    G_JUPITER: 24.79,
  },
  simulation: {
    independent: [V0, SUDUT, GRAVITASI, H0],
    dependent: ["jarak tempuh (R)", "ketinggian maksimum (H)", "waktu tempuh (t)"],
  },
};

export default PARABOLA_CONFIG;
