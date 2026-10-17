// ============================================================
// FISIKASERU — TEST: CONCEPTUAL CHANGE ENGINE
// Pure Unit Test Suite (Zero External Dependencies)
// ============================================================

import assert from "node:assert";
import { evaluateConceptualChange } from "../conceptualChange";

export function runConceptualChangeTests() {
  console.log("▶ Testing Conceptual Change Engine...");

  // 1. COMPLETELY_RANDOM -> CHALLENGED
  const randomRes = evaluateConceptualChange({
    prediction: { hypothesis: "COMPLETELY_RANDOM", reasoning: "Muatan cair bebas" },
    trials: [{ id: 1, q: 1.6 }, { id: 2, q: 3.2 }],
    patternHistory: [{ candidate: 1.6, meanDeviation: 0.05 }],
    discovery: { isDiscovered: true, calculatedE_corr: 1.602 },
  });
  assert.strictEqual(randomRes.outcome, "CHALLENGED", "COMPLETELY_RANDOM should be CHALLENGED by evidence");
  assert.ok(randomRes.beforeNarrative.includes("kontinu"), "Before narrative should mention continuity/randomness");
  assert.ok(randomRes.afterNarrative.includes("menantang"), "After narrative should respectfully explain challenge");

  // 2. ALL_SAME -> CHALLENGED
  const sameRes = evaluateConceptualChange({
    prediction: { hypothesis: "ALL_SAME", reasoning: "Semua elektron sama" },
    trials: [{ id: 1, q: 1.6 }, { id: 2, q: 4.8 }],
    patternHistory: [{ candidate: 1.6, meanDeviation: 0.05 }],
    discovery: { isDiscovered: true },
  });
  assert.strictEqual(sameRes.outcome, "CHALLENGED", "ALL_SAME should be CHALLENGED by discrete variation");

  // 3. QUANTIZED_PATTERN + Full Evidence -> SUPPORTED
  const quantSupportedRes = evaluateConceptualChange({
    prediction: { hypothesis: "QUANTIZED_PATTERN", reasoning: "Ada paket terkecil" },
    trials: [{ id: 1, q: 1.6 }, { id: 2, q: 3.2 }, { id: 3, q: 4.8 }],
    patternHistory: [{ candidate: 1.6, meanDeviation: 0.04 }],
    discovery: { isDiscovered: true, calculatedE_corr: 1.602 },
    reflection: {
      studentConclusion: {
        claim: "Muatan adalah kelipatan bulat",
        evidence: "Rasio 1, 2, 3",
        reasoning: "Tetesan menangkap partikel diskret",
      },
    },
  });
  assert.strictEqual(quantSupportedRes.outcome, "SUPPORTED", "QUANTIZED_PATTERN + CER should be SUPPORTED");

  // 4. QUANTIZED_PATTERN + Partial Evidence -> REFINED
  const quantRefinedRes = evaluateConceptualChange({
    prediction: { hypothesis: "QUANTIZED_PATTERN" },
    trials: [{ id: 1, q: 1.6 }],
    patternHistory: [{ candidate: 1.6 }],
    discovery: { isDiscovered: false },
  });
  assert.strictEqual(quantRefinedRes.outcome, "REFINED", "QUANTIZED_PATTERN with partial evidence should be REFINED");

  // 5. UNSURE + Investigation -> DEVELOPED_THROUGH_INVESTIGATION
  const unsureRes = evaluateConceptualChange({
    prediction: { hypothesis: "UNSURE" },
    trials: [{ id: 1, q: 1.6 }, { id: 2, q: 3.2 }],
    patternHistory: [{ candidate: 1.6 }],
  });
  assert.strictEqual(unsureRes.outcome, "DEVELOPED_THROUGH_INVESTIGATION", "UNSURE should lead to DEVELOPED_THROUGH_INVESTIGATION");

  // 6. Safe Null / Empty state
  const nullRes = evaluateConceptualChange({});
  assert.strictEqual(nullRes.outcome, "DEVELOPED_THROUGH_INVESTIGATION", "Empty input should safely default to DEVELOPED_THROUGH_INVESTIGATION");
  assert.ok(nullRes.evidenceOfChange.length > 0, "Evidence of change should not be empty");

  console.log("  ✓ All Conceptual Change tests passed!");
}

if (require.main === module) {
  runConceptualChangeTests();
}
