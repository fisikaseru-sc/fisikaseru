// ============================================================
// FISIKASERU — SPRINT G1: OUTCOME PROFILE ENGINE
// Multidimensional Qualitative Learning Profiler (Zero Overall Score)
// ============================================================

import {
  DimensionEvidence,
  DimensionInsight,
  LearningDimension,
  LearningJourneyInput,
  LearningOutcomeProfile,
  QualitativeLevel,
} from "./types";
import { LEARNING_DIMENSIONS } from "./learningDimensions";
import { evaluateConceptualChange } from "./conceptualChange";
import { evaluateEvidenceQuality } from "./evidenceQuality";
import { evaluateTransferReasoning } from "./transferEvaluation";

/**
 * Builds the independent insight for the EVIDENCE_READING dimension.
 */
function evaluateEvidenceReadingDimension(input: LearningJourneyInput): DimensionInsight {
  const trials = Array.isArray(input.trials) ? input.trials : [];
  const trialCount = trials.length;
  const evidenceText = input.reflection?.studentConclusion?.evidence || "";
  const evidenceEval = evaluateEvidenceQuality(evidenceText);

  const evidenceList: DimensionEvidence[] = [];
  let level: QualitativeLevel = "NOT_YET_VISIBLE";
  let narrative = "Siswa belum mengumpulkan data observasi tetesan di laboratorium.";

  if (trialCount === 0) {
    level = "NOT_YET_VISIBLE";
  } else if (trialCount < 3) {
    level = "EMERGING";
    evidenceList.push({
      source: "Laboratorium",
      description: `Mengumpulkan ${trialCount} data tetes minyak.`,
    });
    narrative = `Siswa telah mulai mengamati tetes minyak (${trialCount} droplet), namun masih memerlukan variasi data tambahan untuk melihat sebaran nilai.`;
  } else {
    evidenceList.push({
      source: "Laboratorium",
      description: `Mengumpulkan ${trialCount} observasi droplet dengan variasi radius dan kecepatan.`,
    });

    if (evidenceEval.strongestLevel === "DATA_REFERENCE" || evidenceEval.strongestLevel === "REASONED_CONNECTION") {
      level = "SUPPORTED_BY_EVIDENCE";
      evidenceList.push({
        source: "Refleksi CER",
        description: "Menyertakan rujukan numerik data konkret dalam argumen tertulis.",
      });
      narrative = `Siswa mengumpulkan ${trialCount} droplet dan secara aktif mengutip fakta numerik observasi dalam pembuktian ilmiahnya.`;
    } else {
      level = "DEVELOPING";
      narrative = `Siswa memiliki kumpulan data empiris yang cukup (${trialCount} droplet) dan sedang mengembangkan keterampilan merujuk data spesifik dalam argumennya.`;
    }
  }

  // If student also transferred data reading to the independent dataset
  if (level === "SUPPORTED_BY_EVIDENCE" && input.reflection?.transfer?.studentExplanation) {
    const transferEval = evaluateTransferReasoning(input.reflection.transfer);
    if (transferEval.signals.includes("DATA_REFERENCE")) {
      level = "TRANSFERABLE";
      evidenceList.push({
        source: "Uji Transfer",
        description: "Membaca dan merujuk data independen peneliti lain secara presisi.",
      });
      narrative = `Siswa mahir membaca bukti eksperimen internal maupun mengevaluasi data observasi dari eksperimen independen.`;
    }
  }

  return {
    dimension: "EVIDENCE_READING",
    level,
    evidence: evidenceList,
    narrative,
    nextInquiry: LEARNING_DIMENSIONS.EVIDENCE_READING.inquiryGuidingPrompt,
  };
}

/**
 * Builds the independent insight for the PATTERN_REASONING dimension.
 */
function evaluatePatternReasoningDimension(input: LearningJourneyInput): DimensionInsight {
  const history = Array.isArray(input.patternHistory) ? input.patternHistory : [];
  const candidateCount = history.length;
  const isDiscovered = Boolean(input.discovery?.isDiscovered || (input.discovery?.calculatedE_corr !== null && input.discovery?.calculatedE_corr !== undefined));
  const hasScatterExploration = history.some((h) => (h.meanDeviation || 0) > 0.18);

  const evidenceList: DimensionEvidence[] = [];
  let level: QualitativeLevel = "NOT_YET_VISIBLE";
  let narrative = "Siswa belum memulai penyelidikan pola pembagian atau pengujian kandidat satuan.";

  if (candidateCount === 0) {
    level = "NOT_YET_VISIBLE";
  } else if (candidateCount === 1 && !isDiscovered) {
    level = "EMERGING";
    evidenceList.push({
      source: "Uji Kandidat",
      description: `Menguji kandidat awal ${history[0].candidate.toFixed(2)} × 10⁻¹⁹ C.`,
    });
    narrative = "Siswa mulai menguji hipotesis kandidat satuan pembagi awal pada data muatan.";
  } else if (candidateCount >= 2 && !isDiscovered) {
    level = "DEVELOPING";
    evidenceList.push({
      source: "Uji Kandidat",
      description: `Menguji ${candidateCount} variasi kandidat satuan pembagi.`,
    });
    narrative = `Siswa secara aktif membandingkan beberapa kandidat satuan (${candidateCount} nilai) untuk mencari pola keteraturan rasio.`;
  } else if (isDiscovered) {
    level = "SUPPORTED_BY_EVIDENCE";
    evidenceList.push({
      source: "Penemuan Keteraturan",
      description: "Menemukan kandidat satuan yang menghasilkan pengelompokan rasio kelipatan bulat.",
    });
    narrative = "Siswa berhasil membuktikan keteraturan rasio bilangan bulat melalui investigasi pengujian kandidat satuan.";

    if (hasScatterExploration || (input.reflection?.transfer?.testedCandidate && input.reflection.transfer.testedCandidate > 0)) {
      level = "TRANSFERABLE";
      evidenceList.push({
        source: "Verifikasi Kontras",
        description: "Menguji alternatif pembanding dan menerapkan penalaran rasio pada situasi transfer.",
      });
      narrative = "Siswa menunjukkan pemahaman mendalam tentang penalaran pola dengan menguji kontras keteraturan dan menerapkannya pada data baru.";
    }
  }

  return {
    dimension: "PATTERN_REASONING",
    level,
    evidence: evidenceList,
    narrative,
    nextInquiry: LEARNING_DIMENSIONS.PATTERN_REASONING.inquiryGuidingPrompt,
  };
}

/**
 * Builds the independent insight for the CONCEPTUAL_EXPLANATION dimension.
 */
function evaluateConceptualExplanationDimension(input: LearningJourneyInput): DimensionInsight {
  const conclusion = input.reflection?.studentConclusion;
  const claim = (conclusion?.claim || conclusion?.pattern || "").trim();
  const evidence = (conclusion?.evidence || conclusion?.strongestEvidence || "").trim();
  const reasoning = (conclusion?.reasoning || conclusion?.physicalMeaning || "").trim();
  const combined = `${claim} ${evidence} ${reasoning}`.trim();

  const evidenceEval = evaluateEvidenceQuality(combined);
  const evidenceList: DimensionEvidence[] = [];
  let level: QualitativeLevel = "NOT_YET_VISIBLE";
  let narrative = "Siswa belum menyusun penjelasan atau kesimpulan konseptual tertulis.";

  const hasClaim = claim.length > 0;
  const hasEvidence = evidence.length > 0;
  const hasReasoning = reasoning.length > 0;
  const isCompleteCER = hasClaim && hasEvidence && hasReasoning;

  if (!combined) {
    level = "NOT_YET_VISIBLE";
  } else if (isCompleteCER || evidenceEval.strongestLevel === "REASONED_CONNECTION") {
    level = "SUPPORTED_BY_EVIDENCE";
    evidenceList.push({
      source: "Struktur CER Lengkap",
      description: "Menghubungkan klaim, data numerik, dan penalaran fisis secara koheren.",
    });
    narrative = "Siswa mampu menyusun penjelasan ilmiah mandiri yang menghubungkan bukti rasio teratur dengan konsep kuantisasi partikel materi.";

    if (reasoning.length > 60) {
      level = "TRANSFERABLE";
      evidenceList.push({
        source: "Penalaran Kausal Mendalam",
        description: "Mengartikulasikan makna fisis kuantisasi (tangkapan partikel diskret elektron) secara tuntas.",
      });
      narrative = "Siswa menunjukkan penguasaan eksplanasi saintifik yang utuh dan mampu mengartikulasikan mekanisme fisis di balik pola teramati.";
    }
  } else if (evidenceEval.strongestLevel === "OBSERVATION" || evidenceEval.strongestLevel === "DATA_REFERENCE" || (hasClaim && hasEvidence)) {
    level = "DEVELOPING";
    evidenceList.push({
      source: "Observasi & Data",
      description: "Menyertakan rujukan pengamatan data numerik dalam kesimpulannya.",
    });
    narrative = "Siswa mulai memadukan rujukan data dengan klaimnya dan sedang mengembangkan penalaran fisis sebab-akibat.";
  } else {
    level = "EMERGING";
    evidenceList.push({
      source: "Artikulasi Klaim",
      description: "Menyatakan gagasan konseptual awal tanpa menyertakan bukti numerik pendukung.",
    });
    narrative = "Siswa telah menyatakan klaim tentang sifat muatan, namun belum menghubungkannya dengan data empiris.";
  }

  return {
    dimension: "CONCEPTUAL_EXPLANATION",
    level,
    evidence: evidenceList,
    narrative,
    nextInquiry: LEARNING_DIMENSIONS.CONCEPTUAL_EXPLANATION.inquiryGuidingPrompt,
  };
}

/**
 * Builds the independent insight for the MODEL_TRANSFER dimension.
 */
function evaluateModelTransferDimension(input: LearningJourneyInput): DimensionInsight {
  const transfer = input.reflection?.transfer;
  const transferEval = evaluateTransferReasoning(transfer || {});

  const evidenceList: DimensionEvidence[] = [];
  let level: QualitativeLevel = "NOT_YET_VISIBLE";
  let narrative = "Siswa belum mencoba tantangan transfer pada skenario data independen.";

  if (transferEval.signals.length === 0) {
    level = "NOT_YET_VISIBLE";
  } else if (transferEval.signals.includes("PREMATURE_CONCLUSION") && transferEval.signals.length === 1) {
    level = "EMERGING";
    evidenceList.push({
      source: "Respons Transfer",
      description: "Menarik kesimpulan awal tanpa menyertakan verifikasi bukti data.",
    });
    narrative = "Siswa telah merespons skenario transfer, namun cenderung menarik kesimpulan definitif sebelum meneliti bukti.";
  } else if (transferEval.signals.includes("RELATION_NOTICE") && !transferEval.signals.includes("PROPOSES_VERIFICATION") && !transferEval.signals.includes("ACKNOWLEDGES_UNCERTAINTY")) {
    level = "DEVELOPING";
    evidenceList.push({
      source: "Deteksi Pola Baru",
      description: "Memperhatikan kemungkinan keteraturan pada data baru.",
    });
    narrative = "Siswa mengenali potensi pola keteraturan pada set data baru dan sedang mengembangkan kemampuan menguji anomali.";
  } else if (transferEval.signals.includes("DATA_REFERENCE") && (transferEval.signals.includes("PROPOSES_VERIFICATION") || transferEval.signals.includes("ACKNOWLEDGES_UNCERTAINTY"))) {
    level = "SUPPORTED_BY_EVIDENCE";
    evidenceList.push({
      source: "Penalaran Transfer Saintifik",
      description: "Menggunakan data konkret dan mengakui batas ketidakpastian atau mengusulkan verifikasi lanjutan.",
    });
    narrative = "Siswa menerapkan logika kuantisasi pada data baru dan menunjukkan skeptisisme saintifik yang sehat terhadap anomali data.";

    if (transferEval.signals.includes("ACKNOWLEDGES_UNCERTAINTY") && transferEval.signals.includes("PROPOSES_VERIFICATION")) {
      level = "TRANSFERABLE";
      evidenceList.push({
        source: "Inkuiri Saintifik Lanjutan",
        description: "Menggabungkan pengakuan ketidakpastian data dengan proposal verifikasi eksperimen lanjutan.",
      });
      narrative = "Siswa siap menerapkan kerangka berpikir inkuiri pada persoalan baru: tidak memaksakan kesimpulan dan tahu kapan data memerlukan pengujian ulang.";
    }
  } else {
    level = "DEVELOPING";
    narrative = transferEval.narrative;
  }

  return {
    dimension: "MODEL_TRANSFER",
    level,
    evidence: evidenceList,
    narrative,
    nextInquiry: LEARNING_DIMENSIONS.MODEL_TRANSFER.inquiryGuidingPrompt,
  };
}

/**
 * Builds the independent insight for the METACOGNITIVE_AWARENESS dimension.
 */
function evaluateMetacognitiveAwarenessDimension(input: LearningJourneyInput): DimensionInsight {
  const pred = input.prediction;
  const meta = input.reflection?.metacognition;
  const revisit = input.reflection?.confidenceRevisit;

  const hasInitialConfidence = typeof pred?.confidence === "number";
  const hasCurrentConfidence = typeof revisit?.currentConfidence === "number";
  const reasonForChange = (revisit?.reasonForChange || "").trim();
  const thinkingChange = (meta?.thinkingChange || "").trim();
  const remainingQuestion = (meta?.remainingQuestion || "").trim();

  const evidenceList: DimensionEvidence[] = [];
  let level: QualitativeLevel = "NOT_YET_VISIBLE";
  let narrative = "Siswa belum merefleksikan perubahan cara berpikir atau keyakinannya.";

  if (!hasInitialConfidence && !thinkingChange && !reasonForChange) {
    level = "NOT_YET_VISIBLE";
  } else if (hasInitialConfidence && !thinkingChange && !reasonForChange) {
    level = "EMERGING";
    evidenceList.push({
      source: "Dugaan Awal",
      description: `Mencatat tingkat keyakinan awal sebesar ${pred?.confidence}/5.`,
    });
    narrative = "Siswa telah mencatat keyakinan awal dan belum merefleksikan kembali pengaruh data terhadap pemikirannya.";
  } else if (hasCurrentConfidence && (reasonForChange.length >= 10 || thinkingChange.length >= 10)) {
    level = "DEVELOPING";
    evidenceList.push({
      source: "Refleksi Keyakinan",
      description: `Mengevaluasi keyakinan (${pred?.confidence || 3} → ${revisit?.currentConfidence}) dengan catatan alasan.`,
    });
    narrative = "Siswa menyadari pergeseran pemikiran dan keyakinan setelah menelaah hasil eksperimen.";

    const evidenceQualityOfReflection = evaluateEvidenceQuality(`${reasonForChange} ${thinkingChange}`);
    if (evidenceQualityOfReflection.strongestLevel === "DATA_REFERENCE" || evidenceQualityOfReflection.strongestLevel === "REASONED_CONNECTION") {
      level = "SUPPORTED_BY_EVIDENCE";
      evidenceList.push({
        source: "Identifikasi Bukti Kunci",
        description: "Menyebutkan bukti data konkret yang secara spesifik mengubah pemikiran awalnya.",
      });
      narrative = "Siswa mampu mengidentifikasi secara eksplisit bagian bukti mana yang menantang dan mengubah dugaan awalnya.";

      if (remainingQuestion.length >= 10) {
        level = "TRANSFERABLE";
        evidenceList.push({
          source: "Keingintahuan Berkelanjutan",
          description: `Merumuskan pertanyaan ilmiah lanjutan: "${remainingQuestion}".`,
        });
        narrative = "Siswa memiliki kesadaran metakognitif yang matang: memahami batas pengetahuannya dan memelihara rasa ingin tahu ilmiah untuk investigasi selanjutnya.";
      }
    }
  } else {
    level = "EMERGING";
  }

  return {
    dimension: "METACOGNITIVE_AWARENESS",
    level,
    evidence: evidenceList,
    narrative,
    nextInquiry: LEARNING_DIMENSIONS.METACOGNITIVE_AWARENESS.inquiryGuidingPrompt,
  };
}

/**
 * Pure function: Builds the complete multidimensional LearningOutcomeProfile.
 * Completely deterministic, zero scores, zero rankings, zero dependencies.
 */
export function buildOutcomeProfile(input: LearningJourneyInput): LearningOutcomeProfile {
  const safeInput: LearningJourneyInput = input || {};

  const dimensions: Record<LearningDimension, DimensionInsight> = {
    EVIDENCE_READING: evaluateEvidenceReadingDimension(safeInput),
    PATTERN_REASONING: evaluatePatternReasoningDimension(safeInput),
    CONCEPTUAL_EXPLANATION: evaluateConceptualExplanationDimension(safeInput),
    MODEL_TRANSFER: evaluateModelTransferDimension(safeInput),
    METACOGNITIVE_AWARENESS: evaluateMetacognitiveAwarenessDimension(safeInput),
  };

  const conceptualChange = evaluateConceptualChange({
    prediction: safeInput.prediction,
    trials: safeInput.trials,
    patternHistory: safeInput.patternHistory,
    discovery: safeInput.discovery,
    reflection: safeInput.reflection,
  });

  return {
    dimensions,
    conceptualChange,
    generatedAt: new Date().toISOString(),
  };
}
