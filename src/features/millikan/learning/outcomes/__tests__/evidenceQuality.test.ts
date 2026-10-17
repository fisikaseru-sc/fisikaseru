// ============================================================
// FISIKASERU — TEST: EVIDENCE QUALITY HEURISTICS
// Pure Unit Test Suite (Zero External Dependencies)
// ============================================================

import assert from "node:assert";
import { evaluateEvidenceQuality } from "../evidenceQuality";

export function runEvidenceQualityTests() {
  console.log("▶ Testing Evidence Quality Heuristics...");

  // 1. Simple Assertion (No data, no observation)
  const assertionRes = evaluateEvidenceQuality("Menurut saya muatan ini bersifat diskret.");
  assert.strictEqual(assertionRes.strongestLevel, "ASSERTION", "Should classify simple claim as ASSERTION");
  assert.ok(assertionRes.signals.includes("HAS_CLAIM"), "Should detect HAS_CLAIM signal");

  // 2. Observation (General phenomenon mentioned without data)
  const obsRes = evaluateEvidenceQuality("Saya melihat beberapa nilai tampak memiliki pola.");
  assert.strictEqual(obsRes.strongestLevel, "OBSERVATION", "Should classify general sighting as OBSERVATION");
  assert.ok(obsRes.signals.includes("MENTIONS_OBSERVATION"), "Should detect MENTIONS_OBSERVATION signal");

  // 3. Data Reference (Specific numbers / ratio terms referenced)
  const dataRes = evaluateEvidenceQuality("Saya melihat hasil pembagian mendekati angka tertentu 1, 2, dan 3.");
  assert.strictEqual(dataRes.strongestLevel, "DATA_REFERENCE", "Should classify numeric ratio reference as DATA_REFERENCE");
  assert.ok(dataRes.signals.includes("REFERENCES_DATA"), "Should detect REFERENCES_DATA signal");

  // 4. Reasoned Connection (Connects data + claim via causal relation)
  const reasonedRes = evaluateEvidenceQuality(
    "Karena beberapa rasio menunjukkan keteraturan kelipatan bulat yang sama saat dibagi 1.6, saya menduga muatan tersusun dari paket dasar yang berulang."
  );
  assert.strictEqual(reasonedRes.strongestLevel, "REASONED_CONNECTION", "Should classify causal link with data as REASONED_CONNECTION");
  assert.ok(reasonedRes.signals.includes("CONNECTS_EVIDENCE_TO_CLAIM"), "Should detect CONNECTS_EVIDENCE_TO_CLAIM");
  assert.ok(reasonedRes.signals.includes("REFERENCES_DATA"), "Should detect REFERENCES_DATA");

  // 5. Uncertainty Acknowledgement
  const uncertaintyRes = evaluateEvidenceQuality("Saya masih ragu dan belum yakin karena satu nilai tampak menyimpang.");
  assert.ok(uncertaintyRes.signals.includes("ACKNOWLEDGES_UNCERTAINTY"), "Should detect ACKNOWLEDGES_UNCERTAINTY");

  // 6. Safe Empty Text
  const emptyRes = evaluateEvidenceQuality("");
  assert.strictEqual(emptyRes.strongestLevel, "ASSERTION", "Empty string should safely default without crash");
  assert.strictEqual(emptyRes.signals.length, 0, "Empty string should have 0 signals");

  const nullRes = evaluateEvidenceQuality(null);
  assert.strictEqual(nullRes.strongestLevel, "ASSERTION", "Null should safely default without crash");

  // 7. Ambiguous Text
  const ambigRes = evaluateEvidenceQuality("Halo selamat pagi saya sedang mencoba.");
  assert.strictEqual(ambigRes.strongestLevel, "ASSERTION", "Ambiguous non-physics text should be ASSERTION");

  console.log("  ✓ All Evidence Quality tests passed!");
}

if (require.main === module) {
  runEvidenceQualityTests();
}
