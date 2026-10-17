"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, HelpCircle, ArrowRight, ChevronDown, ChevronUp, Atom, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TransformedDroplet {
  id: number;
  dropletLabel?: string;
  r: number;
  V: number;
  q: number;
  cf: number;
  qCorr: number;
  uncRel: number;
}

interface TransformationSectionProps {
  trials: TransformedDroplet[];
  onProceedToPatternHunting: () => void;
}

export function TransformationSection({
  trials,
  onProceedToPatternHunting,
}: TransformationSectionProps) {
  const [showFormulaDetail, setShowFormulaDetail] = useState(false);
  const [selectedIntuition, setSelectedIntuition] = useState<"pattern" | "related" | "unsure" | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Guiding Question Banner */}
      <div className="bg-gradient-to-r from-teal/5 via-cyan-500/5 to-accent-cobalt/5 border border-teal/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal">
                Tahap 02: Transformasi Fisika
              </span>
              <Badge variant="primary" size="sm">
                Stokes + Koreksi Slip Cunningham
              </Badge>
            </div>
            <h3 className="font-display font-bold text-base text-primary-navy">
              Bagaimana data gerak dan tegangan berubah menjadi muatan listrik (q)?
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
              Kita tidak bisa mengukur muatan listrik secara langsung menggunakan sensor optik. Namun melalui kesetimbangan antara gaya gravitasi, gaya apung, gaya hambat viskositas udara (Stokes), dan gaya medan listrik elektrostatik, muatan $q$ dapat dihitung secara presisi.
            </p>
          </div>
        </div>
      </div>

      {/* Physics Bridge Visual Cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-display font-semibold text-primary-navy">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            1. Jatuh Bebas (Stokes)
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Gaya gravitasi efektif seimbang dengan gaya gesek udara:
          </p>
          <div className="bg-slate-50 rounded-lg p-2 font-mono text-[11px] text-primary-navy text-center border border-border-default/60">
            F<sub>g</sub> = 6π · η · r · v<sub>f</sub>
          </div>
          <p className="text-[10px] text-slate-500">
            → Menghasilkan radius tetes (r) dan massa tetes (m).
          </p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-display font-semibold text-primary-navy">
            <span className="w-2 h-2 rounded-full bg-accent-cobalt" />
            2. Medan Listrik (Coulomb)
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Medan listrik seragam E = V/d menarik muatan q ke atas:
          </p>
          <div className="bg-slate-50 rounded-lg p-2 font-mono text-[11px] text-primary-navy text-center border border-border-default/60">
            F<sub>e</sub> = q · (V / d)
          </div>
          <p className="text-[10px] text-slate-500">
            → Menghasilkan nilai muatan mentah (q Stokes).
          </p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-display font-semibold text-primary-navy">
            <span className="w-2 h-2 rounded-full bg-teal" />
            3. Koreksi Cunningham
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Karena ukuran tetes mikro mendekati jarak bebas molekul udara (λ ≈ 65 nm):
          </p>
          <div className="bg-slate-50 rounded-lg p-2 font-mono text-[11px] text-teal font-semibold text-center border border-border-default/60">
            C(r) = 1 + A · (λ / r)
          </div>
          <p className="text-[10px] text-slate-500">
            → q<sub>terkoreksi</sub> = q<sub>Stokes</sub> · C(r).
          </p>
        </div>
      </div>

      {/* Expandable Physics Derivation Details */}
      <div className="bg-white border border-border-default rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowFormulaDetail(!showFormulaDetail)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-accent-cobalt" />
            <span className="font-display font-semibold text-xs text-primary-navy">
              🔬 Buka Penjelasan Rumus & Parameter Fisika Lengkap
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>{showFormulaDetail ? "Sembunyikan" : "Pelajari"}</span>
            {showFormulaDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showFormulaDetail && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border-default p-5 bg-slate-900 text-slate-300 font-mono text-xs space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                    1. Menghitung Jari-Jari Tetes (r)
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Dengan gaya apung Archimedes pada fluida udara:
                  </p>
                  <div className="bg-slate-800 p-2.5 rounded-lg text-emerald-300 text-[11px]">
                    r = √[ (9 · η · v_f) / (2 · (ρ_minyak - ρ_udara) · g) ]
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Konstanta: η = 1.832×10⁻⁵ Pa·s, ρ_minyak = 886 kg/m³, ρ_udara = 1.204 kg/m³, g = 9.80665 m/s².
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                    2. Menghitung Muatan Listrik (q)
                  </h5>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Pada gerak vertikal dengan jarak pelat d = 6.0 mm:
                  </p>
                  <div className="bg-slate-800 p-2.5 rounded-lg text-yellow-300 text-[11px]">
                    q_stokes = [ 6π · η · r · (v_f + v_r) · d ] / V
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Saat tetes dibuat seimbang melayang (v_r = 0), rumusnya menyederhanakan menjadi: q = (m_eff · g · d) / V.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold">Catatan Sejarah:</span> Pada tahun 1909, Millikan menggunakan nilai viskositas udara standar saat itu yang sedikit meleset, menghasilkan e ≈ 1.592×10⁻¹⁹ C. Setelah koreksi Cunningham dan pembaharuan nilai viskositas udara modern, hasil Millikan terbukti luar biasa akurat mendekati standar NIST modern.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calculated Charges Table */}
      <div className="bg-white border border-border-default rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Daftar Muatan Listrik Terhitung (q)
            </h4>
            <p className="text-xs text-text-muted">
              Muatan dihitung untuk setiap tetesan tanpa asumsi apapun mengenai nilai kuantum
            </p>
          </div>
          <Badge variant="primary" size="sm">
            Satuan: ×10⁻¹⁹ Coulomb
          </Badge>
        </div>

        <div className="rounded-xl border border-border-default overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-border-default text-text-muted font-display text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Droplet #</th>
                <th className="py-2.5 px-3">Radius (r)</th>
                <th className="py-2.5 px-3">Tegangan (V)</th>
                <th className="py-2.5 px-3">q Stokes (10⁻¹⁹ C)</th>
                <th className="py-2.5 px-3">Koreksi Cunningham C(r)</th>
                <th className="py-2.5 px-3">q Terkoreksi (10⁻¹⁹ C)</th>
                <th className="py-2.5 px-3">Estimasi Ketidakpastian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 font-mono text-[11px]">
              {trials.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-primary-navy">
                    {t.dropletLabel || `Tetes #${t.id}`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {t.r.toFixed(2)} µm
                  </td>
                  <td className="py-2.5 px-3 text-indigo-700">
                    {t.V} V
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-bold">
                    {t.q.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-600">
                    {t.cf ? t.cf.toFixed(3) : "1.050"}×
                  </td>
                  <td className="py-2.5 px-3 text-teal font-extrabold text-xs">
                    {t.qCorr ? t.qCorr.toFixed(2) : (t.q * 1.05).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans text-[10px]">
                    ±{((t.uncRel || 0.05) * 100).toFixed(1)}% (stopwatch & optik)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cognitive Transition Gate */}
      <div className="bg-slate-50 border border-border-default rounded-2xl p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-cobalt" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
              Sebelum Melanjutkan
            </span>
          </div>
          <h4 className="font-display font-bold text-base text-primary-navy">
            Dari nilai yang kamu lihat, apakah kamu merasa ada hubungan yang menarik untuk diselidiki?
          </h4>
          <p className="text-xs text-text-muted">
            Pilihlah yang paling menggambarkan pengamatan intuitifmu saat ini. Tidak ada penilaian benar atau salah.
          </p>
        </div>

        {/* 3 Lightweight Observation Options */}
        <div className="grid sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "pattern",
              label: "Ya, saya melihat kemungkinan pola",
              guidance: "Bagus. Mari uji apakah dugaanmu benar.",
            },
            {
              id: "related",
              label: "Ada beberapa nilai yang tampak berhubungan",
              guidance: "Mari kita bandingkan nilainya dengan lebih sistematis.",
            },
            {
              id: "unsure",
              label: "Saya belum yakin",
              guidance: "Itu tidak masalah. Sains sering dimulai dari sesuatu yang belum jelas. Mari kita selidiki bersama.",
            },
          ].map((opt) => {
            const isSelected = selectedIntuition === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedIntuition(opt.id as any)}
                className={cn(
                  "p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between min-h-[64px]",
                  isSelected
                    ? "bg-white border-accent-cobalt ring-2 ring-accent-cobalt/20 shadow-sm text-primary-navy font-semibold"
                    : "bg-white/70 border-border-default hover:border-slate-300 text-text-muted hover:text-text-primary"
                )}
              >
                <span>{opt.label}</span>
                <span className={cn("w-3.5 h-3.5 rounded-full border mt-2 flex items-center justify-center text-[9px] self-end",
                  isSelected ? "border-accent-cobalt bg-accent-cobalt text-white" : "border-slate-300"
                )}>
                  {isSelected && "✓"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Adaptive Guidance Message */}
        <AnimatePresence mode="wait">
          {selectedIntuition && (
            <motion.div
              key={selectedIntuition}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-white border border-accent-cobalt/20 rounded-xl p-3.5 text-xs text-primary-navy font-medium flex items-center gap-2.5 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-accent-cobalt animate-ping flex-shrink-0" />
              <span>
                {selectedIntuition === "pattern" && "Bagus. Mari uji apakah dugaanmu benar."}
                {selectedIntuition === "related" && "Mari kita bandingkan nilainya dengan lebih sistematis."}
                {selectedIntuition === "unsure" && "Itu tidak masalah. Sains sering dimulai dari sesuatu yang belum jelas. Mari kita selidiki bersama."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary CTA */}
        <div className="pt-2 flex justify-end">
          <Button
            size="md"
            onClick={onProceedToPatternHunting}
            className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer flex items-center gap-2 text-xs font-bold px-6 py-2.5 shadow-sm"
          >
            MULAI MENYELIDIKI POLA
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
