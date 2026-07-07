import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Socratic tutor system prompts for both experiments
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
Anda adalah "Tutor Sokratis FisikaSeru" — asisten pembelajaran kecerdasan buatan elit yang berspesialisasi dalam membimbing siswa SMA Indonesia membongkar miskonsepsi mengenai sifat muatan listrik melalui percakapan dialektika Sokratis.

Pedoman Utama:
1. JANGAN PERNAH memberikan kesimpulan akhir atau membocorkan nilai muatan elektron secara langsung kepada siswa sebelum mereka menemukannya sendiri.
2. Ajukan pertanyaan penuntun pendek yang mengarahkan mereka untuk melihat pola diskret (kelompok) muatan fisis pada tetesan minyak hasil eksperimen mereka.
3. Gunakan bahasa Indonesia yang santun, kasual, menginspirasi, dan ramah ("Sobat Sains" atau "kamu").
4. Tuntun mereka menyadari bahwa muatan listrik bersifat terkuantisasi (terpaketkan dalam kelipatan bilangan bulat dari muatan elementer e ≈ 1.6 × 10⁻¹⁹ C), BUKAN bersifat kontinu/acak.
  `
};

export async function POST(req: Request) {
  try {
    const { moduleSlug, trials, prediction, qId, userResponse, history } = await req.json();
    const activeSlug = moduleSlug === "millikan" ? "millikan" : "bandul";

    if (!userResponse || userResponse.trim() === "") {
      return NextResponse.json({ error: "Input respon siswa kosong." }, { status: 400 });
    }

    // 1. Fallback simulation if Gemini API Key is missing (Ensures the app is robust and ALWAYS works)
    if (!genAI) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to Socratic simulation.");
      
      let reply = "";
      const cleaned = userResponse.toLowerCase();

      if (activeSlug === "millikan") {
        if (qId === "q1") {
          if (cleaned.includes("kelompok") || cleaned.includes("teratur") || cleaned.includes("diskret") || cleaned.includes("garis") || cleaned.includes("ngumpul") || cleaned.includes("tentu")) {
            reply = "Luar biasa, Sobat Sains! Kamu mendeteksi adanya keteraturan kelompok. Nah, sekarang coba amati kelompok nilai muatan tersebut berkisar di sekitar 4.8, 6.4, dan 8.0 × 10⁻¹⁹ C. Jika kita membagi nilai-nilai tersebut dengan pembagi terkecil yang pas, angka dasar berapa yang selalu muncul?";
          } else {
            reply = "Coba perhatikan baik-baik tabel data hasil eksperimenmu. Apakah angka muatan listrik yang kamu catat menyebar acak bebas secara kontinu, atau cenderung mengumpul di sekitar baris nilai tertentu? Amati kembali grafik visual sebaranmu.";
          }
        } else if (qId === "q2") {
          if (cleaned.includes("1.6") || cleaned.includes("1,6") || cleaned.includes("elektron")) {
            reply = "Tepat sekali! Pembagi terkecilnya bernilai ~1.6 × 10⁻¹⁹ C, yang merupakan muatan satu elektron tunggal (e). Nah, mengapa di alam semesta kita tidak pernah menemukan tetesan minyak dengan muatan bernilai pecahan seperti 0.5e atau 1.5e?";
          } else {
            reply = "Coba gunakan pembagian sederhana: bagi 4.8 dengan 3, bagi 6.4 dengan 4, atau bagi 8.0 dengan 5. Angka fisis konstan berapa yang selalu muncul sebagai pembagi dasar bulatnya?";
          }
        } else if (qId === "q3") {
          if (cleaned.includes("tidak") || cleaned.includes("bulat") || cleaned.includes("elektron") || cleaned.includes("pecah") || cleaned.includes("paket")) {
            reply = "Brilian! Karena muatan listrik di alam terikat pada muatan satu buah elektron tunggal yang merupakan partikel elementer fundamental dan tidak dapat dibagi-bagi lagi (terkuantisasi). Bagaimana data eksperimen Millikan ini mengubah cara pandangmu terhadap listrik?";
          } else {
            reply = "Renungkanlah: jika elektron adalah partikel terkecil yang membawa muatan listrik fisis, mungkinkah kita memotong satu buah elektron menjadi setengah bagian untuk mendapatkan muatan setengah elektron?";
          }
        } else {
          reply = "Sobat Sains, bagaimana data eksperimen Tetes Minyak Millikan ini merekonstruksi cara pandangmu mengenai materi fundamental pembentuk alam semesta hari ini?";
        }
      } else {
        // Fallback for simple pendulum
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
      }

      return NextResponse.json({ reply });
    }

    // 2. Real Gemini LLM generation
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    const activePrompt = activeSlug === "millikan" ? SYSTEM_PROMPTS.millikan : SYSTEM_PROMPTS.bandul;

    const prompt = `
    Konteks Dialog Sokratis Sebelumnya:
    ${JSON.stringify(history || [])}

    Pertanyaan ID Saat Ini: ${qId}
    Jawaban Siswa: "${userResponse}"
    
    Analisis jawaban siswa ini menggunakan metode Socratic. Bandingkan dengan data eksperimen mereka (${JSON.stringify(trials || [])}) jika relevan. Formulasikan respon pendek penuntun (maksimal 3 kalimat) dalam Bahasa Indonesia yang ramah.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: activePrompt }] },
        { role: "model", parts: [{ text: `Siap. Saya adalah Tutor Sokratis FisikaSeru untuk modul ${activeSlug === "millikan" ? "Tetes Minyak Millikan" : "Bandul Sederhana"}.` }] }
      ]
    });

    const result = await chat.sendMessage(prompt);
    const replyText = result.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
