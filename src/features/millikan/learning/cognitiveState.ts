// ============================================================
// FISIKASERU — COGNITIVE STATE INFERENCE
// SPRINT F: Deterministic Identification of Student Thinking Mode
// ============================================================

import { CognitiveState, CognitiveStateResult, SocraticEvaluationContext } from "./types";

/**
 * Deterministically infers the student's current active cognitive mode.
 * Evaluates semantic markers, contextual stage, and linguistic patterns.
 */
export function inferCognitiveState(context: SocraticEvaluationContext): CognitiveStateResult {
  const text = (context.userResponse || "").toLowerCase().trim();
  const evidenceFound: string[] = [];
  const scores: Record<CognitiveState, number> = {
    OBSERVING: 0,
    COMPARING: 0,
    HYPOTHESIZING: 0,
    TESTING: 0,
    PATTERN_RECOGNIZING: 0,
    EXPLAINING: 0,
    RECONCILING: 0,
    TRANSFERRING: 0,
    REFLECTING: 0,
  };

  // 1. Semantic marker evaluations
  const countMatches = (terms: string[]) => terms.filter((t) => text.includes(t)).length;

  // COMPARING: Contrastive & comparative terms
  const compareTerms = ["lebih dekat", "berbeda", "dibandingkan", "daripada", "antara", "sedangkan", "kontras", "beda", "kandidat"];
  const compCount = countMatches(compareTerms);
  if (compCount > 0) {
    scores.COMPARING += compCount * 3.5;
    evidenceFound.push("Menggunakan terminologi perbandingan antarnilai atau kandidat.");
  }

  // HYPOTHESIZING: Tentative formulation or conjecture
  const hypothesisTerms = ["saya menduga", "mungkin", "bisa jadi", "hipotesis", "seandainya", "tampaknya", "asumsi", "kemungkinan", "menurut saya"];
  const hypCount = countMatches(hypothesisTerms);
  if (hypCount > 0) {
    scores.HYPOTHESIZING += hypCount * 3.5;
    evidenceFound.push("Mengajukan dugaan atau formulasi hipotesis sementara.");
  }

  // OBSERVING: Direct reference to raw data or empirical visual elements
  const observeTerms = ["data", "angka", "saya melihat", "tampak", "tetes", "tabel", "garis bilangan", "pengamatan", "tercatat"];
  const obsCount = countMatches(observeTerms);
  if (obsCount > 0) {
    scores.OBSERVING += obsCount * 2;
    evidenceFound.push("Merujuk secara langsung pada data mentah atau visualisasi observasi.");
  }

  // PATTERN_RECOGNIZING: Structural patterns, integer ratios, clustering
  const patternTerms = ["kelipatan", "pola", "rasio", "bilangan bulat", "mendekati 1", "mendekati 2", "merapat", "teratur", "anak tangga"];
  const patCount = countMatches(patternTerms);
  if (patCount > 0) {
    scores.PATTERN_RECOGNIZING += patCount * 2;
    evidenceFound.push("Mendeteksi keteraturan rasio bilangan bulat atau struktur berulang.");
  }

  // EXPLAINING: Causal mechanisms and physical meaning (CER)
  const explainTerms = ["karena", "sebab", "artinya", "sehingga", "maka", "alasannya", "partikel", "elektron", "terkuantisasi", "diskret"];
  const expCount = countMatches(explainTerms);
  if (expCount > 0) {
    scores.EXPLAINING += expCount * 3;
    evidenceFound.push("Menghubungkan data dengan penalaran sebab-akibat atau konsep fisika.");
  }

  // RECONCILING: Confronting initial intuition with empirical proof
  const reconcileTerms = ["awalnya saya", "ternyata beda", "dugaan saya salah", "dugaan awal", "mengubah pikiran", "berbeda dari dugaan", "saya kira"];
  const recCount = countMatches(reconcileTerms);
  if (recCount > 0) {
    scores.RECONCILING += recCount * 4;
    evidenceFound.push("Membandingkan keyakinan awal dengan fakta empiris laboratorium.");
  }

  // TRANSFERRING: Applying concept to new researchers/data outside original experiment
  const transferTerms = ["peneliti lain", "data baru", "tetes 1.58", "tetes a", "skenario", "2.35", "kasus lain", "di luar data"];
  const trnCount = countMatches(transferTerms);
  if (trnCount > 0) {
    scores.TRANSFERRING += trnCount * 4;
    evidenceFound.push("Menerapkan konsep ke skenario eksperimen baru di luar data laboratorium awal.");
  }

  // REFLECTING: Metacognitive self-evaluation & uncertainty
  const reflectTerms = ["saya yakin", "masih ragu", "bingung", "pemahaman saya", "saya belajar", "menyadari", "penasaran"];
  const refCount = countMatches(reflectTerms);
  if (refCount > 0) {
    scores.REFLECTING += refCount * 3;
    evidenceFound.push("Mengevaluasi proses berpikir sendiri (metakognisi).");
  }

  // TESTING: Verification action
  const testingTerms = ["menguji", "mencoba", "memasukkan nilai", "membagi dengan"];
  const tstCount = countMatches(testingTerms);
  if (tstCount > 0) {
    scores.TESTING += tstCount * 2;
    evidenceFound.push("Menyebutkan tindakan pengujian atau verifikasi nilai.");
  }

  // 2. Contextual Stage Alignment
  if (context.conceptualStage === "TRANSFER_READY") {
    scores.TRANSFERRING += 1;
  }
  if (context.conceptualStage === "CONCEPTUAL_EXPLANATION") {
    scores.EXPLAINING += 1;
  }
  if (context.conceptualStage === "PATTERN_RECOGNITION") {
    scores.PATTERN_RECOGNIZING += 1;
  }

  // 3. Sort states by score
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [CognitiveState, number][];
  const primaryState = sortedEntries[0][1] > 0 ? sortedEntries[0][0] : "OBSERVING";
  const secondaryStates = sortedEntries
    .slice(1, 3)
    .filter(([_, score]) => score > 1)
    .map(([state]) => state);

  // 4. Determine confidence
  const topScore = sortedEntries[0][1];
  let confidence: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (topScore >= 5) confidence = "HIGH";
  else if (topScore >= 2) confidence = "MEDIUM";

  return {
    primaryState,
    secondaryStates,
    confidence,
    evidence: evidenceFound.length > 0 ? evidenceFound : ["Respon umum yang merujuk pada pengamatan."],
  };
}
