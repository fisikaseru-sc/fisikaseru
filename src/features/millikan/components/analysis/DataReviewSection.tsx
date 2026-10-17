"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, HelpCircle, ArrowRight, Activity, Gauge, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DropletRecord {
  id: number;
  dropletLabel?: string;
  r: number;
  V: number;
  tf: number;
  tr: number;
  vf?: number;
  vr?: number;
  method?: "dynamic" | "balanced";
}

interface DataReviewSectionProps {
  trials: DropletRecord[];
  onProceedToTransform: () => void;
}

export function DataReviewSection({
  trials,
  onProceedToTransform,
}: DataReviewSectionProps) {
  const radii = trials.map((t) => t.r).filter((r) => !isNaN(r));
  const minR = radii.length ? Math.min(...radii).toFixed(2) : "0";
  const maxR = radii.length ? Math.max(...radii).toFixed(2) : "0";

  const voltages = trials.map((t) => t.V).filter((v) => !isNaN(v));
  const minV = voltages.length ? Math.min(...voltages) : 0;
  const maxV = voltages.length ? Math.max(...voltages) : 0;

  const avgTf = trials.length
    ? (trials.reduce((acc, t) => acc + (t.tf || 0), 0) / trials.length).toFixed(2)
    : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Guiding Question Banner */}
      <div className="bg-gradient-to-r from-accent-cobalt/5 via-sky-500/5 to-teal/5 border border-accent-cobalt/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-accent-cobalt/10 text-accent-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
                Fokus Observasi Awal
              </span>
              <Badge variant="primary" size="sm">
                {trials.length} Observasi Tercatat
              </Badge>
            </div>
            <h3 className="font-display font-bold text-base text-primary-navy">
              Apakah semua tetesan minyak berperilaku identik?
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
              Perhatikan data mentah yang terbaca langsung dari instrumen ruang eksperimen. Ukuran tetes berbeda-beda, kecepatan jatuh bebas tidak sama, dan tegangan listrik yang diperlukan untuk mengendalikan gerakannya pun berbeda.
            </p>
          </div>
        </div>
      </div>

      {/* Observation Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-border-default rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] mb-1 font-display">
            <Eye className="w-3.5 h-3.5 text-accent-cobalt" /> Total Tetes Terukur
          </div>
          <div className="font-mono text-xl font-bold text-primary-navy">
            {trials.length} <span className="text-xs font-normal text-text-muted font-sans">tetes</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Memenuhi syarat min. 5 data</p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] mb-1 font-display">
            <Gauge className="w-3.5 h-3.5 text-teal" /> Rentang Radius (r)
          </div>
          <div className="font-mono text-xl font-bold text-teal">
            {minR} – {maxR} <span className="text-xs font-normal text-text-muted font-sans">µm</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Variasi ukuran aerosol</p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] mb-1 font-display">
            <Activity className="w-3.5 h-3.5 text-indigo-600" /> Rentang Voltase (V)
          </div>
          <div className="font-mono text-xl font-bold text-indigo-600">
            {minV} – {maxV} <span className="text-xs font-normal text-text-muted font-sans">Volt</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Tegangan pelat pembelok</p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] mb-1 font-display">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Waktu Jatuh Rata-rata
          </div>
          <div className="font-mono text-xl font-bold text-amber-600">
            {avgTf} <span className="text-xs font-normal text-text-muted font-sans">detik</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Lintasan 1.0 mm (gravitasi)</p>
        </div>
      </div>

      {/* Raw Empirical Data Table */}
      <div className="bg-white border border-border-default rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Log Data Observasi Eksperimen
            </h4>
            <p className="text-xs text-text-muted">
              Data murni kinematika dan instrumen sebelum diubah ke besaran muatan listrik
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            ● Instrumen Siap Diolah
          </span>
        </div>

        <div className="rounded-xl border border-border-default overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-border-default text-text-muted font-display text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Droplet #</th>
                <th className="py-2.5 px-3">Radius Tetes (r)</th>
                <th className="py-2.5 px-3">Tegangan Pelat (V)</th>
                <th className="py-2.5 px-3">Waktu Jatuh (tf)</th>
                <th className="py-2.5 px-3">Status / Waktu Naik (tr)</th>
                <th className="py-2.5 px-3">Kecepatan Jatuh (vf)</th>
                <th className="py-2.5 px-3">Kondisi Pengamatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60 font-mono text-[11px]">
              {trials.map((t, idx) => {
                const vfMm = t.vf ? (t.vf * 1000).toFixed(2) : (1.0 / t.tf).toFixed(2);
                const isBalanced = t.method === "balanced" || t.tr >= 50;
                return (
                  <tr key={t.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-primary-navy">
                      {t.dropletLabel || `Tetes #${t.id || idx + 1}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {t.r.toFixed(2)} µm
                    </td>
                    <td className="py-2.5 px-3 text-indigo-700 font-semibold">
                      {t.V} V
                    </td>
                    <td className="py-2.5 px-3 text-amber-700">
                      {t.tf.toFixed(2)} s
                    </td>
                    <td className="py-2.5 px-3">
                      {isBalanced ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-sans font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Melayang Seimbang
                        </span>
                      ) : (
                        <span className="text-teal font-semibold font-mono">
                          {t.tr.toFixed(2)} s
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {vfMm} mm/s
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 text-[10px]">
                      {isBalanced ? "Fe = Fg (Seimbang)" : "Fe > Fg (Naik teratur)"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discovery Prompt & Stage Transition */}
      <div className="bg-slate-50 border border-border-default rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-sm text-primary-navy">
            Pertanyaan Kunci: Berapa muatan listrik pada masing-masing tetes?
          </h4>
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            Dari hukum Stokes dan kesetimbangan gaya listrik ($F_e = qE$), kita dapat menurunkan nilai muatan listrik $q$ dari waktu tempuh dan tegangan. Mari kita terjemahkan data gerak ini.
          </p>
        </div>
        <Button
          size="md"
          onClick={onProceedToTransform}
          className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer flex-shrink-0 flex items-center gap-2 text-xs font-semibold px-5 shadow-sm"
        >
          Lanjut: Terjemahkan ke Muatan Listrik
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
