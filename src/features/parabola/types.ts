/**
 * Tipe bersama modul Gerak Parabola (payload localStorage + trial).
 */

/** Satu baris data hasil "Catat Data" di lab. */
export interface ParabolaTrial {
  id: number;
  /** Kecepatan awal (m/s). */
  v0: number;
  /** Sudut elevasi (°). */
  angle: number;
  /** Gravitasi saat percobaan (m/s²). */
  g: number;
  /** Ketinggian awal saat percobaan (m). */
  h0: number;
  /** Jarak tempuh terukur (m, dengan derau pengukuran). */
  range: number;
  /** Stempel waktu rekam (ISO). */
  recordedAt: string;
}

/** Prediksi siswa sebelum eksperimen (langkah PREDICT). */
export interface ParabolaPrediction {
  /** Tebakan sudut optimal (°). */
  angle: number;
  /** Alasan singkat siswa. */
  reasoning: string;
  /** Keyakinan 1–5. */
  confidence: number;
  submittedAt: string;
}

/** Penanda modul tuntas (langkah REFLECT). */
export interface ParabolaCompletion {
  completedAt: string;
  /** Jawaban pertanyaan sokratis (key pertanyaan → jawaban). */
  answers: Record<string, string>;
}

/** Kunci localStorage modul parabola (sesuai kontrak workstream). */
export const STORAGE_KEYS = {
  prediction: "parabola-prediction",
  trials: "parabola-trials",
  completed: "parabola-completed",
} as const;

/** Membaca array trial dari localStorage (robust terhadap JSON rusak). */
export function loadTrials(): ParabolaTrial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.trials);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ParabolaTrial[]) : [];
  } catch {
    return [];
  }
}

/** Menyimpan array trial ke localStorage. */
export function saveTrials(trials: ParabolaTrial[]): void {
  window.localStorage.setItem(STORAGE_KEYS.trials, JSON.stringify(trials));
}

/** Trial dengan jarak terjauh (null bila belum ada data). */
export function bestTrial(trials: ParabolaTrial[]): ParabolaTrial | null {
  if (trials.length === 0) return null;
  return trials.reduce((best, t) => (t.range > best.range ? t : best), trials[0]);
}
