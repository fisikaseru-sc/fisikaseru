// ============================================================
// FISIKASERU — TEST: TRANSFER REASONING EVALUATION
// Pure Unit Test Suite (Zero External Dependencies)
// ============================================================

import assert from "node:assert";
import { evaluateTransferReasoning } from "../transferEvaluation";

export function runTransferEvaluationTests() {
  console.log("▶ Testing Transfer Reasoning Evaluation...");

  // 1. Relation Noticed + Data Reference
  const relRes = evaluateTransferReasoning({
    studentExplanation: "Nilai pada tetes A (1.58) dan tetes B (3.21) menunjukkan pola rasio kelipatan bilangan bulat.",
  });
  assert.ok(relRes.signals.includes("RELATION_NOTICE"), "Should detect RELATION_NOTICE");
  assert.ok(relRes.signals.includes("DATA_REFERENCE"), "Should detect DATA_REFERENCE");

  // 2. Proposes Verification
  const propRes = evaluateTransferReasoning({
    studentExplanation: "Kita perlu menghitung dan membandingkan hasil bagi dengan satuan dasar.",
  });
  assert.ok(propRes.signals.includes("PROPOSES_VERIFICATION"), "Should detect PROPOSES_VERIFICATION");

  // 3. Acknowledges Uncertainty as Positive Scientific Sophistication (Never Penalized)
  const uncertRes = evaluateTransferReasoning({
    studentExplanation: "Saya melihat ada pola kelipatan, namun untuk tetes 2.35 saya masih ragu dan belum yakin karena nilainya menyimpang.",
    followUpInquiry: "Saya ingin memeriksa kembali ketidakpastian eksperimen atau menguji ulang pengukurannya.",
  });
  assert.ok(uncertRes.signals.includes("ACKNOWLEDGES_UNCERTAINTY"), "Should detect ACKNOWLEDGES_UNCERTAINTY");
  assert.ok(uncertRes.signals.includes("PROPOSES_VERIFICATION"), "Should detect PROPOSES_VERIFICATION");
  assert.ok(uncertRes.narrative.includes("kedewasaan berpikir saintifik"), "Should praise uncertainty awareness");

  // 4. Premature Conclusion Detection
  const prematureRes = evaluateTransferReasoning({
    studentExplanation: "Ini pasti sudah benar dan sama persis tanpa perlu diuji lagi karena buku pasti benar.",
  });
  assert.ok(prematureRes.signals.includes("PREMATURE_CONCLUSION"), "Should detect PREMATURE_CONCLUSION");

  // 5. Safe Empty / Null State
  const emptyRes = evaluateTransferReasoning({});
  assert.strictEqual(emptyRes.signals.length, 0, "Empty state should return 0 signals safely");
  assert.ok(emptyRes.narrative.length > 0, "Narrative should exist even for empty state");
  assert.ok(emptyRes.suggestedInquiry, "Suggested inquiry should guide student");

  console.log("  ✓ All Transfer Evaluation tests passed!");
}

if (require.main === module) {
  runTransferEvaluationTests();
}
