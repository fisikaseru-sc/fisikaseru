// ============================================================
// FISIKASERU — SPRINT G1: MASTER TEST RUNNER
// Runs all Outcome & Conceptual Change unit test suites
// ============================================================

import { runEvidenceQualityTests } from "./evidenceQuality.test";
import { runConceptualChangeTests } from "./conceptualChange.test";
import { runTransferEvaluationTests } from "./transferEvaluation.test";
import { runOutcomeProfileTests } from "./outcomeProfile.test";
import { runJourneyBuilderTests } from "./journeyBuilder.test";

console.log("\n🧪 Running FisikaSeru Sprint G1 Outcomes Test Suite...\n");

try {
  runEvidenceQualityTests();
  runConceptualChangeTests();
  runTransferEvaluationTests();
  runOutcomeProfileTests();
  runJourneyBuilderTests();

  console.log("\n🎉 All Sprint G1 Outcomes tests passed successfully!\n");
  process.exit(0);
} catch (err: any) {
  console.error("\n❌ Test failure:", err.message);
  console.error(err.stack);
  process.exit(1);
}
