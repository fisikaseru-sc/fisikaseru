"use client";
import Link from "next/link";
import { ConfigRegistry } from "@/features/configRegistry";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, ChevronLeft, ChevronRight, Sparkles, Lightbulb,
  ArrowRight, MessageCircle, CheckCircle2, Wrench, Lock, Send,
  Download, Home, Bot, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Math helpers ──────────────────────────────────────────────────────────────
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

const C_LAMBDA = 65e-9;
const C_A      = 1.257;
const E_REF    = 1.6022;
function cunninghamFactor(r_um: number): number { return 1 + C_A * C_LAMBDA / (r_um * 1e-6); }

const LAB_STEPS = ["Persiapan", "Pengamatan", "Pengukuran", "Analisis", "Refleksi"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReflectionPage() {
  const params     = useParams();
  const moduleSlug = (params?.moduleSlug as string) || "bandul";
  const isActive   = moduleSlug === "millikan" || moduleSlug === "bandul";

  // ── Not-active fallback will be placed below hooks ──

  const [step, setStep] = useState<"confront" | "dialogue" | "reconstruct" | "complete">("confront");
  const [trials, setTrials] = useState<unknown[]>([]);
  const [writtenReflections, setWrittenReflections] = useState({ q1: "", q2: "", q3: "", final: "" });

  useEffect(() => {
    const saved = localStorage.getItem(`fisikaseru:trials:${moduleSlug}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) { setTrials(p); return; }
      } catch (_) {}
    }
    if (moduleSlug === "millikan") {
      setTrials([
        { id: 1, r: 1.50, V: 300, tf: 4.17, tr: 14.30, q: 4.72, n: 3 },
        { id: 2, r: 1.50, V: 400, tf: 4.17, tr:  6.82, q: 6.25, n: 4 },
        { id: 3, r: 1.20, V: 350, tf: 6.51, tr:  8.95, q: 4.61, n: 3 },
        { id: 4, r: 1.80, V: 450, tf: 2.89, tr:  5.61, q: 7.83, n: 5 },
      ]);
    } else {
      setTrials([
        { L: 0.20, T: 0.897, T2: 0.804 }, { L: 0.40, T: 1.268, T2: 1.608 },
        { L: 0.60, T: 1.553, T2: 2.412 }, { L: 0.80, T: 1.792, T2: 3.211 },
      ]);
    }
  }, [moduleSlug]);

  // ── Bandul stats ──
  const regressionBandul = useMemo(() => {
    if (moduleSlug !== "bandul") return { slope: 0, intercept: 0, r2: 0 };
    return linearRegression((trials as { L: number; T2: number }[]).map(d => ({ x: d.L, y: d.T2 })));
  }, [trials, moduleSlug]);

  const calculatedG = useMemo(() => {
    if (regressionBandul.slope === 0) return 9.80665;
    return (4 * Math.PI ** 2) / regressionBandul.slope;
  }, [regressionBandul.slope]);

  // ── Millikan stats ──
  const trialsAug = useMemo(() => trials.map((t: any) => {
    const cf = cunninghamFactor(t.r ?? 1.5);
    return { ...t, cf, qCorr: t.q * cf };
  }), [trials]);

  const calculatedE = useMemo(() => {
    const valid = trialsAug.filter(t => t.n > 0 && t.qCorr > 0);
    if (!valid.length) return 1.602;
    return valid.reduce((s, t) => s + t.qCorr / t.n, 0) / valid.length;
  }, [trialsAug]);

  const gError = useMemo(() => Math.abs((calculatedG - 9.80665) / 9.80665 * 100), [calculatedG]);
  const eError = useMemo(() => Math.abs((calculatedE - E_REF) / E_REF * 100), [calculatedE]);

  const handlePrint = () => window.print();

  const moduleTitle = ConfigRegistry[moduleSlug]?.title || "Eksperimen Baru";

  if (!isActive) {
    const titleMap: Record<string, string> = {
      ohm: "Hukum Ohm", "jatuh-bebas": "Jatuh Bebas", boyle: "Hukum Boyle", snellius: "Pembiasan Cahaya",
    };
    const currentTitle = titleMap[moduleSlug] || "Eksperimen Baru";
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col font-body">
        <header className="h-14 bg-white border-b border-border-default flex items-center px-6 sticky top-0 z-30 justify-between">
          <Link href="/modules" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
            <ChevronLeft className="w-4 h-4" /><span className="text-sm font-display font-medium">Katalog</span>
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-cobalt flex items-center justify-center"><FlaskConical className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-display font-bold text-sm text-primary-navy">FisikaSeru</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-sm w-full bg-white rounded-2xl border border-border-default shadow-depth p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-cobalt to-sky-blue" />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}
              className="w-[72px] h-[72px] rounded-2xl bg-accent-cobalt/5 border border-accent-cobalt/10 flex items-center justify-center mx-auto mb-5">
              <Wrench className="w-8 h-8 text-accent-cobalt" />
            </motion.div>
            <Badge variant="outline" className="text-[10px] font-mono mb-3"><Lock className="w-2.5 h-2.5 mr-1" /> Segera Hadir</Badge>
            <h2 className="font-display text-xl font-bold text-primary-navy mb-2">{currentTitle}</h2>
            <p className="text-xs text-text-muted leading-relaxed mb-6">Halaman refleksi untuk topik ini sedang disiapkan.</p>
            <Link href="/modules"><Button className="w-full cursor-pointer"><ChevronLeft className="w-4 h-4 mr-1" /> Katalog</Button></Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary font-body">

      {/* ─── Printable PDF Report ─────────────────────────────────────────────── */}
      <div className="hidden print:block p-10 bg-white text-black font-body text-xs">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Laporan Kognitif Sains — FisikaSeru</h1>
            <p className="text-[10px] text-slate-400">Lab: {moduleTitle}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Sertifikat Kelulusan Eksperimen Virtual</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-bold text-[10px] mb-1">Spesifikasi Eksperimen</p>
            <p>Modul: {moduleTitle}</p>
            <p>Jumlah Trial: {trials.length}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="font-bold text-[10px] mb-1">Hasil Statistik</p>
            {moduleSlug === "millikan"
              ? <><p>e hitung: {calculatedE.toFixed(4)} ×10⁻¹⁹ C</p><p>Galat: {eError.toFixed(2)}%</p></>
              : <><p>g hitung: {calculatedG.toFixed(4)} m/s²</p><p>Galat: {gError.toFixed(2)}%</p><p>R² = {regressionBandul.r2.toFixed(4)}</p></>
            }
          </div>
        </div>
        <h3 className="font-bold mb-2">Rekonstruksi Mental Model</h3>
        <div className="p-3 border rounded-lg space-y-3">
          {(moduleSlug === "millikan" ? ["Analisis sebaran muatan (kontinu vs diskret)", "Penentuan FPB dari nilai q", "Makna muatan dasar 1.6×10⁻¹⁹ C"] :
            ["Variabel penentu periode T = 2π√(L/g)", "Absennya massa m dalam rumus", "Hubungan panjang tali dengan periode"]).map((q, i) => (
            <div key={i}>
              <p className="font-semibold">{i + 1}. {q}</p>
              <p className="text-slate-600 italic mt-0.5">{writtenReflections[`q${i + 1}` as "q1" | "q2" | "q3"] || "—"}</p>
            </div>
          ))}
          <div className="border-t pt-2">
            <p className="font-bold">Kesimpulan Akhir:</p>
            <p className="text-slate-700 italic mt-0.5">{writtenReflections.final || "—"}</p>
          </div>
        </div>
      </div>

      {/* ─── Header ─────────────────────────────────────────────────────────────── */}
      <header className="h-12 bg-white border-b border-border-default flex items-center px-4 sticky top-0 z-30 print:hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <Link href="/modules" className="hover:text-primary-navy transition-colors">Katalog</Link>
          <span>/</span>
          <Link href={`/modules/${moduleSlug}/analysis`} className="hover:text-primary-navy transition-colors">Analisis</Link>
          <span>/</span>
          <span className="text-text-primary font-semibold">Refleksi</span>
        </div>

        {/* Step indicator */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {LAB_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold",
                i === 4 ? "bg-accent-cobalt text-white" :
                i < 4   ? "bg-success/10 text-success" : "text-text-muted bg-gray-50 opacity-40"
              )}>
                {i < 4 ? <CheckCircle2 className="w-3 h-3" /> : <span className="font-mono opacity-70">{i + 1}</span>}
                <span className="hidden lg:inline">{s}</span>
              </div>
              {i < 4 && <div className={cn("w-3 h-px", i < 4 ? "bg-success/40" : "bg-border-default")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Nav */}
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/modules/${moduleSlug}/analysis`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-text-muted hover:bg-gray-100 transition-all border border-border-default">
            <ChevronLeft className="w-3.5 h-3.5" /> Analisis
          </Link>
        </div>
      </header>

      {/* ─── MAIN ─────────────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8 print:hidden">
        <AnimatePresence mode="wait">

          {/* STEP 1: CONFRONTATION */}
          {step === "confront" && (
            <motion.div key="confront" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="text-center mb-7">
                <Badge variant="warning" size="lg" className="mb-3">
                  <Lightbulb className="w-3.5 h-3.5" /> Momen Konfrontasi
                </Badge>
                <h2 className="font-display text-2xl font-bold text-primary-navy mb-1.5">Prediksi vs Kenyataan</h2>
                <p className="text-sm text-text-muted">Di sinilah miskonsepsi bertemu data empiris.</p>
              </div>

              {/* Confrontation card */}
              <div className="bg-white rounded-2xl border border-border-default shadow-sm overflow-hidden mb-5">

                {/* Misconception (amber) */}
                <div className="p-5 border-b border-amber-100/80 bg-amber-50/30">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h3 className="text-xs font-display font-bold text-amber-700 uppercase tracking-widest">Intuisi Awal</h3>
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    {moduleSlug === "millikan"
                      ? '"Muatan listrik pada tetesan minyak bisa bernilai berapa saja — kontinu dan bebas, tidak ada aturan kelipatan."'
                      : '"Massa beban mempengaruhi periode ayunan bandul — semakin berat, semakin lambat."'
                    }
                  </p>
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center -my-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-border-default flex items-center justify-center shadow-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted rotate-90" />
                  </div>
                </div>

                {/* Result (cobalt) */}
                <div className="p-5 bg-accent-cobalt/[0.025]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cobalt" />
                    <h3 className="text-xs font-display font-bold text-accent-cobalt uppercase tracking-widest">Data Eksperimen</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {moduleSlug === "millikan"
                      ? <>Muatan selalu <b>mengelompok secara diskret</b> di kelipatan muatan tunggal <b>1.6 × 10⁻¹⁹ C</b> (nilai e). Tidak ada muatan "pecahan" di alam.</>
                      : <>Data menunjukkan <b>massa tidak mempengaruhi periode</b>. T hanya bergantung pada panjang tali (L) dan gravitasi (g).</>
                    }
                  </p>
                  {/* Key stats */}
                  <div className="flex gap-3 flex-wrap">
                    {moduleSlug === "millikan" ? (
                      <>
                        <StatChip label="e Cunningham" value={`${calculatedE.toFixed(3)} ×10⁻¹⁹ C`} color="cobalt" />
                        <StatChip label="Galat vs NIST" value={`${eError.toFixed(2)}%`} color={eError < 3 ? "success" : "amber"} />
                        <StatChip label="Kuantisasi" value="100% Diskret" color="teal" />
                      </>
                    ) : (
                      <>
                        <StatChip label="g hitung" value={`${calculatedG.toFixed(3)} m/s²`} color="cobalt" />
                        <StatChip label="Galat" value={`${gError.toFixed(2)}%`} color={gError < 2 ? "success" : "amber"} />
                        <StatChip label="R²" value={regressionBandul.r2.toFixed(4)} color={regressionBandul.r2 > 0.99 ? "success" : "cobalt"} />
                      </>
                    )}
                  </div>
                </div>

                {/* Match */}
                <div className="px-5 py-3.5 border-t border-rose/20 bg-rose/[0.025]">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">Berbeda</Badge>
                    <span className="text-xs text-text-muted">Intuisi awalmu tidak sesuai dengan kebenaran fisis.</span>
                  </div>
                </div>
              </div>

              {/* Educational insight card */}
              <div className="bg-gradient-to-br from-accent-cobalt/5 to-sky-blue/5 border border-accent-cobalt/15 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-accent-cobalt flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-display font-bold text-accent-cobalt mb-1">Kenapa ini penting?</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {moduleSlug === "millikan"
                      ? "Penemuan kuantisasi muatan (e) pada 1909 membuktikan atom bukanlah partikel terkecil. Elektron memiliki muatan diskret — inilah fondasi mekanika kuantum modern."
                      : "Massa tidak mempengaruhi periode adalah konsekuensi langsung dari persamaan gerak Newton: gaya gravitasi dan inersia massa saling menghilangkan (prinsip ekivalensi Einstein)."
                    }
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" onClick={() => setStep("dialogue")} className="cursor-pointer">
                  Lanjut Dialog Sokratis <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SOCRATIC DIALOGUE */}
          {step === "dialogue" && (
            <DialogueSection
              moduleSlug={moduleSlug}
              trials={trials}
              writtenReflections={writtenReflections}
              setWrittenReflections={setWrittenReflections}
              onBack={() => setStep("confront")}
              onNext={() => setStep("reconstruct")}
            />
          )}

          {/* STEP 3: RECONSTRUCTION */}
          {step === "reconstruct" && (
            <motion.div key="reconstruct" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="text-center mb-7">
                <Badge variant="primary" size="lg" className="mb-3">
                  <Lightbulb className="w-3.5 h-3.5" /> Rekonstruksi
                </Badge>
                <h2 className="font-display text-2xl font-bold text-primary-navy mb-1.5">Bangun Pemahaman Baru</h2>
                <p className="text-sm text-text-muted">Artikulasikan bukti eksperimental yang mengubah keyakinanmu.</p>
              </div>

              <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 mb-6">
                <label className="block mb-4">
                  <span className="font-display font-semibold text-sm text-primary-navy block mb-1.5">
                    {moduleSlug === "millikan"
                      ? "Bagaimana pemahamanmu tentang kuantisasi muatan listrik setelah eksperimen ini?"
                      : "Apa yang sebenarnya menentukan periode ayunan bandul, dan mengapa massa tidak berperan?"}
                  </span>
                  <textarea
                    value={writtenReflections.final}
                    onChange={e => setWrittenReflections({ ...writtenReflections, final: e.target.value })}
                    className="w-full min-h-[120px] p-4 rounded-xl border border-border-default text-sm font-body placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt transition-all resize-y bg-white"
                    placeholder="Tulis pemahaman barumu. Sebutkan bukti eksperimental spesifik yang mengubah keyakinan awalmu..."
                    aria-label="Tuliskan pemahaman baru"
                  />
                </label>

                <div className="bg-gray-50 rounded-xl p-3.5 border border-border-default/60">
                  <p className="text-[10px] font-display font-semibold text-text-muted mb-2 uppercase tracking-wider">Panduan menulis:</p>
                  <ul className="text-[11px] text-text-muted space-y-1 leading-relaxed">
                    <li>• Apa gagasan awalmu yang salah? Bukti apa yang membuktikannya?</li>
                    <li>• Hukum fisika mana yang mengatur fenomena ini?</li>
                    <li>• Bagaimana pemahaman baru ini relevan di kehidupan nyata?</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" size="lg" onClick={() => setStep("dialogue")} className="cursor-pointer">
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </Button>
                <Button size="lg" onClick={() => setStep("complete")} className="cursor-pointer"
                  disabled={writtenReflections.final.trim().length < 20}>
                  Selesaikan <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: COMPLETE */}
          {step === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div
                initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                className="w-24 h-24 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-primary-navy mb-2">Selesai! 🎉</h2>
              <p className="text-text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Kamu berhasil meluruskan satu miskonsepsi melalui eksplorasi empiris. Setiap saintis sejati memulai dari sini.
              </p>

              {/* Result summary */}
              <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 mb-7 text-left max-w-md mx-auto">
                <h3 className="font-display font-semibold text-sm text-primary-navy mb-3 text-center">Ringkasan Eksperimen</h3>
                <div className="space-y-2.5">
                  {moduleSlug === "millikan" ? (
                    <>
                      <ResultRow label="e Cunningham" value={`${calculatedE.toFixed(4)} ×10⁻¹⁹ C`} status={eError < 3} />
                      <ResultRow label="Galat vs NIST" value={`${eError.toFixed(2)}%`} status={eError < 5} />
                      <ResultRow label="Jumlah trial" value={`${trials.length} percobaan`} status={trials.length >= 4} />
                    </>
                  ) : (
                    <>
                      <ResultRow label="g hitung" value={`${calculatedG.toFixed(4)} m/s²`} status={gError < 3} />
                      <ResultRow label="Galat" value={`${gError.toFixed(2)}%`} status={gError < 5} />
                      <ResultRow label="R²" value={regressionBandul.r2.toFixed(4)} status={regressionBandul.r2 > 0.99} />
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-3 flex-wrap">
                <Button size="lg" onClick={handlePrint} className="cursor-pointer">
                  <Download className="w-4 h-4" /> Unduh Laporan PDF
                </Button>
                <Link href="/modules">
                  <Button variant="outline" size="lg" className="cursor-pointer">
                    <Home className="w-4 h-4" /> Kembali ke Katalog
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }: { label: string; value: string; color: "cobalt" | "success" | "teal" | "amber" }) {
  const colors: Record<string, string> = {
    cobalt:  "bg-accent-cobalt/5 border-accent-cobalt/20 text-accent-cobalt",
    success: "bg-success/5 border-success/20 text-success",
    teal:    "bg-teal/5 border-teal/20 text-teal",
    amber:   "bg-amber/5 border-amber/20 text-amber",
  };
  return (
    <div className={cn("rounded-xl px-3 py-2 border", colors[color] || colors.cobalt)}>
      <span className="text-[9px] block opacity-70 uppercase tracking-wider font-mono">{label}</span>
      <span className="font-mono font-bold text-sm">{value}</span>
    </div>
  );
}

// ─── Result Row ────────────────────────────────────────────────────────────────
function ResultRow({ label, value, status }: { label: string; value: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border-default/50 last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-primary-navy">{value}</span>
        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", status ? "bg-success" : "bg-amber-400")}>
          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Dialogue Section ─────────────────────────────────────────────────────────
function DialogueSection({ moduleSlug, trials, writtenReflections, setWrittenReflections, onBack, onNext }: {
  moduleSlug: string; trials: any[];
  writtenReflections: { q1: string; q2: string; q3: string; final: string }; setWrittenReflections: React.Dispatch<React.SetStateAction<{ q1: string; q2: string; q3: string; final: string }>>;
  onBack: () => void; onNext: () => void;
}) {
  const questions = ConfigRegistry[moduleSlug]?.questions || [];

  const [chatIndex, setChatIndex]       = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [messages, setMessages]         = useState<{ role: "tutor" | "user"; text: string }[]>([
    { role: "tutor", text: questions[0].q }
  ]);
  const messagesEndRef                  = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isGenerating) return;

    const userText = currentInput;
    setCurrentInput("");
    setIsGenerating(true);
    const updated = [...messages, { role: "user" as const, text: userText }];
    setMessages(updated);
    setWrittenReflections((prev) => ({ ...prev, [questions[chatIndex].key]: userText }));

    try {
      const res  = await fetch("/api/ai/socratic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug, trials, qId: questions[chatIndex].key, userResponse: userText, history: updated }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "tutor", text: data.reply }]);
        if (chatIndex < questions.length - 1) {
          setTimeout(() => {
            setChatIndex(chatIndex + 1);
            setMessages(prev => [...prev, { role: "tutor", text: questions[chatIndex + 1].q }]);
            setIsGenerating(false);
          }, 1400);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: "tutor",
              text: "Brilian! Kamu telah membuktikan miskonsepsi ini secara empiris. Saatnya merekonstruksi pemahaman barumu secara utuh!"
            }]);
            setIsGenerating(false);
          }, 800);
        }
      } else throw new Error("No reply");
    } catch {
      setMessages(prev => [...prev, {
        role: "tutor",
        text: chatIndex < questions.length - 1
          ? `Jawabanmu terekam! ${questions[chatIndex + 1].q}`
          : "Jawabanmu terekam! Saatnya merekonstruksi pemahaman barumu."
      }]);
      if (chatIndex < questions.length - 1) {
        setTimeout(() => { setChatIndex(chatIndex + 1); setIsGenerating(false); }, 800);
      } else setIsGenerating(false);
    }
  };

  const isFinished = messages.some(m => m.text.includes("merekonstruksi") || m.text.includes("Brilian"));

  return (
    <motion.div key="dialogue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <div className="text-center mb-6">
        <Badge variant="teal" size="lg" className="mb-3">
          <MessageCircle className="w-3.5 h-3.5" /> Dialog Sokratis
        </Badge>
        <h2 className="font-display text-2xl font-bold text-primary-navy mb-1">Diskusi dengan AI Tutor</h2>
        <p className="text-xs text-text-muted">Jawab pertanyaan berdasarkan data eksperimenmu sendiri.</p>
      </div>

      {/* Chat container */}
      <div className="bg-white rounded-2xl border border-border-default shadow-sm overflow-hidden mb-4">
        {/* Progress bar */}
        <div className="px-4 py-2.5 border-b border-border-default bg-gray-50/50 flex items-center gap-3">
          <span className="text-[10px] font-mono text-text-muted">Pertanyaan</span>
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <motion.div className="bg-accent-cobalt h-1 rounded-full" animate={{ width: `${(chatIndex / (questions.length - 1)) * 100}%` }} />
          </div>
          <span className="text-[10px] font-mono text-accent-cobalt font-bold">{chatIndex + 1}/{questions.length}</span>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto bg-gray-50/30" id="chat-messages">
          {messages.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-2.5 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
              {/* Avatar */}
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                msg.role === "tutor" ? "bg-accent-cobalt" : "bg-slate-200")}>
                {msg.role === "tutor"
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-3.5 h-3.5 text-slate-600" />
                }
              </div>
              {/* Bubble */}
              <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "tutor"
                  ? "bg-white border border-border-default text-text-primary rounded-tl-none"
                  : "bg-accent-cobalt text-white rounded-tr-none")}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isGenerating && (
            <div className="flex gap-2.5 mr-auto max-w-[90%]">
              <div className="w-7 h-7 rounded-full bg-accent-cobalt flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-border-default rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map(d => (
                    <motion.div key={d} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                      className="w-1.5 h-1.5 rounded-full bg-accent-cobalt/60" />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-border-default p-3 flex gap-2">
          <input
            value={currentInput} onChange={e => setCurrentInput(e.target.value)}
            disabled={isGenerating || isFinished}
            placeholder={isFinished ? "Dialog selesai — lanjutkan ke rekonstruksi" : "Tuliskan jawabanmu di sini..."}
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border-default bg-white placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <Button type="submit" disabled={isGenerating || !currentInput.trim() || isFinished}
            className="px-4 py-2.5 h-auto cursor-pointer">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" size="lg" onClick={onBack} className="cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Button>
        <Button size="lg" onClick={onNext} disabled={!isFinished} className="cursor-pointer">
          Rekonstruksi <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
