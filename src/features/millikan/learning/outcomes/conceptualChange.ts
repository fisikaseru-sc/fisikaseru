// ============================================================
// FISIKASERU — SPRINT G1: CONCEPTUAL CHANGE ENGINE
// Respectful Baseline vs Evidence Comparison (Zero Correct/Wrong Judgements)
// ============================================================

import {
  ConceptualChangeInsight,
  DiscoveryInputAdapter,
  PatternCandidateInputAdapter,
  PredictionInputAdapter,
  PredictionOutcome,
  ReflectionInputAdapter,
  TrialInputAdapter,
} from "./types";

interface ConceptualChangeInput {
  prediction?: PredictionInputAdapter | null;
  trials?: TrialInputAdapter[] | null;
  patternHistory?: PatternCandidateInputAdapter[] | null;
  discovery?: DiscoveryInputAdapter | null;
  reflection?: ReflectionInputAdapter | null;
}

/**
 * Maps baseline hypothesis to a descriptive narrative of initial thinking.
 */
function getBeforeNarrative(hypothesis?: string | null, reasoning?: string): string {
  const customReason = reasoning && reasoning !== "(Tidak ada catatan tambahan)" ? ` ("${reasoning}")` : "";

  switch (hypothesis) {
    case "COMPLETELY_RANDOM":
      return `Pada awal eksperimen, kamu memperkirakan bahwa muatan listrik dapat bernilai berapa saja secara kontinu dan tersebar acak bebas tanpa aturan dasar${customReason}.`;
    case "ALL_SAME":
      return `Pada awal eksperimen, kamu menduga bahwa setiap tetes minyak akan memiliki nilai muatan yang persis identik satu sama lain${customReason}.`;
    case "QUANTIZED_PATTERN":
      return `Pada awal eksperimen, kamu telah mengantisipasi bahwa muatan listrik tersusun dalam paket-paket kelipatan dari suatu satuan terkecil${customReason}.`;
    case "UNSURE":
    default:
      return `Pada awal eksperimen, kamu memulai dengan pikiran terbuka dan belum menyimpulkan bagaimana sifat pembagian muatan listrik${customReason}.`;
  }
}

/**
 * Pure function that deterministically interprets how student's initial belief
 * was influenced or evolved based on the collected evidence and investigation.
 */
export function evaluateConceptualChange(input: ConceptualChangeInput): ConceptualChangeInsight {
  const hypothesis = input.prediction?.hypothesis || "UNSURE";
  const reasoning = input.prediction?.reasoning;
  const trialsCount = Array.isArray(input.trials) ? input.trials.length : 0;
  const candidatesCount = Array.isArray(input.patternHistory) ? input.patternHistory.length : 0;
  const hasDiscovery = Boolean(input.discovery?.isDiscovered || (input.discovery?.calculatedE_corr !== null && input.discovery?.calculatedE_corr !== undefined));
  const hasCER = Boolean(input.reflection?.studentConclusion?.claim || input.reflection?.studentConclusion?.reasoning);

  let outcome: PredictionOutcome = "DEVELOPED_THROUGH_INVESTIGATION";
  let afterNarrative = "";
  let respectfulSummary = "";
  const evidenceOfChange: string[] = [];

  // Track evidence items
  if (trialsCount > 0) {
    evidenceOfChange.push(`Mengumpulkan ${trialsCount} data observasi tetes minyak independen`);
  }
  if (candidatesCount > 0) {
    evidenceOfChange.push(`Menguji ${candidatesCount} kandidat satuan pembagi pada garis bilangan`);
  }
  if (hasDiscovery) {
    evidenceOfChange.push("Menemukan keteraturan rasio yang konsisten mendekati kelipatan bilangan bulat");
  }
  if (hasCER) {
    evidenceOfChange.push("Merumuskan kesimpulan mandiri berbasis bukti dan penalaran fisis");
  }

  const beforeNarrative = getBeforeNarrative(hypothesis, reasoning);

  // Determine respectful outcome
  switch (hypothesis) {
    case "COMPLETELY_RANDOM":
      outcome = "CHALLENGED";
      afterNarrative = "Data eksperimen memberikan bukti kuat yang menantang gagasan kontinuitas acak: nilai muatan ternyata berulang pada kelipatan bilangan bulat diskret.";
      respectfulSummary = "Data eksperimen membantumu melihat bahwa variasi muatan bukanlah ketidakteraturan acak, melainkan keteraturan kuantisasi yang rapi.";
      break;

    case "ALL_SAME":
      outcome = "CHALLENGED";
      afterNarrative = "Data menunjukkan bahwa tetesan memiliki muatan yang berbeda-beda, namun semuanya dapat diuraikan menjadi kelipatan dari satu satuan dasar yang sama.";
      respectfulSummary = "Investigasi mempertajam pemahamanmu: muatan tidak seragam identik, melainkan tersusun dari jumlah butir partikel dasar yang bervariasi.";
      break;

    case "QUANTIZED_PATTERN":
      // If student also articulated solid evidence/discovery, it is SUPPORTED; otherwise REFINED
      if (hasDiscovery && hasCER) {
        outcome = "SUPPORTED";
        afterNarrative = "Dugaan awalmu terbukti konsisten dengan fakta laboratorium: data empiris mengonfirmasi bahwa muatan adalah kelipatan integer dari satuan dasar.";
        respectfulSummary = "Intuisi awalanmu tentang kuantisasi terbukti selaras dengan bukti eksperimen konkret yang kamu kumpulkan sendiri.";
      } else {
        outcome = "REFINED";
        afterNarrative = "Dugaan awalmu tentang pola kini diperkaya dengan bukti numerik rasio pembagian dari data tetesan nyata.";
        respectfulSummary = "Dugaan awalmu diperdalam melalui pengukuran empiris dan verifikasi rasio pada garis bilangan.";
      }
      break;

    case "UNSURE":
    default:
      outcome = "DEVELOPED_THROUGH_INVESTIGATION";
      afterNarrative = "Melalui pengujian empiris dan eksplorasi kandidat satuan, kamu membangun model pemahaman sendiri langsung dari data nyata.";
      respectfulSummary = "Dari titik awal eksplorasi terbuka, kamu berhasil merumuskan pemahaman fisis berbasis bukti yang terukur.";
      break;
  }

  return {
    outcome,
    beforeNarrative,
    afterNarrative,
    evidenceOfChange: evidenceOfChange.length > 0 ? evidenceOfChange : ["Melakukan observasi eksperimen dan menelaah data"],
    respectfulSummary,
  };
}
