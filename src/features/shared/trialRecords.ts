/**
 * Kontrak data trial yang dipersist ke localStorage.
 *
 * Bentuk di bawah adalah bentuk yang BENAR-BENAR ditulis ExperimentView
 * ke key `fisikaseru:trials:{slug}` — jangan menyamakan dengan
 * MillikanTrial di features/millikan/types.ts, yang belum dipakai oleh
 * persist aktual dan memiliki field lebih banyak.
 */

export interface MillikanTrialRecord {
  id: number;
  dropletLabel?: string; // tidak dikonsumsi AnalysisView; opsional untuk data historis/demo
  r: number;             // radius (µm)
  V: number;             // tegangan (Volt)
  tf: number;            // waktu jatuh 1 mm (s)
  tr: number;            // waktu naik 1 mm (s); 9999 = melayang seimbang
  method?: "dynamic" | "balanced"; // ada pada data tersimpan; demo fallback tanpa ini
  q: number;             // muatan Stokes (×10⁻¹⁹ C)
  n: number;             // verifikasi internal (tidak ditampilkan sebelum discovery)
  hiddenN?: number;      // hanya pada demo data lokal AnalysisView; tidak dipersist
}

export interface BandulTrialRecord {
  id: number;
  L: number;             // panjang tali (m)
  T: number;             // periode teramati (s)
  T2: number;            // T² (s²)
  g?: number;            // gravitasi lab saat rekam (preset non-Bumi)
}

export type TrialRecord = MillikanTrialRecord | BandulTrialRecord;

// ─── Type guards: data localStorage tidak tepercaya ──────────────────────────

export function isMillikanTrial(t: unknown): t is MillikanTrialRecord {
  return typeof t === "object" && t !== null &&
    typeof (t as MillikanTrialRecord).r === "number" &&
    typeof (t as MillikanTrialRecord).q === "number";
}

export function isBandulTrial(t: unknown): t is BandulTrialRecord {
  return typeof t === "object" && t !== null &&
    typeof (t as BandulTrialRecord).L === "number" &&
    typeof (t as BandulTrialRecord).T === "number";
}
