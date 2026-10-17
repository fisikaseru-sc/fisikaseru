// ============================================================
// FISIKASERU — MILLIKAN LEARNING INTELLIGENCE TYPES
// SPRINT E: Learning Signals, Conceptual Progress & Misconception Map
// ============================================================

import { PredictionHypothesis } from "../types";

/**
 * 5-level qualitative learning progression states (NOT scores or grades).
 * Distinguishes activity completion from conceptual understanding.
 */
export type ConceptualProgressStage =
  | "EXPOSURE"              // Level 1: Encountered phenomena & empirical data
  | "INVESTIGATION"         // Level 2: Actively tested hypotheses & varied candidates
  | "PATTERN_RECOGNITION"   // Level 3: Noticed meaningful discrete ratio structures
  | "CONCEPTUAL_EXPLANATION"// Level 4: Can explain quantization using Claim-Evidence-Reasoning
  | "TRANSFER_READY";       // Level 5: Successfully applies quantization concept to new scenario

/**
 * Qualitative evidence classification (NOT numeric metrics).
 */
export type EvidenceQualityLevel =
  | "LIMITED_EVIDENCE"          // Minimum or insufficient data points
  | "EMERGING_PATTERN"          // Some structure visible, needs further tests
  | "CONSISTENT_PATTERN"        // Multiple observations confirm integer ratio clustering
  | "STRONG_CONCEPTUAL_EVIDENCE"; // Deep understanding connecting data to physical model

/**
 * Domain-level Misconception Identifiers.
 * Always framed respectfully as "POSSIBLE CONCEPTUAL SIGNALS" (never "You misunderstand").
 */
export type MisconceptionCode =
  | "ALL_DROPLETS_IDENTICAL"       // Misconception A: Thinks all q should equal each other
  | "CHARGE_COMPLETELY_RANDOM"     // Misconception B: Interprets near-integer ratios as coincidence
  | "PERFECTION_BIAS"              // Misconception C: Rejects 1.99 because not exactly 2.00
  | "TEXTBOOK_ANCHOR_BIAS"         // Misconception D: Repeatedly forces 1.60 without alternative inquiry
  | "ROUNDING_ARTIFACT_BELIEF";    // Misconception E: Attributes pattern solely to UI software rounding

export interface PossibleConceptualSignal {
  code: MisconceptionCode;
  title: string;
  description: string;
  constructivePrompt: string;
}

/**
 * Claim-Evidence-Reasoning (CER) Evaluation for Student Articulation.
 */
export interface CERArticulationEvaluation {
  hasClaim: boolean;
  hasEvidence: boolean;
  hasReasoning: boolean;
  isCompleteCER: boolean;
  claimFeedback?: string;
  evidenceFeedback?: string;
  reasoningFeedback?: string;
  overallStatusDescription: string;
}

/**
 * Input learning signals gathered from all experiment phases.
 */
export interface MillikanLearningSignals {
  prediction: {
    hypothesis: PredictionHypothesis | null;
    confidence: number;
    reasoning?: string;
  };
  investigation: {
    trialsCollected: number;
    candidatesTested: number;
    candidateHistory: Array<{
      candidate: number;
      meanDeviation: number;
      testedAt: number;
    }>;
    exploredNonIntegerCandidate: boolean; // Did student test a candidate yielding scattered ratios?
    comparedMultipleCandidates: boolean;  // Did student compare >= 2 candidates?
  };
  discovery: {
    patternObserved: boolean;
    discoveredCandidateUnit?: number;
    meanDeviation?: number;
    nearIntegerPercentage?: number;
  };
  articulation: {
    claim: string;
    evidence: string;
    reasoning: string;
  };
  transfer?: {
    attempted: boolean;
    studentExplanation: string;
    followUpInquiry?: string;
    demonstratesTransfer?: boolean;
  };
  confidenceRevisit?: {
    initialConfidence: number;
    currentConfidence: number;
    reasonForChange: string;
  };
}

/**
 * Output of the deterministic learning state evaluator.
 */
export interface MillikanConceptualEvaluation {
  stage: ConceptualProgressStage;
  stageLabel: string;
  stageNarrative: string;
  evidenceQuality: EvidenceQualityLevel;
  evidenceQualityLabel: string;
  cerEvaluation: CERArticulationEvaluation;
  possibleConceptualSignals: PossibleConceptualSignal[];
  recommendedSupport: {
    type: "OBSERVATION" | "COMPARISON" | "EVIDENCE_REMINDER" | "CONCEPTUAL_QUESTION" | "TRANSFER_CHALLENGE";
    prompt: string;
    actionLabel: string;
  };
}
