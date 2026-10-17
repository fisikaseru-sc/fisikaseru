// ============================================================
// FISIKASERU — MILLIKAN LEARNING INTELLIGENCE EVALUATOR
// SPRINT E: Deterministic Conceptual Progress & Evidence Engine
// ============================================================

import {
  MillikanLearningSignals,
  MillikanConceptualEvaluation,
  ConceptualProgressStage,
  EvidenceQualityLevel,
  PossibleConceptualSignal,
  CERArticulationEvaluation,
} from "./learningTypes";

/**
 * Evaluates student scientific articulation using the Claim-Evidence-Reasoning (CER) framework.
 * Transparent heuristic: no AI dependency, no arbitrary character counts.
 */
export function analyzeCERArticulation(
  claim: string,
  evidence: string,
  reasoning: string
): CERArticulationEvaluation {
  const cleanClaim = (claim || "").trim().toLowerCase();
  const cleanEvidence = (evidence || "").trim().toLowerCase();
  const cleanReasoning = (reasoning || "").trim().toLowerCase();

  // 1. Claim Detection: Does student state an assertive finding / relationship?
  const claimKeywords = [
    "muatan", "kelipatan", "paket", "terkuantisasi", "diskret", "satuan",
    "sama", "berbeda", "pola", "elektron", "nilai", "teratur", "kelipatan bulat",
    "fundamental", "terbagi", "membentuk", "tetap"
  ];
  const hasClaim = cleanClaim.length >= 10 && claimKeywords.some((k) => cleanClaim.includes(k));

  // 2. Evidence Detection: Does student cite observations, data, numbers, or ratios?
  const evidenceKeywords = [
    "tetes", "data", "angka", "rasio", "hasil bagi", "pembagian", "1", "2", "3", "4",
    "bilangan bulat", "garis bilangan", "deviasi", "eksperimen", "tabel", "titik",
    "mendekati", "berkumpul", "1.6", "posisi", "seimbang"
  ];
  const hasEvidence = cleanEvidence.length >= 10 && evidenceKeywords.some((k) => cleanEvidence.includes(k));

  // 3. Reasoning Detection: Does student provide connective causal/logical reasoning?
  const reasoningConnectives = [
    "karena", "sehingga", "maka", "artinya", "menunjukkan", "disebabkan",
    "membuktikan", "berarti", "alasannya", "oleh sebab itu", "menandakan",
    "menggambarkan bahwa", "hubungan antara"
  ];
  const hasReasoning = cleanReasoning.length >= 10 && reasoningConnectives.some((k) => cleanReasoning.includes(k));

  const isCompleteCER = hasClaim && hasEvidence && hasReasoning;

  let overallStatusDescription = "Sedang Merumuskan Penjelasan";
  if (isCompleteCER) {
    overallStatusDescription = "Menjelaskan dengan Bukti Lengkap (Klaim + Bukti + Penalaran)";
  } else if (hasClaim && hasEvidence) {
    overallStatusDescription = "Klaim & Bukti Lengkap (Perlu memperdalam penalaran sebab-akibat)";
  } else if (hasClaim) {
    overallStatusDescription = "Klaim Dinyatakan (Perlu menambahkan rujukan bukti data konkret)";
  } else if (hasEvidence) {
    overallStatusDescription = "Menyajikan Bukti (Perlu menegaskan kesimpulan utama/klaim)";
  }

  return {
    hasClaim,
    hasEvidence,
    hasReasoning,
    isCompleteCER,
    claimFeedback: hasClaim
      ? "Pernyataan klaim teridentifikasi dengan baik."
      : "Cobalah nyatakan dengan lugas apa kesimpulan utamamu tentang sifat muatan tetesan.",
    evidenceFeedback: hasEvidence
      ? "Rujukan bukti data pengamatan laboratorium disertakan."
      : "Sertakan bukti konkret dari data (misalnya: hasil pembagian atau posisi rasio pada garis bilangan).",
    reasoningFeedback: hasReasoning
      ? "Penalaran penghubung sebab-akibat terartikulasi."
      : "Gunakan kata penghubung seperti 'karena' atau 'sehingga' untuk menjelaskan mengapa data tersebut mendukung klaimmu.",
    overallStatusDescription,
  };
}

/**
 * Identifies possible conceptual signals (misconceptions) respectfully.
 * Never diagnoses a student as "wrong"; frames observations as productive thinking paths.
 */
export function detectPossibleConceptualSignals(
  signals: MillikanLearningSignals
): PossibleConceptualSignal[] {
  const detected: PossibleConceptualSignal[] = [];
  const textCorpus = `${signals.articulation.claim} ${signals.articulation.evidence} ${signals.articulation.reasoning} ${signals.prediction.reasoning || ""}`.toLowerCase();

  // Signal A: All droplets should have identical charge
  const mentionsAllIdentical = textCorpus.includes("semua tetes bernilai sama") ||
    textCorpus.includes("muatannya harus sama") ||
    textCorpus.includes("nilai q identik");
  if (signals.prediction.hypothesis === "ALL_SAME" && mentionsAllIdentical) {
    detected.push({
      code: "ALL_DROPLETS_IDENTICAL",
      title: "Dugaan Muatan Identik pada Setiap Tetesan",
      description: "Data pengamatan menunjukkan nilai muatan yang berbeda antar tetesan, namun semuanya merupakan kelipatan dari satuan dasar yang sama.",
      constructivePrompt: "Tetesan minyak memiliki ukuran berbeda sehingga dapat menangkap 1, 2, atau 3 elektron sekaligus. Bagaimana jika perbedaan muatan ini berasal dari jumlah elektron yang terikat?",
    });
  }

  // Signal B: Charge is completely random
  const mentionsRandomCoincidence = textCorpus.includes("kebetulan saja") ||
    textCorpus.includes("acak sembarang") ||
    textCorpus.includes("tidak ada aturan");
  if (signals.prediction.hypothesis === "COMPLETELY_RANDOM" && mentionsRandomCoincidence && !signals.discovery.patternObserved) {
    detected.push({
      code: "CHARGE_COMPLETELY_RANDOM",
      title: "Kesan Keacakan Nilai Desimal",
      description: "Nilai muatan mentah memiliki angka desimal beragam, yang sekilas dapat tampak seperti bilangan acak.",
      constructivePrompt: "Coba amati hasil bagi setiap nilai terhadap kandidat satuan dasar. Mengapa hasilnya berkali-kali mendekati bilangan bulat dan tidak jatuh di angka bebas seperti 1.37 atau 2.84?",
    });
  }

  // Signal C: Experimental values must be perfect (Rejection of 1.99 because not 2.00)
  const mentionsPerfection = textCorpus.includes("tidak tepat 2") ||
    textCorpus.includes("harus bulat persis") ||
    textCorpus.includes("bukan tepat 2.00");
  if (mentionsPerfection) {
    detected.push({
      code: "PERFECTION_BIAS",
      title: "Ekspektasi Kepresisian Tanpa Galat Eksperimen",
      description: "Dalam eksperimen fisika nyata, gerak Brown dan ketidakpastian pembacaan mikroskop selalu menghasilkan sedikit fluktuasi pengukuran.",
      constructivePrompt: "Mengapa dalam pengukuran ilmiah empiris, deviasi kecil (seperti 1.98 atau 2.02) tetap menjadi bukti sangat kuat untuk kelipatan bilangan bulat 2?",
    });
  }

  // Signal D: Textbook value anchor bias (Repeatedly forcing 1.60 without exploring alternatives)
  const onlyTestedTextbook = signals.investigation.candidatesTested === 1 &&
    signals.investigation.candidateHistory.length === 1 &&
    Math.abs(signals.investigation.candidateHistory[0].candidate - 1.60) <= 0.05 &&
    !signals.investigation.exploredNonIntegerCandidate;
  if (onlyTestedTextbook) {
    detected.push({
      code: "TEXTBOOK_ANCHOR_BIAS",
      title: "Kecenderungan Berpatokan Langsung pada Nilai Teoretis",
      description: "Kamu langsung memasukkan angka 1.60 tanpa menguji kandidat satuan lain terlebih dahulu.",
      constructivePrompt: "Sebelum menyimpulkan, bagaimana jika kamu mencoba menguji kandidat lain (seperti 1.20 atau 2.40)? Membandingkan pola yang tersebar akan memperjelas mengapa kandidatmu memang yang paling konsisten.",
    });
  }

  // Signal E: Rounding artifact belief (Attributing pattern to UI rounding)
  const mentionsRounding = textCorpus.includes("pembulatan komputer") ||
    textCorpus.includes("dibulatkan oleh sistem") ||
    textCorpus.includes("efek pembulatan");
  if (mentionsRounding) {
    detected.push({
      code: "ROUNDING_ARTIFACT_BELIEF",
      title: "Pertimbangan Efek Pembulatan Perangkat Lunak",
      description: "Pola kelipatan terkadang dicurigai hanya berasal dari pembulatan otomatis angka desimal.",
      constructivePrompt: "Perhatikan rincian tabel: nilai rasio mentah sebelum pembulatan (misalnya 1.991 atau 3.012) sudah berkumpul sangat dekat dengan bilangan bulat. Ini menunjukkan sifat intrinsik data, bukan sekadar tampilan layar.",
    });
  }

  return detected;
}

/**
 * Assesses the qualitative depth of evidence collected.
 */
export function assessEvidenceQuality(signals: MillikanLearningSignals): EvidenceQualityLevel {
  const trials = signals.investigation.trialsCollected;
  const testedCount = signals.investigation.candidatesTested;
  const patternFound = signals.discovery.patternObserved;
  const nearPct = signals.discovery.nearIntegerPercentage ?? 0;

  if (trials >= 5 && patternFound && nearPct >= 80 && (signals.investigation.comparedMultipleCandidates || testedCount >= 2)) {
    return "STRONG_CONCEPTUAL_EVIDENCE";
  }
  if (trials >= 5 && patternFound && nearPct >= 70) {
    return "CONSISTENT_PATTERN";
  }
  if (trials >= 3 && testedCount >= 1) {
    return "EMERGING_PATTERN";
  }
  return "LIMITED_EVIDENCE";
}

/**
 * Pure evaluation function mapping student signals into qualitative conceptual stages.
 * Deterministic and UI-independent.
 */
export function evaluateMillikanLearningState(
  signals: MillikanLearningSignals
): MillikanConceptualEvaluation {
  const cer = analyzeCERArticulation(
    signals.articulation.claim,
    signals.articulation.evidence,
    signals.articulation.reasoning
  );

  const evidenceQuality = assessEvidenceQuality(signals);
  const possibleConceptualSignals = detectPossibleConceptualSignals(signals);

  // Determine Conceptual Stage
  let stage: ConceptualProgressStage = "EXPOSURE";
  let stageLabel = "Tahap 1: Pengenalan Fenomena";
  let stageNarrative = "Siswa telah melihat fenomena tetesan minyak melayang dan mengumpulkan data awal.";

  if (signals.transfer?.attempted && signals.transfer.studentExplanation.trim().length >= 15) {
    stage = "TRANSFER_READY";
    stageLabel = "Tahap 5: Penerapan Konsep (Transfer of Understanding)";
    stageNarrative = "Siswa mampu mengaplikasikan prinsip kuantisasi muatan ke skenario eksperimen baru di luar data aslinya.";
  } else if (cer.isCompleteCER || (cer.hasClaim && cer.hasEvidence && evidenceQuality === "STRONG_CONCEPTUAL_EVIDENCE")) {
    stage = "CONCEPTUAL_EXPLANATION";
    stageLabel = "Tahap 4: Penjelasan Konseptual Berbasis Bukti";
    stageNarrative = "Siswa mampu menjelaskan alasan di balik pola muatan menggunakan struktur Klaim-Bukti-Penalaran.";
  } else if (signals.discovery.patternObserved) {
    stage = "PATTERN_RECOGNITION";
    stageLabel = "Tahap 3: Pengenalan Struktur Pola";
    stageNarrative = "Siswa telah mengenali keteraturan pengelompokan rasio pada garis bilangan.";
  } else if (signals.investigation.candidatesTested >= 1 || signals.investigation.trialsCollected >= 3) {
    stage = "INVESTIGATION";
    stageLabel = "Tahap 2: Investigasi & Pengujian Hipotesis";
    stageNarrative = "Siswa aktif menguji kandidat satuan dan membandingkan perilaku rasio.";
  }

  // Determine Recommended Adaptive Support
  let recommendedSupport: MillikanConceptualEvaluation["recommendedSupport"] = {
    type: "OBSERVATION",
    prompt: "Amati bagaimana nilai-nilai muatan tersebar pada tabel sebelum memilih kandidat satuan.",
    actionLabel: "Periksa Tabel Data",
  };

  if (stage === "TRANSFER_READY") {
    recommendedSupport = {
      type: "TRANSFER_CHALLENGE",
      prompt: "Pemahamanmu sangat kokoh. Siap meneliti kasus data yang memiliki nilai anomali (misalnya muatan pecahan kuark)?",
      actionLabel: "Tantangan Lanjutan",
    };
  } else if (stage === "CONCEPTUAL_EXPLANATION") {
    recommendedSupport = {
      type: "TRANSFER_CHALLENGE",
      prompt: "Kamu sudah mampu menjelaskan bukti dengan sangat baik. Uji pemahamanmu pada skenario eksperimen baru dari peneliti lain!",
      actionLabel: "Mulai Uji Transfer",
    };
  } else if (stage === "PATTERN_RECOGNITION") {
    if (!cer.isCompleteCER) {
      recommendedSupport = {
        type: "CONCEPTUAL_QUESTION",
        prompt: "Kamu telah menemukan keteraturan rasio. Sekarang, bagaimana kamu merumuskannya ke dalam kalimat ilmiah: apa klaimmu, apa buktinya, dan apa alasannya?",
        actionLabel: "Rumuskan Kesimpulan Mandiri",
      };
    } else {
      recommendedSupport = {
        type: "TRANSFER_CHALLENGE",
        prompt: "Mari uji apakah prinsip satuan dasar ini juga berlaku pada kumpulan data baru.",
        actionLabel: "Uji Pemahaman Baru",
      };
    }
  } else if (stage === "INVESTIGATION") {
    if (signals.investigation.candidatesTested <= 1) {
      recommendedSupport = {
        type: "COMPARISON",
        prompt: "Sebelum menarik kesimpulan, coba uji satu kandidat lain (misal 1.20 atau 2.00) untuk membandingkan perbedaannya pada garis bilangan.",
        actionLabel: "Bandingkan Kandidat Lain",
      };
    } else {
      recommendedSupport = {
        type: "EVIDENCE_REMINDER",
        prompt: "Perhatikan kandidat mana yang membuat sebagian besar titik rasio berkumpul sangat dekat dengan bilangan bulat 1, 2, 3...",
        actionLabel: "Periksa Posisi Rasio",
      };
    }
  }

  const qualityLabels: Record<EvidenceQualityLevel, string> = {
    LIMITED_EVIDENCE: "Bukti Terbatas (Perlu lebih banyak observasi)",
    EMERGING_PATTERN: "Pola Mulai Terlihat (Struktur awal muncul)",
    CONSISTENT_PATTERN: "Pola Konsisten (Keteraturan rasio bulat terbukti)",
    STRONG_CONCEPTUAL_EVIDENCE: "Bukti Konseptual Kuat (Menghubungkan data dengan model diskret)",
  };

  return {
    stage,
    stageLabel,
    stageNarrative,
    evidenceQuality,
    evidenceQualityLabel: qualityLabels[evidenceQuality],
    cerEvaluation: cer,
    possibleConceptualSignals,
    recommendedSupport,
  };
}
