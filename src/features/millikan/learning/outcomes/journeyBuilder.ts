// ============================================================
// FISIKASERU — SPRINT G1: LEARNING JOURNEY BUILDER
// Pure Function Timeline of Intellectual Development (Zero Checklist / Zero Gamification)
// ============================================================

import {
  LearningJourney,
  LearningJourneyInput,
  LearningMomentEntry,
} from "./types";
import { buildOutcomeProfile } from "./outcomeProfile";

/**
 * Builds the narrative moments of a student's inquiry journey.
 * Formatted as a reflective story of thinking evolution, NOT a completion checklist.
 */
function buildJourneyMoments(input: LearningJourneyInput): LearningMomentEntry[] {
  const moments: LearningMomentEntry[] = [];
  const safe = input || {};

  // 1. INITIAL BELIEF MOMENT
  if (safe.prediction?.hypothesis) {
    const h = safe.prediction.hypothesis;
    let desc = "";
    if (h === "COMPLETELY_RANDOM") {
      desc = "Pada awal penyelidikan, kamu memperkirakan bahwa muatan tetes minyak bernilai acak sembarang dan kontinu.";
    } else if (h === "ALL_SAME") {
      desc = "Pada awal penyelidikan, kamu memperkirakan bahwa setiap tetes minyak akan membawa muatan yang persis sama.";
    } else if (h === "QUANTIZED_PATTERN") {
      desc = "Pada awal penyelidikan, kamu menduga bahwa muatan listrik akan menunjukkan pola kelipatan teratur.";
    } else {
      desc = "Pada awal penyelidikan, kamu memilih untuk memulai dengan observasi terbuka tanpa kepastian praduga.";
    }

    const evidence: string[] = [`Hipotesis awal: ${h}`];
    if (safe.prediction.reasoning && safe.prediction.reasoning !== "(Tidak ada catatan tambahan)") {
      evidence.push(`Alasan: "${safe.prediction.reasoning}"`);
    }
    if (safe.prediction.confidence) {
      evidence.push(`Tingkat keyakinan awal: ${safe.prediction.confidence}/5`);
    }

    moments.push({
      type: "INITIAL_BELIEF",
      narrative: desc,
      evidence,
    });
  }

  // 2. EVIDENCE COLLECTION MOMENT
  const trials = Array.isArray(safe.trials) ? safe.trials : [];
  if (trials.length > 0) {
    moments.push({
      type: "EVIDENCE_COLLECTION",
      narrative: `Kamu mengumpulkan ${trials.length} data observasi tetes minyak independen di bilik eksperimen, mencatat variasi kecepatan dan muatan terhitung.`,
      evidence: [
        `${trials.length} droplet teramati secara empiris`,
        `Rentang muatan bervariasi antara tetesan kecil hingga besar`,
      ],
    });
  }

  // 3. PATTERN INVESTIGATION MOMENT
  const history = Array.isArray(safe.patternHistory) ? safe.patternHistory : [];
  if (history.length > 0) {
    moments.push({
      type: "PATTERN_INVESTIGATION",
      narrative: `Kamu menguji ${history.length} variasi kandidat satuan pembagi pada garis bilangan untuk meneliti keteraturan rasio hasil pembagian.`,
      evidence: history.map((h) => `Kandidat ~${h.candidate.toFixed(2)} × 10⁻¹⁹ C (deviasi ±${(h.meanDeviation || 0).toFixed(2)})`),
    });
  }

  // 4. DISCOVERY MOMENT (AHA MOMENT)
  const isDiscovered = Boolean(safe.discovery?.isDiscovered || (safe.discovery?.calculatedE_corr !== null && safe.discovery?.calculatedE_corr !== undefined));
  if (isDiscovered) {
    const val = safe.discovery?.calculatedE_corr || (history.length > 0 ? history[history.length - 1].candidate : 1.6);
    moments.push({
      type: "DISCOVERY",
      narrative: `Titik balik: kamu menemukan bahwa rasio hasil pembagian berkali-kali merapat sangat dekat ke bilangan bulat dengan kandidat dasar ~${val.toFixed(2)} × 10⁻¹⁹ C.`,
      evidence: [
        "Pola rasio mengelompok pada kelipatan diskret",
        "Muatan terbukti tidak tersebar acak bebas",
      ],
    });
  }

  // 5. CONCEPTUAL ARTICULATION MOMENT
  const conclusion = safe.reflection?.studentConclusion;
  if (conclusion?.claim || conclusion?.reasoning) {
    const evidenceList: string[] = [];
    if (conclusion.claim) evidenceList.push(`Klaim: "${conclusion.claim}"`);
    if (conclusion.evidence) evidenceList.push(`Bukti: "${conclusion.evidence}"`);
    if (conclusion.reasoning) evidenceList.push(`Penalaran: "${conclusion.reasoning}"`);

    moments.push({
      type: "CONCEPTUAL_ARTICULATION",
      narrative: "Kamu merangkai temuanmu ke dalam penjelasan ilmiah mandiri yang mengaitkan klaim terkuantisasi dengan data numerik dan konsep partikel diskret.",
      evidence: evidenceList,
    });
  }

  // 6. TRANSFER ATTEMPT MOMENT
  const transfer = safe.reflection?.transfer;
  if (transfer?.studentExplanation) {
    moments.push({
      type: "TRANSFER_ATTEMPT",
      narrative: "Kamu menguji ketahanan pemahamanmu dengan menelaah set data baru dari peneliti independen dan mengevaluasi kemungkinan adanya anomali.",
      evidence: [
        `Penjelasan transfer: "${transfer.studentExplanation}"`,
        transfer.followUpInquiry ? `Penyelidikan anomali: "${transfer.followUpInquiry}"` : "Mengevaluasi keselarasan rasio data baru",
      ],
    });
  }

  // 7. METACOGNITIVE REFLECTION MOMENT
  const meta = safe.reflection?.metacognition;
  const revisit = safe.reflection?.confidenceRevisit;
  if (meta?.thinkingChange || revisit?.reasonForChange || meta?.remainingQuestion) {
    const evidenceList: string[] = [];
    if (revisit?.reasonForChange) evidenceList.push(`Pergeseran keyakinan: "${revisit.reasonForChange}"`);
    if (meta?.strongestEvidence) evidenceList.push(`Bukti terkuat: "${meta.strongestEvidence}"`);
    if (meta?.remainingQuestion) evidenceList.push(`Pertanyaan lanjutan: "${meta.remainingQuestion}"`);

    moments.push({
      type: "METACOGNITIVE_REFLECTION",
      narrative: "Kamu merefleksikan bagaimana data mengubah cara berpikirmu serta merumuskan pertanyaan yang masih mengundang rasa ingin tahu ilmiah.",
      evidence: evidenceList,
    });
  }

  return moments;
}

/**
 * Pure function: Builds the complete LearningJourney containing
 * narrative timeline moments and the multidimensional LearningOutcomeProfile.
 */
export function buildLearningJourney(input: LearningJourneyInput): LearningJourney {
  const safeInput = input || {};
  const profile = buildOutcomeProfile(safeInput);
  const moments = buildJourneyMoments(safeInput);

  return {
    moments,
    profile,
  };
}
