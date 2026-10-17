// ============================================================
// FISIKASERU — TEST: OUTCOME PROFILE ENGINE
// Pure Unit Test Suite (Zero External Dependencies)
// ============================================================

import assert from "node:assert";
import { buildOutcomeProfile } from "../outcomeProfile";

export function runOutcomeProfileTests() {
  console.log("▶ Testing Outcome Profile Engine...");

  // 1. Safe Empty / Missing Data State
  const emptyProfile = buildOutcomeProfile({});
  assert.ok(emptyProfile.dimensions, "Dimensions object should exist");
  assert.strictEqual(emptyProfile.dimensions.EVIDENCE_READING.level, "NOT_YET_VISIBLE");
  assert.strictEqual(emptyProfile.dimensions.PATTERN_REASONING.level, "NOT_YET_VISIBLE");
  assert.strictEqual(emptyProfile.dimensions.CONCEPTUAL_EXPLANATION.level, "NOT_YET_VISIBLE");
  assert.strictEqual(emptyProfile.dimensions.MODEL_TRANSFER.level, "NOT_YET_VISIBLE");
  assert.strictEqual(emptyProfile.dimensions.METACOGNITIVE_AWARENESS.level, "NOT_YET_VISIBLE");

  // Verify NO global score or percentage exists in the profile
  assert.strictEqual((emptyProfile as any).score, undefined, "No global score must exist");
  assert.strictEqual((emptyProfile as any).percentage, undefined, "No percentage must exist");
  assert.strictEqual((emptyProfile as any).grade, undefined, "No grade must exist");

  // 2. Independent Dimension Evolution (Dimensions don't artificially rise together)
  const partialProfile = buildOutcomeProfile({
    prediction: { hypothesis: "QUANTIZED_PATTERN", confidence: 4 },
    trials: [
      { id: 1, dropletLabel: "A", q: 1.6 },
      { id: 2, dropletLabel: "B", q: 3.2 },
      { id: 3, dropletLabel: "C", q: 4.8 },
      { id: 4, dropletLabel: "D", q: 6.4 },
    ],
    patternHistory: [
      { candidate: 1.2, meanDeviation: 0.25 },
      { candidate: 1.6, meanDeviation: 0.04 },
    ],
    discovery: { isDiscovered: true, calculatedE_corr: 1.602 },
    reflection: {
      studentConclusion: {
        claim: "Muatan listrik diskret",
        evidence: "Rasio muatan dengan 1.6 menghasilkan kelipatan bulat 1, 2, 3, dan 4",
        reasoning: "Tetes minyak menangkap elektron dalam jumlah bilangan bulat",
      },
      // Notice: Transfer is NOT completed
      transfer: { studentExplanation: "" },
    },
  });

  // Verify independent levels:
  assert.strictEqual(
    partialProfile.dimensions.EVIDENCE_READING.level,
    "SUPPORTED_BY_EVIDENCE",
    "Evidence reading should be SUPPORTED_BY_EVIDENCE with 4 trials + CER evidence"
  );
  assert.strictEqual(
    partialProfile.dimensions.PATTERN_REASONING.level,
    "TRANSFERABLE",
    "Pattern reasoning should be TRANSFERABLE after testing multiple candidates including scatter exploration"
  );
  assert.strictEqual(
    partialProfile.dimensions.CONCEPTUAL_EXPLANATION.level,
    "SUPPORTED_BY_EVIDENCE",
    "Conceptual explanation should be SUPPORTED_BY_EVIDENCE with complete CER"
  );
  assert.strictEqual(
    partialProfile.dimensions.MODEL_TRANSFER.level,
    "NOT_YET_VISIBLE",
    "Model transfer MUST remain NOT_YET_VISIBLE since it was not yet attempted"
  );

  console.log("  ✓ All Outcome Profile tests passed!");
}

if (require.main === module) {
  runOutcomeProfileTests();
}
