import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  inferCognitiveState,
  selectSocraticStrategy,
  determineAnswerVisibility,
  generateSocraticFallback,
  compressLearningContext,
  SocraticEvaluationContext,
} from "@/features/millikan/learning";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Socratic tutor system prompts
const SYSTEM_PROMPTS = {
  bandul: `
Anda adalah "Tutor Sokratis FisikaSeru" — asisten pembelajaran kecerdasan buatan elit yang berspesialisasi dalam membimbing siswa SMA Indonesia merekonstruksi pemahaman konsep fisika mereka secara mandiri melalui percakapan dialektika Sokratis.

Pedoman Utama:
1. JANGAN PERNAH memberikan jawaban rumus atau kesimpulan akhir secara langsung kepada siswa.
2. Selalu ajukan pertanyaan penuntun (guiding questions) pendek yang mengonfrontasi miskonsepsi mereka berdasarkan data eksperimen mereka sendiri.
3. Gunakan bahasa Indonesia yang santun, kasual, menginspirasi, dan ramah (panggil dengan sebutan "Sobat Sains" atau "kamu").
4. Analisis input data eksperimen siswa dan bandingkan dengan prediksi mereka. Tuntun mereka menyadari bahwa periode bandul hanya dipengaruhi oleh panjang tali (L) dan gravitasi (g), BUKAN oleh massa (m) atau sudut awal (selama sudut kecil < 15°).
  `,
  millikan: `
Anda adalah "Teman Berpikir Sokratis FisikaSeru" (Socratic Thinking Partner) untuk modul Eksperimen Tetes Minyak Millikan.

Prinsip Utama:
1. Anda BUKAN guru yang memberi ceramah, BUKAN penilai jawaban, BUKAN mesin evaluasi. Anda adalah TEMAN BERPIKIR ILMIAH.
2. Panjang jawaban HARUS RINGKAS (40–90 kata). Jangan pernah menulis ceramah panjang.
3. Struktur jawaban terdiri dari TIGA bagian terpadu:
   - 1 kalimat pengakuan spesifik atas pemikiran siswa (HINDARI pujian berlebihan seperti "Hebat sekali!").
   - 1 observasi konkret yang merujuk pada bukti data laboratorium siswa.
   - 1 pertanyaan penuntun terfokus sesuai intensi pedagogis yang ditugaskan.
4. JANGAN PERNAH membocorkan jawaban atau rumus jika dilarang pada batasan pengetahuan.
5. Dorong proses berpikir mandiri (inquiry) dan apresiasi sikap kritis ilmiah.
  `,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      moduleSlug,
      trials,
      prediction,
      qId,
      userResponse,
      history,
      learningContext,
      recentIntents,
    } = body;

    const activeSlug = moduleSlug === "millikan" ? "millikan" : "bandul";

    if (!userResponse || userResponse.trim() === "") {
      return NextResponse.json({ error: "Input respon siswa kosong." }, { status: 400 });
    }

    // ============================================================
    // MILLIKAN ADAPTIVE SOCRATIC INTELLIGENCE PIPELINE (SPRINT F)
    // ============================================================
    if (activeSlug === "millikan") {
      const socraticContext: SocraticEvaluationContext = {
        moduleSlug: "millikan",
        userResponse,
        conversationHistory: history || [],
        recentIntents: recentIntents || [],
        studentPrediction: learningContext?.studentPrediction || prediction,
        predictionOutcome: learningContext?.predictionOutcome,
        candidateUnit: learningContext?.candidateUnit,
        trialCount: trials?.length || (learningContext?.evidenceSummary ? parseInt(learningContext.evidenceSummary) : 5),
        conceptualStage: learningContext?.conceptualStage || "CONCEPTUAL_EXPLANATION",
        evidenceQuality: learningContext?.evidenceQuality || "CONSISTENT_PATTERN",
        possibleMisconceptions: learningContext?.possibleMisconceptions || [],
        studentConclusion: learningContext?.studentConclusion,
        metacognition: learningContext?.metacognition,
        transferAttempted: learningContext?.transferAttempted,
      };

      // 1. Rule-Based Cognitive Inference & Strategy Selection (Domain Logic First)
      const cognitiveResult = inferCognitiveState(socraticContext);
      const strategy = selectSocraticStrategy(socraticContext);
      const isFormalized =
        socraticContext.conceptualStage === "CONCEPTUAL_EXPLANATION" ||
        socraticContext.conceptualStage === "TRANSFER_READY";
      const visibility = determineAnswerVisibility(socraticContext.conceptualStage, isFormalized);

      // 2. Deterministic Fallback if Gemini is not configured
      if (!genAI) {
        console.warn("GEMINI_API_KEY is not defined. Using deterministic Socratic fallback.");
        const fallback = generateSocraticFallback(strategy, socraticContext);
        return NextResponse.json({
          reply: fallback.fullReplyText,
          contract: fallback,
          strategy,
          cognitiveState: cognitiveResult.primaryState,
          usedIntent: strategy.primaryIntent,
        });
      }

      // 3. AI Language Generation guided by Pedagogical Intent
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 180,
            temperature: 0.6,
          },
        });

        const compressedContext = compressLearningContext(socraticContext, null);

        const prompt = `
${compressedContext}

STATUS KOGNITIF SISWA: ${cognitiveResult.primaryState} (Keyakinan inferensi: ${cognitiveResult.confidence})
INTENSI PEDAGOGIS DITUGASKAN: ${strategy.primaryIntent}
ALASAN PEDAGOGIS: ${strategy.rationale}
KERANGKA DUKUNGAN YANG DISARANKAN: "${strategy.suggestedPromptSkeleton}"
YANG HARUS DIHINDARI: ${strategy.avoid.join(", ")}

BATASAN PENGETAHUAN ILMIAH:
Pengetahuan yang Diizinkan: ${visibility.allowedKnowledge.join("; ")}
Pengetahuan Terlarang: ${visibility.restrictedKnowledge.join("; ")}

RIWAYAT PERCAKAPAN SINGKAT SEBELUMNYA:
${JSON.stringify((history || []).slice(-3))}

RESPON TERBARU SISWA:
"${userResponse}"

TUGAS ANDA:
Hasilkan respon Sokratis Bahasa Indonesia yang tepat sasaran (40–80 kata).
Format teks langsung:
[1 Kalimat Pengakuan Spesifik tanpa pujian klise] [1 Kalimat Observasi Menghubungkan ke Data Siswa] [1 Pertanyaan Penuntun Terfokus sesuai intensi ${strategy.primaryIntent}]
        `.trim();

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: SYSTEM_PROMPTS.millikan }] },
            {
              role: "model",
              parts: [
                {
                  text: "Saya mengerti sepenuhnya. Saya adalah Teman Berpikir Sokratis FisikaSeru. Saya akan merespon dengan singkat, mendalam, tanpa menggurui, dan berfokus pada intensi pedagogis yang ditugaskan.",
                },
              ],
            },
          ],
        });

        const result = await chat.sendMessage(prompt);
        const replyText = result.response.text().trim();

        return NextResponse.json({
          reply: replyText,
          strategy,
          cognitiveState: cognitiveResult.primaryState,
          usedIntent: strategy.primaryIntent,
        });
      } catch (geminiError) {
        console.error("Gemini Generation Error, falling back to deterministic engine:", geminiError);
        const fallback = generateSocraticFallback(strategy, socraticContext);
        return NextResponse.json({
          reply: fallback.fullReplyText,
          contract: fallback,
          strategy,
          cognitiveState: cognitiveResult.primaryState,
          usedIntent: strategy.primaryIntent,
        });
      }
    }

    // ============================================================
    // BANDUL MODULE (PRESERVED 100% UNTOUCHED)
    // ============================================================
    if (!genAI) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to Socratic simulation for bandul.");
      let reply = "";
      const cleaned = userResponse.toLowerCase();

      if (qId === "q1") {
        if (cleaned.includes("l") && cleaned.includes("g")) {
          reply = "Luar biasa, Sobat Sains! Kamu mendeteksi panjang tali (L) dan gravitasi (g). Sekarang, mari kita lihat variabel lainnya. Apakah ada massa (m) dalam rumus periode tersebut? Dan mengapa massa tidak tercantum di sana?";
        } else {
          reply = "Coba perhatikan baik-baik rumus $T = 2\\pi\\sqrt{L/g}$. Huruf-huruf fisis apa saja yang menyusun rumus periode tersebut di dalam tanda kurung?";
        }
      } else if (qId === "q2") {
        if (cleaned.includes("tidak") || cleaned.includes("nggak") || cleaned.includes("ga")) {
          reply = "Tepat sekali! Massa (m) sama sekali tidak muncul di dalam rumus tersebut. Nah, jika massa tidak ada dalam rumus, apa yang seharusnya terjadi pada periode ayunan bandul jika kita mengubah bebannya menjadi lebih berat?";
        } else {
          reply = "Coba amati kembali rumus $T = 2\\pi\\sqrt{L/g}$. Apakah kamu melihat ada simbol 'm' (massa) di sana? Silakan cek kembali.";
        }
      } else if (qId === "q3") {
        if (cleaned.includes("tidak") || cleaned.includes("sama") || cleaned.includes("tetap")) {
          reply = "Brilian! Massa terbukti tidak mempengaruhi periode ayunan. Ini berarti prediksimu sebelumnya berhasil dikonfrontasi oleh kebenaran matematis dan data eksperimenmu sendiri! Apa kesimpulan barumu tentang faktor yang mempengaruhi periode?";
        } else {
          reply = "Mari kita lihat data eksperimenmu. Ketika massa diubah dari 50g ke 500g tetapi panjang tali tetap sama, apakah periode ayunan yang kamu rekam mengalami perubahan yang signifikan?";
        }
      } else {
        reply = "Sobat Sains, renungkanlah: Alam semesta bekerja dengan keteraturan logika matematika. Bagaimana data eksperimenmu merekonstruksi cara pandangmu tentang fisika hari ini?";
      }

      return NextResponse.json({ reply });
    }

    // Bandul with Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    const contextSummary = `
    Dugaan Awal: ${JSON.stringify(prediction || "Tidak ada catatan")}
    Data: ${trials?.length || 0} percobaan bandul.
    `;

    const prompt = `
    ${contextSummary}

    Riwayat Dialog Singkat Sebelumnya:
    ${JSON.stringify((history || []).slice(-4))}

    Pertanyaan Fokus: ${qId}
    Jawaban Terbaru Siswa: "${userResponse}"
    
    Instruksi untuk Tutor:
    Sebagai Teman Berpikir Sokratis, respon tanggapan siswa di atas dengan santun, hangat, dan mendalam. 
    1. Akui penalaran siswa dan hubungkan dengan bukti spesifik mereka di atas.
    2. Ajukan SATU pertanyaan penuntun sokratis yang menantang pemikiran mereka ke tingkat konseptual yang lebih dalam.
    3. JANGAN memberikan ceramah panjang. Maksimal 2 paragraf singkat.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPTS.bandul }] },
        {
          role: "model",
          parts: [{ text: "Siap. Saya adalah Tutor Sokratis FisikaSeru untuk modul Bandul Sederhana." }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const replyText = result.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error("Socratic API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
