"use client";

/**
 * AnalysisView — langkah ANALYZE modul Gerak Parabola.
 *
 * Membaca trial dari localStorage `parabola-trials`, menampilkan:
 *  - Tab "Data": tabel lengkap + ringkasan (sudut terbaik dari datamu).
 *  - Tab "Grafik": scatter jarak (R) vs sudut (θ) + kurva teoretis
 *    R = v₀²·sin(2θ)/g sebagai overlay pada v₀ terpilih siswa.
 *  - Tab "Teori": derivasi rumus & penuntun menemukan sudut optimal 45°.
 */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  Table2,
  TrendingUp,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PARABOLA_CONFIG } from "../config";
import { OPTIMAL_ANGLE_DEG, theoreticalRange } from "../simulation/projectile";
import { bestTrial, loadTrials, type ParabolaTrial } from "../types";

const STEPS = ["Prediksi", "Eksperimen", "Analisis", "Refleksi"];

interface ChartPoint extends ParabolaTrial {
  /** x-axis: sudut (°). */
  angle: number;
  /** y-axis: range terukur (m). */
  range: number;
}

/** Tooltip scatter ter-typed (tanpa any). */
function TrialTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-border-default rounded-xl p-3 shadow-depth text-[11px] font-mono space-y-0.5 min-w-[160px]">
      <p className="font-bold text-primary-navy mb-1">Percobaan #{d.id}</p>
      <p className="text-text-muted">
        v₀ = {d.v0} m/s · θ = {d.angle}°
      </p>
      <p className="text-text-muted">g = {d.g.toFixed(2)} m/s² · h₀ = {d.h0} m</p>
      <p>
        R terukur = <span className="font-bold text-accent-cobalt">{d.range.toFixed(2)} m</span>
      </p>
      <p>
        R teori ={" "}
        <span className="font-bold text-teal">{theoreticalRange(d.v0, d.angle, d.g).toFixed(2)} m</span>
      </p>
    </div>
  );
}

export default function AnalysisView() {
  const [mounted, setMounted] = useState(false);
  const [trials, setTrials] = useState<ParabolaTrial[]>([]);
  const [selectedV0, setSelectedV0] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadTrials();
    setTrials(loaded);
    // Default: v₀ dari percobaan terakhir.
    if (loaded.length > 0) setSelectedV0(loaded[loaded.length - 1].v0);
    setMounted(true);
  }, []);

  // v₀ berbeda yang ada di data (untuk pemilihan kurva teoretis).
  const distinctV0 = useMemo(() => Array.from(new Set(trials.map((t) => t.v0))).sort((a, b) => a - b), [trials]);

  // Percobaan pada v₀ terpilih.
  const selectedTrials = useMemo(
    () => (selectedV0 === null ? [] : trials.filter((t) => t.v0 === selectedV0)),
    [trials, selectedV0]
  );

  // g diambil dari percobaan terakhir pada v₀ terpilih.
  const selectedG = useMemo(
    () => (selectedTrials.length > 0 ? selectedTrials[selectedTrials.length - 1].g : 9.81),
    [selectedTrials]
  );

  const scatterPoints: ChartPoint[] = selectedTrials;

  // Kurva teoretis R = v₀² sin(2θ)/g pada v₀ terpilih.
  const theoryCurve = useMemo(() => {
    if (selectedV0 === null) return [];
    const points: Array<{ angle: number; range: number }> = [];
    for (let angle = 10; angle <= 80; angle += 2) {
      points.push({ angle, range: parseFloat(theoreticalRange(selectedV0, angle, selectedG).toFixed(2)) });
    }
    return points;
  }, [selectedV0, selectedG]);

  // Sudut terbaik dari data (v₀ terpilih) & global.
  const bestAtV0 = bestTrial(selectedTrials);
  const bestOverall = bestTrial(trials);

  // Deteksi pasangan sudut komplemen (θ + θ' ≈ 90°, range mirip).
  const complementaryPairs = useMemo(() => {
    const pairs: Array<{ a: number; b: number; ra: number; rb: number }> = [];
    for (const p of selectedTrials) {
      const partner = selectedTrials.find(
        (q) => q.id !== p.id && Math.abs(p.angle + q.angle - 90) <= 1 && p.angle < q.angle
      );
      if (partner && Math.abs(p.range - partner.range) / Math.max(p.range, partner.range, 1e-9) < 0.12) {
        pairs.push({ a: p.angle, b: partner.angle, ra: p.range, rb: partner.range });
      }
    }
    return pairs;
  }, [selectedTrials]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center" suppressHydrationWarning>
        <div className="w-6 h-6 rounded-full border-2 border-accent-cobalt border-t-transparent animate-spin" />
      </div>
    );
  }

  const moduleTitle = PARABOLA_CONFIG.meta.title;

  return (
    <div className="min-h-screen bg-bg-primary font-body">
      {/* ── Header ── */}
      <header className="h-12 bg-white border-b border-border-default flex items-center px-4 sticky top-0 z-30">
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <Link href="/modules" className="hover:text-primary-navy transition-colors whitespace-nowrap">
            Katalog
          </Link>
          <span>/</span>
          <Link
            href="/modules/parabola/experiment"
            className="hover:text-primary-navy transition-colors whitespace-nowrap"
          >
            {moduleTitle}
          </Link>
          <span>/</span>
          <span className="text-text-primary font-semibold">Analisis</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={
                  i === 2
                    ? "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white"
                    : i < 2
                      ? "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-success/10 text-success"
                      : "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-border-default text-text-muted"
                }
              >
                <span className="font-mono opacity-70">{i + 1}</span>
                <span className="hidden lg:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={i < 2 ? "w-3 h-px bg-success/40" : "w-3 h-px bg-border-default"} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/modules/parabola/experiment"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-text-muted hover:bg-gray-100 transition-all border border-border-default"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Lab
          </Link>
          <Link
            href="/modules/parabola/reflection"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white hover:bg-accent-cobalt/90 transition-all"
          >
            Refleksi <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Banner insight */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-xl px-5 py-3.5 flex items-start gap-3 mb-6"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-snug">
            Bandingkan <b>titik-titik datamu</b> dengan <b>kurva teoretis</b> R = v₀²·sin(2θ)/g. Di sudut berapa
            kurva itu mencapai puncaknya — dan apakah data percobaanmu setuju?
          </p>
        </motion.div>

        {trials.length === 0 ? (
          /* ── Belum ada data ── */
          <Card>
            <CardHeader>
              <CardTitle>Belum ada data percobaan</CardTitle>
              <CardDescription>
                Analisis butuh data. Jalankan beberapa peluncuran di laboratorium terlebih dahulu, lalu kembali ke
                sini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/modules/parabola/experiment">
                <Button className="cursor-pointer">
                  Buka Laboratorium <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="grafik">
            <TabsList className="mb-4">
              <TabsTrigger value="data">
                <Table2 className="w-3.5 h-3.5" /> Data
              </TabsTrigger>
              <TabsTrigger value="grafik">
                <BarChart3 className="w-3.5 h-3.5" /> Grafik
              </TabsTrigger>
              <TabsTrigger value="teori">
                <Lightbulb className="w-3.5 h-3.5" /> Teori
              </TabsTrigger>
            </TabsList>

            {/* ── TAB: DATA ── */}
            <TabsContent value="data">
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Semua Percobaan ({trials.length})</CardTitle>
                      <CardDescription>
                        Setiap baris adalah satu peluncuran yang kamu rekam dengan tombol Catat Data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-border-default overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              {["#", "v₀ (m/s)", "θ (°)", "g (m/s²)", "h₀ (m)", "R terukur (m)", "R teori (m)"].map(
                                (h) => (
                                  <TableHead key={h} className="text-[10px] px-2 py-2 whitespace-nowrap">
                                    {h}
                                  </TableHead>
                                )
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trials.map((t) => (
                              <TableRow key={t.id} className="hover:bg-accent-cobalt/[0.02]">
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 text-text-muted">{t.id}</TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5">{t.v0}</TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5">{t.angle}</TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5">{t.g.toFixed(2)}</TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5">{t.h0}</TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 font-bold text-accent-cobalt">
                                  {t.range.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 text-text-muted">
                                  {theoreticalRange(t.v0, t.angle, t.g).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Ringkasan Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-accent-cobalt/5 rounded-xl p-3 border border-accent-cobalt/20">
                        <span className="text-[9px] text-accent-cobalt font-mono uppercase tracking-wider block">
                          Sudut terbaik dari datamu
                        </span>
                        <span className="font-mono text-2xl font-bold text-accent-cobalt">
                          {bestOverall ? `${bestOverall.angle}°` : "—"}
                        </span>
                        <span className="text-xs text-text-muted block">
                          {bestOverall ? `dengan R = ${bestOverall.range.toFixed(1)} m @ v₀ = ${bestOverall.v0} m/s` : ""}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-border-default/60">
                        <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider block">
                          Jarak dari teori 45°
                        </span>
                        <span className="font-mono text-lg font-bold text-primary-navy">
                          {bestOverall
                            ? `${(bestOverall.angle - OPTIMAL_ANGLE_DEG).toFixed(0)}°`
                            : "—"}
                        </span>
                        <span className="text-xs text-text-muted block">
                          selisih terhadap sudut optimal teoretis (45°)
                        </span>
                      </div>
                      {complementaryPairs.length > 0 ? (
                        <div className="bg-teal/5 rounded-xl p-3 border border-teal/20">
                          <span className="text-[9px] text-teal font-mono uppercase tracking-wider block mb-1">
                            Pasangan komplemen ditemukan
                          </span>
                          {complementaryPairs.map((p, i) => (
                            <p key={i} className="text-xs text-text-muted font-mono">
                              {p.a}° → {p.ra.toFixed(1)} m ≈ {p.b}° → {p.rb.toFixed(1)} m
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Alert>
                    <Info />
                    <AlertTitle>Saran eksperimen</AlertTitle>
                    <AlertDescription className="text-xs">
                      Coba luncurkan pada sudut 30° lalu 60° dengan v₀ yang sama. Apa yang kamu amati pada jarak
                      tempuhnya?
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>

            {/* ── TAB: GRAFIK ── */}
            <TabsContent value="grafik">
              <div className="space-y-4">
                {/* Pemilih v₀ */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-display font-semibold text-text-muted">v₀:</span>
                  {distinctV0.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedV0(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                        selectedV0 === v
                          ? "bg-accent-cobalt text-white"
                          : "bg-white border border-border-default text-text-muted hover:border-accent-cobalt/30"
                      }`}
                    >
                      {v} m/s
                    </button>
                  ))}
                  <span className="text-[10px] text-text-muted font-mono ml-1">
                    kurva teoretis memakai g = {selectedG.toFixed(2)} m/s²
                  </span>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Jarak Tempuh (R) vs Sudut (θ)</CardTitle>
                    <CardDescription>
                      Titik = data percobaanmu pada v₀ {selectedV0 ?? "—"} m/s. Garis putus = kurva teoretis
                      R = v₀²·sin(2θ)/g. Garis tegak menandai 45°.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            type="number"
                            dataKey="angle"
                            name="Sudut"
                            domain={[10, 80]}
                            allowDecimals={false}
                            label={{
                              value: "Sudut elevasi θ (°)",
                              position: "bottom",
                              offset: 14,
                              style: { fontSize: 11, fill: "#64748B" },
                            }}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                          />
                          <YAxis
                            type="number"
                            dataKey="range"
                            name="Jarak"
                            domain={[0, "auto"]}
                            label={{
                              value: "Jarak tempuh R (m)",
                              angle: -90,
                              position: "insideLeft",
                              offset: -4,
                              style: { fontSize: 11, fill: "#64748B" },
                            }}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                          />
                          <Tooltip content={<TrialTooltip />} />
                          <ReferenceLine
                            x={OPTIMAL_ANGLE_DEG}
                            stroke="#D97706"
                            strokeWidth={1.5}
                            strokeDasharray="6 3"
                            label={{
                              value: "45°",
                              fill: "#D97706",
                              fontSize: 10,
                              position: "top",
                            }}
                          />
                          <Line
                            data={theoryCurve}
                            dataKey="range"
                            stroke="#14213D"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            name="Teori"
                            activeDot={false}
                          />
                          <Scatter
                            data={scatterPoints}
                            dataKey="range"
                            fill="#1B4FD8"
                            r={6}
                            stroke="#fff"
                            strokeWidth={1.5}
                            name="Data percobaan"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-text-muted flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#1B4FD8] inline-block" /> Data percobaan
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-6 h-0.5 border-t-2 border-dashed border-[#14213D] inline-block" />{" "}
                        Teori R = v₀²·sin(2θ)/g
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-0.5 inline-block border-t-2 border-dashed border-[#D97706]" /> 45°
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Penuntun penemuan */}
                <Card className="bg-gradient-to-br from-accent-cobalt/5 to-sky-blue/5 border-accent-cobalt/15">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-accent-cobalt" /> Menemukan Sudut Optimal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-xl p-3 border border-border-default/60">
                      <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider block">
                        Tebakan terbaik datamu
                      </span>
                      <span className="font-mono text-xl font-bold text-accent-cobalt">
                        {bestAtV0 ? `${bestAtV0.angle}°` : "—"}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-border-default/60">
                      <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider block">
                        Prediksi teori
                      </span>
                      <span className="font-mono text-xl font-bold text-amber-600">{OPTIMAL_ANGLE_DEG}°</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-border-default/60">
                      <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider block">
                        Status
                      </span>
                      {bestAtV0 && Math.abs(bestAtV0.angle - OPTIMAL_ANGLE_DEG) <= 3 ? (
                        <Badge variant="success" className="mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Cocok!
                        </Badge>
                      ) : (
                        <span className="text-xs text-text-muted">
                          Tambah data di sekitar 40–50° untuk mengonfirmasi
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── TAB: TEORI ── */}
            <TabsContent value="teori">
              <div className="grid lg:grid-cols-2 gap-5">
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Dari Rumus ke Sudut Optimal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs font-mono text-slate-300">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Derivasi ringkas</p>
                    <p>R = v₀·cosθ · t dengan t = 2·v₀·sinθ / g</p>
                    <p>
                      R = v₀² · 2·sinθ·cosθ / g = <span className="text-yellow-300">v₀² · sin(2θ) / g</span>
                    </p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider pt-2">Mengapa 45°?</p>
                    <p>sin(2θ) maksimal ketika 2θ = 90°, yaitu θ = 45°.</p>
                    <p className="text-green-300 font-bold">∴ R maks = v₀² / g pada θ = 45°</p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider pt-2">
                      Sudut komplemen
                    </p>
                    <p>
                      sin(2·30°) = sin(2·60°) → 30° dan 60° memberi jarak sama. Sudut apa pun θ dan (90° − θ)
                      selalu berbagi jarak yang sama!
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Prediksi Teoretis pada v₀ = {selectedV0 ?? "—"} m/s</CardTitle>
                    <CardDescription>Hitungan R = v₀²·sin(2θ)/g dengan g = {selectedG.toFixed(2)} m/s².</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border-default overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-[10px] px-2 py-2">θ (°)</TableHead>
                            <TableHead className="text-[10px] px-2 py-2 text-right">R teori (m)</TableHead>
                            <TableHead className="text-[10px] px-2 py-2 text-right">R datamu (m)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[10, 20, 30, 40, 45, 50, 60, 70, 80].map((angle) => {
                            const predicted = selectedV0 !== null ? theoreticalRange(selectedV0, angle, selectedG) : 0;
                            const observed = selectedTrials.find((t) => Math.abs(t.angle - angle) <= 0.5);
                            return (
                              <TableRow
                                key={angle}
                                className={angle === OPTIMAL_ANGLE_DEG ? "bg-amber-50/60" : undefined}
                              >
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 font-semibold text-primary-navy">
                                  {angle}
                                  {angle === OPTIMAL_ANGLE_DEG ? " ★" : ""}
                                </TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 text-right">
                                  {predicted.toFixed(1)}
                                </TableCell>
                                <TableCell className="text-[11px] font-mono px-2 py-1.5 text-right font-bold text-accent-cobalt">
                                  {observed ? observed.range.toFixed(1) : "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                      ★ = sudut optimal. Baris dengan &ldquo;—&rdquo; belum kamu coba — isi di laboratorium untuk
                      melengkapi tabel ini.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Navigasi bawah */}
        <div className="flex gap-3 mt-6">
          <Link href="/modules/parabola/experiment" className="flex-1">
            <Button variant="outline" className="w-full cursor-pointer text-xs">
              <ChevronLeft className="w-3.5 h-3.5" /> Kembali ke Lab
            </Button>
          </Link>
          <Link href="/modules/parabola/reflection" className="flex-1">
            <Button className="w-full cursor-pointer text-xs">
              Lanjut Refleksi <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
