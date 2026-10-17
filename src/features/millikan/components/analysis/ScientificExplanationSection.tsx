"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, TrendingUp, BarChart2, BarChart3, Atom,
  CheckCircle2, AlertCircle, Info, ArrowRight, ShieldCheck, HelpCircle
} from "lucide-react";
import {
  ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Area, Line, Bar, Cell, LabelList
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnrichedDroplet {
  id: number;
  dropletLabel?: string;
  r: number;
  V: number;
  tf: number;
  tr: number;
  q: number;
  cf: number;
  qCorr: number;
  uncRel: number;
  qUncAbs?: number;
  qCorrUncAbs?: number;
  n: number;
  method?: "dynamic" | "balanced";
}

interface ScientificExplanationSectionProps {
  trials: EnrichedDroplet[];
  calculatedE_stokes: number;
  calculatedE_corr: number;
  stdDev: number;
  errorPct_stokes: number;
  errorPct_corr: number;
  E_REF: number;
  moduleSlug: string;
}

export function ScientificExplanationSection({
  trials,
  calculatedE_stokes,
  calculatedE_corr,
  stdDev,
  errorPct_stokes,
  errorPct_corr,
  E_REF,
  moduleSlug,
}: ScientificExplanationSectionProps) {
  const [activeChartTab, setActiveChartTab] = useState<"scatter" | "histogram" | "convergence">("scatter");

  // Quantum bands (±10% tolerance)
  const Q_BAND_PCT = 0.10;
  const qBands = [1, 2, 3, 4, 5, 6].map((n) => ({
    n,
    center: n * E_REF,
    lo: n * E_REF * (1 - Q_BAND_PCT),
    hi: n * E_REF * (1 + Q_BAND_PCT),
  }));

  const BIN_WIDTH = 0.8;
  const histogramData = React.useMemo(() => {
    const bins: Record<string, { bin: number; count: number; label: string; qRange: string }> = {};
    trials.forEach((t) => {
      const binIdx = Math.floor(t.qCorr / BIN_WIDTH);
      const key = `${binIdx}`;
      if (!bins[key]) {
        const lo = (binIdx * BIN_WIDTH).toFixed(1);
        const hi = ((binIdx + 1) * BIN_WIDTH).toFixed(1);
        bins[key] = {
          bin: parseFloat(((binIdx + 0.5) * BIN_WIDTH).toFixed(2)),
          count: 0,
          label: `${lo}–${hi}`,
          qRange: `${lo}–${hi}`,
        };
      }
      bins[key].count++;
    });
    return Object.values(bins).sort((a, b) => a.bin - b.bin);
  }, [trials]);

  function binZone(binCenter: number): number {
    for (const b of qBands) {
      if (binCenter >= b.lo && binCenter <= b.hi) return b.n;
    }
    return 0;
  }

  const convergenceData = React.useMemo(() => {
    const valid = trials.filter((t) => t.n > 0 && t.qCorr > 0);
    const result: {
      trial: number; stokes: number; corrected: number;
      s_upper: number; s_lower: number; c_upper: number; c_lower: number;
    }[] = [];
    let sumE = 0, sumE2 = 0, sumEc = 0, sumEc2 = 0;
    for (let i = 0; i < valid.length; i++) {
      const e = valid[i].q / valid[i].n;
      const ec = valid[i].qCorr / valid[i].n;
      sumE += e;
      sumE2 += e ** 2;
      sumEc += ec;
      sumEc2 += ec ** 2;
      const meanE = sumE / (i + 1);
      const meanEc = sumEc / (i + 1);
      const varE = i > 0 ? Math.max(0, sumE2 / (i + 1) - meanE ** 2) : 0;
      const varEc = i > 0 ? Math.max(0, sumEc2 / (i + 1) - meanEc ** 2) : 0;
      result.push({
        trial: i + 1,
        stokes: parseFloat(meanE.toFixed(4)),
        corrected: parseFloat(meanEc.toFixed(4)),
        s_upper: parseFloat((meanE + Math.sqrt(varE)).toFixed(4)),
        s_lower: parseFloat(Math.max(0, meanE - Math.sqrt(varE)).toFixed(4)),
        c_upper: parseFloat((meanEc + Math.sqrt(varEc)).toFixed(4)),
        c_lower: parseFloat(Math.max(0, meanEc - Math.sqrt(varEc)).toFixed(4)),
      });
    }
    return result;
  }, [trials]);

  const sem = stdDev / Math.sqrt(Math.max(1, trials.length));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Guiding Theory Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-primary-navy border border-indigo-500/30 text-white rounded-2xl p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-400/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Tahap 05: Teori Ilmiah & Verifikasi NIST
              </span>
              <Badge variant="success" size="sm">
                Kuantisasi Terverifikasi
              </Badge>
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Mengapa Muatan Listrik Berbentuk Paket Diskret?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Di alam semesta, muatan listrik tidak kontinu seperti cairan yang dapat ditakar dalam pecahan berapapun. Listrik selalu berpindah dalam paket partikel dasar yang tak terbagi: <b>elektron</b> ($e$). Setiap tetesan minyak yang disemprotkan dari atomizer menangkap atau kehilangan sejumlah bilangan bulat elektron ($n = 1, 2, 3...$), sehingga muatannya selalu terkuantisasi:
            </p>
            <div className="pt-1 flex items-center gap-3">
              <span className="font-mono text-xl font-extrabold text-yellow-300 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                q = n · e
              </span>
              <span className="text-xs text-slate-300 font-sans">
                di mana e ≈ {calculatedE_corr.toFixed(3)} × 10⁻¹⁹ C (Standar NIST: {E_REF} × 10⁻¹⁹ C)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Scientific Concepts */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-primary-navy">
            <Atom className="w-4 h-4 text-accent-cobalt" />
            1. Partikel Diskret vs Fluida Kontinu
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Sebelum eksperimen Millikan, para fisikawan memperdebatkan apakah listrik adalah fluida kontinu atau partikel. Temuan ini membuktikan secara definitif eksistensi elektron sebagai partikel pembawa muatan fundamental.
          </p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-primary-navy">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            2. Mengapa Hasil Tidak Tepat Bulat?
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Di lab riil, rasio $q/e$ muncul sebagai 2.98 atau 4.04 karena <b>Gerak Brownian</b> (tumbukan molekul udara acak pada tetesan), ketidakpastian stopwatch manusia (~0.15s), dan fluktuasi medan tegangan.
          </p>
        </div>

        <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-primary-navy">
            <ShieldCheck className="w-4 h-4 text-teal" />
            3. Peran Koreksi Slip Cunningham
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Hukum Stokes mengasumsikan udara sebagai fluida mulus tanpa celah. Namun untuk tetesan sekecil 1-2 µm, tetesan sering &apos;tergelincir&apos; di sela molekul udara. Koreksi Cunningham meningkatkan akurasi dari galat 5% ke &lt; 2%.
          </p>
        </div>
      </div>

      {/* Interactive Charts & Results Layout */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: Interactive Visualizations (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Visual Tab Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "scatter", label: "Tangga Kuantum (q vs n)", icon: <BarChart2 className="w-3.5 h-3.5" /> },
              { id: "histogram", label: "Puncak Frekuensi Muatan", icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: "convergence", label: "Konvergensi Estimasi e", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveChartTab(tab.id as "scatter" | "histogram" | "convergence")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeChartTab === tab.id
                    ? "bg-accent-cobalt text-white shadow-sm"
                    : "bg-white border border-border-default text-text-muted hover:border-accent-cobalt/30"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Viewport */}
          <div className="bg-white rounded-2xl border border-border-default p-5 shadow-card">
            <AnimatePresence mode="wait">
              {/* Scatter Chart with Quantum Bands */}
              {activeChartTab === "scatter" && (
                <motion.div key="scatter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-display font-bold text-primary-navy text-sm">
                      Sebaran Muatan dengan Pita Kuantum (1e, 2e, 3e, 4e, 5e, 6e)
                    </h4>
                    <span className="text-[10px] font-mono text-accent-cobalt bg-accent-cobalt/10 px-2 py-0.5 rounded-full font-bold">
                      Toleransi ±10%
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-4 leading-relaxed">
                    Setiap pita berwarna mewakili satu tingkat kelebihan elektron ($n$). Titik-titik data eksperimenmu terbukti jatuh tepat di dalam pita-pita diskret tersebut!
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart margin={{ top: 10, right: 40, bottom: 25, left: 10 }} data={trials}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                          dataKey="id"
                          type="number"
                          allowDecimals={false}
                          label={{ value: "Nomor Observasi Tetes", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          domain={[0, "dataMax+1"]}
                        />
                        <YAxis
                          type="number"
                          domain={[0, 12]}
                          label={{ value: "Muatan q (×10⁻¹⁹ C)", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 11, fontFamily: "monospace" }}
                          formatter={(val, name, item) => [
                            `${typeof val === "number" ? val.toFixed(3) : val} × 10⁻¹⁹ C (${(item as { payload: { n: number } }).payload.n}e)`,
                            name === "qCorr" ? "q Terkoreksi" : "q Stokes"
                          ]}
                        />
                        {qBands.map((b, idx) => (
                          <ReferenceArea
                            key={idx}
                            y1={b.lo}
                            y2={b.hi}
                            fill={idx % 2 === 0 ? "#0ea5e9" : "#8b5cf6"}
                            fillOpacity={0.07}
                            ifOverflow="hidden"
                          />
                        ))}
                        {qBands.map((b, idx) => (
                          <ReferenceLine
                            key={`rl-${idx}`}
                            y={b.center}
                            stroke={idx % 2 === 0 ? "#0ea5e9" : "#8b5cf6"}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            label={{ value: `${b.n}e`, fill: idx % 2 === 0 ? "#0284c7" : "#7c3aed", fontSize: 10, position: "right" }}
                          />
                        ))}
                        <Scatter
                          dataKey="q"
                          fill="#64748B"
                          r={4}
                          name="q Stokes (mentah)"
                        />
                        <Scatter
                          dataKey="qCorr"
                          fill="#0D9488"
                          r={6}
                          stroke="#fff"
                          strokeWidth={1.5}
                          name="q (+ Cunningham)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-text-muted flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" /> q Stokes</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal" /> q Terkoreksi (+Cunningham)</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-2.5 rounded bg-[#0ea5e9]/20" /> Tingkat Kuantum (1e–6e)</span>
                  </div>
                </motion.div>
              )}

              {/* Histogram */}
              {activeChartTab === "histogram" && (
                <motion.div key="histogram" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h4 className="font-display font-bold text-primary-navy text-sm mb-1">
                    Distribusi Frekuensi Muatan
                  </h4>
                  <p className="text-xs text-text-muted mb-4 leading-relaxed">
                    Pengelompokan data dalam histogram memperlihatkan puncak-puncak frekuensi yang terpisah secara teratur di sekitar kelipatan e ≈ 1.6 × 10⁻¹⁹ C.
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={histogramData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                          dataKey="label"
                          label={{ value: "Rentang q (×10⁻¹⁹ C)", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 10, fill: "#64748B" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          label={{ value: "Frekuensi Tetes", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11 }}
                          formatter={(v, _, p) => {
                            const zone = binZone((p as { payload: { bin: number } }).payload.bin);
                            return [`${v} droplet${zone ? ` — tingkat ${zone}e` : ""}`, "Jumlah"];
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={55}>
                          {histogramData.map((entry, i) => {
                            const zone = binZone(entry.bin);
                            const colors = ["#94a3b8", "#0ea5e9", "#8b5cf6", "#14b8a6", "#f97316", "#ef4444", "#22c55e"];
                            return <Cell key={i} fill={zone ? colors[zone] : "#cbd5e1"} fillOpacity={0.85} />;
                          })}
                          <LabelList
                            dataKey="count"
                            position="top"
                            style={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }}
                            formatter={(v) => (Number(v) > 0 ? v : "")}
                          />
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Convergence */}
              {activeChartTab === "convergence" && (
                <motion.div key="convergence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h4 className="font-display font-bold text-primary-navy text-sm mb-1">
                    Konvergensi Nilai e Menuju Standar NIST (Running Average ± 1σ)
                  </h4>
                  <p className="text-xs text-text-muted mb-4 leading-relaxed">
                    Seiring bertambahnya jumlah tetesan yang diteliti, fluktuasi acak saling meniadakan dan rata-rata kumulatif $e$ semakin presisi menuju nilai NIST.
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={convergenceData} margin={{ top: 10, right: 40, bottom: 25, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                          dataKey="trial"
                          allowDecimals={false}
                          label={{ value: "Jumlah Trial Kumulatif", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <YAxis
                          domain={[1.0, 2.2]}
                          label={{ value: "Estimasi e (×10⁻¹⁹ C)", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <ReferenceLine
                          y={E_REF}
                          stroke="#ef4444"
                          strokeWidth={1.5}
                          strokeDasharray="6 3"
                          label={{ value: `NIST: ${E_REF}`, fill: "#ef4444", fontSize: 10, position: "right" }}
                        />
                        <Area type="monotone" dataKey="c_upper" stroke="none" fill="#14b8a6" fillOpacity={0.12} />
                        <Area type="monotone" dataKey="c_lower" stroke="none" fill="#ffffff" fillOpacity={1} />
                        <Line
                          type="monotone"
                          dataKey="corrected"
                          stroke="#14b8a6"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "#14b8a6", stroke: "#fff", strokeWidth: 1.5 }}
                          name="Rata-rata Terkoreksi"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Results Cards & Detailed Evidence (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-border-default p-5 shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-primary-navy">
                Nilai Muatan Elementer (e) Terukur
              </h4>
              <Badge variant={errorPct_corr < 3 ? "success" : "primary"} size="sm">
                {errorPct_corr < 3 ? "✓ Sangat Akurat" : "Valid"}
              </Badge>
            </div>

            <div className="bg-teal/5 border border-teal/20 rounded-xl p-3.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-teal uppercase tracking-wider mb-1">
                <span>Rekomendasi (+ Cunningham)</span>
                <span className="font-bold">Δ {errorPct_corr.toFixed(2)}% vs NIST</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-teal">
                  {calculatedE_corr.toFixed(4)}
                </span>
                <span className="font-mono text-xs text-text-muted">× 10⁻¹⁹ C</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-border-default rounded-xl p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Stokes (Tanpa Koreksi):</span>
                <span className="font-bold">{calculatedE_stokes.toFixed(4)} × 10⁻¹⁹ C</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standar NIST 2018:</span>
                <span className="font-bold text-primary-navy">{E_REF} × 10⁻¹⁹ C</span>
              </div>
              <div className="flex justify-between border-t border-border-default pt-1.5 text-text-muted text-[11px]">
                <span>Standar Deviasi (σ):</span>
                <span>±{stdDev.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-text-muted text-[11px]">
                <span>Standar Error Mean (SEM):</span>
                <span>±{sem.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Per-Trial Quantum Decomposition Table */}
          <div className="bg-white rounded-2xl border border-border-default p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-primary-navy">
                Dekomposisi Kuantum Tiap Tetes
              </h4>
              <span className="text-[10px] font-mono text-text-muted">
                q = n · e
              </span>
            </div>

            <div className="rounded-xl border border-border-default overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-slate-50 border-b border-border-default text-text-muted text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">q Terkoreksi</th>
                    <th className="p-2">Kuantum n</th>
                    <th className="p-2">e Terhitung</th>
                    <th className="p-2">Galat %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/50">
                  {trials.map((t) => {
                    const eSingle = t.n > 0 ? t.qCorr / t.n : 0;
                    const err = Math.abs((eSingle - E_REF) / E_REF * 100);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="p-2 text-text-muted">#{t.id}</td>
                        <td className="p-2 font-bold text-slate-700">{t.qCorr.toFixed(2)}</td>
                        <td className="p-2 font-bold text-accent-cobalt">{t.n}e</td>
                        <td className="p-2 text-teal font-semibold">{eSingle.toFixed(3)}</td>
                        <td className={cn("p-2 font-semibold", err < 3 ? "text-success" : "text-amber-600")}>
                          {err.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proceed to Reflection Action */}
          <div className="bg-gradient-to-r from-accent-cobalt/5 to-teal/5 border border-accent-cobalt/20 rounded-2xl p-5 text-center space-y-3">
            <h5 className="font-display font-bold text-sm text-primary-navy">
              Siap Membandingkan Temuanmu dengan Hipotesis Awal?
            </h5>
            <p className="text-xs text-text-muted leading-relaxed">
              Di tahap refleksi, AI Socratic akan membandingkan dugaan yang kamu buat sebelum eksperimen dengan bukti empiris yang baru saja kamu temukan.
            </p>
            <Button
              size="lg"
              onClick={() => {
                window.location.href = `/modules/${moduleSlug}/reflection`;
              }}
              className="w-full bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold py-2.5 shadow-sm"
            >
              Lanjut ke Refleksi Kognitif
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
