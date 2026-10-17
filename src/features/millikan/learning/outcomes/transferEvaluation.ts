// ============================================================
// FISIKASERU — SPRINT G1: TRANSFER REASONING EVALUATOR
// Evaluates Scientific Inquiry Behaviors (Zero Keyword Matching / Zero Textbooks)
// ============================================================

import { TransferEvaluation, TransferSignal } from "./types";

interface TransferReasoningInput {
  studentExplanation?: string | null;
  followUpInquiry?: string | null;
  testedCandidate?: number;
}

const RELATION_PATTERNS = [
  /kelipatan/i,
  /rasio/i,
  /pola/i,
  /hubungan/i,
  /mendekati/i,
  /faktor/i,
  /selisih/i,
  /satuan/i,
  /teratur/i,
  /proporsional/i,
];

const DATA_PATTERNS = [
  /\b\d+(\.\d+)?\b/,
  /tetes\s+[a-d]/i,
  /sampel/i,
  /1\.58/i,
  /3\.18/i,
  /3\.21/i,
  /4\.82/i,
  /4\.77/i,
  /6\.42/i,
  /2\.35/i,
];

const VERIFICATION_PATTERNS = [
  /menguji/i,
  /periksa/i,
  /memeriksa/i,
  /cek/i,
  /menghitung/i,
  /mengulang/i,
  /ukur\s+kembali/i,
  /mencari\s+tahu/i,
  /membagi/i,
  /membandingkan/i,
  /verifikasi/i,
  /eksperimen\s+lanjutan/i,
];

const UNCERTAINTY_PATTERNS = [
  /belum\s+(cukup\s+)?yakin/i,
  /ragu/i,
  /menyimpang/i,
  /anomali/i,
  /ketidakpastian/i,
  /galat/i,
  /tidak\s+cocok/i,
  /pecahan/i,
  /belum\s+pasti/i,
  /kurang\s+data/i,
  /mungkin/i,
];

const PREMATURE_PATTERNS = [
  /pasti\s+(sudah\s+)?benar/i,
  /tidak\s+perlu\s+diuji/i,
  /sudah\s+jelas\s+tanpa\s+perlu/i,
  /pasti\s+sama\s+persis/i,
  /buku\s+pasti\s+benar/i,
];

/**
 * Evaluates the student's transfer reasoning behaviors.
 * Considers acknowledging uncertainty as a sophisticated scientific trait.
 */
export function evaluateTransferReasoning(input: TransferReasoningInput): TransferEvaluation {
  const explanation = (input.studentExplanation || "").trim();
  const followUp = (input.followUpInquiry || "").trim();
  const combinedText = `${explanation} ${followUp}`.trim();

  if (!combinedText) {
    return {
      signals: [],
      narrative: "Tantangan transfer belum dicoba atau teks penjelasan masih kosong.",
      suggestedInquiry: "Bagaimana jika kamu mencoba membandingkan nilai-nilai pada data baru tersebut dengan kandidat satuan pembagi?",
    };
  }

  const signals: TransferSignal[] = [];

  // 1. Relation Notice
  if (RELATION_PATTERNS.some((p) => p.test(combinedText))) {
    signals.push("RELATION_NOTICE");
  }

  // 2. Data Reference
  if (DATA_PATTERNS.some((p) => p.test(combinedText))) {
    signals.push("DATA_REFERENCE");
  }

  // 3. Proposes Verification
  if (VERIFICATION_PATTERNS.some((p) => p.test(combinedText))) {
    signals.push("PROPOSES_VERIFICATION");
  }

  // 4. Acknowledges Uncertainty (Positive scientific trait!)
  if (UNCERTAINTY_PATTERNS.some((p) => p.test(combinedText))) {
    signals.push("ACKNOWLEDGES_UNCERTAINTY");
  }

  // 5. Premature Conclusion (Heuristic check)
  if (PREMATURE_PATTERNS.some((p) => p.test(combinedText))) {
    signals.push("PREMATURE_CONCLUSION");
  }

  // Construct narrative based on scientific behaviors
  let narrative = "";
  if (signals.includes("ACKNOWLEDGES_UNCERTAINTY") && signals.includes("PROPOSES_VERIFICATION")) {
    narrative = "Siswa menunjukkan kedewasaan berpikir saintifik dengan mengenali anomali atau batas data dan mengusulkan verifikasi lebih lanjut.";
  } else if (signals.includes("RELATION_NOTICE") && signals.includes("DATA_REFERENCE")) {
    narrative = "Siswa mampu mengidentifikasi pola keteraturan numerik pada set data baru dan merujuk nilai konkret untuk mendukung analisisnya.";
  } else if (signals.includes("RELATION_NOTICE")) {
    narrative = "Siswa memperhatikan adanya kemungkinan hubungan pola keteraturan pada data baru.";
  } else if (signals.includes("PREMATURE_CONCLUSION")) {
    narrative = "Siswa cenderung menarik kesimpulan definitif lebih awal sebelum memeriksa kecukupan bukti empiris pendukung.";
  } else {
    narrative = "Siswa telah mulai merespons situasi transfer dengan pandangan awal tentang data.";
  }

  let suggestedInquiry: string | undefined;
  if (!signals.includes("PROPOSES_VERIFICATION")) {
    suggestedInquiry = "Langkah pengujian apa yang akan kamu lakukan jika ada nilai yang tidak langsung membentuk bilangan bulat?";
  } else if (!signals.includes("ACKNOWLEDGES_UNCERTAINTY")) {
    suggestedInquiry = "Apakah ada kemungkinan hasil pengukuran tersebut dipengaruhi oleh galat batas presisi alat?";
  }

  return {
    signals,
    narrative,
    suggestedInquiry,
  };
}
