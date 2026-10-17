"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, HelpCircle, CheckCircle2,
  Atom, Layers, ChevronRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AhaMomentBannerProps {
  onContinueToReflection: () => void;
  calculatedE: number | null;
  candidateUnit?: number;
  sampleRatios?: number[];
}

export function AhaMomentBanner({
  onContinueToReflection,
  calculatedE,
  candidateUnit = 1.6,
  sampleRatios = [1.01, 1.99, 3.02, 4.01],
}: AhaMomentBannerProps) {
  // Step in the formalization journey:
  // 1 = Discovery Recap & Conceptual Bridge
  // 2 = Progressive Formalization (q ≈ n × unit -> q = n × e)
  // 3 = Quantization Concept (Continuous vs Quantized)
  const [formalizationStep, setFormalizationStep] = useState<1 | 2 | 3>(1);
  const [meaningChoice, setMeaningChoice] = useState<string | null>(null);

  const unitDisplay = calculatedE !== null ? calculatedE.toFixed(3) : candidateUnit.toFixed(2);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden my-6">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full bg-cyan-500/10 filter blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-indigo-500/15 filter blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">

        {/* ── STEP 1: DISCOVERY RECAP & CONCEPTUAL BRIDGE ── */}
        {formalizationStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-300">
                Langkah 1 dari 3 · Kembali ke Temuanmu
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                Kamu Tidak Hanya Menemukan Angka.
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-body">
                Ketika kamu membagi muatan tetesan minyak dengan kandidat satuan <b className="text-cyan-300 font-mono">~{unitDisplay} × 10⁻¹⁹ C</b>, hasil bagi berkali-kali mendekati bilangan bulat.
              </p>
            </div>

            {/* Evidence Recap Cards */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Sampel Rasio Hasil Pembagian yang Kamu Amati:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-center">
                {sampleRatios.slice(0, 4).map((r, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-sans">Tetes #{i + 1}</span>
                    <span className="text-base font-bold text-cyan-300">{r.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-300 block font-sans mt-0.5">≈ {Math.round(r)} satuan</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conceptual Bridge Question */}
            <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <h4 className="font-display font-semibold text-xs md:text-sm text-white">
                  Jika nilai-nilai muatan yang berbeda ini dapat tersusun dari pengulangan satu satuan yang sama, apa yang mungkin terjadi secara fisika?
                </h4>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                {[
                  {
                    id: "repeated",
                    label: "Saya melihat adanya satuan dasar yang berulang",
                    feedback: "Tepat sekali. Jika nilai-nilai berbeda dapat dijelaskan oleh satu satuan yang sama, muatan listrik tidak berubah secara sembarang.",
                  },
                  {
                    id: "multiples",
                    label: "Saya menduga ada hubungan kelipatan",
                    feedback: "Pengamatan yang tajam. Pola kelipatan mengindikasikan bahwa setiap tetesan mengumpulkan sejumlah paket identik.",
                  },
                  {
                    id: "unsure",
                    label: "Saya belum yakin dengan maknanya",
                    feedback: "Wajar sekali. Menemukan pola angka adalah langkah awal. Sekarang mari kita ubah pola numerik ini menjadi model ilmiah.",
                  },
                ].map((opt) => {
                  const isSelected = meaningChoice === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMeaningChoice(opt.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[70px]",
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-white font-semibold ring-1 ring-cyan-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] text-cyan-300 self-end mt-1">
                        {isSelected ? "✓ Terpilih" : "Pilih"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {meaningChoice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-2 text-xs text-cyan-200 border-t border-white/10 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                  <span>
                    {meaningChoice === "repeated" && "Tepat sekali. Jika nilai-nilai berbeda dapat dijelaskan oleh satu satuan yang sama, muatan listrik tidak berubah secara sembarang."}
                    {meaningChoice === "multiples" && "Pengamatan yang tajam. Pola kelipatan mengindikasikan bahwa setiap tetesan mengumpulkan sejumlah paket identik."}
                    {meaningChoice === "unsure" && "Wajar sekali. Menemukan pola angka adalah langkah awal. Sekarang mari kita ubah pola numerik ini menjadi model ilmiah."}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="md"
                onClick={() => setFormalizationStep(2)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display px-6 h-10 cursor-pointer flex items-center gap-2 text-xs"
              >
                Lanjut: Formalisasi Model Ilmiah <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: PROGRESSIVE SCIENTIFIC FORMALIZATION ── */}
        {formalizationStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-300">
                Langkah 2 dari 3 · Dari Pengamatan ke Persamaan Umum
              </span>
            </div>

            <h3 className="font-display font-bold text-xl md:text-2xl text-white">
              Bagaimana Fisikawan Menuliskan Hubungan Ini?
            </h3>

            {/* Sequence of Generalization */}
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">Muatan Tetes #1:</span>
                  <span className="text-cyan-300 font-bold">q₁ ≈ 1 × (satuan dasar)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">Muatan Tetes #2:</span>
                  <span className="text-cyan-300 font-bold">q₂ ≈ 2 × (satuan dasar)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400">Muatan Tetes #3:</span>
                  <span className="text-cyan-300 font-bold">q₃ ≈ 3 × (satuan dasar)</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-300 leading-relaxed font-sans">
                Setiap muatan selalu dapat ditulis sebagai perkalian bilangan bulat $n$ dengan satu paket satuan yang sama:
              </div>

              <div className="py-3 px-4 bg-slate-900/90 border border-yellow-400/30 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Generalisasi Bentuk Umum:
                </span>
                <div className="font-mono text-2xl md:text-3xl font-extrabold text-yellow-300">
                  q = n × e
                </div>
                <p className="text-[11px] font-sans text-slate-300 mt-1">
                  Dalam fisika, satuan dasar terkecil ini diberi simbol <b className="text-cyan-300 font-mono">e</b> (muatan elementer), dengan <b className="text-cyan-300 font-mono">n = 1, 2, 3...</b> (bilangan bulat).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-white/10">
                <div>
                  <span className="text-slate-400 block text-[10px]">SATUAN TERUKUR DARI DATAMU:</span>
                  <span className="text-cyan-300 font-bold text-sm">e ≈ {unitDisplay} × 10⁻¹⁹ C</span>
                </div>
                <div className="hidden sm:block w-px h-7 bg-white/10" />
                <div>
                  <span className="text-slate-400 block text-[10px]">STANDAR NIST 2018 (1 ELEKTRON):</span>
                  <span className="text-emerald-400 font-bold text-sm">e = 1.602 × 10⁻¹⁹ C</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormalizationStep(1)}
                className="text-xs cursor-pointer border-white/20 text-slate-300"
              >
                Kembali
              </Button>
              <Button
                size="md"
                onClick={() => setFormalizationStep(3)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display px-6 h-10 cursor-pointer flex items-center gap-2 text-xs"
              >
                Lanjut: Makna Kuantisasi <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: QUANTIZATION CONCEPT (CONTINUOUS VS DISCRETE) ── */}
        {formalizationStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-300">
                Langkah 3 dari 3 · Makna Fisika Kuantisasi
              </span>
            </div>

            <h3 className="font-display font-bold text-xl md:text-2xl text-white">
              Apa Artinya Muatan Terkuantisasi?
            </h3>

            {/* Continuous vs Quantized Visual Model */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block font-mono">
                  Gagasan Kontinu (Zat Cair Bebas)
                </span>
                <div className="h-1 bg-slate-600 rounded-full my-4 relative">
                  <div className="w-3 h-3 rounded-full bg-slate-400 absolute top-1/2 -translate-y-1/2 left-[43%]" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Muatan diasumsikan dapat bernilai berapa saja di sembarang titik pecahan tanpa batas (seperti air yang dapat ditakar dalam desimal sembarang).
                </p>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] block font-mono">
                  Gagasan Kuantisasi (Paket Terpisah)
                </span>
                <div className="h-1 bg-cyan-900 rounded-full my-4 relative flex justify-between items-center px-1">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <div key={step} className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white shadow-xs" />
                  ))}
                </div>
                <p className="text-[11px] text-cyan-200 leading-relaxed font-sans">
                  Muatan hanya dapat bertambah dalam langkah-langkah diskret ($1e, 2e, 3e, 4e$). Tidak pernah ditemukan tetesan bermuatan $0.5e$ atau $1.5e$.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p>
                <b>Catatan Eksperimen Ilmiah:</b> Pengukuran nyata di laboratorium selalu mengandung ketidakpastian dan sedikit variasi acak (noise), namun pola dasarnya terbukti kuat menunjukkan struktur diskret tak terbagi.
              </p>
            </div>

            {/* Final Transition CTA to Reflection */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormalizationStep(2)}
                className="text-xs cursor-pointer border-white/20 text-slate-300 w-full sm:w-auto"
              >
                Kembali ke Persamaan
              </Button>
              <Button
                size="lg"
                onClick={onContinueToReflection}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display px-8 h-12 shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2 text-xs transition-all transform hover:scale-[1.01]"
              >
                Lanjut ke Refleksi Metakognitif <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
