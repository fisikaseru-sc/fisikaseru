"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronLeft, ChevronRight, Sparkles, Lightbulb, ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReflectionPage() {
  const [step, setStep] = useState<"confront" | "dialogue" | "reconstruct" | "complete">("confront");

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="h-14 bg-white border-b border-border-default flex items-center px-6 gap-4 sticky top-0 z-30">
        <a href="/modules/bandul/analysis" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Analisis</span>
        </a>
        <div className="h-6 w-px bg-border-default" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-mono uppercase">Langkah 5 dari 6 • Bandul</span>
            <h1 className="font-display font-semibold text-sm text-primary-navy leading-none">Refleksi & Rekonstruksi</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Confrontation Card */}
          {step === "confront" && (
            <motion.div key="confront" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <Badge variant="warning" size="lg" className="mb-4">
                  <Lightbulb className="w-3.5 h-3.5" /> Momen Konfrontasi
                </Badge>
                <h2 className="font-display text-2xl font-bold text-primary-navy mb-2">
                  Prediksi vs Kenyataan
                </h2>
                <p className="text-text-muted">
                  Bandingkan apa yang kamu pikirkan sebelum eksperimen dengan data yang kamu temukan.
                </p>
              </div>

              {/* Confrontation Card */}
              <div className="bg-white rounded-2xl border border-border-default shadow-sm overflow-hidden mb-6">
                {/* Prediction Side */}
                <div className="p-6 border-b border-border-default bg-amber/[0.03]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber" />
                    <h3 className="font-display font-semibold text-sm text-amber uppercase tracking-wide">Prediksi Awalmu</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-amber/20">
                    <p className="text-sm text-text-primary italic">
                      &ldquo;Saya pikir massa bandul akan mempengaruhi periode ayunan.
                      Semakin berat benda, semakin lambat ayunannya.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Arrow Separator */}
                <div className="flex items-center justify-center -my-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-border-default flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-text-muted rotate-90" />
                  </div>
                </div>

                {/* Result Side */}
                <div className="p-6 bg-accent-cobalt/[0.02]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-accent-cobalt" />
                    <h3 className="font-display font-semibold text-sm text-accent-cobalt uppercase tracking-wide">Hasil Eksperimen</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-accent-cobalt/20">
                    <p className="text-sm text-text-primary mb-3">
                      Data menunjukkan bahwa <strong>massa tidak mempengaruhi periode</strong>.
                      Periode hanya bergantung pada panjang tali dan gravitasi.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 rounded-lg px-3 py-2 border border-border-default/50">
                        <span className="text-[10px] text-text-muted block">R²</span>
                        <span className="font-mono font-bold text-accent-cobalt">0.985</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2 border border-border-default/50">
                        <span className="text-[10px] text-text-muted block">g hitung</span>
                        <span className="font-mono font-bold text-primary-navy">9.81 m/s²</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Indicator */}
                <div className="px-6 py-4 bg-rose/[0.03] border-t border-rose/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="md">Berbeda</Badge>
                    <span className="text-xs text-text-muted">Prediksimu tidak sesuai dengan data eksperimen</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" onClick={() => setStep("dialogue")}>
                  Lanjut ke Dialog Reflektif <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Socratic Dialogue */}
          {step === "dialogue" && (
            <motion.div key="dialogue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <Badge variant="teal" size="lg" className="mb-4">
                  <MessageCircle className="w-3.5 h-3.5" /> Dialog Sokratis
                </Badge>
                <h2 className="font-display text-2xl font-bold text-primary-navy mb-2">
                  Mari Berpikir Lebih Dalam
                </h2>
                <p className="text-text-muted">AI Tutor membantumu memahami mengapa prediksimu berbeda dari data.</p>
              </div>

              {/* Dialogue Cards */}
              <div className="space-y-4 mb-8">
                {[
                  { q: "Perhatikan rumus T = 2π√(L/g). Variabel apa saja yang ada dalam rumus ini?", a: "" },
                  { q: "Apakah massa (m) muncul di dalam rumus tersebut?", a: "" },
                  { q: "Jika massa tidak ada dalam rumus, apa yang bisa kamu simpulkan tentang pengaruh massa terhadap periode?", a: "" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3, duration: 0.4 }}
                    className="bg-white rounded-xl border border-border-default p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-teal" />
                      </div>
                      <p className="text-sm text-primary-navy font-medium">{item.q}</p>
                    </div>
                    <textarea
                      className="w-full min-h-[60px] p-3 rounded-lg border border-border-default text-sm font-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all resize-y"
                      placeholder="Tuliskan jawabanmu di sini..."
                      aria-label={`Jawaban untuk pertanyaan ${i + 1}`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="lg" onClick={() => setStep("confront")}>
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </Button>
                <Button size="lg" onClick={() => setStep("reconstruct")}>
                  Rekonstruksi Pemahaman <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Reconstruction */}
          {step === "reconstruct" && (
            <motion.div key="reconstruct" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <Badge variant="primary" size="lg" className="mb-4">
                  <Lightbulb className="w-3.5 h-3.5" /> Rekonstruksi
                </Badge>
                <h2 className="font-display text-2xl font-bold text-primary-navy mb-2">
                  Pemahaman Barumu
                </h2>
                <p className="text-text-muted">
                  Tulis ulang pemahamanmu berdasarkan data dan refleksi yang sudah kamu lakukan.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-border-default shadow-sm p-6 mb-8">
                <label className="block mb-4">
                  <span className="font-display font-semibold text-sm text-primary-navy block mb-2">
                    Sekarang, bagaimana pemahamanmu tentang faktor-faktor yang mempengaruhi periode bandul?
                  </span>
                  <textarea
                    className="w-full min-h-[120px] p-4 rounded-xl border border-border-default text-sm font-body placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt transition-all resize-y"
                    placeholder="Tuliskan pemahaman barumu di sini. Jelaskan apa yang berubah dari pemahamanmu sebelumnya..."
                    aria-label="Tuliskan pemahaman baru"
                  />
                </label>

                {/* Guided prompts */}
                <div className="bg-accent-cobalt/[0.03] rounded-xl p-4 border border-accent-cobalt/10">
                  <p className="text-xs font-display font-semibold text-accent-cobalt mb-2">Panduan menulis refleksi:</p>
                  <ul className="text-xs text-text-muted space-y-1.5">
                    <li>• Apa yang awalnya kamu pikir benar tapi ternyata keliru?</li>
                    <li>• Bukti data apa yang mengubah pikiranmu?</li>
                    <li>• Bagaimana pemahaman barumu menjelaskan fenomena ini?</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="lg" onClick={() => setStep("dialogue")}>
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </Button>
                <Button size="lg" onClick={() => setStep("complete")}>
                  Selesaikan Refleksi <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-primary-navy mb-3">
                Refleksi Selesai! 🎉
              </h2>
              <p className="text-text-muted max-w-md mx-auto mb-8">
                Kamu telah merekonstruksi pemahamanmu tentang gerak bandul sederhana.
                Lanjutkan ke pembuatan laporan ilmiah.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg">
                  Buat Laporan <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Lihat Eureka Card
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
