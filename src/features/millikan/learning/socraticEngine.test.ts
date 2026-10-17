// ============================================================
// FISIKASERU — SPRINT F SOCRATIC ENGINE UNIT TESTS
// Automated Verification for Cognitive State, Strategy & Anti-Leakage
// ============================================================

import { inferCognitiveState } from "./cognitiveState";
import { selectSocraticStrategy } from "./socraticStrategy";
import { determineAnswerVisibility } from "./answerVisibility";
import { generateSocraticFallback } from "./socraticFallback";
import { detectLearningCondition } from "./learningCondition";

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

console.log("\n🧪 Running FisikaSeru Socratic Engine Test Suite...\n");

// 1. Cognitive State Inference
const cogComparing = inferCognitiveState({
  moduleSlug: "millikan",
  userResponse: "Kandidat 1.60 jauh lebih dekat ke bilangan bulat dibandingkan kandidat 1.20",
  conceptualStage: "PATTERN_RECOGNITION",
});
assert(cogComparing.primaryState === "COMPARING", "Cognitive State (COMPARING) correctly inferred");

const cogExplaining = inferCognitiveState({
  moduleSlug: "millikan",
  userResponse: "Hal ini terjadi karena setiap tetes hanya bisa menangkap bilangan bulat partikel elektron",
  conceptualStage: "CONCEPTUAL_EXPLANATION",
});
assert(cogExplaining.primaryState === "EXPLAINING", "Cognitive State (EXPLAINING) correctly inferred");

// 2. Strategy Selector: Claim without Evidence -> REQUEST_EVIDENCE
const stratNoEvidence = selectSocraticStrategy({
  moduleSlug: "millikan",
  userResponse: "Saya menduga muatan tetesan memiliki pola kelipatan diskret",
  recentIntents: [],
});
assert(stratNoEvidence.primaryIntent === "REQUEST_EVIDENCE", "Strategy (REQUEST_EVIDENCE) on claim without evidence");

// 3. Strategy Selector: Perfection Bias -> REFRAME_ERROR
const stratPerfection = selectSocraticStrategy({
  moduleSlug: "millikan",
  userResponse: "Nilai 1.99 ini bukan 2 persis, jadi datanya masih meragukan",
  possibleMisconceptions: ["PERFECTION_BIAS"],
  recentIntents: [],
});
assert(stratPerfection.primaryIntent === "REFRAME_ERROR", "Strategy (REFRAME_ERROR) on experimental perfection bias");

// 4. Learning Condition: Productive Struggle vs Stuckness
const condStuck = detectLearningCondition({
  moduleSlug: "millikan",
  userResponse: "buntu banget gak paham",
});
assert(condStuck.condition === "POSSIBLY_STUCK", "Stuckness correctly identified for scaffold intervention");

const condStruggle = detectLearningCondition({
  moduleSlug: "millikan",
  userResponse: "Saya mencoba kandidat 1.2 tapi rasionya meleset, mengapa bisa berbeda dengan 1.6?",
  candidateUnit: 1.2,
});
assert(condStruggle.condition === "PRODUCTIVE_STRUGGLE", "Productive Struggle correctly identified and preserved");

// 5. Anti-Leakage Answer Visibility
const visPreDiscovery = determineAnswerVisibility("EXPOSURE", false);
assert(!visPreDiscovery.canMentionElectronCharge, "Electron charge forbidden before discovery");
assert(!visPreDiscovery.canMentionElectronSymbolE, "Symbol 'e' forbidden before discovery");

const visFormalized = determineAnswerVisibility("TRANSFER_READY", true);
assert(visFormalized.canMentionElectronCharge, "Electron charge allowed in formalized reflection stage");

// 6. Deterministic Fallback Generation
const fallbackResponse = generateSocraticFallback(stratNoEvidence, {
  moduleSlug: "millikan",
  userResponse: "Ada keteraturan pada nilai",
  candidateUnit: 1.6,
  trialCount: 6,
});
assert(
  fallbackResponse.fullReplyText.length > 20 && fallbackResponse.intentUsed === "REQUEST_EVIDENCE",
  "Deterministic fallback generates complete contextual response without AI"
);

// 7. Repetition Protection
const stratRepetition = selectSocraticStrategy({
  moduleSlug: "millikan",
  userResponse: "Saya menduga polanya kelipatan",
  recentIntents: ["REQUEST_EVIDENCE", "REQUEST_EVIDENCE"],
});
assert(
  stratRepetition.primaryIntent !== "REQUEST_EVIDENCE",
  "Repetition protection selects fresh alternative intent"
);

console.log("\n🎉 All 8 Socratic Engine tests passed successfully!\n");
