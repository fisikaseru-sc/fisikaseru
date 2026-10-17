// ============================================================
// FISIKASERU — SPRINT G1: LEARNING OUTCOMES DOMAIN TYPES
// Pure TypeScript Domain Model (Zero UI / Zero React / Zero DB / Zero Scores)
// ============================================================

import { PredictionHypothesis } from "../../types";

/**
 * 5 Dimensi Pembelajaran Saintifik Multidimensional.
 * Belajar tidak dikerdilkan menjadi 1 skor tunggal.
 */
export type LearningDimension =
  | "EVIDENCE_READING"
  | "PATTERN_REASONING"
  | "CONCEPTUAL_EXPLANATION"
  | "MODEL_TRANSFER"
  | "METACOGNITIVE_AWARENESS";

/**
 * 5 Tingkat Kualitatif Perkembangan Konseptual.
 * Bahasa pedagogis internal non-penghakiman (BUKAN nilai, ranking, atau persentase).
 */
export type QualitativeLevel =
  | "NOT_YET_VISIBLE"
  | "EMERGING"
  | "DEVELOPING"
  | "SUPPORTED_BY_EVIDENCE"
  | "TRANSFERABLE";

export interface DimensionEvidence {
  source: string;
  description: string;
}

export interface DimensionInsight {
  dimension: LearningDimension;
  level: QualitativeLevel;
  evidence: DimensionEvidence[];
  narrative: string;
  nextInquiry?: string;
}

/**
 * Klasifikasi perubahan konseptual dari dugaan awal vs bukti eksperimen.
 */
export type PredictionOutcome =
  | "SUPPORTED"
  | "REFINED"
  | "CHALLENGED"
  | "DEVELOPED_THROUGH_INVESTIGATION";

export interface ConceptualChangeInsight {
  outcome: PredictionOutcome;
  beforeNarrative: string;
  afterNarrative: string;
  evidenceOfChange: string[];
  respectfulSummary: string;
}

export interface LearningOutcomeProfile {
  dimensions: Record<LearningDimension, DimensionInsight>;
  conceptualChange: ConceptualChangeInsight;
  generatedAt: string;
}

/**
 * Hierarki Kualitas Bukti / Artikulasi Siswa (Sprint G4).
 */
export type EvidenceQuality =
  | "ASSERTION"
  | "OBSERVATION"
  | "DATA_REFERENCE"
  | "REASONED_CONNECTION";

export type EvidenceSignal =
  | "HAS_CLAIM"
  | "MENTIONS_OBSERVATION"
  | "REFERENCES_DATA"
  | "CONNECTS_EVIDENCE_TO_CLAIM"
  | "ACKNOWLEDGES_UNCERTAINTY";

export interface EvidenceEvaluation {
  strongestLevel: EvidenceQuality;
  signals: EvidenceSignal[];
  explanation: string;
}

/**
 * Sinyal Penalaran Uji Transfer (Sprint G5/G6).
 */
export type TransferSignal =
  | "RELATION_NOTICE"
  | "DATA_REFERENCE"
  | "PROPOSES_VERIFICATION"
  | "ACKNOWLEDGES_UNCERTAINTY"
  | "PREMATURE_CONCLUSION";

export interface TransferEvaluation {
  signals: TransferSignal[];
  narrative: string;
  suggestedInquiry?: string;
}

/**
 * Momen Reflektif Perjalanan Saintifik (Linimasa Naratif, bukan checklist tugas).
 */
export type LearningMoment =
  | "INITIAL_BELIEF"
  | "EVIDENCE_COLLECTION"
  | "PATTERN_INVESTIGATION"
  | "DISCOVERY"
  | "CONCEPTUAL_ARTICULATION"
  | "TRANSFER_ATTEMPT"
  | "METACOGNITIVE_REFLECTION";

export interface LearningMomentEntry {
  type: LearningMoment;
  narrative: string;
  evidence: string[];
}

export interface LearningJourney {
  moments: LearningMomentEntry[];
  profile: LearningOutcomeProfile;
}

// ============================================================
// Input Data Adapters (Toleran terhadap state parsial/kosong)
// ============================================================

export interface PredictionInputAdapter {
  hypothesis?: PredictionHypothesis | string | null;
  reasoning?: string;
  confidence?: number;
  submittedAt?: string;
}

export interface TrialInputAdapter {
  id?: number | string;
  dropletLabel?: string;
  q?: number;
  qCorr?: number;
  r?: number;
}

export interface PatternCandidateInputAdapter {
  candidate: number;
  meanDeviation?: number;
  nearIntegerPct?: number;
  testedAt?: number;
}

export interface DiscoveryInputAdapter {
  isDiscovered?: boolean;
  discoveredCandidateUnit?: number;
  calculatedE_corr?: number | null;
}

export interface ReflectionInputAdapter {
  studentConclusion?: {
    claim?: string;
    evidence?: string;
    reasoning?: string;
    pattern?: string;
    physicalMeaning?: string;
    strongestEvidence?: string;
  };
  metacognition?: {
    thinkingChange?: string;
    strongestEvidence?: string;
    remainingQuestion?: string;
  };
  transfer?: {
    studentExplanation?: string;
    followUpInquiry?: string;
    testedCandidate?: number;
  };
  confidenceRevisit?: {
    initialConfidence?: number;
    currentConfidence?: number;
    reasonForChange?: string;
  };
}

export interface LearningJourneyInput {
  prediction?: PredictionInputAdapter | null;
  trials?: TrialInputAdapter[] | null;
  patternHistory?: PatternCandidateInputAdapter[] | null;
  discovery?: DiscoveryInputAdapter | null;
  reflection?: ReflectionInputAdapter | null;
}
