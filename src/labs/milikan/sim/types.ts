export type MilikanMethod = "floating" | "rising_falling";
export type Polarity = "above" | "below";

export interface MilikanTrialRow {
  trialId: string;
  timestampISO: string;

  method: MilikanMethod;
  dropletId: string;

  U_V: number;
  polarity: Polarity;

  topMark_lines: number;
  bottomMark_lines: number;
  S_lines: number;

  scaleDivision_mm_per_line: number;
  V_obj: number;

  x_m: number;

  t1_s: number | null;
  t2_s: number;

  T_C: number;
  P_Pa: number;

  eta0_Pa_s: number;
  eta_used_Pa_s: number;

  rho_oil_kg_m3: number;
  rho_air_kg_m3: number;

  v1_m_s: number | null;
  v2_m_s: number;

  r0_m: number;
  q0_C: number;

  cunningham_enabled: boolean;
  cunningham_b: number;

  eta_c_Pa_s: number | null;
  q_c_C: number | null;

  notes: string | null;
}

export interface MilikanDroplet {
  id: string;
  radius_m: number;
  charge_C: number;
}

export interface MilikanComputationInput {
  method: MilikanMethod;
  U_V: number;
  polarity: Polarity;
  d_mm: number;
  V_obj: number;
  g_m_s2: number;
  topMark_lines: number;
  bottomMark_lines: number;
  scaleDivision_mm_per_line: number;
  t1_s: number | null;
  t2_s: number;
  T_C: number;
  P_hPa: number;
  eta0_Pa_s: number;
  rho_air_kg_m3: number;
  rho_oil_kg_m3_at_15C: number;
  rho_oil_kg_m3_at_25C: number;
  cunningham_enabled: boolean;
  cunningham_b: number;
}

export interface MilikanComputationResult {
  P_Pa: number;
  rho_oil_kg_m3: number;
  S_lines: number;
  x_m: number;
  v1_m_s: number | null;
  v2_m_s: number;
  r0_m: number;
  q0_C: number | null;
  eta_used_Pa_s: number;
  eta_c_Pa_s: number | null;
  q_c_C: number | null;
  q_display_C: number | null;
}

export interface QFitRow {
  q_C: number;
  n: number;
  residual_C: number;
}

export interface ElementaryChargeEstimate {
  e_est_C: number;
  rows: QFitRow[];
  rmsResidual_C: number;
}
