// ============================================================
// FISIKASERU — ADAPTIVE SOCRATIC INTELLIGENCE TYPES
// SPRINT F: Cognitive State, Socratic Intent & Thinking Partner
// ============================================================

import { PredictionHypothesis, StudentPrediction } from "../types";
import { ConceptualProgressStage, EvidenceQualityLevel, MisconceptionCode } from "../intelligence/learningTypes";

/**
 * Represents the current active cognitive activity of the student.
 * Describes the thinking action, NOT ability, IQ, or student grading.
 */
export type CognitiveState =
  | "OBSERVING"             // Describing empirical data or noticing numbers
  | "COMPARING"             // Comparing multiple candidates, droplets, or ratios
  | "HYPOTHESIZING"         // Proposing tentative explanation or conjectures
  | "TESTING"               // Testing hypotheses with empirical data
  | "PATTERN_RECOGNIZING"   // Identifying regular structure (e.g. integer ratios)
  | "EXPLAINING"            // Articulating causal/physical reasoning (CER)
  | "RECONCILING"           // Reconciling prior intuition with contradictory evidence
  | "TRANSFERRING"          // Applying concept to a novel scenario
  | "REFLECTING";           // Evaluating one's own thinking process (metacognition)

export type CognitiveConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface CognitiveStateResult {
  primaryState: CognitiveState;
  secondaryStates: CognitiveState[];
  confidence: CognitiveConfidence;
  evidence: string[];
}

/**
 * Condition of student engagement during problem-solving.
 * Distinguishes productive struggle (valuable) from stuckness.
 */
export type LearningCondition =
  | "FLOWING"               // Proceeding smoothly with clear progression
  | "PRODUCTIVE_STRUGGLE"   // Actively wrestling with discrepancies (encourage!)
  | "NEEDS_SCAFFOLD"        // Missing a bridging link to connect claim and evidence
  | "POSSIBLY_STUCK";       // Repeating same action or unanswered questions

/**
 * Finite taxonomy of pedagogical Socratic intents.
 * The rule-based engine selects intent BEFORE LLM language generation.
 */
export type SocraticIntent =
  | "INVITE_OBSERVATION"     // Prompt to notice specific data details
  | "REQUEST_COMPARISON"     // Prompt to compare two candidates or observations
  | "PROBE_ASSUMPTION"       // Challenge unstated premises or intuitions
  | "REQUEST_EVIDENCE"       // Ask what concrete data supports a claim
  | "TEST_HYPOTHESIS"        // Invite testing a claim against edge cases
  | "HIGHLIGHT_CONTRADICTION"// Gently highlight tension between belief and data
  | "REFRAME_ERROR"          // Frame deviation/error as natural physical measurement
  | "CONNECT_PATTERN"        // Guide from ratio clustering to discrete packets
  | "REQUEST_EXPLANATION"    // Prompt for physical causal mechanism ("Why?")
  | "INVITE_TRANSFER"        // Prompt application to a novel dataset
  | "PROMPT_METACOGNITION"   // Prompt reflection on how understanding evolved
  | "ALLOW_PRODUCTIVE_PAUSE"; // Deliberate silence: give space for student reflection

/**
 * Strict anti-answer-leakage guardrails.
 * Explicitly separates allowed knowledge from restricted knowledge by stage.
 */
export interface AnswerVisibility {
  canMentionQuantization: boolean;
  canMentionElectronCharge: boolean;
  canMentionElectronSymbolE: boolean;
  allowedKnowledge: string[];
  restrictedKnowledge: string[];
}

/**
 * Result of pedagogical strategy selection.
 */
export interface SocraticStrategy {
  primaryIntent: SocraticIntent;
  secondaryIntent?: SocraticIntent;
  rationale: string;
  avoid: string[];
  suggestedPromptSkeleton: string;
  supportLevel: "NONE" | "LIGHT" | "SCAFFOLD" | "PARTIAL_EXPLANATION";
}

/**
 * Compact, bounded Socratic conversation memory.
 * Prevents unbounded context expansion while preserving learning essence.
 */
export interface SocraticMemory {
  studentCurrentClaim: string;
  strongestEvidenceMentioned: string;
  activeHypothesis: string;
  unresolvedQuestion: string;
  misconceptionSignals: MisconceptionCode[];
  currentCognitiveState: CognitiveState;
  recentIntents: SocraticIntent[];
  turnCount: number;
}

/**
 * Structured contract for LLM generation.
 * Ensures concise, non-patronizing, focused dialogue.
 */
export interface SocraticResponseContract {
  acknowledgement: string;
  observation: string;
  question: string;
  supportLevel: "NONE" | "LIGHT" | "SCAFFOLD";
  intentUsed: SocraticIntent;
  fullReplyText: string;
}

/**
 * Comprehensive learning context passed from client to Socratic engine.
 */
export interface SocraticEvaluationContext {
  moduleSlug: string;
  userResponse: string;
  conversationHistory?: Array<{ role: "tutor" | "user"; text: string }>;
  recentIntents?: SocraticIntent[];
  studentPrediction?: StudentPrediction | null;
  predictionOutcome?: "SUPPORTED" | "REFINED" | "CHALLENGED" | "DEVELOPED";
  candidateUnit?: number;
  trialCount?: number;
  evidenceSummary?: string;
  conceptualStage?: ConceptualProgressStage;
  evidenceQuality?: EvidenceQualityLevel;
  possibleMisconceptions?: MisconceptionCode[];
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
  transferAttempted?: boolean;
}
