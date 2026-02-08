import { MilikanApparatusSettings } from "@/lib/session/types";

export const DEFAULT_MILIKAN_APPARATUS: MilikanApparatusSettings = {
  method: "rising_falling",
  U_V: 250,
  polarity: "above",
  d_mm: 3,
  V_obj: 2,
  g_m_s2: 9.81,
  scaleDivision_mm_per_line: 0.1,
  topMark_lines: 0,
  bottomMark_lines: 20,
  T_C: 25,
  P_hPa: 1013.23,
  eta0_Pa_s: 1.85e-5,
  rho_air_kg_m3: 1.293,
  rho_oil_kg_m3_at_15C: 877,
  rho_oil_kg_m3_at_25C: 871,
  cunningham_enabled: true,
  cunningham_b: 6.17e-4,
};
