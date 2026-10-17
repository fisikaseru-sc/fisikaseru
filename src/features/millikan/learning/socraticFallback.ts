// ============================================================
// FISIKASERU — SOCRATIC FALLBACK INTELLIGENCE ENGINE
// SPRINT F: High-Quality Deterministic Socratic Dialogue Library
// ============================================================

import { SocraticIntent, SocraticResponseContract, SocraticStrategy, SocraticEvaluationContext } from "./types";

/**
 * Deterministic fallback generator for all 12 Socratic pedagogical intents.
 * Guarantees that learning NEVER stops, even without an internet connection or Gemini API key.
 * Every response follows the 3-part formula:
 * 1 short acknowledgement + 1 observation + 1 clear thinking question (40–80 words).
 */
export function generateSocraticFallback(
  strategy: SocraticStrategy,
  context: SocraticEvaluationContext
): SocraticResponseContract {
  const intent = strategy.primaryIntent;
  const userText = context.userResponse.trim();
  const cand = context.candidateUnit ? context.candidateUnit.toFixed(2) : "1.60";
  const droplets = context.trialCount || 5;

  let acknowledgement = "Penalaran yang menarik, Sobat Sains.";
  let observation = "Kamu sedang mencermati data pengukuran di laboratorium.";
  let question = "Menurutmu, apa hubungan fisik yang paling mendasar di balik data tersebut?";

  switch (intent) {
    case "REQUEST_EVIDENCE":
      acknowledgement = "Kamu telah merumuskan sebuah gagasan konseptual penting.";
      observation = `Kamu telah mengumpulkan ${droplets} tetesan dan menguji kandidat satuan ~${cand} × 10⁻¹⁹ C.`;
      question = "Dari seluruh angka dan rasio hasil bagi pada data laboratoriummu, bukti spesifik mana yang paling kuat mendasari pernyataanmu tersebut?";
      break;

    case "REQUEST_COMPARISON":
      acknowledgement = "Memperhatikan variasi nilai adalah langkah awal inkuiri yang sangat tajam.";
      observation = "Tetesan yang berbeda menghasilkan waktu tempuh dan tegangan penyeimbang yang tidak persis sama.";
      question = "Coba bandingkan hasil pembagian tetesan-tetesan tersebut: apa perbedaan pola yang paling mencolok saat dibagi dengan kandidat satuan yang berbeda?";
      break;

    case "REFRAME_ERROR":
      acknowledgement = "Ketelitianmu dalam mengamati angka desimal patut diapresiasi.";
      observation = "Dalam laboratorium fisika nyata, gerak partikel udara dan pembacaan alat selalu membawa ketidakpastian eksperimen kecil.";
      question = "Jika deviasi kecil seperti 1.98 atau 2.02 selalu wajar terjadi, mengapa nilai-nilai ini tetap menjadi bukti kuat untuk kelipatan bilangan bulat 2?";
      break;

    case "HIGHLIGHT_CONTRADICTION":
      acknowledgement = "Wajar bila pada awalnya nilai-nilai muatan terkesan acak bebas.";
      observation = `Namun saat dibagi dengan satuan ${cand} × 10⁻¹⁹ C, rasionya berulang kali mendekati anak tangga 1, 2, 3, dan 4.`;
      question = "Jika muatan benar-benar acak tanpa aturan, mengapa rasionya tidak jatuh di sembarang angka pecahan seperti 1.43 atau 2.81?";
      break;

    case "PROBE_ASSUMPTION":
      acknowledgement = "Poin pengamatan yang membuka diskusi menarik.";
      observation = "Tetesan minyak disemprotkan dari atomizer sehingga memiliki volume dan luas permukaan yang berbeda-beda.";
      question = "Bagaimana jika perbedaan muatan antar tetesan bukan karena nilai muatan dasar yang berubah, melainkan karena tetesan menangkap jumlah butir partikel yang berbeda?";
      break;

    case "CONNECT_PATTERN":
      acknowledgement = "Keteraturan titik-titik rasio pada garis bilangan mulai terlihat jelas.";
      observation = "Nilai muatan terbukti tidak tersebar rata di sembarang posisi garis kontinu.";
      question = "Menurutmu, bagaimana pola pengelompokan pada posisi bilangan bulat ini membuktikan bahwa listrik tersusun dari paket-paket satuan dasar yang berulang?";
      break;

    case "REQUEST_EXPLANATION":
      acknowledgement = "Kamu berhasil mengidentifikasi struktur kelipatan pada data.";
      observation = "Sains berupaya melangkah dari sekadar pola angka menuju makna fisis di alam nyata.";
      question = "Secara fisika partikel, mengapa muatan listrik pada tetesan minyak tidak bisa bernilai sembarang pecahan dan selalu terkuantisasi?";
      break;

    case "INVITE_TRANSFER":
      acknowledgement = "Pemahamanmu tentang hukum kelipatan muatan sudah sangat kokoh.";
      observation = "Prinsip kuantisasi yang berlaku pada tetesan minyakmu seharusnya juga berlaku universal pada percobaan peneliti lain.";
      question = "Jika pada eksperimen lain ditemukan data muatan 1.58, 3.21, dan 4.77 × 10⁻¹⁹ C, bagaimana caramu membuktikan bahwa data tersebut berasal dari satuan dasar yang sama?";
      break;

    case "PROMPT_METACOGNITION":
      acknowledgement = "Perjalanan berpikir yang sangat reflektif, Sobat Sains.";
      observation = "Kamu telah menguji dugaan awalmu sendiri menggunakan bukti empiris laboratorium nyata.";
      question = "Bagaimana proses menguji hipotesis dan melihat pola data secara mandiri mengubah caramu memandang konsep kelistrikan materi hari ini?";
      break;

    case "INVITE_OBSERVATION":
      acknowledgement = "Mari kita kembali sejenak pada fakta konkret yang terekam.";
      observation = "Setiap baris tabel menyimpan informasi radius, kecepatan terminal, dan muatan terhitung.";
      question = "Apa hal paling menarik yang kamu amati ketika melihat jarak sebaran titik-titik rasio terhadap garis bilangan?";
      break;

    case "TEST_HYPOTHESIS":
      acknowledgement = "Hipotesis yang kamu ajukan layak diuji lebih jauh.";
      observation = "Sebuah teori ilmiah harus tahan diuji pada berbagai kondisi pengukuran yang berbeda.";
      question = "Bagaimana caramu menguji apakah hipotesis satuan dasarmu tetap konsisten jika kita menyinari bilik dengan sinar-X?";
      break;

    case "ALLOW_PRODUCTIVE_PAUSE":
      acknowledgement = "Berpikir mendalam membutuhkan ketenangan dan perenungan data.";
      observation = "Kamu sedang mempertimbangkan hubungan antar variabel secara teliti.";
      question = "Luangkan waktu sejenak untuk menelaah datamu. Apa yang ingin kamu uji atau tanyakan selanjutnya saat kamu siap?";
      break;
  }

  const fullReplyText = `${acknowledgement} ${observation} ${question}`;

  return {
    acknowledgement,
    observation,
    question,
    supportLevel: strategy.supportLevel === "PARTIAL_EXPLANATION" ? "SCAFFOLD" : strategy.supportLevel,
    intentUsed: intent,
    fullReplyText,
  };
}
