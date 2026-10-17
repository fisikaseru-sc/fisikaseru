"use client";

/**
 * ExperimentView — laboratorium utama modul Gerak Parabola.
 *
 * Layout: kanvas 3D (ProjectileScene3D, dynamic ssr:false) + bar kontrol
 * simulasi (SimulationControls) di kiri; panel variabel + tabel data di kanan.
 * "Catat Data" merekam {v0, sudut, jarak} ke localStorage `parabola-trials`
 * (maksimum 12 percobaan) dengan derau pengukuran gaussian kecil.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight, Info, Save } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimulationControls } from "@/components/viz/three";
import { GRAVITY_PRESETS, PARABOLA_CONFIG } from "../config";
import { GaussianNoise, maxHeight, timeOfFlight, range as theoreticalRange } from "../simulation/projectile";
import {
  STORAGE_KEYS,
  loadTrials,
  saveTrials,
  type ParabolaTrial,
} from "../types";
import type { ProjectileSceneState } from "../views3d/ProjectileScene3D";

const ProjectileScene3D = dynamic(() => import("../views3d/ProjectileScene3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-bg-dark">
      <div className="w-48 space-y-3">
        <Skeleton className="h-40 w-full rounded-xl bg-slate-700/40" />
        <Skeleton className="h-4 w-3/4 bg-slate-700/40" />
      </div>
    </div>
  ),
});

const STEPS = ["Prediksi", "Eksperimen", "Analisis", "Refleksi"];
const MAX_TRIALS = PARABOLA_CONFIG.constants.MAKS_TRIAL;
const SIGMA = PARABOLA_CONFIG.constants.SIGMA_PENGUKURAN;

const [V0_VAR, SUDUT_VAR, G_VAR, H0_VAR] = PARABOLA_CONFIG.simulation.independent;

export default function ExperimentView() {
  // ── Variabel simulasi ──
  const [v0, setV0] = useState(V0_VAR.defaultValue);
  const [angleDeg, setAngleDeg] = useState(SUDUT_VAR.defaultValue);
  const [g, setG] = useState(G_VAR.defaultValue);
  const [h0, setH0] = useState(H0_VAR.defaultValue);

  // ── Kontrol simulasi ──
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  // ── Pembacaan state scene (±10 Hz) ──
  const [sceneState, setSceneState] = useState<ProjectileSceneState>({
    x: 0,
    y: h0,
    t: 0,
    vx: 0,
    vy: 0,
    landed: false,
    rested: false,
    rangeX: null,
  });

  // ── Data percobaan ──
  const [trials, setTrials] = useState<ParabolaTrial[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const noiseRef = useRef<GaussianNoise | null>(null);

  useEffect(() => {
    setTrials(loadTrials());
    noiseRef.current = new GaussianNoise();
  }, []);

  // Auto-pause setelah proyektil berhenti (bounce-and-stop selesai).
  useEffect(() => {
    if (sceneState.rested && running) setRunning(false);
  }, [sceneState.rested, running]);

  const handleStateChange = useCallback((state: ProjectileSceneState) => {
    setSceneState(state);
  }, []);

  const handlePlayPause = () => {
    if (sceneState.rested) {
      // Luncur ulang dari awal setelah proyektil berhenti.
      setResetKey((k) => k + 1);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setResetKey((k) => k + 1);
  };

  const canRecord =
    sceneState.landed && sceneState.rangeX !== null && trials.length < MAX_TRIALS;

  const handleRecord = () => {
    setHint(null);
    if (trials.length >= MAX_TRIALS) {
      setHint("Tabel data sudah penuh (12 percobaan). Lanjut ke Analisis untuk memproses datamu.");
      return;
    }
    if (!sceneState.landed || sceneState.rangeX === null) {
      setHint("Jalankan peluncuran sampai bola mendarat dulu — jarak baru bisa dicatat setelah mendarat.");
      return;
    }
    if (noiseRef.current === null) noiseRef.current = new GaussianNoise();

    // Pengukuran manusiawi: sedikit derau relatif pada pembacaan jarak.
    const measured = Math.max(
      0,
      sceneState.rangeX + noiseRef.current.gaussian(0, SIGMA * sceneState.rangeX)
    );

    const trial: ParabolaTrial = {
      id: trials.length + 1,
      v0,
      angle: angleDeg,
      g,
      h0,
      range: parseFloat(measured.toFixed(2)),
      recordedAt: new Date().toISOString(),
    };
    const updated = [...trials, trial];
    setTrials(updated);
    saveTrials(updated);
  };

  // Prediksi teoretis live (untuk pembanding di panel).
  const theory = useMemo(() => {
    const params = { v0, angleDeg, g, h0 };
    return {
      range: theoreticalRange(params),
      height: maxHeight(params),
      flight: timeOfFlight(params),
    };
  }, [v0, angleDeg, g, h0]);

  const speedMag = Math.hypot(sceneState.vx, sceneState.vy);

  return (
    <div className="h-screen bg-bg-primary flex flex-col font-body overflow-hidden">
      {/* ── Header ── */}
      <header className="h-12 bg-white border-b border-border-default flex items-center px-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <Link href="/modules" className="hover:text-primary-navy transition-colors whitespace-nowrap">
            <ChevronLeft className="w-3.5 h-3.5 inline" /> Katalog
          </Link>
          <span>/</span>
          <span className="text-xs font-semibold text-primary-navy truncate">{PARABOLA_CONFIG.meta.title}</span>
          <span>/</span>
          <span className="text-text-primary font-semibold whitespace-nowrap">Eksperimen</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={
                  i === 1
                    ? "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white"
                    : i < 1
                      ? "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-success/10 text-success"
                      : "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-border-default text-text-muted"
                }
              >
                <span className="font-mono opacity-70">{i + 1}</span>
                <span className="hidden lg:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={i < 1 ? "w-3 h-px bg-success/40" : "w-3 h-px bg-border-default"} />}
            </React.Fragment>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/modules/parabola/analysis"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white hover:bg-accent-cobalt/90 transition-all"
          >
            Analisis <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 flex-col lg:flex-row">
        {/* Kanvas 3D */}
        <main className="flex-1 relative min-w-0 min-h-[320px] bg-bg-dark overflow-hidden">
          <ProjectileScene3D
            v0={v0}
            angleDeg={angleDeg}
            g={g}
            h0={h0}
            running={running}
            speed={speed}
            resetKey={resetKey}
            onStateChange={handleStateChange}
          />

          {/* HUD fisika real-time */}
          <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 shadow-depth space-y-1.5 text-[10px] font-mono min-w-[148px]">
            <div className="text-slate-400 uppercase tracking-wider font-bold text-[8px] mb-1.5">
              Fisika Real-Time
            </div>
            {[
              { label: "t", value: `${sceneState.t.toFixed(2)} s`, color: "text-slate-300" },
              { label: "x", value: `${sceneState.x.toFixed(1)} m`, color: "text-yellow-300" },
              { label: "y", value: `${Math.max(sceneState.y, 0).toFixed(1)} m`, color: "text-yellow-300" },
              { label: "|v|", value: `${speedMag.toFixed(1)} m/s`, color: "text-cyan-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-1.5 flex justify-between">
              <span className="text-slate-400">R teori</span>
              <span className="text-green-400 font-bold">{theory.range.toFixed(1)} m</span>
            </div>
          </div>

          {/* Bar kontrol simulasi */}
          <SimulationControls
            className="absolute bottom-4 left-1/2 z-10 w-max max-w-[calc(100%-2rem)] -translate-x-1/2"
            running={running}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            time={sceneState.t}
            speed={speed}
            onSpeedChange={setSpeed}
            labels={{ play: "Luncurkan", pause: "Jeda" }}
          />
        </main>

        {/* Panel kanan */}
        <aside className="lg:w-[340px] flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-border-default flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Variabel */}
              <section className="space-y-4">
                <h2 className="font-display font-bold text-xs text-primary-navy flex items-center gap-1.5">
                  Variabel Peluncur
                </h2>

                {/* v0 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="var-v0" className="text-xs font-medium">
                      {V0_VAR.label}
                    </Label>
                    <span className="font-mono text-xs font-bold text-accent-cobalt">
                      {v0} {V0_VAR.unit}
                    </span>
                  </div>
                  <Slider
                    id="var-v0"
                    value={[v0]}
                    min={V0_VAR.min}
                    max={V0_VAR.max}
                    step={V0_VAR.step}
                    onValueChange={(values) => {
                      const next = values[0];
                      if (typeof next === "number") setV0(next);
                    }}
                    aria-label="Kecepatan awal"
                  />
                </div>

                {/* Sudut */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="var-sudut" className="text-xs font-medium">
                      {SUDUT_VAR.label}
                    </Label>
                    <span className="font-mono text-xs font-bold text-accent-cobalt">
                      {angleDeg} {SUDUT_VAR.unit}
                    </span>
                  </div>
                  <Slider
                    id="var-sudut"
                    value={[angleDeg]}
                    min={SUDUT_VAR.min}
                    max={SUDUT_VAR.max}
                    step={SUDUT_VAR.step}
                    onValueChange={(values) => {
                      const next = values[0];
                      if (typeof next === "number") setAngleDeg(next);
                    }}
                    aria-label="Sudut elevasi"
                  />
                </div>

                {/* Gravitasi */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="var-g" className="text-xs font-medium">
                      {G_VAR.label}
                    </Label>
                    <span className="font-mono text-xs font-bold text-accent-cobalt">
                      {g.toFixed(2)} {G_VAR.unit}
                    </span>
                  </div>
                  <Slider
                    id="var-g"
                    value={[g]}
                    min={G_VAR.min}
                    max={G_VAR.max}
                    step={G_VAR.step}
                    onValueChange={(values) => {
                      const next = values[0];
                      if (typeof next === "number") setG(parseFloat(next.toFixed(2)));
                    }}
                    aria-label="Gravitasi"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {GRAVITY_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setG(preset.g)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          Math.abs(g - preset.g) < 0.005
                            ? "bg-accent-cobalt/10 border-accent-cobalt text-accent-cobalt"
                            : "bg-white border-border-default text-text-muted hover:border-accent-cobalt/30"
                        }`}
                      >
                        <span aria-hidden="true">{preset.emoji}</span> {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* h0 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="var-h0" className="text-xs font-medium">
                      {H0_VAR.label}
                    </Label>
                    <span className="font-mono text-xs font-bold text-accent-cobalt">
                      {h0.toFixed(1)} {H0_VAR.unit}
                    </span>
                  </div>
                  <Slider
                    id="var-h0"
                    value={[h0]}
                    min={H0_VAR.min}
                    max={H0_VAR.max}
                    step={H0_VAR.step}
                    onValueChange={(values) => {
                      const next = values[0];
                      if (typeof next === "number") setH0(next);
                    }}
                    aria-label="Ketinggian awal"
                  />
                </div>
              </section>

              <Separator />

              {/* Prediksi teoretis */}
              <section className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-2 border border-border-default/60">
                  <span className="text-[8px] text-text-muted font-mono uppercase tracking-wider block">R teori</span>
                  <span className="font-mono text-xs font-bold text-primary-navy">{theory.range.toFixed(1)} m</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 border border-border-default/60">
                  <span className="text-[8px] text-text-muted font-mono uppercase tracking-wider block">H maks</span>
                  <span className="font-mono text-xs font-bold text-primary-navy">{theory.height.toFixed(1)} m</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 border border-border-default/60">
                  <span className="text-[8px] text-text-muted font-mono uppercase tracking-wider block">t terbang</span>
                  <span className="font-mono text-xs font-bold text-primary-navy">{theory.flight.toFixed(2)} s</span>
                </div>
              </section>

              <Separator />

              {/* Catat data */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xs text-primary-navy">Data Percobaan</h2>
                  <Badge variant={trials.length >= MAX_TRIALS ? "warning" : "primary"} size="sm">
                    {trials.length}/{MAX_TRIALS}
                  </Badge>
                </div>

                <Button
                  onClick={handleRecord}
                  disabled={!canRecord}
                  variant="teal"
                  className="w-full cursor-pointer"
                  aria-label="Catat data percobaan"
                >
                  <Save data-icon="inline-start" className="size-3.5" />
                  Catat Data
                </Button>

                {hint ? (
                  <Alert>
                    <Info />
                    <AlertTitle>Petunjuk</AlertTitle>
                    <AlertDescription className="text-xs">{hint}</AlertDescription>
                  </Alert>
                ) : trials.length === 0 ? (
                  <Alert>
                    <Info />
                    <AlertTitle>Langkah eksperimen</AlertTitle>
                    <AlertDescription className="text-xs">
                      Tekan <b>Luncurkan</b>, tunggu bola mendarat, lalu <b>Catat Data</b>. Ulangi dengan sudut
                      berbeda (mis. 15°, 30°, 45°, 60°, 75°) untuk melihat polanya.
                    </AlertDescription>
                  </Alert>
                ) : trials.length < 5 ? (
                  <Alert>
                    <Info />
                    <AlertTitle>Rekomendasi</AlertTitle>
                    <AlertDescription className="text-xs">
                      Coba sudut berbeda-beda — semakin bervariasi sudutnya, semakin jelas pola hubungan
                      sudut ↔ jarak di analisis.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* Tabel trial */}
                {trials.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-lg border border-border-default overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-[10px] px-2 py-1.5">#</TableHead>
                            <TableHead className="text-[10px] px-2 py-1.5">v₀ (m/s)</TableHead>
                            <TableHead className="text-[10px] px-2 py-1.5">θ (°)</TableHead>
                            <TableHead className="text-[10px] px-2 py-1.5 text-right">R (m)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trials.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="text-[10px] font-mono px-2 py-1.5 text-text-muted">{t.id}</TableCell>
                              <TableCell className="text-[10px] font-mono px-2 py-1.5">{t.v0}</TableCell>
                              <TableCell className="text-[10px] font-mono px-2 py-1.5">{t.angle}</TableCell>
                              <TableCell className="text-[10px] font-mono px-2 py-1.5 text-right font-bold text-accent-cobalt">
                                {t.range.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {trials.length >= 5 ? (
                      <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                        Sudut mana yang memberi R terbesar sejauh ini? Lanjut ke Analisis untuk grafik lengkapnya.
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}
              </section>
            </div>
          </ScrollArea>

          {/* Footer panel */}
          <div className="border-t border-border-default p-3 flex-shrink-0">
            <Link href="/modules/parabola/analysis" className="block">
              <Button variant="outline" size="sm" className="w-full cursor-pointer">
                <BarChart3 data-icon="inline-start" className="size-3.5" />
                Analisis Data ({trials.length})
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
