// ============================================================
// FISIKASERU — TEST: LEARNING JOURNEY BUILDER
// Pure Unit Test Suite (Zero External Dependencies)
// ============================================================

import assert from "node:assert";
import { buildLearningJourney } from "../journeyBuilder";

export function runJourneyBuilderTests() {
  console.log("▶ Testing Learning Journey Builder...");

  // 1. Empty Journey Safety
  const emptyJourney = buildLearningJourney({});
  assert.ok(emptyJourney.moments, "Moments array should exist");
  assert.strictEqual(emptyJourney.moments.length, 0, "Empty input should have 0 moments safely without crashing");
  assert.ok(emptyJourney.profile, "Outcome profile must still be generated");
  assert.strictEqual(emptyJourney.profile.dimensions.EVIDENCE_READING.level, "NOT_YET_VISIBLE");

  // 2. Journey from Full Data
  const fullJourney = buildLearningJourney({
    prediction: {
      hypothesis: "COMPLETELY_RANDOM",
      reasoning: "Muatan fluida bebas",
      confidence: 3,
    },
    trials: [
      { id: 1, dropletLabel: "A", q: 1.6 },
      { id: 2, dropletLabel: "B", q: 3.2 },
      { id: 3, dropletLabel: "C", q: 4.8 },
      { id: 4, dropletLabel: "D", q: 6.4 },
      { id: 5, dropletLabel: "E", q: 8.0 },
    ],
    patternHistory: [
      { candidate: 1.2, meanDeviation: 0.22 },
      { candidate: 1.6, meanDeviation: 0.04 },
    ],
    discovery: { isDiscovered: true, calculatedE_corr: 1.602 },
    reflection: {
      studentConclusion: {
        claim: "Muatan terkuantisasi",
        evidence: "Rasio kelipatan bulat 1, 2, 3, 4, 5",
        reasoning: "Tetesan menangkap partikel diskret elektron",
      },
      transfer: {
        studentExplanation: "Data baru memiliki kelipatan yang sama",
        followUpInquiry: "Memeriksa nilai anomali jika ada penyimpangan",
      },
      metacognition: {
        thinkingChange: "Melihat bahwa muatan tidak kontinu acak",
        strongestEvidence: "Rasio pembagian yang konsisten bulat",
        remainingQuestion: "Berapa massa satu elektron?",
      },
      confidenceRevisit: {
        initialConfidence: 3,
        currentConfidence: 5,
        reasonForChange: "Data empiris membuktikan keteraturan",
      },
    },
  });

  // Verify all 7 moments were captured in narrative order
  assert.strictEqual(fullJourney.moments.length, 7, "Full journey should capture all 7 inquiry moments");
  const momentTypes = fullJourney.moments.map((m) => m.type);
  assert.deepStrictEqual(momentTypes, [
    "INITIAL_BELIEF",
    "EVIDENCE_COLLECTION",
    "PATTERN_INVESTIGATION",
    "DISCOVERY",
    "CONCEPTUAL_ARTICULATION",
    "TRANSFER_ATTEMPT",
    "METACOGNITIVE_REFLECTION",
  ]);

  // Verify narrative quality (Student-facing, NOT a completion checklist)
  fullJourney.moments.forEach((m) => {
    assert.ok(m.narrative.length > 20, "Narrative must be substantial and reflective");
    assert.ok(!m.narrative.includes("✓"), "Narrative must not use checklist symbols");
    assert.ok(!m.narrative.includes("Completed"), "Narrative must not use corporate checklist status");
  });

  // 3. Journey from Partial Data (e.g. only prediction and experiment)
  const partialJourney = buildLearningJourney({
    prediction: { hypothesis: "ALL_SAME" },
    trials: [{ id: 1, dropletLabel: "A", q: 1.6 }],
  });
  assert.strictEqual(partialJourney.moments.length, 2, "Partial journey should capture exactly 2 moments");
  assert.strictEqual(partialJourney.moments[0].type, "INITIAL_BELIEF");
  assert.strictEqual(partialJourney.moments[1].type, "EVIDENCE_COLLECTION");

  console.log("  ✓ All Learning Journey Builder tests passed!");
}

if (require.main === module) {
  runJourneyBuilderTests();
}
