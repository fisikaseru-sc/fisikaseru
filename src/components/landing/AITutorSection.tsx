"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Heart } from "lucide-react";

const tutorModes = [
  {
    icon: Sparkles,
    mode: "Micro-Hint",
    example: "Perhatikan — variabel apa yang belum kamu ubah?",
    desc: "Petunjuk halus tanpa mengganggu alur berpikir siswa.",
    color: "border-l-sky-blue",
    iconColor: "text-sky-blue bg-sky-blue/10",
  },
  {
    icon: MessageCircle,
    mode: "Dialog Sokratis",
    example: "Jika massa benda tidak berpengaruh, mengapa prediksimu berbeda?",
    desc: "Pertanyaan mendalam yang membimbing siswa menemukan jawaban sendiri.",
    color: "border-l-accent-cobalt",
    iconColor: "text-accent-cobalt bg-accent-cobalt/10",
  },
  {
    icon: Heart,
    mode: "Mitra Refleksi",
    example: "Menarik! Pemahamanmu berubah dari tadi. Apa yang membuatmu berpikir ulang?",
    desc: "Mendampingi siswa saat momen konfrontasi kognitif terjadi.",
    color: "border-l-teal",
    iconColor: "text-teal bg-teal/10",
  },
];

export function AITutorSection() {
  return (
    <section id="ai-tutor" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-teal/[0.03] blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-display font-semibold text-teal tracking-wide uppercase mb-3">
              AI Tutor Sokratis
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-navy mb-4">
              Pendamping Berpikir{" "}
              <span className="text-gradient-discovery">Ilmiah</span>
            </h2>
            <p className="text-text-muted leading-relaxed mb-8">
              AI Tutor bukan chatbot. Ia adalah pendamping sains yang membimbing melalui
              pertanyaan — bukan memberikan jawaban. Dirancang berdasarkan pedagogi Sokratis
              dengan 5 layer eskalasi adaptif.
            </p>

            {/* Modes */}
            <div className="space-y-4">
              {tutorModes.map((mode, i) => (
                <motion.div
                  key={mode.mode}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`border-l-4 ${mode.color} bg-white rounded-r-xl p-4 shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${mode.iconColor} flex items-center justify-center flex-shrink-0`}>
                      <mode.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-primary-navy mb-1">
                        {mode.mode}
                      </h3>
                      <p className="text-xs text-text-muted mb-2">{mode.desc}</p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2 border border-border-default/50">
                        <p className="text-xs text-primary-navy italic">&ldquo;{mode.example}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-depth border border-border-default p-6 relative">
              {/* Chat Interface Mock */}
              <div className="space-y-4">
                {/* Student message */}
                <div className="flex justify-end">
                  <div className="bg-accent-cobalt/5 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-primary-navy">
                      Aku tidak mengerti kenapa massa tidak mempengaruhi periode bandul...
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-teal" />
                  </div>
                  <div className="bg-gray-50 rounded-xl rounded-tl-sm px-4 py-3 max-w-[85%] border border-border-default/50">
                    <p className="text-sm text-text-primary mb-2">
                      Pertanyaan yang bagus! 🤔 Mari kita pikirkan bersama:
                    </p>
                    <p className="text-sm text-text-muted">
                      Coba lihat rumus periode bandul: T = 2π√(L/g). Variabel apa saja yang
                      ada di rumus itu? Apakah massa (m) muncul?
                    </p>
                  </div>
                </div>

                {/* Student realization */}
                <div className="flex justify-end">
                  <div className="bg-accent-cobalt/5 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-primary-navy">
                      Oh! Massa tidak ada dalam rumus... Jadi memang tidak berpengaruh?
                    </p>
                  </div>
                </div>

                {/* AI celebration */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-success" />
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl rounded-tl-sm px-4 py-3 max-w-[85%] border border-success/20">
                    <p className="text-sm text-emerald-800">
                      ✨ Tepat sekali! Kamu baru saja menemukan sesuatu yang penting.
                      Data eksperimenmu juga menunjukkan hal yang sama, kan?
                    </p>
                  </div>
                </div>
              </div>

              {/* Layer indicator */}
              <div className="mt-5 pt-4 border-t border-border-default/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Layer</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <div
                        key={l}
                        className={`w-5 h-1.5 rounded-full ${
                          l <= 2 ? "bg-teal" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-teal">Socratic Guide Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
