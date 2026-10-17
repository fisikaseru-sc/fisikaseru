"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, HelpCircle, ArrowRight, RefreshCw,
  Search, Plus, Minus, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NumberLineVisualization } from "./analysis/NumberLineVisualization";
import { CandidateHistory, type TestedCandidateRecord } from "./analysis/CandidateHistory";
import { PatternObservationPrompt } from "./analysis/PatternObservationPrompt";
import { PreDiscoveryModal } from "./analysis/PreDiscoveryModal";
import { trackLearningEvent } from "../analytics/learningEvents";

interface DropletTrial {
  id: number;
  dropletLabel?: string;
  r: number;
  V: number;
  q: number;
  cf?: number;
  qCorr?: number;
}

interface PatternDiscoveryToolProps {
  trials: DropletTrial[];
  onPatternDiscovered: (discoveredUnit: number) => void;
  isAlreadyDiscovered: boolean;
}

export function PatternDiscoveryTool({
  trials,
  onPatternDiscovered,
  isAlreadyDiscovered,
}: PatternDiscoveryToolProps) {
  // Sort trials by measured charge q
  const sortedTrials = useMemo(() => {
    return [...trials].sort((a, b) => a.q - b.q);
  }, [trials]);

  // Smallest observed charge as a starting hypothesis
  const lowestCharge = sortedTrials.length > 0 ? sortedTrials[0].q : 1.6;
  const initialCandidate = parseFloat(lowestCharge.toFixed(2));

  // Candidate state
  const [candidateUnit, setCandidateUnit] = useState<number>(initialCandidate);
  const [candidateInputText, setCandidateInputText] = useState<string>(initialCandidate.toFixed(2));
  // Load candidate history from localStorage — lazy init (komponen ini
  // dirender di dalam Analysis/Experiment view yang dynamic ssr:false).
  // (Pembayaran debt lint: set-state-in-effect.)
  const [candidateHistory, setCandidateHistory] = useState<TestedCandidateRecord[]>(() => {
    try {
      const saved = localStorage.getItem("fisikaseru:pattern-history:millikan");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed as TestedCandidateRecord[];
      }
    } catch (_) {}
    return [];
  });
  const [showPreDiscoveryModal, setShowPreDiscoveryModal] = useState<boolean>(false);
  const [showDetailsTable, setShowDetailsTable] = useState<boolean>(false);
  const [hasTestedChange, setHasTestedChange] = useState<boolean>(false);

  // Sinkronkan teks input ketika candidateUnit berubah secara programatik
  // (slider/tombol) — pola "adjust state during render" dari dokumen React,
  // tanpa effect. (Pembayaran debt lint: set-state-in-effect.)
  const [prevCandidateUnit, setPrevCandidateUnit] = useState(candidateUnit);
  if (prevCandidateUnit !== candidateUnit) {
    setPrevCandidateUnit(candidateUnit);
    setCandidateInputText(candidateUnit.toFixed(2));
  }

  // Compute raw ratios and deviations for every droplet
  const ratioResults = useMemo(() => {
    if (candidateUnit <= 0) return [];
    return sortedTrials.map((t) => {
      const rawRatio = t.q / candidateUnit;
      const nearestInt = Math.round(rawRatio);
      const dev = Math.abs(rawRatio - nearestInt);
      return {
        id: t.id,
        label: t.dropletLabel,
        q: t.q,
        ratio: rawRatio,
        nearestInt,
        dev,
        isNear: dev <= 0.15,
      };
    });
  }, [sortedTrials, candidateUnit]);

  // Pattern consistency metrics (evidence-driven, no hardcoded answer constants)
  const meanDeviation = useMemo(() => {
    if (!ratioResults.length) return 1;
    return ratioResults.reduce((acc, r) => acc + r.dev, 0) / ratioResults.length;
  }, [ratioResults]);

  const nearCount = useMemo(() => {
    return ratioResults.filter((r) => r.isNear).length;
  }, [ratioResults]);

  const nearPercentage = useMemo(() => {
    return ratioResults.length > 0 ? (nearCount / ratioResults.length) * 100 : 0;
  }, [nearCount, ratioResults.length]);

  // Qualitative description for candidate history and feedback
  const consistencyDescription: "Titik-titik masih tersebar" | "Mulai memperlihatkan pola" | "Struktur lebih konsisten" = useMemo(() => {
    if (meanDeviation <= 0.12 && nearPercentage >= 80) return "Struktur lebih konsisten";
    if (meanDeviation <= 0.22 && nearPercentage >= 50) return "Mulai memperlihatkan pola";
    return "Titik-titik masih tersebar";
  }, [meanDeviation, nearPercentage]);

  // Evidence-driven discovery readiness
  const isDiscoveryReady = useMemo(() => {
    // 1. Data sufficiency
    if (trials.length < 5) return false;
    // 2. Candidate must not be zero or trivial
    if (candidateUnit < 0.5) return false;
    // 3. Evidence quality: high integer proximity across data
    const isConsistent = meanDeviation <= 0.14 && nearPercentage >= 80;
    // 4. Student has engaged (tested history or adjusted candidate)
    const hasExplored = hasTestedChange || candidateHistory.length >= 1 || isAlreadyDiscovered;
    return isConsistent && hasExplored;
  }, [trials.length, candidateUnit, meanDeviation, nearPercentage, hasTestedChange, candidateHistory.length, isAlreadyDiscovered]);

  // Log candidate to history
  const logCandidateTest = (unitToLog: number) => {
    setHasTestedChange(true);
    trackLearningEvent("millikan", "candidate_tested", {
      candidate: unitToLog,
      meanDeviation,
      nearPercentage,
      consistencyDescription,
    });
    setCandidateHistory((prev) => {
      const filtered = prev.filter((item) => Math.abs(item.candidate - unitToLog) > 0.02);
      const updated: TestedCandidateRecord[] = [
        ...filtered,
        {
          candidate: unitToLog,
          consistencyDescription,
          meanDeviation,
          testedAt: Date.now(),
        },
      ];
      try {
        localStorage.setItem("fisikaseru:pattern-history:millikan", JSON.stringify(updated.slice(-6)));
      } catch (_) {}
      return updated;
    });
  };

  const handleAdjust = (delta: number) => {
    const nextVal = Math.max(0.5, Math.min(3.5, parseFloat((candidateUnit + delta).toFixed(2))));
    setCandidateUnit(nextVal);
    setHasTestedChange(true);
  };

  const handleSliderChange = (val: number) => {
    setCandidateUnit(val);
    setHasTestedChange(true);
  };

  const handleTextInputBlur = () => {
    const parsed = parseFloat(candidateInputText);
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 3.5) {
      setCandidateUnit(parseFloat(parsed.toFixed(2)));
      setHasTestedChange(true);
    } else {
      setCandidateInputText(candidateUnit.toFixed(2));
    }
  };

  return (
    <div className="bg-white border border-border-default rounded-3xl p-6 md:p-7 shadow-card space-y-7">
      {/* ── Section 1: Introduction (Scientific Question) ── */}
      <div className="border-b border-border-default pb-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-cobalt animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
            Penyelidikan Ilmiah
          </span>
          <Badge variant={isAlreadyDiscovered ? "success" : "primary"} size="sm" className="ml-auto">
            {isAlreadyDiscovered ? "✓ Kuantisasi Terungkap" : "Uji Hipotesis"}
          </Badge>
        </div>

        <h3 className="font-display font-bold text-xl text-primary-navy tracking-tight">
          Cari Hubungan Antar Nilai
        </h3>

        <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
          Kamu telah memperoleh beberapa estimasi muatan. Sekarang pertanyaannya: apakah nilai-nilai tersebut benar-benar tidak berhubungan, atau justru memiliki struktur tersembunyi?
        </p>

        <div className="bg-slate-50 border border-border-default/80 rounded-xl p-3.5 mt-2 text-xs font-sans text-primary-navy flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-accent-cobalt flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pertanyaan Kunci:</span>
            <p className="text-text-muted mt-0.5">
              Bagaimana jika setiap nilai terdiri dari satu satuan dasar yang sama? Uji apakah beberapa nilai dapat dijelaskan menggunakan satu satuan dasar yang konsisten.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Candidate Unit Explorer ── */}
      <div className="bg-slate-50/80 border border-border-default rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
              Eksplorasi Hipotesis
            </span>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Kandidat Satuan
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCandidateUnit(initialCandidate);
                setHasTestedChange(true);
              }}
              className="text-[11px] h-8 px-2.5 cursor-pointer flex items-center gap-1 border-border-default bg-white"
            >
              <RefreshCw className="w-3 h-3 text-text-muted" />
              Titik Awal ({initialCandidate})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logCandidateTest(candidateUnit)}
              className="text-[11px] h-8 px-3 cursor-pointer border-accent-cobalt/30 text-accent-cobalt hover:bg-accent-cobalt/10 font-semibold"
            >
              Simpan Hipotesis Ini
            </Button>
          </div>
        </div>

        {/* Interactive Controls: Buttons + Numeric Input + Wide Slider */}
        <div className="bg-white border border-border-default rounded-xl p-4 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
            <span className="text-xs text-text-muted font-sans">
              Nilai yang diuji sebagai satuan pembagi:
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdjust(-0.05)}
                className="h-8 w-8 p-0 cursor-pointer text-xs"
                title="Kurangi 0.05"
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-border-default rounded-lg px-2.5 py-1">
                <input
                  type="number"
                  step={0.01}
                  min={0.5}
                  max={3.5}
                  value={candidateInputText}
                  onChange={(e) => setCandidateInputText(e.target.value)}
                  onBlur={handleTextInputBlur}
                  className="w-16 font-mono font-bold text-accent-cobalt text-sm bg-transparent focus:outline-hidden text-center"
                />
                <span className="font-mono text-xs text-text-muted">× 10⁻¹⁹ C</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdjust(0.05)}
                className="h-8 w-8 p-0 cursor-pointer text-xs"
                title="Tambah 0.05"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Broad Slider (0.50 to 3.50 × 10⁻¹⁹ C) */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0.5}
              max={3.5}
              step={0.05}
              value={candidateUnit}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-cobalt"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono px-0.5">
              <span>0.50</span>
              <span>1.50</span>
              <span>2.50</span>
              <span>3.50 × 10⁻¹⁹ C</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed font-sans">
          💡 <i>Nilai terkecil sering menjadi titik awal yang menarik untuk diuji. Mari lihat apakah kandidat ini dapat menjelaskan nilai lainnya.</i>
        </p>
      </div>

      {/* ── Section 3: Number Line Visualization (Primary Discovery Surface) ── */}
      <NumberLineVisualization ratios={ratioResults} maxRange={6} />

      {/* ── Section 4: Tested Hypotheses History ── */}
      <CandidateHistory
        history={candidateHistory}
        onReuseCandidate={(cand) => {
          setCandidateUnit(cand);
          setHasTestedChange(true);
        }}
        onCompareCandidates={(candA, candB) => {
          trackLearningEvent("millikan", "candidate_compared", { candA, candB });
        }}
      />

      {/* ── Section 5: Student Observation Prompt ── */}
      <PatternObservationPrompt
        onObservationSelected={() => {
          setHasTestedChange(true);
        }}
      />

      {/* Supporting Data Table (Collapsible Evidence) */}
      <div className="border border-border-default rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetailsTable(!showDetailsTable)}
          className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 text-left cursor-pointer transition-colors"
        >
          <span className="text-xs font-display font-semibold text-primary-navy">
            {showDetailsTable ? "Sembunyikan" : "Tampilkan"} Tabel Rincian Nilai Pembagian
          </span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            {showDetailsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence>
          {showDetailsTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-white border-t border-border-default overflow-x-auto"
            >
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-border-default text-text-muted text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Droplet</th>
                    <th className="py-2 px-3">q Terukur (10⁻¹⁹ C)</th>
                    <th className="py-2 px-3">Hasil Bagi (q / Kandidat)</th>
                    <th className="py-2 px-3">Deviasi ke Bulat</th>
                    <th className="py-2 px-3">Kondisi Keteraturan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60 text-[11px]">
                  {ratioResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-primary-navy">
                        {r.label || `#${r.id}`}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-bold">
                        {r.q.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-accent-cobalt font-extrabold">
                        {r.ratio.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        ±{r.dev.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        {r.isNear ? (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md">
                            Dekat posisi bulat
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            Tersebar bebas
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section 6: Discovery Readiness Signal (Subtle, Voluntary) ── */}
      {isDiscoveryReady && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent-cobalt/10 via-teal/10 to-emerald-500/10 border border-accent-cobalt/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-accent-cobalt font-display font-bold text-xs">
              <Search className="w-4 h-4" />
              <span>🔍 Ada Sesuatu yang Menarik pada Data Ini</span>
            </div>
            <p className="text-xs text-primary-navy leading-relaxed max-w-xl">
              Kandidat satuan ini tampaknya membuat banyak hasil pembagian berulang kali mendekati posisi yang teratur pada garis bilangan.
            </p>
          </div>

          <Button
            size="md"
            onClick={() => setShowPreDiscoveryModal(true)}
            className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-bold px-6 py-2.5 shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            Teliti Temuan Ini
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* ── Section 7: Pre-Discovery Articulation Modal ── */}
      <AnimatePresence>
        {showPreDiscoveryModal && (
          <PreDiscoveryModal
            candidateUnit={candidateUnit}
            onConfirmDiscovery={() => {
              setShowPreDiscoveryModal(false);
              trackLearningEvent("millikan", "pattern_observed", {
                discoveredUnit: candidateUnit,
                meanDeviation,
                nearPercentage,
              });
              onPatternDiscovered(candidateUnit);
            }}
            onCancel={() => setShowPreDiscoveryModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
