"use client";
import Link from "next/link";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, ChevronLeft, ChevronRight, TrendingUp, Sparkles,
  CheckCircle2, BarChart2, Atom, Info, AlertCircle, BarChart3,
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  ComposedChart, Area, Line, BarChart, Bar, Cell, LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const unc = timingUncertainty(d.tf ?? 5, d.tr ?? 15);
  const cf  = cunninghamFactor(d.r ?? 1.5);
  return (
    <div className="bg-white border border-border-default rounded-xl p-3 shadow-depth text-[11px] font-mono space-y-0.5 min-w-[180px]">
      <p className="font-bold text-primary-navy mb-1.5">Trial #{d.id}</p>
      <p className="text-text-muted">r = {d.r} µm · V = {d.V} V</p>
      <p>q Stokes = <span className="text-slate-600 font-bold">{d.q.toFixed(3)}</span> ×10⁻¹⁹ C</p>
      <p>Koreksi Cunningham = <span className="text-amber-600 font-bold">{cf.toFixed(4)}×</span></p>
      <p>q terkoreksi = <span className="text-teal font-bold">{(d.q * cf).toFixed(3)}</span> ×10⁻¹⁹ C</p>
      <p>Ketidakpastian ≈ <span className="text-rose-500 font-bold">±{(unc * 100).toFixed(1)}%</span></p>
      <p>Kelipatan n = <span className="font-bold text-accent-cobalt">{d.n}e</span></p>
    </div>
  );
}

function ConvergenceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const filtered = payload.filter((p: any) => p.name && p.name !== "_");
  return (
    <div className="bg-white border border-border-default rounded-xl p-3 shadow-depth text-[11px] font-mono space-y-0.5">
      <p className="font-bold text-primary-navy mb-1">Setelah {label} trial</p>
      {filtered.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(4) : "--"} ×10⁻¹⁹ C</p>
      ))}
    </div>
  );
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const params     = useParams();
  const moduleSlug = (params?.moduleSlug as string) || "bandul";
  const isMillikan = moduleSlug === "millikan";
  const isBandul   = moduleSlug === "bandul";
  const isActive   = isMillikan || isBandul;

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

  // ─── State ───────────────────────────────────────────────────────────────────
  const [transform,   setTransform]   = useState<"T vs L" | "T² vs L" | "Log-Log">("T² vs L");
  const [millikanTab, setMillikanTab] = useState<"scatter" | "histogram" | "convergence">("scatter");
  const [mounted,     setMounted]     = useState(false);
  const [trials,      setTrials]      = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(`fisikaseru:trials:${moduleSlug}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) { setTrials(p); return; }
      } catch (_) {}
    }
    // Fallback demo data
    if (isMillikan) {
      setTrials([
        { id: 1, r: 1.50, V: 300, tf: 4.17,  tr: 14.30, q: 4.72, n: 3 },
        { id: 2, r: 1.50, V: 400, tf: 4.17,  tr:  6.82, q: 6.25, n: 4 },
        { id: 3, r: 1.20, V: 350, tf: 6.51,  tr:  8.95, q: 4.61, n: 3 },
        { id: 4, r: 1.80, V: 450, tf: 2.89,  tr:  5.61, q: 7.83, n: 5 },
        { id: 5, r: 1.50, V: 300, tf: 4.17,  tr: 14.30, q: 4.75, n: 3 },
        { id: 6, r: 2.00, V: 500, tf: 2.30,  tr:  4.10, q: 9.44, n: 6 },
      ]);
    } else {
      setTrials([
        { id: 1, L: 0.20, T: 0.897, T2: 0.804 },
        { id: 2, L: 0.40, T: 1.268, T2: 1.608 },
        { id: 3, L: 0.60, T: 1.553, T2: 2.412 },
        { id: 4, L: 0.80, T: 1.792, T2: 3.211 },
        { id: 5, L: 1.00, T: 2.006, T2: 4.024 },
      ]);
    }
  }, [moduleSlug]);

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

  // Regression line points for display
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
    return { ...t, cf, uncRel, qCorr, qUncAbs, qCorrUncAbs: qCorr * uncRel };
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

  // Quantum bands (±10% tolerance)
  const Q_BAND_PCT = 0.10;
  const qBands = [1, 2, 3, 4, 5, 6].map(n => ({
    n, center: n * E_REF, lo: n * E_REF * (1 - Q_BAND_PCT), hi: n * E_REF * (1 + Q_BAND_PCT),
  }));

  const scatterData = useMemo(() => trialsAug.map(t => ({ ...t, qErr: t.qUncAbs, qCorrErr: t.qCorrUncAbs })), [trialsAug]);

  const BIN_WIDTH = 0.8;
  const histogramData = useMemo(() => {
    const bins: Record<string, { bin: number; count: number; label: string; qRange: string }> = {};
    trialsAug.forEach(t => {
      const binIdx = Math.floor(t.q / BIN_WIDTH);
      const key = `${binIdx}`;
      if (!bins[key]) {
        const lo = (binIdx * BIN_WIDTH).toFixed(1); const hi = ((binIdx + 1) * BIN_WIDTH).toFixed(1);
        bins[key] = { bin: parseFloat(((binIdx + 0.5) * BIN_WIDTH).toFixed(2)), count: 0, label: `${lo}–${hi}`, qRange: `${lo}–${hi}` };
      }
      bins[key].count++;
    });
    return Object.values(bins).sort((a, b) => a.bin - b.bin);
  }, [trialsAug]);

  function binZone(binCenter: number): number {
    for (const b of qBands) { if (binCenter >= b.lo && binCenter <= b.hi) return b.n; }
    return 0;
  }

  const convergenceData = useMemo(() => {
    const valid = trialsAug.filter(t => t.n > 0 && t.q > 0);
    const result: any[] = [];
    let sumE = 0, sumE2 = 0, sumEc = 0, sumEc2 = 0;
    for (let i = 0; i < valid.length; i++) {
      const e = valid[i].q / valid[i].n; const ec = valid[i].qCorr / valid[i].n;
      sumE += e; sumE2 += e ** 2; sumEc += ec; sumEc2 += ec ** 2;
      const meanE = sumE / (i + 1); const meanEc = sumEc / (i + 1);
      const varE  = i > 0 ? Math.max(0, sumE2 / (i + 1) - meanE ** 2) : 0;
      const varEc = i > 0 ? Math.max(0, sumEc2 / (i + 1) - meanEc ** 2) : 0;
      result.push({
        trial: i + 1,
        stokes:    parseFloat(meanE.toFixed(4)),
        corrected: parseFloat(meanEc.toFixed(4)),
        s_upper:   parseFloat((meanE + Math.sqrt(varE)).toFixed(4)),
        s_lower:   parseFloat(Math.max(0, meanE - Math.sqrt(varE)).toFixed(4)),
        c_upper:   parseFloat((meanEc + Math.sqrt(varEc)).toFixed(4)),
        c_lower:   parseFloat(Math.max(0, meanEc - Math.sqrt(varEc)).toFixed(4)),
      });
    }
    return result;
  }, [trialsAug]);

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

        {/* ─── Insight Banner ─── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal/5 to-sky-blue/5 border border-teal/20 rounded-xl px-5 py-3.5 flex items-start gap-3 mb-6">
          <Sparkles className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal/90 leading-snug">
            {isMillikan ? (
              <><b>Analisis seperti lab nyata:</b> Nilai referensi ditampilkan sebagai zona ±10% karena alat sesungguhnya memiliki ketidakpastian dari stopwatch dan gerak Brownian. Perhatikan bagaimana konvergensi menunjukkan estimasi <i>e</i> mendekati nilai NIST seiring bertambahnya trial.</>
            ) : (
              <>Gunakan grafik <b>T² vs L</b> untuk regresi linear yang ideal — <i>T = 2π√(L/g)</i> menjadi T² = (4π²/g)·L, sehingga gradien langsung memberi nilai <b>g</b>. Target R² &gt; 0.99.</>
            )}
          </p>
        </motion.div>

        {/* ─── MILLIKAN LAYOUT ─── */}
        {isMillikan ? (
          <div className="grid lg:grid-cols-5 gap-5">

            {/* Charts (left 3 cols) */}
            <div className="lg:col-span-3 space-y-4">

              {/* Tab switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: "scatter",     label: "Sebaran q + Zona Kuantum",   icon: <BarChart2 className="w-3.5 h-3.5" /> },
                  { id: "histogram",   label: "Distribusi Muatan (Raw)",     icon: <BarChart3 className="w-3.5 h-3.5" /> },
                  { id: "convergence", label: "Konvergensi Estimasi e",      icon: <TrendingUp className="w-3.5 h-3.5" /> },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setMillikanTab(tab.id as any)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      millikanTab === tab.id ? "bg-accent-cobalt text-white" : "bg-white border border-border-default text-text-muted hover:border-accent-cobalt/30")}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Summary stats bar */}
              <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border-default shadow-sm text-sm flex-wrap">
                <div>
                  <span className="text-text-muted text-[10px] block uppercase tracking-wider">Stokes (raw)</span>
                  <span className="font-mono font-bold text-slate-600">{calculatedE_stokes.toFixed(3)} ×10⁻¹⁹ C</span>
                  <span className={cn("ml-1.5 text-[10px] font-semibold", errorPct_stokes < 5 ? "text-success" : "text-amber-500")}>
                    Δ{errorPct_stokes.toFixed(1)}%
                  </span>
                </div>
                <div className="w-px h-8 bg-border-default" />
                <div>
                  <span className="text-text-muted text-[10px] block uppercase tracking-wider">+ Cunningham</span>
                  <span className="font-mono font-bold text-teal">{calculatedE_corr.toFixed(3)} ×10⁻¹⁹ C</span>
                  <span className={cn("ml-1.5 text-[10px] font-semibold", errorPct_corr < 3 ? "text-success" : "text-amber-500")}>
                    Δ{errorPct_corr.toFixed(1)}%
                  </span>
                </div>
                <div className="w-px h-8 bg-border-default" />
                <div>
                  <span className="text-text-muted text-[10px] block uppercase tracking-wider">NIST 2018</span>
                  <span className="font-mono font-bold text-primary-navy">{E_REF} ×10⁻¹⁹ C</span>
                </div>
                {errorPct_corr < 3 && (
                  <Badge variant="success" size="sm" className="ml-auto"><CheckCircle2 className="w-3 h-3" /> Sangat Akurat</Badge>
                )}
              </div>

              {/* Chart panel */}
              <div className="bg-white rounded-xl border border-border-default p-5 shadow-sm">
                <AnimatePresence mode="wait">

                  {/* TAB 1: Scatter + Quantum Zones */}
                  {millikanTab === "scatter" && (
                    <motion.div key="scatter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="font-display font-semibold text-primary-navy text-sm mb-1">Sebaran Muatan q dengan Zona Kuantum</h3>
                      <p className="text-xs text-text-muted mb-4 leading-snug">
                        Zona berwarna = rentang nilai yang masuk akal untuk setiap level n×e (±10%). Titik yang jatuh dalam zona = bukti kuantisasi.
                      </p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart margin={{ top: 10, right: 50, bottom: 30, left: 10 }} data={scatterData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="id" type="number" name="Trial" allowDecimals={false}
                              label={{ value: "Nomor Trial", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                              tick={{ fontSize: 11, fill: "#64748B" }} domain={[0, "dataMax+1"]} />
                            <YAxis type="number" domain={[0, 12]}
                              label={{ value: "Muatan q (×10⁻¹⁹ C)", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                              tick={{ fontSize: 11, fill: "#64748B" }} />
                            <Tooltip content={<ScatterTooltip />} />
                            {qBands.map((b, idx) => (
                              <ReferenceArea key={idx} y1={b.lo} y2={b.hi}
                                fill={idx % 2 === 0 ? "#0ea5e9" : "#8b5cf6"} fillOpacity={0.07} ifOverflow="hidden" />
                            ))}
                            {qBands.map((b, idx) => (
                              <ReferenceLine key={`rl-${idx}`} y={b.center}
                                stroke={idx % 2 === 0 ? "#0ea5e9" : "#8b5cf6"} strokeWidth={1} strokeDasharray="4 4"
                                label={{ value: `${b.n}e`, fill: idx % 2 === 0 ? "#0284c7" : "#7c3aed", fontSize: 9, position: "right" }} />
                            ))}
                            <Scatter dataKey="q" fill="#0891B2" r={6} stroke="#fff" strokeWidth={1.5}
                              name="q (Stokes)" shape={(props: any) => {
                                const { cx, cy, payload } = props;
                                if (!cx || !cy) return <g />;
                                const yScale = 72 / 12;
                                const errPx = (payload.qUncAbs || 0) * yScale;
                                return (
                                  <g>
                                    <line x1={cx} y1={cy - errPx} x2={cx} y2={cy + errPx} stroke="#0891B2" strokeWidth={1.5} />
                                    <line x1={cx - 4} y1={cy - errPx} x2={cx + 4} y2={cy - errPx} stroke="#0891B2" strokeWidth={1.5} />
                                    <line x1={cx - 4} y1={cy + errPx} x2={cx + 4} y2={cy + errPx} stroke="#0891B2" strokeWidth={1.5} />
                                    <circle cx={cx} cy={cy} r={5} fill="#0891B2" stroke="#fff" strokeWidth={1.5} />
                                  </g>
                                );
                              }} />
                            <Scatter dataKey="qCorr" fill="#14b8a6" r={5} stroke="#fff" strokeWidth={1.5}
                              name="q (+ Cunningham)" shape={(props: any) => {
                                const { cx, cy } = props;
                                if (!cx || !cy) return <g />;
                                const s = 6;
                                return (
                                  <polygon points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
                                    fill="#14b8a6" stroke="#fff" strokeWidth={1.5} />
                                );
                              }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-text-muted flex-wrap">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#0891B2] inline-block" /> Stokes (tanpa koreksi)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rotate-45 bg-teal inline-block" /> + Cunningham</span>
                        <span className="flex items-center gap-1"><span className="w-5 h-3 rounded bg-[#0ea5e9]/20 inline-block" /> Zona kuantum ±10%</span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Histogram */}
                  {millikanTab === "histogram" && (
                    <motion.div key="histogram" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="font-display font-semibold text-primary-navy text-sm mb-1">Distribusi Muatan q (Tanpa Asumsi n)</h3>
                      <p className="text-xs text-text-muted mb-4 leading-snug">
                        Dalam lab nyata, kamu <b>tidak tahu n terlebih dahulu</b>. Puncak-puncak pada histogram ini membuktikan kuantisasi secara empiris.
                      </p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={histogramData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="label"
                              label={{ value: "Rentang q (×10⁻¹⁹ C)", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                              tick={{ fontSize: 9, fill: "#64748B" }} />
                            <YAxis allowDecimals={false}
                              label={{ value: "Jumlah droplet", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                              tick={{ fontSize: 11, fill: "#64748B" }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11 }}
                              formatter={(v: any, _: any, p: any) => {
                                const zone = binZone(p.payload.bin);
                                return [`${v} droplet${zone ? ` — zona ${zone}e` : ""}`, "Frekuensi"];
                              }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                              {histogramData.map((entry, i) => {
                                const zone = binZone(entry.bin);
                                const colors = ["#94a3b8","#0ea5e9","#8b5cf6","#14b8a6","#f97316","#ef4444","#22c55e"];
                                return <Cell key={i} fill={zone ? colors[zone] : "#cbd5e1"} fillOpacity={0.85} />;
                              })}
                              <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }}
                                formatter={(v: any) => v > 0 ? v : ""} />
                            </Bar>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[10px] text-amber-700 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Dengan banyak trial, GCD dari semua nilai q ≈ nilai e. Puncak-puncak pada histogram ini adalah bukti empiris kuantisasi tanpa asumsi awal.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Convergence */}
                  {millikanTab === "convergence" && (
                    <motion.div key="convergence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="font-display font-semibold text-primary-navy text-sm mb-1">Konvergensi Estimasi e (Running Average ± 1σ)</h3>
                      <p className="text-xs text-text-muted mb-4 leading-snug">
                        Semakin banyak trial, semakin sempit rentang ketidakpastian — persis seperti yang Millikan lakukan selama berbulan-bulan.
                      </p>
                      {convergenceData.length < 2 ? (
                        <div className="h-72 flex items-center justify-center">
                          <div className="text-center text-text-muted text-sm">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p>Butuh minimal 2 trial untuk melihat konvergensi.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={convergenceData} margin={{ top: 10, right: 40, bottom: 30, left: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                              <XAxis dataKey="trial" allowDecimals={false}
                                label={{ value: "Jumlah Trial", position: "bottom", offset: 12, style: { fontSize: 11, fill: "#64748B" } }}
                                tick={{ fontSize: 11, fill: "#64748B" }} />
                              <YAxis domain={[0.8, 2.4]}
                                label={{ value: "Estimasi e (×10⁻¹⁹ C)", angle: -90, position: "insideLeft", offset: -4, style: { fontSize: 11, fill: "#64748B" } }}
                                tick={{ fontSize: 11, fill: "#64748B" }} />
                              <Tooltip content={<ConvergenceTooltip />} />
                              <ReferenceLine y={E_REF} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3"
                                label={{ value: `NIST: ${E_REF}`, fill: "#ef4444", fontSize: 9, position: "right" }} />
                              <Area type="monotone" dataKey="c_upper" stroke="none" fill="#14b8a6" fillOpacity={0.12} legendType="none" name="_" />
                              <Area type="monotone" dataKey="c_lower" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" name="_" />
                              <Area type="monotone" dataKey="s_upper" stroke="none" fill="#0ea5e9" fillOpacity={0.10} legendType="none" name="_" />
                              <Area type="monotone" dataKey="s_lower" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" name="_" />
                              <Line type="monotone" dataKey="stokes" stroke="#0891B2" strokeWidth={2}
                                dot={{ r: 5, fill: "#0891B2", stroke: "#fff", strokeWidth: 1.5 }} name="Rata-rata (Stokes)" />
                              <Line type="monotone" dataKey="corrected" stroke="#14b8a6" strokeWidth={2.5}
                                dot={{ r: 5, fill: "#14b8a6", stroke: "#fff", strokeWidth: 1.5 }} name="Rata-rata (+Cunningham)" />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-5 text-[10px] font-mono text-text-muted flex-wrap">
                        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-[#0891B2] inline-block" /> Stokes</span>
                        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-teal inline-block" /> +Cunningham</span>
                        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block border-t-2 border-red-400 border-dashed" /> NIST</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cunningham explainer */}
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-display font-semibold text-white text-sm">Koreksi Cunningham</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Mengapa Stokes tidak cukup</p>
                    <p>Untuk droplet <span className="text-yellow-300">r ≈ 1–2 µm</span>, ukurannya mendekati <span className="text-cyan-300">jarak bebas rata-rata molekul udara (λ ≈ 65 nm)</span>.</p>
                    <p>Akibatnya, drag aktual &lt; prediksi Stokes → q terukur &lt; q nyata.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Formula</p>
                    <p className="text-green-300 text-sm font-bold">C(r) = 1 + A·λ/r</p>
                    <p className="text-slate-400 text-[10px]">A = 1.257 · λ = 65 nm</p>
                    <div className="bg-slate-800 rounded-lg p-2 space-y-1 text-[10px] mt-1">
                      {[1.0, 1.5, 2.0].map(r => (
                        <div key={r} className="flex justify-between">
                          <span className="text-slate-400">r = {r} µm</span>
                          <span className="text-yellow-300">C = {cunninghamFactor(r).toFixed(4)}×</span>
                          <span className="text-green-300">+{((cunninghamFactor(r)-1)*100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Data + Results */}
            <div className="lg:col-span-2 space-y-4">

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-border-default p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-sm text-primary-navy">Data Percobaan</h3>
                  <Badge variant="primary" size="sm">n = {trials.length}</Badge>
                </div>
                <div className="rounded-lg border border-border-default overflow-auto">
                  <table className="w-full text-[10px]" aria-label="Tabel data Millikan">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border-default">
                        {["#", "r(µm)", "V", "tf/tr (s)", "q Stokes", "C(r)", "q+Cunn.", "n"].map(h => (
                          <th key={h} className="px-1.5 py-2 text-left font-display font-semibold text-text-muted whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trialsAug.map((d, i) => (
                        <tr key={i} className="border-b border-border-default/50 hover:bg-accent-cobalt/[0.02]">
                          <td className="px-1.5 py-1.5 font-mono text-text-muted">{d.id}</td>
                          <td className="px-1.5 py-1.5 font-mono">{d.r.toFixed(2)}</td>
                          <td className="px-1.5 py-1.5 font-mono">{d.V}</td>
                          <td className="px-1.5 py-1.5 font-mono">{d.tf.toFixed(2)}/{d.tr < 50 ? d.tr.toFixed(2) : "∞"}</td>
                          <td className="px-1.5 py-1.5 font-mono text-slate-500">{d.q.toFixed(3)}</td>
                          <td className="px-1.5 py-1.5 font-mono text-amber-600">{d.cf.toFixed(3)}</td>
                          <td className="px-1.5 py-1.5 font-mono font-semibold text-teal">{d.qCorr.toFixed(3)}</td>
                          <td className="px-1.5 py-1.5 font-mono font-semibold text-accent-cobalt">{d.n}e</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result Card */}
              <div className="bg-white rounded-xl border border-border-default p-4 shadow-sm">
                <h3 className="font-display font-semibold text-primary-navy mb-4 text-sm">Muatan Elementer e</h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-border-default/60">
                    <p className="text-[9px] text-text-muted font-mono mb-1 uppercase tracking-wider">Stokes (tanpa koreksi)</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-slate-600">{calculatedE_stokes.toFixed(4)}</span>
                      <span className="text-[10px] text-text-muted font-mono">×10⁻¹⁹ C</span>
                      <span className={cn("ml-auto text-xs font-bold", errorPct_stokes < 5 ? "text-success" : "text-amber-500")}>
                        Δ{errorPct_stokes.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-teal/5 rounded-xl p-3 border border-teal/20">
                    <p className="text-[9px] text-teal font-mono mb-1 uppercase tracking-wider">+ Koreksi Cunningham</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-bold text-teal">{calculatedE_corr.toFixed(4)}</span>
                      <span className="text-[10px] text-text-muted font-mono">×10⁻¹⁹ C</span>
                      <span className={cn("ml-auto text-xs font-bold", errorPct_corr < 3 ? "text-success" : "text-amber-500")}>
                        Δ{errorPct_corr.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className={cn("rounded-xl p-3 border text-[10px]",
                    errorPct_corr < 3 ? "bg-success/5 border-success/20 text-success" :
                    errorPct_corr < 8 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-rose-50 border-rose-200 text-rose-700")}>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      {errorPct_corr < 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      NIST 2018: {E_REF} ×10⁻¹⁹ C
                    </div>
                    <p>Galat: Stokes <b>{errorPct_stokes.toFixed(2)}%</b> → Cunningham <b>{errorPct_corr.toFixed(2)}%</b></p>
                    <p className="mt-0.5">Std. Dev: {stdDev.toFixed(4)} · ±SEM: {(stdDev / Math.sqrt(Math.max(1, trials.length))).toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Per-trial e table */}
              <div className="bg-white rounded-xl border border-border-default p-4 shadow-sm">
                <h3 className="font-display font-semibold text-sm text-primary-navy mb-3">Estimasi e per Trial</h3>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-border-default bg-gray-50">
                      <th className="px-2 py-1.5 text-left text-text-muted">#</th>
                      <th className="px-2 py-1.5 text-left text-text-muted">n</th>
                      <th className="px-2 py-1.5 text-left text-text-muted">e (Stokes)</th>
                      <th className="px-2 py-1.5 text-left text-text-muted">e (+Cunn.)</th>
                      <th className="px-2 py-1.5 text-left text-text-muted">Δ%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialsAug.filter(d => d.n > 0).map((d, i) => {
                      const eS  = d.q / d.n;
                      const eC  = d.qCorr / d.n;
                      const err = Math.abs((eC - E_REF) / E_REF * 100);
                      return (
                        <tr key={i} className="border-b border-border-default/40 hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-mono text-text-muted">{d.id}</td>
                          <td className="px-2 py-1.5 font-mono">{d.n}e</td>
                          <td className="px-2 py-1.5 font-mono text-slate-500">{eS.toFixed(4)}</td>
                          <td className="px-2 py-1.5 font-mono font-bold text-teal">{eC.toFixed(4)}</td>
                          <td className={cn("px-2 py-1.5 font-mono font-semibold", err < 3 ? "text-success" : err < 8 ? "text-amber-500" : "text-danger")}>
                            {err.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 font-bold text-[10px]">
                      <td colSpan={2} className="px-2 py-1.5 text-text-muted">Rata-rata</td>
                      <td className="px-2 py-1.5 font-mono text-slate-500">{calculatedE_stokes.toFixed(4)}</td>
                      <td className="px-2 py-1.5 font-mono text-teal">{calculatedE_corr.toFixed(4)}</td>
                      <td className={cn("px-2 py-1.5 font-mono", errorPct_corr < 3 ? "text-success" : "text-amber-500")}>{errorPct_corr.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Link href={`/modules/${moduleSlug}/experiment`} className="flex-1">
                  <Button variant="outline" size="md" className="w-full cursor-pointer text-xs">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Lab
                  </Button>
                </Link>
                <Link href={`/modules/${moduleSlug}/reflection`} className="flex-1">
                  <Button size="md" className="w-full cursor-pointer text-xs">
                    Lanjut Refleksi <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        ) : (
          // ─── BANDUL LAYOUT ─────────────────────────────────────────────────────
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
        )}
      </main>
    </div>
  );
}
