// ============================================================
// FISIKASERU — LEARNING CONDITION DETECTOR
// SPRINT F: Distinguishing Productive Struggle from Stuckness
// ============================================================

import { LearningCondition, SocraticEvaluationContext } from "./types";

/**
 * Detects the current problem-solving condition of the student.
 * Never diagnoses psychological traits; only describes interaction dynamics.
 */
export function detectLearningCondition(context: SocraticEvaluationContext): {
  condition: LearningCondition;
  rationale: string;
} {
  const text = (context.userResponse || "").trim().toLowerCase();
  const history = context.conversationHistory || [];

  // Check for repeated identical or near-empty inputs across turns
  const userTurns = history.filter((m) => m.role === "user");
  const lastUserTurn = userTurns.length > 0 ? userTurns[userTurns.length - 1].text.trim().toLowerCase() : "";
  const isRepeatingExact = userTurns.length >= 2 && text === lastUserTurn && text.length > 0;

  // Check for explicit expressions of stuckness or surrender
  const stuckMarkers = ["tidak tahu", "nggak paham sama sekali", "buntu", "menyerah", "bingung banget", "gak ngerti"];
  const expressesStuck = stuckMarkers.some((m) => text.includes(m));

  if (isRepeatingExact || (expressesStuck && text.length < 25)) {
    return {
      condition: "POSSIBLY_STUCK",
      rationale: "Siswa mengulang jawaban serupa atau menyatakan kebuntuan tanpa dielaborasi lebih lanjut.",
    };
  }

  // Check for Productive Struggle:
  // Student is wrestling with data, comparing multiple hypotheses, exploring discrepancies,
  // or expressing healthy cognitive conflict ("mengapa berbeda", "tapi hasilnya mendekati")
  const struggleMarkers = [
    "tapi", "namun", "mengapa bisa", "penasaran kenapa", "agak beda",
    "masih mencari", "antara", "sedikit meleset", "kurang yakin apakah"
  ];
  const hasStruggleMarker = struggleMarkers.some((m) => text.includes(m));
  const testedMultiple = (context.candidateUnit !== undefined) || (context.possibleMisconceptions && context.possibleMisconceptions.length > 0);

  if (hasStruggleMarker || (testedMultiple && text.length > 20)) {
    return {
      condition: "PRODUCTIVE_STRUGGLE",
      rationale: "Siswa secara aktif mengeksplorasi kontradiksi data atau membandingkan hipotesis (perjuangan produktif).",
    };
  }

  // Check if needs scaffold: short claim without supporting evidence or reasoning
  if (text.length > 0 && text.length < 20 && !text.includes("karena") && !text.includes("data")) {
    return {
      condition: "NEEDS_SCAFFOLD",
      rationale: "Respon siswa masih sangat singkat dan membutuhkan tangga bantuan untuk merujuk pada bukti data.",
    };
  }

  return {
    condition: "FLOWING",
    rationale: "Siswa bergerak lancar menghubungkan pemikiran dengan bukti yang mereka amati.",
  };
}
