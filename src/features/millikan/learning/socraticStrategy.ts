// ============================================================
// FISIKASERU — PEDAGOGICAL STRATEGY SELECTOR
// SPRINT F: Rule-Based Socratic Question Intent Selection
// ============================================================

import { SocraticIntent, SocraticStrategy, SocraticEvaluationContext, CognitiveState } from "./types";
import { inferCognitiveState } from "./cognitiveState";
import { detectLearningCondition } from "./learningCondition";

/**
 * Pure deterministic selector for the next pedagogical Socratic intent.
 * Runs BEFORE LLM generation. Does NOT call external APIs or access React state.
 */
export function selectSocraticStrategy(context: SocraticEvaluationContext): SocraticStrategy {
  const cognitive = inferCognitiveState(context);
  const condition = detectLearningCondition(context);
  const recentIntents = context.recentIntents || [];
  const text = (context.userResponse || "").toLowerCase().trim();

  // Helper to ensure intent diversity (avoid asking same cognitive demand repeatedly)
  const isRecent = (intent: SocraticIntent) => recentIntents.slice(-2).includes(intent);

  // 1. Stuckness / Repetition Handling (Scaffolding ladder escalation)
  if (condition.condition === "POSSIBLY_STUCK") {
    return {
      primaryIntent: "REQUEST_COMPARISON",
      secondaryIntent: "INVITE_OBSERVATION",
      rationale: "Siswa tampak buntu atau mengulang respon. Berikan tangga bantuan komparasi konkret antara dua nilai untuk memecah kebuntuan.",
      avoid: [
        "memberikan jawaban rumus langsung",
        "mengulang pertanyaan abstrak yang sama",
        "menghakimi bahwa siswa buntu"
      ],
      suggestedPromptSkeleton: "Bandingkan nilai tetes A dengan tetes B: apakah kamu melihat pola kelipatan sederhana di antara keduanya?",
      supportLevel: "SCAFFOLD",
    };
  }

  // 2. Misconception-driven interventions (Constructive reframing)
  if (context.possibleMisconceptions && context.possibleMisconceptions.length > 0) {
    const primaryMisc = context.possibleMisconceptions[0];

    if (primaryMisc === "PERFECTION_BIAS" && !isRecent("REFRAME_ERROR")) {
      return {
        primaryIntent: "REFRAME_ERROR",
        rationale: "Siswa mengekspektasikan data laboratorium tanpa galat (misal menolak 1.99 karena bukan tepat 2.00).",
        avoid: ["menyalahkan ekspektasi siswa", "memberikan teori galat yang rumit"],
        suggestedPromptSkeleton: "Dalam pengukuran sains nyata, ada hambatan udara dan gerak partikel. Mengapa deviasi kecil seperti 1.98 tetap menjadi bukti kuat untuk kelipatan 2?",
        supportLevel: "LIGHT",
      };
    }

    if (primaryMisc === "CHARGE_COMPLETELY_RANDOM" && !isRecent("HIGHLIGHT_CONTRADICTION")) {
      return {
        primaryIntent: "HIGHLIGHT_CONTRADICTION",
        rationale: "Siswa masih menganggap muatan acak sembarang meskipun bukti rasio menunjukkan keteraturan.",
        avoid: ["mengatakan siswa salah melihat data", "memaksakan dogma kuantisasi"],
        suggestedPromptSkeleton: "Jika nilainya benar-benar acak bebas, mengapa hasil pembagiannya berkali-kali berkumpul di dekat bilangan bulat dan tidak jatuh di sembarang desimal seperti 1.43 atau 2.81?",
        supportLevel: "LIGHT",
      };
    }

    if (primaryMisc === "ALL_DROPLETS_IDENTICAL" && !isRecent("PROBE_ASSUMPTION")) {
      return {
        primaryIntent: "PROBE_ASSUMPTION",
        rationale: "Siswa berasumsi semua tetes harus memiliki muatan sama persis.",
        avoid: ["langsung menyatakan setiap tetes menyerap elektron berbeda"],
        suggestedPromptSkeleton: "Tetesan memiliki ukuran yang berbeda-beda. Bagaimana jika satu tetes dapat menangkap lebih dari satu butir elektron?",
        supportLevel: "LIGHT",
      };
    }
  }

  // 3. Cognitive State Driven Strategy Selection
  const state: CognitiveState = cognitive.primaryState;

  // A. If student states a conclusion/claim/pattern without evidence -> REQUEST_EVIDENCE
  const hasEvidenceCitation =
    text.includes("data") ||
    text.includes("angka") ||
    text.includes("rasio") ||
    text.includes("tabel") ||
    text.includes("hasil bagi") ||
    text.includes("garis bilangan") ||
    text.includes("1.") ||
    text.includes("2.") ||
    text.includes("3.") ||
    text.includes("4.") ||
    text.includes("tetes a") ||
    text.includes("tetes b") ||
    text.includes("tetes 1") ||
    text.includes("tetes #");
  const isStatingClaim = state === "EXPLAINING" || state === "HYPOTHESIZING" || state === "PATTERN_RECOGNIZING";
  if (isStatingClaim && !hasEvidenceCitation && !isRecent("REQUEST_EVIDENCE")) {
    return {
      primaryIntent: "REQUEST_EVIDENCE",
      secondaryIntent: "REQUEST_EXPLANATION",
      rationale: "Siswa merumuskan pernyataan atau dugaan namun belum mengaitkannya secara eksplisit dengan data laboratorium konkret.",
      avoid: ["menerima klaim tanpa konfirmasi bukti", "menguliahi siswa"],
      suggestedPromptSkeleton: "Penalaran yang menarik. Dari data tetesan yang kamu amati, angka atau rasio mana yang paling meyakinkanmu atas pernyataan tersebut?",
      supportLevel: "NONE",
    };
  }

  // B. If student is observing raw data -> REQUEST_COMPARISON or CONNECT_PATTERN
  if (state === "OBSERVING") {
    if (!isRecent("CONNECT_PATTERN")) {
      return {
        primaryIntent: "CONNECT_PATTERN",
        secondaryIntent: "REQUEST_COMPARISON",
        rationale: "Siswa mendeskripsikan data mentah. Bimbing untuk melihat hubungan pola antar nilai tersebut.",
        avoid: ["langsung membocorkan rumus kuantisasi"],
        suggestedPromptSkeleton: "Saat kamu mengamati angka-angka tersebut, apakah kamu melihat pola pengulangan atau kelipatan tertentu?",
        supportLevel: "LIGHT",
      };
    }
  }

  // C. If student is comparing candidates or droplets -> REQUEST_EXPLANATION
  if (state === "COMPARING") {
    if (!isRecent("REQUEST_EXPLANATION")) {
      return {
        primaryIntent: "REQUEST_EXPLANATION",
        secondaryIntent: "CONNECT_PATTERN",
        rationale: "Siswa sedang membandingkan dua kondisi. Ajak untuk menjelaskan alasan fisis di balik perbedaan tersebut.",
        avoid: ["mengulang perbandingan yang sudah disadari siswa"],
        suggestedPromptSkeleton: "Mengapa menurutmu satu kandidat mampu menghasilkan keteraturan yang jauh lebih konsisten dibanding kandidat lainnya?",
        supportLevel: "NONE",
      };
    }
  }

  // D. If student is reconciling old vs new belief -> PROMPT_METACOGNITION
  if (state === "RECONCILING" || state === "REFLECTING") {
    if (!isRecent("PROMPT_METACOGNITION")) {
      return {
        primaryIntent: "PROMPT_METACOGNITION",
        secondaryIntent: "INVITE_TRANSFER",
        rationale: "Siswa sedang merefleksikan perubahan cara berpikirnya. Perkuat kesadaran metakognitif mengenai bagaimana bukti mengubah pemahamannya.",
        avoid: ["menguji dengan soal teknis hafalan", "mengabaikan proses refleksi siswa"],
        suggestedPromptSkeleton: "Bagaimana proses menguji data sendiri di laboratorium membantumu melepaskan dugaan awal yang kurang tepat?",
        supportLevel: "NONE",
      };
    }
  }

  // E. If student is in transfer stage or ready for novel scenario -> INVITE_TRANSFER
  if (state === "TRANSFERRING" || context.conceptualStage === "TRANSFER_READY") {
    if (!isRecent("INVITE_TRANSFER")) {
      return {
        primaryIntent: "INVITE_TRANSFER",
        secondaryIntent: "PROBE_ASSUMPTION",
        rationale: "Siswa telah memahami konsep kuantisasi muatan. Tantang untuk menerapkannya pada data baru atau anomali kasus.",
        avoid: ["pertanyaan teoretis murni buku teks", "pembahasan topik di luar fisika kuantisasi"],
        suggestedPromptSkeleton: "Jika seorang peneliti menemukan tetesan dengan muatan yang bukan kelipatan bulat dari e, kemungkinan apa saja yang ingin kamu telusuri?",
        supportLevel: "NONE",
      };
    }
  }

  // Fallback diverse intent to prevent stagnation
  const fallbackIntents: SocraticIntent[] = [
    "REQUEST_EXPLANATION",
    "PROBE_ASSUMPTION",
    "INVITE_OBSERVATION",
    "PROMPT_METACOGNITION",
  ];
  const freshIntent = fallbackIntents.find((i) => !isRecent(i)) || "REQUEST_EXPLANATION";

  return {
    primaryIntent: freshIntent,
    rationale: "Memilih strategi inkuiri yang segar untuk menjaga ritme dialektika berpikir siswa.",
    avoid: ["memberikan jawaban akhir", "mengulang pertanyaan sebelumnya"],
    suggestedPromptSkeleton: "Menurutmu, apa arti fisis dari keteraturan ini bagi pemahaman kita tentang atom?",
    supportLevel: "NONE",
  };
}
