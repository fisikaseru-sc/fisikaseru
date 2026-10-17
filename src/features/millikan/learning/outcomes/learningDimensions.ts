// ============================================================
// FISIKASERU — SPRINT G1: LEARNING DIMENSIONS METADATA
// Pure Pedagogical Domain Specifications
// ============================================================

import { LearningDimension, QualitativeLevel } from "./types";

export interface LearningDimensionMetadata {
  id: LearningDimension;
  label: string;
  shortLabel: string;
  description: string;
  observableEvidence: string[];
  inquiryGuidingPrompt: string;
}

export const LEARNING_DIMENSIONS: Record<LearningDimension, LearningDimensionMetadata> = {
  EVIDENCE_READING: {
    id: "EVIDENCE_READING",
    label: "Membaca Bukti Empiris",
    shortLabel: "Membaca Bukti",
    description: "Kemampuan mengidentifikasi dan merujuk data observasi konkret dari bilik eksperimen, serta membedakan dugaan dari fakta empiris.",
    observableEvidence: [
      "Merujuk data pengukuran konkret (kecepatan jatuh/naik atau muatan tetesan)",
      "Memperhatikan variasi nilai antar droplet yang berbeda",
      "Mengakui adanya galat eksperimental tanpa mengabaikan data",
      "Menggunakan data aktual sebagai dasar berargumentasi",
    ],
    inquiryGuidingPrompt: "Data droplet mana yang nilainya paling menonjol bagimu?",
  },
  PATTERN_REASONING: {
    id: "PATTERN_REASONING",
    label: "Menyelidiki Pola & Hubungan Rasio",
    shortLabel: "Menyelidiki Pola",
    description: "Kemampuan menguji kandidat satuan pembagi, membandingkan rasio, dan meneliti keteraturan tanpa menerima kesimpulan secara terburu-buru.",
    observableEvidence: [
      "Menguji lebih dari satu kandidat nilai pembagi",
      "Membandingkan sebaran rasio pada garis bilangan",
      "Menyadari bahwa kandidat tertentu menghasilkan pengelompokan yang lebih teratur",
      "Mengeksplorasi kandidat yang tidak cocok untuk memastikan kontras keteraturan",
    ],
    inquiryGuidingPrompt: "Bagaimana sebaran rasio berubah saat kamu mengganti kandidat satuan pembaginya?",
  },
  CONCEPTUAL_EXPLANATION: {
    id: "CONCEPTUAL_EXPLANATION",
    label: "Menjelaskan Makna Fisis (Klaim-Bukti-Nalar)",
    shortLabel: "Menjelaskan Konsep",
    description: "Kemampuan merangkai klaim ilmiah mandiri yang ditopang oleh bukti numerik spesifik dan penalaran sebab-akibat fisika kuantisasi.",
    observableEvidence: [
      "Menyatakan klaim terkuantisasi dengan kalimat sendiri",
      "Mengaitkan klaim dengan bukti rasio kelipatan bulat",
      "Menjelaskan sebab fisis mengapa muatan tidak kontinu (tangkapan partikel diskret)",
      "Menghindari pengulangan rumus tanpa penjelasan fisis",
    ],
    inquiryGuidingPrompt: "Mengapa bukti rasio kelipatan bulat tersebut mengarah pada kesimpulan bahwa muatan memiliki batas terkecil?",
  },
  MODEL_TRANSFER: {
    id: "MODEL_TRANSFER",
    label: "Menerapkan pada Konteks Baru",
    shortLabel: "Aplikasi Data Baru",
    description: "Kemampuan menerapkan cara berpikir kuantisasi pada data independen baru serta mengakui anomali dan ketidakpastian secara saintifik.",
    observableEvidence: [
      "Menguji rasio pada set data peneliti independen",
      "Menemukan pola kelipatan tanpa mengandalkan hafalan rumus baku",
      "Mengidentifikasi anomali data (misal: nilai pecahan ganjil)",
      "Mengusulkan verifikasi ulang ketika bukti belum mencukupi (skeptisisme saintifik)",
    ],
    inquiryGuidingPrompt: "Jika ada data yang tidak pas dengan kelipatan bulat, investigasi apa yang akan kamu lakukan selanjutnya?",
  },
  METACOGNITIVE_AWARENESS: {
    id: "METACOGNITIVE_AWARENESS",
    label: "Kesadaran Metakognitif",
    shortLabel: "Refleksi Diri",
    description: "Kemampuan menyadari bagaimana data eksperimen mengubah cara berpikir awal, mengevaluasi tingkat keyakinan, dan memelihara rasa ingin tahu.",
    observableEvidence: [
      "Mengartikulasikan perbedaan antara dugaan awal dan kenyataan data",
      "Menjelaskan bagian bukti mana yang memicu perubahan pemikiran",
      "Menilai kembali keyakinan secara objektif",
      "Menyampaikan pertanyaan lanjutan yang masih mengundang rasa ingin tahu",
    ],
    inquiryGuidingPrompt: "Bagian data mana yang paling menantang pemikiranmu sebelum melakukan eksperimen?",
  },
};

export const QUALITATIVE_LEVEL_LABELS: Record<QualitativeLevel, { label: string; description: string; indicatorIndex: number }> = {
  NOT_YET_VISIBLE: {
    label: "Belum Terlihat",
    description: "Siswa telah berinteraksi dengan aktivitas, namun bukti penalaran pada aspek ini belum terartikulasikan.",
    indicatorIndex: 0,
  },
  EMERGING: {
    label: "Mulai Muncul",
    description: "Siswa mulai memperhatikan fenomena atau keteraturan menarik pada data observasi.",
    indicatorIndex: 1,
  },
  DEVELOPING: {
    label: "Sedang Berkembang",
    description: "Siswa mulai menghubungkan bukti dengan dugaan atau menguji beberapa alternatif hubungan.",
    indicatorIndex: 2,
  },
  SUPPORTED_BY_EVIDENCE: {
    label: "Didukung oleh Bukti",
    description: "Penalaran siswa ditopang secara konsisten oleh data konkret laboratorium dan penjelasan fisis logis.",
    indicatorIndex: 3,
  },
  TRANSFERABLE: {
    label: "Siap Diterapkan",
    description: "Siswa mampu menerapkan cara berpikir saintifik pada konteks baru dan mengenali batas ketidakpastian.",
    indicatorIndex: 4,
  },
};
