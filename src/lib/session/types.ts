import { ElementaryChargeEstimate, MilikanMethod, MilikanTrialRow, Polarity } from "@/labs/milikan/sim/types";

export interface MilikanPrelabAnswers {
  variables: string;
  variableRoles: string;
  changingVariables: string;
  hypothesis: string;
  collectedData: string;
  tableDesign: string;
  completed: boolean;
}

export interface MilikanCER {
  claim: string;
  evidence: string;
  reasoning: string;
}

export interface MilikanAnalysisSnapshot {
  e_est_C: number | null;
  rmsResidual_C: number | null;
  rows: Array<{ q_C: number; n: number; residual_C: number }>;
  estimatedAtISO: string | null;
}

export interface MilikanApparatusSettings {
  method: MilikanMethod;
  U_V: number;
  polarity: Polarity;
  d_mm: number;
  V_obj: number;
  g_m_s2: number;
  scaleDivision_mm_per_line: number;
  topMark_lines: number;
  bottomMark_lines: number;
  T_C: number;
  P_hPa: number;
  eta0_Pa_s: number;
  rho_air_kg_m3: number;
  rho_oil_kg_m3_at_15C: number;
  rho_oil_kg_m3_at_25C: number;
  cunningham_enabled: boolean;
  cunningham_b: number;
}

export interface LabAttemptSession {
  attemptId: string;
  labId: string;
  slug: string;
  createdAtISO: string;
  updatedAtISO: string;
  currentStep: number;
  apparatus: MilikanApparatusSettings;
  prelab: MilikanPrelabAnswers;
  trials: MilikanTrialRow[];
  analysis: MilikanAnalysisSnapshot;
  cer: MilikanCER;
  reportReady: boolean;
}

export interface AttemptIndexItem {
  attemptId: string;
  labId: string;
  slug: string;
  updatedAtISO: string;
}

export const EMPTY_PRELAB: MilikanPrelabAnswers = {
  variables: "",
  variableRoles: "",
  changingVariables: "",
  hypothesis: "",
  collectedData: "",
  tableDesign: "",
  completed: false,
};

export const EMPTY_CER: MilikanCER = {
  claim: "",
  evidence: "",
  reasoning: "",
};

export const EMPTY_ANALYSIS: MilikanAnalysisSnapshot = {
  e_est_C: null,
  rmsResidual_C: null,
  rows: [],
  estimatedAtISO: null,
};

export function fromElementaryEstimate(estimate: ElementaryChargeEstimate): MilikanAnalysisSnapshot {
  return {
    e_est_C: estimate.e_est_C,
    rmsResidual_C: estimate.rmsResidual_C,
    rows: estimate.rows,
    estimatedAtISO: new Date().toISOString(),
  };
}
