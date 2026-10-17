// ============================================================
// FISIKASERU — SOCRATIC MEMORY ARCHITECTURE
// SPRINT F: Bounded, Structured Conversation Memory
// ============================================================

import { SocraticMemory, SocraticIntent, CognitiveState, SocraticEvaluationContext } from "./types";
import { MisconceptionCode } from "../intelligence/learningTypes";

/**
 * Initializes or updates a compact, bounded Socratic memory representation.
 * Prevents memory bloat and protects against sending unbounded transcripts to LLM.
 */
export function updateSocraticMemory(
  previousMemory: SocraticMemory | null,
  context: SocraticEvaluationContext,
  usedIntent: SocraticIntent,
  cognitiveState: CognitiveState
): SocraticMemory {
  const text = context.userResponse.trim();
  const recentIntents: SocraticIntent[] = previousMemory
    ? [...previousMemory.recentIntents, usedIntent].slice(-4)
    : [usedIntent];

  const studentClaim = context.studentConclusion?.claim ||
    (text.toLowerCase().includes("karena") || text.length > 25 ? text : previousMemory?.studentCurrentClaim || "");

  const strongestEvidence = context.studentConclusion?.evidence ||
    context.metacognition?.strongestEvidence ||
    previousMemory?.strongestEvidenceMentioned ||
    "Pola rasio bilangan bulat hasil bagi";

  const unresolvedQuestion = context.metacognition?.remainingQuestion ||
    previousMemory?.unresolvedQuestion ||
    "";

  const activeHypothesis = context.studentPrediction?.hypothesis ||
    previousMemory?.activeHypothesis ||
    "Eksplorasi Terbuka";

  const misconceptionSignals: MisconceptionCode[] = context.possibleMisconceptions || previousMemory?.misconceptionSignals || [];

  return {
    studentCurrentClaim: studentClaim,
    strongestEvidenceMentioned: strongestEvidence,
    activeHypothesis,
    unresolvedQuestion,
    misconceptionSignals,
    currentCognitiveState: cognitiveState,
    recentIntents,
    turnCount: (previousMemory?.turnCount || 0) + 1,
  };
}

/**
 * Generates a concise context string suitable for the LLM prompt.
 * Keeps tokens strictly controlled (target: < 150 words of context).
 */
export function compressLearningContext(
  context: SocraticEvaluationContext,
  memory: SocraticMemory | null
): string {
  const cand = context.candidateUnit ? `${context.candidateUnit.toFixed(2)} × 10⁻¹⁹ C` : "belum ditentukan";
  const prediction = context.studentPrediction?.hypothesis || "Belum dicatat";
  const claim = memory?.studentCurrentClaim || context.studentConclusion?.claim || "Belum dirumuskan";
  const evidence = memory?.strongestEvidenceMentioned || context.studentConclusion?.evidence || "Belum dirumuskan";
  const stage = context.conceptualStage || "INVESTIGATION";

  return `
RINGKASAN KONTEKS PEMBELAJARAN SISWA:
- Tahap Inkuiri: ${stage}
- Dugaan Awal Siswa: ${prediction}
- Kandidat Satuan Teruji: ${cand} (${context.trialCount || 5} tetesan)
- Klaim Terakhir Siswa: "${claim}"
- Bukti yang Dirujuk Siswa: "${evidence}"
- Kondisi Berpikir: ${memory?.currentCognitiveState || "OBSERVING"}
- Pertanyaan Tersisa Siswa: "${memory?.unresolvedQuestion || context.metacognition?.remainingQuestion || "Tidak ada"}"
  `.trim();
}
