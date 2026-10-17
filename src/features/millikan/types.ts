// ============================================================
// FISIKASERU — MILLIKAN TYPE DEFINITIONS
// ============================================================

export type PredictionHypothesis = 
  | "ALL_SAME"          // Semua tetes memiliki muatan yang sama persis
  | "COMPLETELY_RANDOM"  // Muatan acak tanpa aturan apa pun
  | "QUANTIZED_PATTERN"  // Nilai muatan mengikuti pola kelipatan tertentu
  | "UNSURE";            // Belum yakin

export interface StudentPrediction {
  hypothesis: PredictionHypothesis;
  reasoning: string;
  confidence: number; // 1 to 5 (1 = Sangat ragu, 5 = Sangat yakin)
  submittedAt?: string;
}

export interface PhysicalForces {
  Fg: number; // Gaya gravitasi efektif (N) (W_eff = m_eff * g)
  Fe: number; // Gaya elektrostatik pelat (N)
  Fd: number; // Gaya hambat Stokes udara (N)
  vf: number; // Kecepatan terminal jatuh bebas (m/s)
  vr: number; // Kecepatan terminal naik medan listrik (m/s)
}

export interface DropletSpec {
  id: number;
  label: string;
  radiusUm: number; // Radius tetes dalam mikrometer (µm)
  trueN: number;    // Jumlah kelebihan elektron nyata (integer, tersembunyi dari murid)
}

export interface MillikanTrial {
  id: number;
  dropletLabel: string;
  r: number;        // radius in µm
  V: number;        // voltage in Volts
  tf: number;       // fall time across 1.0 mm (s)
  tr: number;       // rise time across 1.0 mm (s)
  vf: number;       // fall velocity (m/s)
  vr: number;       // rise velocity (m/s)
  q: number;        // raw calculated charge (×10⁻¹⁹ C) via Stokes
  cf: number;       // Cunningham correction factor
  qCorr: number;    // Cunningham corrected charge (×10⁻¹⁹ C)
  uncRel: number;   // Relative uncertainty estimation (fraction, e.g. 0.05 = 5%)
  hiddenN: number;  // True quantum number for internal verification
  method?: "dynamic" | "balanced"; // Metode pengukuran: naik dinamis atau melayang seimbang
  createdAt: number;
}

export type ExperimentPhase =
  | "prepare"
  | "observe"
  | "adjust"
  | "stabilize"
  | "readyToRecord"
  | "recording"
  | "nextDroplet"
  | "evidenceComplete"
  | "readyForAnalysis";

export interface ExperimentMission {
  phase: ExperimentPhase;
  mission: string;
  hint?: string;
  primaryAction?: string;
  secondaryActions?: string[];
}
