export const MILIKAN_READOUTS = [
  { id: "U_V", label: "U", unit: "V" },
  { id: "E_V_m", label: "E=U/d", unit: "V/m" },
  { id: "t1_s", label: "t1", unit: "s" },
  { id: "t2_s", label: "t2", unit: "s" },
  { id: "q_C", label: "q", unit: "C" },
] as const;

export const MILIKAN_TABLE_COLUMNS = [
  "trialId",
  "method",
  "U_V",
  "t2_s",
  "v2_m_s",
  "r0_m",
  "q0_C",
] as const;
