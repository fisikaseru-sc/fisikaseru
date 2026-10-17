// ============================================================
// FISIKASERU — ANSWER VISIBILITY GUARDRAILS
// SPRINT F: Strict Anti-Answer Leakage Protocol
// ============================================================

import { ConceptualProgressStage } from "../intelligence/learningTypes";
import { AnswerVisibility } from "./types";

/**
 * Determines what scientific knowledge the AI is allowed to mention
 * based on the student's current discovery progress.
 * Prevents premature textbook answer leakage.
 */
export function determineAnswerVisibility(
  stage: ConceptualProgressStage = "EXPOSURE",
  isFormalized: boolean = false
): AnswerVisibility {
  // Stages before Pattern Formalization
  if (!isFormalized && (stage === "EXPOSURE" || stage === "INVESTIGATION")) {
    return {
      canMentionQuantization: false,
      canMentionElectronCharge: false,
      canMentionElectronSymbolE: false,
      allowedKnowledge: [
        "Data waktu jatuh (tf) dan waktu naik (tr) tetesan minyak",
        "Tegangan penyeimbang pelat logam (V)",
        "Perhitungan muatan mentah tiap tetesan",
        "Pengujian kandidat satuan pembagi",
        "Persebaran rasio pada garis bilangan",
      ],
      restrictedKnowledge: [
        "DILARANG menyebutkan nilai muatan elektron standar (1.602 × 10⁻¹⁹ C)",
        "DILARANG menyebutkan rumus kanonikal q = n × e",
        "DILARANG menggunakan simbol konstanta dasar 'e' sebelum siswa menemukannya sendiri",
        "DILARANG memberikan kesimpulan langsung tentang sifat kuantisasi",
      ],
    };
  }

  // Stages during Pattern Recognition
  if (stage === "PATTERN_RECOGNITION" && !isFormalized) {
    return {
      canMentionQuantization: true,
      canMentionElectronCharge: false,
      canMentionElectronSymbolE: false,
      allowedKnowledge: [
        "Keteraturan rasio hasil bagi yang berulang mendekati bilangan bulat (1, 2, 3...)",
        "Gagasan tentang adanya 'satuan dasar terkecil' yang berulang",
        "Perbandingan antara model fluida kontinu vs paket-paket diskret",
      ],
      restrictedKnowledge: [
        "DILARANG menyebutkan angka referensi baku CODATA / NIST (1.602 × 10⁻¹⁹ C)",
        "DILARANG menyelesaikan kesimpulan mandiri siswa untuk mereka",
      ],
    };
  }

  // Formalized Stages (Reflection, Transfer, Synthesis)
  return {
    canMentionQuantization: true,
    canMentionElectronCharge: true,
    canMentionElectronSymbolE: true,
    allowedKnowledge: [
      "Prinsip kuantisasi muatan listrik q = n × e",
      "Muatan elementer e yang diukur dari data tetesan siswa",
      "Partikel elektron sebagai pembawa paket muatan diskret",
      "Aplikasi prinsip kelipatan bulat pada skenario eksperimen baru",
    ],
    restrictedKnowledge: [
      "DILARANG menggurui dengan ceramah teoritis panjang tanpa melibatkan penalaran siswa",
      "DILARANG mendiskreditkan jawaban transfer siswa secara sepihak",
      "DILARANG memberikan jawaban akhir atas pertanyaan keingintahuan siswa secara dogmatis",
    ],
  };
}
