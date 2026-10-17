"use client";

import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, TrendingUp, Sparkles,
  CheckCircle2, AlertCircle, BookOpen, FlaskConical, Search,
  Compass, Eye, RefreshCw
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AhaMomentBanner } from "./AhaMomentBanner";
import { PatternDiscoveryTool } from "./PatternDiscoveryTool";
import { RealLabGuideModal } from "./RealLabGuideModal";
import { AnalysisStageProgress, type AnalysisStage } from "./analysis/AnalysisStageProgress";
import { DataReviewSection } from "./analysis/DataReviewSection";
import { TransformationSection } from "./analysis/TransformationSection";
import { ScientificExplanationSection } from "./analysis/ScientificExplanationSection";

// ─── Physical Constants ───────────────────────────────────────────────────────
const E_REF    = 1.6022;   // elementary charge ×10⁻¹⁹ C (NIST 2018)
const C_LAMBDA = 65e-9;    // mean free path of air
const C_A      = 1.257;    // Cunningham coefficient

function cunninghamFactor(r_um: number): number {
  return 1 + C_A * C_LAMBDA / (r_um * 1e-6);
}

const DELTA_T_REACTION = 0.15;
function timingUncertainty(tf: number, tr: number): number {
  const relTf = (2 * DELTA_T_REACTION) / tf;
  const relTr = tr < 50 ? (2 * DELTA_T_REACTION) / tr : 0.06;
  return Math.sqrt(relTf ** 2 + relTr ** 2);
}

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  const sumX  = data.reduce((s, d) => s + d.x, 0);
  const sumY  = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: 0, r2: 0 };
  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = data.reduce((s, d) => s + (d.y - (slope * d.x + intercept)) ** 2, 0);
  const ssTot = data.reduce((s, d) => s + (d.y - sumY / n) ** 2, 0);
  if (ssTot === 0) return { slope, intercept, r2: 1 };
  return { slope, intercept, r2: 1 - ssRes / ssTot };
}

function BandulTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-border-default rounded-xl p-3 shadow-depth text-[11px] font-mono space-y-0.5">
      <p className="font-bold text-primary-navy mb-1">Trial</p>
      <p>L = <span className="text-accent-cobalt font-bold">{d.x?.toFixed(2)}</span> m</p>
      <p>T² = <span className="text-primary-navy font-bold">{d.y?.toFixed(3)}</span> s²</p>
    </div>
  );
}

const LAB_STEPS = ["Persiapan", "Pengamatan", "Pengukuran", "Analisis", "Refleksi"];

const DEMO_MILLIKAN_TRIALS = [
  { id: 1, dropletLabel: "Tetes A", r: 1.50, V: 300, tf: 4.17, tr: 14.30, q: 4.72, hiddenN: 3, n: 3, method: "dynamic" },
  { id: 2, dropletLabel: "Tetes B", r: 1.50, V: 400, tf: 4.17, tr:  6.82, q: 6.25, hiddenN: 4, n: 4, method: "dynamic" },
  { id: 3, dropletLabel: "Tetes C", r: 1.20, V: 350, tf: 6.51, tr:  8.95, q: 4.61, hiddenN: 3, n: 3, method: "dynamic" },
  { id: 4, dropletLabel: "Tetes D", r: 1.80, V: 450, tf: 2.89, tr:  5.61, q: 7.83, hiddenN: 5, n: 5, method: "dynamic" },
  { id: 5, dropletLabel: "Tetes E", r: 1.50, V: 300, tf: 4.17, tr: 14.30, q: 4.75, hiddenN: 3, n: 3, method: "dynamic" },
  { id: 6, dropletLabel: "Tetes F", r: 2.00, V: 500, tf: 2.30, tr:  4.10, q: 9.44, hiddenN: 6, n: 6, method: "dynamic" },
];

export default function AnalysisPage() {
  const params     = useParams();
  const moduleSlug = (params?.moduleSlug as string) || "millikan";
  const isMillikan = moduleSlug === "millikan";
  const isBandul   = moduleSlug === "bandul";
  const isActive   = isMillikan || isBandul;

  // ─── State ───────────────────────────────────────────────────────────────────
  const [transform,   setTransform]   = useState<"T vs L" | "T² vs L" | "Log-Log">("T² vs L");
  const [mounted,     setMounted]     = useState(false);
  const [isDiscovered, setIsDiscovered] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [trials,      setTrials]      = useState<any[]>([]);
  const [activeStage, setActiveStage] = useState<AnalysisStage>(1);

  useEffect(() => {
    setMounted(true);
    const savedDiscovery = localStorage.getItem(`fisikaseru:discovered:${moduleSlug}`);
    if (savedDiscovery === "true") {
      setIsDiscovered(true);
      setActiveStage(4);
    }

    const saved = localStorage.getItem(`fisikaseru:trials:${moduleSlug}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) {
          setTrials(p);
          return;
        }
      } catch (_) {}
    }
    // Fallback demo data
    if (isMillikan) {
      setTrials(DEMO_MILLIKAN_TRIALS);
    } else {
      setTrials([
        { id: 1, L: 0.20, T: 0.897, T2: 0.804 },
        { id: 2, L: 0.40, T: 1.268, T2: 1.608 },
        { id: 3, L: 0.60, T: 1.553, T2: 2.412 },
        { id: 4, L: 0.80, T: 1.792, T2: 3.211 },
        { id: 5, L: 1.00, T: 2.006, T2: 4.024 },
      ]);
    }
  }, [moduleSlug, isMillikan]);

  // ─── Bandul calcs ─────────────────────────────────────────────────────────────
  const chartDataBandul = useMemo(() => {
    if (!isBandul) return [];
    return trials.map((d) => ({
      x: d.L,
      y: transform === "T vs L" ? d.T : transform === "T² vs L" ? d.T2 : Math.log(d.T),
      T: d.T, T2: d.T2,
    }));
  }, [trials, transform, isBandul]);

  const regressionBandul = useMemo(() => linearRegression(chartDataBandul), [chartDataBandul]);

  const calculatedG = useMemo(() => {
    if (regressionBandul.slope === 0) return 0;
    return (4 * Math.PI ** 2) / regressionBandul.slope;
  }, [regressionBandul.slope]);

  const maxChartX = useMemo(() => chartDataBandul.length === 0 ? 1 : Math.max(...chartDataBandul.map(d => d.x)), [chartDataBandul]);

  const regressionLine = useMemo(() => {
    if (chartDataBandul.length < 2) return [];
    const xMin = 0;
    const xMax = maxChartX * 1.1;
    return [
      { x: xMin, y: regressionBandul.slope * xMin + regressionBandul.intercept },
      { x: xMax, y: regressionBandul.slope * xMax + regressionBandul.intercept },
    ];
  }, [regressionBandul, maxChartX, chartDataBandul]);

  const gError = useMemo(() => calculatedG > 0 ? Math.abs((calculatedG - 9.80665) / 9.80665 * 100) : 0, [calculatedG]);

  // ─── Millikan calcs ───────────────────────────────────────────────────────────
  const trialsAug = useMemo(() => trials.map(t => {
    const cf      = cunninghamFactor(t.r ?? 1.5);
    const uncRel  = timingUncertainty(t.tf ?? 5, t.tr ?? 15);
    const qCorr   = t.q * cf;
    const qUncAbs = t.q * uncRel;
    const n       = t.hiddenN || t.n || Math.max(1, Math.round(t.q / E_REF));
    return { ...t, cf, uncRel, qCorr, qUncAbs, qCorrUncAbs: qCorr * uncRel, n };
  }), [trials]);

  const calculatedE_stokes = useMemo(() => {
    const valid = trialsAug.filter(t => t.n > 0 && t.q > 0);
    if (!valid.length) return 0;
    return valid.reduce((s, t) => s + t.q / t.n, 0) / valid.length;
  }, [trialsAug]);

  const calculatedE_corr = useMemo(() => {
    const valid = trialsAug.filter(t => t.n > 0 && t.qCorr > 0);
    if (!valid.length) return 0;
    return valid.reduce((s, t) => s + t.qCorr / t.n, 0) / valid.length;
  }, [trialsAug]);

  const stdDev = useMemo(() => {
    const valid = trialsAug.filter(t => t.n > 0 && t.q > 0);
    if (valid.length < 2) return 0;
    const vals = valid.map(t => t.q / t.n);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    return Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1));
  }, [trialsAug]);

  const errorPct_stokes = useMemo(() => calculatedE_stokes === 0 ? 0 : Math.abs((calculatedE_stokes - E_REF) / E_REF * 100), [calculatedE_stokes]);
  const errorPct_corr   = useMemo(() => calculatedE_corr === 0 ? 0 : Math.abs((calculatedE_corr - E_REF) / E_REF * 100), [calculatedE_corr]);

  if (!isActive) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col justify-between font-body">
        <header className="h-14 bg-white border-b border-border-default flex items-center px-6 sticky top-0 z-30 justify-between">
          <Link href="/modules" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
            <ChevronLeft className="w-4 h-4" /><span className="text-sm font-display font-medium">Katalog</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <p className="text-text-muted text-sm">Analisis untuk topik ini sedang disiapkan.</p>
        </main>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center" suppressHydrationWarning>
        <div className="w-6 h-6 rounded-full border-2 border-accent-cobalt border-t-transparent animate-spin" suppressHydrationWarning />
      </div>
    );
  }

  const moduleTitle = isMillikan ? "Tetes Minyak Millikan" : "Bandul Sederhana";

  return (
    <div className="min-h-screen bg-bg-primary font-body">

      {/* ─── Header ─── */}
      <header className="h-12 bg-white border-b border-border-default flex items-center px-4 sticky top-0 z-30">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <Link href="/modules" className="hover:text-primary-navy transition-colors whitespace-nowrap">Katalog</Link>
          <span>/</span>
          <Link href={`/modules/${moduleSlug}/experiment`} className="hover:text-primary-navy transition-colors whitespace-nowrap">{moduleTitle}</Link>
          <span>/</span>
          <span className="text-text-primary font-semibold">Analisis</span>
        </div>

        {/* Step progress */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {LAB_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                i === 3 ? "bg-accent-cobalt text-white" :
                i < 3   ? "bg-success/10 text-success" :
                i === 4  ? "bg-white border border-border-default text-text-muted" :
                "text-text-muted bg-gray-50 opacity-40"
              )}>
                {i < 3 ? <CheckCircle2 className="w-3 h-3" /> : <span className="font-mono opacity-70">{i + 1}</span>}
                <span className="hidden lg:inline">{s}</span>
              </div>
              {i < 4 && <div className={cn("w-3 h-px", i < 3 ? "bg-success/40" : "bg-border-default")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="ml-auto flex items-center gap-2">
          {isMillikan && (
            <button onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-cobalt/10 border border-accent-cobalt/30 text-accent-cobalt hover:bg-accent-cobalt/20 transition-all cursor-pointer">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prinsip Lab</span>
            </button>
          )}
          <Link href={`/modules/${moduleSlug}/experiment`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-text-muted hover:bg-gray-100 transition-all border border-border-default">
            <ChevronLeft className="w-3.5 h-3.5" /> Lab
          </Link>
          <Link href={`/modules/${moduleSlug}/reflection`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white hover:bg-accent-cobalt/90 transition-all">
            Refleksi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ─── MILLIKAN GUIDED SCIENTIFIC NOTEBOOK ─── */}
        {isMillikan ? (
          <div>
            {/* Empty State Guard (< 5 Droplets) */}
            {trials.length < 5 ? (
              <div className="bg-white border border-border-default rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-5 shadow-card my-12">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-primary-navy">
                    Data Observasi Belum Cukup ({trials.length}/5 Tetes)
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto">
                    Dalam metode ilmiah, kesimpulan pola kuantisasi tidak dapat ditarik dari sampel yang terlalu sedikit. Kamu membutuhkan minimal <b>5 data tetesan minyak</b> untuk menguji keteraturan muatan secara objektif.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href={`/modules/${moduleSlug}/experiment`}>
                    <Button size="md" className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs flex items-center gap-1.5">
                      <ChevronLeft className="w-4 h-4" /> Kembali ke Lab untuk Mengamati
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setTrials(DEMO_MILLIKAN_TRIALS)}
                    className="text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Muat Data Sampel Demo Lab
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subtle 5-Stage Scientific Progress Indicator */}
                <AnalysisStageProgress
                  activeStage={activeStage}
                  onSelectStage={(stage) => setActiveStage(stage)}
                  isDiscovered={isDiscovered}
                />

                {/* Stage 1: Data Review (Raw Kinematics & Observations) */}
                {activeStage === 1 && (
                  <DataReviewSection
                    trials={trials}
                    onProceedToTransform={() => setActiveStage(2)}
                  />
                )}

                {/* Stage 2: Transformation (Kinematics -> Charge q) */}
                {activeStage === 2 && (
                  <TransformationSection
                    trials={trialsAug}
                    onProceedToPatternHunting={() => setActiveStage(3)}
                  />
                )}

                {/* Stage 3: Pattern Hunting (Interactive Base Unit Testing) */}
                {activeStage === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-r from-accent-cobalt/5 to-indigo-500/5 border border-accent-cobalt/20 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-accent-cobalt/10 text-accent-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Search className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
                              Tahap 03: Penyelidikan Pola
                            </span>
                            <Badge variant={isDiscovered ? "success" : "primary"} size="sm">
                              {isDiscovered ? "✓ Pola Terverifikasi" : "Uji Hipotesis"}
                            </Badge>
                          </div>
                          <h3 className="font-display font-bold text-base text-primary-navy">
                            Apakah muatan memiliki pembagi terbesar bersama?
                          </h3>
                          <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
                            Urutkan nilai muatanmu dari yang terkecil ke terbesar, lalu uji berbagai kandidat satuan pembagi dasar. Jika semua muatan menghasilkan pembagian bilangan bulat yang konsisten, kamu telah menemukan bukti kuantisasi!
                          </p>
                        </div>
                      </div>
                    </div>

                    <PatternDiscoveryTool
                      trials={trialsAug}
                      onPatternDiscovered={() => {
                        setIsDiscovered(true);
                        localStorage.setItem(`fisikaseru:discovered:${moduleSlug}`, "true");
                        setActiveStage(4);
                      }}
                      isAlreadyDiscovered={isDiscovered}
                    />

                    {isDiscovered && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Pola telah terungkap! Kamu dapat meninjau Momen Aha atau melanjutkan ke Teori Lengkap.
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setActiveStage(4)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
                        >
                          Buka Momen Aha (Tahap 4) <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Stage 4: Aha Moment / Discovery */}
                {activeStage === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <AhaMomentBanner
                      calculatedE={calculatedE_corr}
                      onContinueToReflection={() => {
                        setActiveStage(5);
                      }}
                    />

                    <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="font-display font-bold text-sm text-primary-navy">
                          Dua Langkah Selanjutnya untuk Melengkapi Pembelajaran
                        </h4>
                        <p className="text-xs text-text-muted leading-relaxed">
                          Kamu bisa mendalami teori fisika &amp; grafik verifikasi standar NIST (Tahap 5), atau langsung menuju Refleksi Kognitif bersama Socratic AI.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => setActiveStage(5)}
                          className="text-xs cursor-pointer border-border-default text-primary-navy font-semibold"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-accent-cobalt" />
                          Pahami Teori &amp; NIST (Tahap 5)
                        </Button>
                        <Button
                          size="md"
                          onClick={() => {
                            window.location.href = `/modules/${moduleSlug}/reflection`;
                          }}
                          className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white text-xs cursor-pointer font-semibold shadow-sm"
                        >
                          Lanjut Refleksi <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stage 5: Scientific Explanation & Verification */}
                {activeStage === 5 && (
                  <ScientificExplanationSection
                    trials={trialsAug}
                    calculatedE_stokes={calculatedE_stokes}
                    calculatedE_corr={calculatedE_corr}
                    stdDev={stdDev}
                    errorPct_stokes={errorPct_stokes}
                    errorPct_corr={errorPct_corr}
                    E_REF={E_REF}
                    moduleSlug={moduleSlug}
                  />
                )}
              </div>
            )}
          </div>

        ) : (
          // ─── BANDUL LAYOUT ─────────────────────────────────────────────────────
          <div className="space-y-6">
            {/* Bandul Insight Banner */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-teal/5 to-sky-blue/5 border border-teal/20 rounded-xl px-5 py-3.5 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal/90 leading-snug">
                Gunakan grafik <b>T² vs L</b> untuk regresi linear yang ideal — <i>T = 2π√(L/g)</i> menjadi T² = (4π²/g)·L, sehingga gradien langsung memberi nilai <b>g</b>. Target R² &gt; 0.99.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left: Chart */}
              <div className="lg:col-span-3 space-y-4">
                {/* Transform selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-display font-semibold text-text-muted">Grafik:</span>
                  {(["T vs L", "T² vs L", "Log-Log"] as const).map(t => (
                    <button key={t} onClick={() => setTransform(t)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        transform === t ? "bg-accent-cobalt text-white" : "bg-white border border-border-default text-text-muted hover:border-accent-cobalt/30")}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border-default shadow-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">R²</span>
                    <span className={cn("font-mono font-bold text-base", regressionBandul.r2 > 0.99 ? "text-success" : regressionBandul.r2 > 0.95 ? "text-accent-cobalt" : "text-amber-500")}>
                      {regressionBandul.r2.toFixed(4)}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-border-default" />
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">Gradien (4π²/g)</span>
                    <span className="font-mono font-bold text-primary-navy">{regressionBandul.slope.toFixed(4)}</span>
                  </div>
                  {regressionBandul.r2 > 0.99 && (
                    <Badge variant="success" size="sm" className="ml-auto"><TrendingUp className="w-3 h-3" /> Excellent Fit</Badge>
                  )}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl border border-border-default p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-primary-navy text-sm mb-1">Grafik Regresi: {transform}</h3>
                  <p className="text-xs text-text-muted mb-4 leading-snug">
                    {transform === "T² vs L"
                      ? "T² = (4π²/g)·L — hubungan linear sempurna. Gradien garis regresi = 4π²/g, dari sini kita hitung nilai g."
                      : transform === "T vs L"
                      ? "T = 2π√(L/g) — kurva akar. Lebih sulit di-fit secara linear, gunakan T² vs L untuk analisis lebih akurat."
                      : "Log(T) vs Log(L) — gradien harus ≈ 0.5 jika rumus T = 2π√(L/g) berlaku."
                    }
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="x" type="number" name="L"
                          label={{ value: "Panjang Tali, L (m)", position: "bottom", offset: 12, style: { fontSize: 12, fill: "#6B7280" } }}
                          tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, "auto"]} />
                        <YAxis dataKey="y" type="number"
                          label={{ value: transform === "T vs L" ? "T (s)" : transform === "T² vs L" ? "T² (s²)" : "ln(T)", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#6B7280" } }}
                          tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, "auto"]} />
                        <Tooltip content={<BandulTooltip />} />
                        <Scatter data={chartDataBandul} dataKey="y" fill="#1B4FD8" r={7} stroke="#fff" strokeWidth={2} shape={(props: any) => {
                          const { cx, cy } = props;
                          if (!cx || !cy) return <g />;
                          return <circle cx={cx} cy={cy} r={7} fill="#1B4FD8" stroke="#fff" strokeWidth={2} />;
                        }} />
                        {regressionLine.length > 0 && (
                          <ReferenceLine
                            segment={[{ x: regressionLine[0].x, y: regressionLine[0].y }, { x: regressionLine[1].x, y: regressionLine[1].y }]}
                            stroke="#14213D" strokeWidth={2} strokeDasharray="6 3" />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-text-muted">
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#1B4FD8] inline-block" /> Data trial</span>
                    <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 border-t-2 border-dashed border-[#14213D] inline-block" /> Garis regresi terbaik</span>
                  </div>
                </div>

                {/* Theory explainer */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <h4 className="font-display font-semibold text-white text-sm">Dari Regresi ke Nilai g</h4>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                    <div className="space-y-1.5">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Derivasi rumus</p>
                      <p>T = 2π√(L/g)</p>
                      <p>T² = <span className="text-yellow-300">(4π²/g)</span> · L</p>
                      <p className="text-slate-400 text-[10px] mt-2">Bentuk: y = m·x + c</p>
                      <p>Gradien m = 4π²/g</p>
                      <p className="text-green-300 font-bold">∴ g = 4π²/m</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Dari datamu</p>
                      <div className="bg-slate-800 rounded-lg p-2.5 space-y-1.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gradien (m)</span>
                          <span className="text-yellow-300">{regressionBandul.slope.toFixed(4)} s²/m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">R²</span>
                          <span className={regressionBandul.r2 > 0.99 ? "text-green-300" : "text-amber-300"}>{regressionBandul.r2.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-700 pt-1.5">
                          <span className="text-slate-400">g hitung</span>
                          <span className="text-sky-300 font-bold">{calculatedG.toFixed(4)} m/s²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">g referensi</span>
                          <span className="text-slate-300">9.8067 m/s²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Galat</span>
                          <span className={gError < 2 ? "text-green-300" : "text-amber-300"}>{gError.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Data + Results */}
              <div className="lg:col-span-2 space-y-4">
                {/* Data table */}
                <div className="bg-white rounded-xl border border-border-default p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-sm text-primary-navy">Data Rekaman</h3>
                    <Badge variant="primary" size="sm">n = {trials.length}</Badge>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border-default">
                        {["#", "L (m)", "T (s)", "T² (s²)"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-display font-semibold text-text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trials.map((d, i) => (
                        <tr key={i} className="border-b border-border-default/50 hover:bg-accent-cobalt/[0.02]">
                          <td className="px-3 py-2 font-mono text-text-muted">{d.id || i+1}</td>
                          <td className="px-3 py-2 font-mono">{d.L.toFixed(2)}</td>
                          <td className="px-3 py-2 font-mono">{d.T.toFixed(3)}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-accent-cobalt">{d.T2.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gravity result */}
                <div className="bg-white rounded-xl border border-border-default p-4 shadow-sm">
                  <h3 className="font-display font-semibold text-primary-navy text-sm mb-3">Nilai Gravitasi Terukur</h3>
                  <div className="bg-accent-cobalt/5 rounded-xl p-4 border border-accent-cobalt/20 mb-3">
                    <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider mb-1">g hitung dari regresi T² vs L</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-bold text-primary-navy">{calculatedG.toFixed(3)}</span>
                      <span className="font-mono text-sm text-text-muted">m/s²</span>
                    </div>
                  </div>
                  <div className={cn("rounded-xl p-3 border text-[10px]",
                    gError < 2 ? "bg-success/5 border-success/20 text-success" :
                    gError < 5 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-rose-50 border-rose-200 text-rose-700")}>
                    <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                      {gError < 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      Referensi: 9.8067 m/s²
                    </div>
                    <p>Galat: <b>{gError.toFixed(3)}%</b> · R² = <b>{regressionBandul.r2.toFixed(4)}</b></p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Link href={`/modules/${moduleSlug}/experiment`} className="flex-1">
                    <Button variant="outline" size="md" className="w-full cursor-pointer text-xs">
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Lab
                    </Button>
                  </Link>
                  <Link href={`/modules/${moduleSlug}/reflection`} className="flex-1">
                    <Button size="md" className="w-full cursor-pointer text-xs">
                      Refleksi <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Real Lab & Physics Theory Modal ── */}
      {isMillikan && (
        <RealLabGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}
