// ============================================================
// FISIKASERU — SPRINT G1: EVIDENCE QUALITY EVALUATOR
// Deterministic Structural Heuristics (Zero AI / Zero External NLP)
// ============================================================

import { EvidenceEvaluation, EvidenceQuality, EvidenceSignal } from "./types";

/**
 * Pattern dictionaries for structural heuristics.
 * Independent of AI, fully deterministic and reproducible.
 */
const CLAIM_PATTERNS = [
  /diskret/i,
  /kontinu/i,
  /terkuantisasi/i,
  /kuantisasi/i,
  /kelipatan/i,
  /satuan\s+(dasar|terkecil|fundamental)/i,
  /paket/i,
  /elektron/i,
  /tersusun/i,
  /terdiri\s+dari/i,
  /tidak\s+acak/i,
  /memiliki\s+pola/i,
  /ada\s+hubungan/i,
  /hubungan\s+antar/i,
  /aturan\s+tertentu/i,
];

const OBSERVATION_PATTERNS = [
  /melihat/i,
  /tampak/i,
  /terlihat/i,
  /mengamati/i,
  /pengamatan/i,
  /menemukan/i,
  /muncul/i,
  /observasi/i,
  /memperhatikan/i,
];

const DATA_PATTERNS = [
  /\b\d+(\.\d+)?\b/,
  /rasio/i,
  /hasil\s+bagi/i,
  /pembagian/i,
  /dibagi/i,
  /selisih/i,
  /kandidat/i,
  /kelipatan\s+bulat/i,
  /bilangan\s+bulat/i,
  /tetes(an)?\s+[a-z0-9]/i,
  /deviasi/i,
  /tabel/i,
  /grafik/i,
];

const CAUSAL_CONNECTORS = [
  /karena/i,
  /sehingga/i,
  /maka/i,
  /artinya/i,
  /menunjukkan\s+bahwa/i,
  /membuktikan\s+bahwa/i,
  /oleh\s+karena\s+itu/i,
  /dapat\s+disimpulkan/i,
  /menandakan/i,
  /berdasarkan\s+hal\s+tersebut/i,
  /akibatnya/i,
];

const UNCERTAINTY_PATTERNS = [
  /belum\s+(cukup\s+)?yakin/i,
  /ragu/i,
  /menyimpang/i,
  /anomali/i,
  /galat/i,
  /ketidakpastian/i,
  /masih\s+perlu/i,
  /belum\s+bisa\s+disimpulkan/i,
  /kemungkinan/i,
  /kurang\s+data/i,
  /uji\s+ulang/i,
];

/**
 * Evaluates the structural quality of student's evidence and argumentation.
 * Pure deterministic function without side-effects or external dependencies.
 */
export function evaluateEvidenceQuality(rawText: string | null | undefined): EvidenceEvaluation {
  const text = (rawText || "").trim();

  if (!text) {
    return {
      strongestLevel: "ASSERTION",
      signals: [],
      explanation: "Belum ada tanggapan atau teks kosong.",
    };
  }

  const signals: EvidenceSignal[] = [];

  // 1. Check claim signal
  const hasClaim = CLAIM_PATTERNS.some((p) => p.test(text));
  if (hasClaim) {
    signals.push("HAS_CLAIM");
  }

  // 2. Check observation signal
  const mentionsObservation = OBSERVATION_PATTERNS.some((p) => p.test(text));
  if (mentionsObservation) {
    signals.push("MENTIONS_OBSERVATION");
  }

  // 3. Check data reference signal
  const referencesData = DATA_PATTERNS.some((p) => p.test(text));
  if (referencesData) {
    signals.push("REFERENCES_DATA");
  }

  // 4. Check uncertainty acknowledgement
  const acknowledgesUncertainty = UNCERTAINTY_PATTERNS.some((p) => p.test(text));
  if (acknowledgesUncertainty) {
    signals.push("ACKNOWLEDGES_UNCERTAINTY");
  }

  // 5. Check reasoned connection (Must link data/observation with claim via causal connector)
  const hasCausalConnector = CAUSAL_CONNECTORS.some((p) => p.test(text));
  const connectsEvidenceToClaim = hasCausalConnector && (referencesData || mentionsObservation) && (hasClaim || text.length >= 40);

  if (connectsEvidenceToClaim) {
    signals.push("CONNECTS_EVIDENCE_TO_CLAIM");
  }

  // Determine strongest qualitative level
  let strongestLevel: EvidenceQuality = "ASSERTION";
  let explanation = "Respons menyatakan klaim atau pernyataan tanpa menyertakan rujukan bukti konkret.";

  if (connectsEvidenceToClaim && (referencesData || mentionsObservation)) {
    strongestLevel = "REASONED_CONNECTION";
    explanation = "Respons menghubungkan pengamatan pola empiris dengan kesimpulan fisis secara logis dan terstruktur.";
  } else if (referencesData) {
    strongestLevel = "DATA_REFERENCE";
    explanation = "Respons merujuk data observasi konkret atau keteraturan nilai numerik secara spesifik.";
  } else if (mentionsObservation) {
    strongestLevel = "OBSERVATION";
    explanation = "Respons menyebutkan pengamatan fenomena atau pola yang tampak secara umum.";
  }

  return {
    strongestLevel,
    signals,
    explanation,
  };
}
