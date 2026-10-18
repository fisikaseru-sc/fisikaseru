"use client";

/**
 * ExperimentView — laboratorium modul Bandul Sederhana.
 *
 * Simulasi 2D (kanvas) atau 3D (PendulumScene3D, dynamic ssr:false) yang
 * dapat ditukar lewat toggle "2D / 3D" (default 2D sebagai fallback aman).
 * Fisika: pendulum nonlinier termalu (θ'' = -(g/L)·sin θ − b·θ').
 * "Rekam" menyimpan {L, T, T²} ke localStorage `fisikaseru:trials:bandul`
 * dengan derau pengukuran gaussian ±1.5%; T dihitung dari amplitudo awal
 * aktual memakai pendekatan integral eliptik T = T₀·(1 + θ₀²/16).
 */

import Link from "next/link";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Save,
  Eye, EyeOff, Settings, BarChart2, AlertCircle, CheckCircle2,
  ArrowRight, BookOpen, Sparkles, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PendulumState } from "../views3d/PendulumScene3D";
import { type BandulTrialRecord, isBandulTrial } from "@/features/shared/trialRecords";

const PendulumScene3D = dynamic(() => import("../views3d/PendulumScene3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <span className="text-xs text-slate-400 font-mono">Memuat scene 3D…</span>
    </div>
  ),
});

// ============================================================
// CONSTANTS
// ============================================================
const G_DEFAULT = 9.80665; // gravitasi bumi (m/s²)

const LAB_STEPS = ["Persiapan", "Pengamatan", "Pengukuran", "Analisis", "Refleksi"];

const GRAVITY_PRESETS = [
  { label: "Bulan", g: 1.62 },
  { label: "Bumi", g: 9.81 },
  { label: "Jupiter", g: 24.79 },
];

// ============================================================
// PHYSICS HELPERS
// ============================================================
function gaussianNoise(mean: number, std: number) {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ============================================================
// COMPONENT
// ============================================================
export default function LabPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = (params?.moduleSlug as string) || "bandul";

  const [currentStep, setCurrentStep]       = useState(() => {
    const savedStep = localStorage.getItem(`fisikaseru:step:${slug}`);
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [isRunning, setIsRunning]           = useState(false);
  const [showVectors, setShowVectors]       = useState(true);
  const [visualMode, setVisualMode]          = useState<"2d" | "3d">("2d");
  const [resetCount, setResetCount]          = useState(0);
  const [stopwatch, setStopwatch]            = useState(0);
  const [sceneState, setSceneState]          = useState<PendulumState | null>(null);

  const [pretestAnswers, setPretestAnswers]     = useState<Record<number, number>>(() => {
    const savedAns = localStorage.getItem(`fisikaseru:pretest:ans:${slug}`);
    if (savedAns) { try { return JSON.parse(savedAns); } catch (_) {} }
    return {};
  });
  const [pretestSubmitted, setPretestSubmitted] = useState(
    () => localStorage.getItem(`fisikaseru:pretest:sub:${slug}`) === "true"
  );
  const [expSteps, setExpSteps] = useState<{ interactionChanged: boolean }>(() => {
    const savedExp = localStorage.getItem(`fisikaseru:exp:${slug}`);
    if (savedExp) { try { return JSON.parse(savedExp); } catch (_) {} }
    return { interactionChanged: false };
  });

  const MAX_TRIALS = 10;
  // ── Muat progres tersimpan (lazy init — komponen dynamic ssr:false,
  // aman dari mismatch hidrasi; pembayaran debt lint set-state-in-effect) ──
  const [trials, setTrials] = useState<BandulTrialRecord[]>(() => {
    const savedTrials = localStorage.getItem(`fisikaseru:trials:${slug}`);
    if (savedTrials) {
      try {
        const p: unknown = JSON.parse(savedTrials);
        if (Array.isArray(p) && p.length > 0 && p.every(isBandulTrial)) return p;
      } catch (_) {}
    }
    return [];
  });
  const [sliders, setSliders] = useState(() => {
    try {
      const raw = localStorage.getItem(`fisikaseru:params:${slug}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p === "object" && p !== null) {
          const l = typeof p.length === "number" && p.length >= 0.2 && p.length <= 1.0 ? p.length : 0.75;
          const m = typeof p.mass === "number" && p.mass >= 0.05 && p.mass <= 0.5 ? p.mass : 0.1;
          const a = typeof p.angle === "number" && p.angle >= 5 && p.angle <= 30 ? p.angle : 10;
          const g = typeof p.gravity === "number" && p.gravity >= 1.6 && p.gravity <= 25 ? p.gravity : G_DEFAULT;
          return { length: l, mass: m, angle: a, gravity: g };
        }
      }
    } catch (_) {}
    return {
      length: 0.75, mass: 0.1, angle: 10, gravity: G_DEFAULT,
    };
  });

  // Persist parameter bandul agar bertahan saat reload
  useEffect(() => {
    try {
      localStorage.setItem(`fisikaseru:params:${slug}`, JSON.stringify(sliders));
    } catch (_) {}
  }, [sliders, slug]);

  const bandulRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const lastT        = useRef<number>(0);
  const pendAngleRef = useRef(0);
  const pendOmegaRef = useRef(0);

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    localStorage.setItem(`fisikaseru:step:${slug}`, newStep.toString());
  };

  const handleResetLab = () => {
    // Konfirmasi — reset menghapus SEMUA data percobaan & pretest tanpa undo.
    if (trials.length > 0 && !window.confirm(
      `Hapus semua ${trials.length} data percobaan dan jawaban pretest? Tindakan ini tidak bisa dibatalkan.`
    )) return;
    setTrials([]);
    localStorage.removeItem(`fisikaseru:trials:${slug}`);
    localStorage.removeItem(`fisikaseru:params:${slug}`);
    setSliders({ length: 0.75, mass: 0.1, angle: 10, gravity: G_DEFAULT });
    updateStep(0);
    setPretestAnswers({});
    localStorage.removeItem(`fisikaseru:pretest:ans:${slug}`);
    setPretestSubmitted(false);
    localStorage.removeItem(`fisikaseru:pretest:sub:${slug}`);
    const clearedExp = { interactionChanged: false };
    setExpSteps(clearedExp);
    localStorage.removeItem(`fisikaseru:exp:${slug}`);
  };

  const handleSetPretestAnswer = (qId: number, optionIdx: number) => {
    const updated = { ...pretestAnswers, [qId]: optionIdx };
    setPretestAnswers(updated);
    localStorage.setItem(`fisikaseru:pretest:ans:${slug}`, JSON.stringify(updated));
  };

  const handlePretestSubmit = () => {
    setPretestSubmitted(true);
    localStorage.setItem(`fisikaseru:pretest:sub:${slug}`, "true");
  };

  const updateExpStep = (key: keyof typeof expSteps, value: boolean) => {
    setExpSteps(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`fisikaseru:exp:${slug}`, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      const t0 = Date.now() - stopwatch * 1000;
      id = setInterval(() => setStopwatch((Date.now() - t0) / 1000), 30);
    }
    return () => clearInterval(id);
  }, [isRunning]);

  const handleSceneStateChange = useCallback((state: PendulumState) => {
    setSceneState(state);
  }, []);

  // ================================================================
  // PENDULUM CANVAS (2D)
  // ================================================================
  function drawBandul(dt: number) {
    const canvas = bandulRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr) { canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; }
    ctx.save(); ctx.scale(dpr, dpr);
    const W = rect.width; const H = rect.height;

    if (isRunning) {
      const acc = -(sliders.gravity / sliders.length) * Math.sin(pendAngleRef.current) - 0.012 * pendOmegaRef.current;
      pendOmegaRef.current += acc * dt;
      pendAngleRef.current += pendOmegaRef.current * dt;
    } else {
      pendAngleRef.current = (sliders.angle * Math.PI) / 180;
      pendOmegaRef.current = 0;
    }

    // Gradient background — subtle lab feel
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#f0f4f8"); bgGrad.addColorStop(1, "#e8eef5");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = "rgba(27,79,216,0.04)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Lab ceiling bar
    const barY = 44;
    const barGrad = ctx.createLinearGradient(0, barY - 4, 0, barY + 8);
    barGrad.addColorStop(0, "#cbd5e1"); barGrad.addColorStop(1, "#94a3b8");
    ctx.fillStyle = barGrad; ctx.fillRect(W * 0.2, barY - 4, W * 0.6, 12); ctx.fillStyle = "#64748b";
    ctx.fillRect(W * 0.2 - 2, barY - 6, 4, 16); ctx.fillRect(W * 0.8 - 2, barY - 6, 4, 16);

    const pivX = W / 2; const pivY = barY + 8;
    const scale = Math.min((H - 120) / 2, (W * 0.4));
    const drawL = sliders.length * scale;
    const bobX = pivX + drawL * Math.sin(pendAngleRef.current);
    const bobY = pivY + drawL * Math.cos(pendAngleRef.current);

    // Arc trail
    const maxSwing = (sliders.angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(pivX, pivY, drawL, Math.PI / 2 - maxSwing, Math.PI / 2 + maxSwing);
    ctx.strokeStyle = "rgba(27,79,216,0.07)"; ctx.lineWidth = drawL * 0.5; ctx.stroke();
    ctx.beginPath();
    ctx.arc(pivX, pivY, drawL, Math.PI / 2 - maxSwing, Math.PI / 2 + maxSwing);
    ctx.strokeStyle = "rgba(27,79,216,0.12)"; ctx.lineWidth = 2; ctx.stroke();

    // String with gradient thickness
    const strGrad = ctx.createLinearGradient(pivX, pivY, bobX, bobY);
    strGrad.addColorStop(0, "rgba(30,58,138,0.7)"); strGrad.addColorStop(1, "rgba(30,58,138,0.4)");
    ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = strGrad; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();

    // Pivot
    ctx.beginPath(); ctx.arc(pivX, pivY, 6, 0, Math.PI * 2);
    const pivGrad = ctx.createRadialGradient(pivX - 2, pivY - 2, 1, pivX, pivY, 6);
    pivGrad.addColorStop(0, "#475569"); pivGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = pivGrad; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();

    // Bob shadow
    const shadowR = 12 + sliders.mass * 15;
    ctx.beginPath(); ctx.ellipse(bobX + 3, bobY + 3, shadowR, shadowR * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fill();

    // Bob body
    const bobR = shadowR;
    ctx.beginPath(); ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
    const bG = ctx.createRadialGradient(bobX - bobR / 3, bobY - bobR / 3, bobR / 8, bobX, bobY, bobR);
    bG.addColorStop(0, "#93c5fd"); bG.addColorStop(0.3, "#3b82f6"); bG.addColorStop(0.7, "#1d4ed8"); bG.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = bG; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
    // Specular
    ctx.beginPath(); ctx.arc(bobX - bobR * 0.3, bobY - bobR * 0.3, bobR * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fill();

    // Mass label
    ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.max(9, Math.min(13, bobR * 0.7))}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(`${(sliders.mass * 1000).toFixed(0)}g`, bobX, bobY);

    // Force vectors
    if (showVectors) {
      const fS = 45; const fg = sliders.mass * sliders.gravity;
      drawArrow(ctx, bobX, bobY, bobX, bobY + fg * fS, "#10B981", "W");
      const ft = sliders.mass * sliders.gravity * Math.cos(pendAngleRef.current) + sliders.mass * sliders.length * pendOmegaRef.current ** 2;
      drawArrow(ctx, bobX, bobY, bobX - ft * fS * Math.sin(pendAngleRef.current), bobY - ft * fS * Math.cos(pendAngleRef.current), "#3B82F6", "T");
    }

    // Period readout — memakai koreksi amplitudo yang sama dengan recordTrial()
    // (T = T₀·(1+θ₀²/16)), agar angka di layar = angka yang direkam di tabel.
    const theta0Rd = (sliders.angle * Math.PI) / 180;
    const T_theory = 2 * Math.PI * Math.sqrt(sliders.length / sliders.gravity) * (1 + (theta0Rd * theta0Rd) / 16);
    ctx.fillStyle = "rgba(15,23,42,0.82)";
    roundRect(ctx, W - 132, H - 52, 124, 44, 8); ctx.fill();
    ctx.fillStyle = "#94a3b8"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
    ctx.fillText("T (teoritis)", W - 126, H - 37);
    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 14px monospace";
    ctx.fillText(`${T_theory.toFixed(3)} s`, W - 126, H - 20);

    ctx.restore();
  }

  // ── Helper draw functions ──
  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
    const dx = x2 - x1; const dy = y2 - y1;
    if (Math.sqrt(dx * dx + dy * dy) < 3) return;
    const angle = Math.atan2(dy, dx); const head = 7;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowColor = color; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
    ctx.fillText(label, x2 + 5 * Math.cos(angle + 0.4), y2 + 5 * Math.sin(angle + 0.4));
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  // ── Animation loop (2D canvas) ──
  useEffect(() => {
    if (visualMode !== "2d") return;
    lastT.current = performance.now();
    function loop(ts: number) {
      const dt = Math.min((ts - lastT.current) / 1000, 0.05);
      lastT.current = ts;
      drawBandul(dt);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, sliders, showVectors, visualMode]);

  // ── Record Trial ──
  function recordTrial() {
    if (trials.length >= MAX_TRIALS) return;
    const key = `fisikaseru:trials:${slug}`;
    const L = sliders.length;
    const theta0 = (sliders.angle * Math.PI) / 180;
    // Koreksi amplitudo (pendekatan integral eliptik): T = T₀ · (1 + θ₀²/16),
    // agar data tercatat konsisten dengan gerak nonlinier di kanvas/3D.
    const T0 = 2 * Math.PI * Math.sqrt(L / sliders.gravity);
    const T_true = T0 * (1 + (theta0 * theta0) / 16);
    const T_obs = gaussianNoise(T_true, T_true * 0.015);
    const newTrial = { id: trials.length + 1, L, T: T_obs, T2: T_obs ** 2, g: sliders.gravity };
    const updated = [...trials, newTrial]; setTrials(updated); localStorage.setItem(key, JSON.stringify(updated));
  }

  const moduleTitle = "Bandul Sederhana";

  // Determine observation completion
  const observationDone = isRunning || expSteps.interactionChanged;

  return (
    <div className="h-screen bg-bg-primary flex flex-col relative font-body overflow-hidden">

      {/* ── TOP HEADER ── */}
      <header className="h-12 bg-white border-b border-border-default flex items-center justify-between px-4 flex-shrink-0 z-30">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Link href="/modules" className="flex items-center gap-1.5 text-text-muted hover:text-primary-navy transition-colors text-xs font-medium whitespace-nowrap">
            <ChevronLeft className="w-3.5 h-3.5" /> Katalog
          </Link>
          <span className="text-border-default text-xs">/</span>
          <span className="text-xs font-semibold text-primary-navy hidden sm:block truncate">{moduleTitle}</span>
        </div>

        {/* Step progress (center) */}
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {LAB_STEPS.map((step, i) => {
            const isCurrent = (i < 3 && i === currentStep);
            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => {
                    if (i < 3 && i <= currentStep + 1) updateStep(i);
                    else if (i === 3) router.push(`/modules/${slug}/analysis`);
                    else if (i === 4) router.push(`/modules/${slug}/reflection`);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                    isCurrent ? "bg-accent-cobalt text-white" :
                    (i < 3 && i < currentStep) ? "bg-success/10 text-success" :
                    i >= 3 ? "bg-white border border-border-default text-text-muted hover:text-accent-cobalt hover:border-accent-cobalt/30" :
                    "text-text-muted bg-gray-50 opacity-40 cursor-not-allowed"
                  )}
                >
                  {i < 3 && i < currentStep ? <CheckCircle2 className="w-3 h-3" /> : <span className="font-mono opacity-70">{i + 1}</span>}
                  <span className="hidden lg:inline">{step}</span>
                </button>
                {i < LAB_STEPS.length - 1 && (
                  <div className={cn("w-3 h-px", i < currentStep ? "bg-success/40" : "bg-border-default")} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVectors(!showVectors)}
            aria-label="Tampilkan vektor gaya" aria-pressed={showVectors}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 border border-border-default hover:bg-gray-100 transition-all text-text-muted">
            {showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Vektor</span>
          </button>
          <Link href="/dashboard" aria-label="Dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 border border-border-default hover:bg-gray-100 transition-all text-text-muted">
            <BarChart2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── CANVAS AREA ── */}
        <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden" style={{ background: "#f0f4f8" }}>

          {/* Visual mode switcher (2D / 3D) */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-border-default shadow-depth">
            {(["2d", "3d"] as const).map(mode => (
              <button key={mode} onClick={() => setVisualMode(mode)}
                aria-pressed={visualMode === mode}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  visualMode === mode ? "bg-accent-cobalt text-white" : "text-text-muted hover:text-primary-navy hover:bg-gray-100")}>
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Canvas (2D) / Scene (3D) */}
          {visualMode === "2d" ? (
            <canvas
              ref={bandulRef}
              role="img"
              aria-label="Simulasi interaktif bandul sederhana: beban di ujung tali berosolasi di bawah rel, dengan vektor gaya berat dan tegangan tali"
              className="w-full h-full block"
            />
          ) : (
            <PendulumScene3D
              key={resetCount}
              length={sliders.length}
              mass={sliders.mass}
              initialAngleDeg={sliders.angle}
              gravity={sliders.gravity}
              damping={0.012}
              running={isRunning}
              onStateChange={handleSceneStateChange}
            />
          )}

          {/* Live period readout (3D) */}
          {visualMode === "3d" && (
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-border-default shadow-depth space-y-1 text-[10px] font-mono min-w-[150px]">
              <div className="text-text-muted uppercase tracking-wider font-bold text-[8px] mb-1">Pengukuran Periode</div>
              <div className="flex justify-between gap-3">
                <span className="text-text-muted">T teoritis</span>
                <span className="font-bold text-primary-navy">
                  {(2 * Math.PI * Math.sqrt(sliders.length / sliders.gravity) * (1 + ((sliders.angle * Math.PI / 180) ** 2) / 16)).toFixed(3)} s
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-text-muted">T terukur</span>
                <span className="font-bold text-accent-cobalt">
                  {sceneState?.periodEstimate != null ? `${sceneState.periodEstimate.toFixed(3)} s` : "—"}
                </span>
              </div>
            </div>
          )}

          {/* ── Simulation Controls (floating bottom) ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-depth border border-border-default/80">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all",
                  isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-accent-cobalt hover:bg-accent-cobalt-light text-white")}>
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? "Pause" : "Mulai"}
              </button>
              <button
                onClick={() => { setIsRunning(false); setStopwatch(0); setResetCount(c => c + 1); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-text-muted hover:text-text-primary hover:bg-gray-50 transition-all"
                title="Mengembalikan bandul ke posisi awal — data percobaan tetap aman">
                <RotateCcw className="w-3.5 h-3.5" /> Reset Simulasi
              </button>
              <button onClick={recordTrial} disabled={trials.length >= MAX_TRIALS}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-success/10 hover:bg-success/20 text-success border border-success/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Save className="w-3.5 h-3.5" /> Rekam {trials.length}/{MAX_TRIALS}
              </button>
              <div className="pl-2 border-l border-border-default text-center">
                <div className="text-[8px] text-text-muted font-mono uppercase">Timer</div>
                <div className="font-mono font-bold text-sm text-primary-navy leading-tight">
                  {stopwatch.toFixed(2)}<span className="text-[9px] text-text-muted">s</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <motion.aside
          animate={{ width: panelCollapsed ? 44 : 320 }}
          transition={{ duration: 0.25 }}
          className="bg-white border-l border-border-default flex flex-col flex-shrink-0 overflow-hidden">
          {panelCollapsed ? (
            <button onClick={() => setPanelCollapsed(false)}
              className="h-full flex flex-col items-center justify-start pt-4 gap-3 p-2 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-text-muted rotate-180" />
            </button>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Panel header */}
              <div className="h-10 flex items-center justify-between px-4 border-b border-border-default flex-shrink-0 bg-gray-50/50">
                <h2 className="font-display font-bold text-xs text-primary-navy flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-text-muted" />
                  {currentStep === 0 ? "Pretest" : currentStep === 1 ? "Pengamatan" : "Pengukuran"}
                </h2>
                <button onClick={() => setPanelCollapsed(true)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              {/* ── STEP 0: PRETEST ── */}
              {currentStep === 0 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Header card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display font-semibold text-xs text-amber-900">Pretest Kognitif</h3>
                        <p className="text-[10px] text-amber-700 leading-snug mt-0.5">
                          Rekam intuisimu sebelum eksperimen — jangan khawatir soal benar atau salah.
                        </p>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      {[
                        {
                          id: 1,
                          q: "Faktor apa yang mempengaruhi periode ayunan bandul (T)?",
                          opts: ["Hanya panjang tali (L) dan gravitasi (g)", "Massa beban (m) dan sudut simpangan (θ)", "Semua: L, m, g, dan θ"],
                          ans: 0,
                          exp: "T = 2π√(L/g) — hanya L dan g yang relevan. Massa dan sudut awal (< 15°) tidak mempengaruhi periode."
                        },
                        {
                          id: 2,
                          q: "Jika panjang tali dijadikan 4× lipat, apa yang terjadi pada periode T?",
                          opts: ["T menjadi 4× lebih lambat", "T menjadi 2× lebih lambat (karena √4 = 2)", "T tidak berubah"],
                          ans: 1,
                          exp: "T ∝ √L, sehingga L → 4L berarti T → √4 × T = 2T. Periode menjadi 2× lebih panjang."
                        }
                      ].map((q) => {
                        const selected = pretestAnswers[q.id];
                        const isCorrect = selected === q.ans;
                        return (
                          <div key={q.id} className="border border-border-default/80 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-3 bg-white">
                              <p className="font-display font-semibold text-[11px] text-primary-navy leading-snug mb-2.5">{q.q}</p>
                              <div className="space-y-1.5">
                                {q.opts.map((opt, oIdx) => (
                                  <button key={oIdx} disabled={pretestSubmitted}
                                    onClick={() => handleSetPretestAnswer(q.id, oIdx)}
                                    className={cn(
                                      "w-full text-left px-3 py-2 rounded-lg text-[10px] transition-all border flex items-start gap-2 cursor-pointer leading-snug",
                                      selected === oIdx
                                        ? pretestSubmitted
                                          ? isCorrect ? "bg-success/10 border-success text-success font-medium" : "bg-danger/10 border-danger text-danger font-medium"
                                          : "bg-accent-cobalt/10 border-accent-cobalt text-accent-cobalt font-medium"
                                        : pretestSubmitted && oIdx === q.ans ? "bg-success/5 border-success/30 text-success font-medium"
                                        : "bg-white border-border-default/60 text-text-muted hover:bg-slate-50"
                                    )}>
                                    <span className="font-mono font-bold flex-shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                                    <span>{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            {pretestSubmitted && (
                              <div className={cn("px-3 py-2.5 text-[10px] leading-relaxed border-t",
                                isCorrect ? "bg-success/5 border-success/20 text-success" : "bg-slate-50 border-border-default text-text-muted")}>
                                <span className="font-semibold block mb-0.5">{isCorrect ? "✓ Tepat!" : `✗ Jawaban: ${String.fromCharCode(65 + q.ans)}`}</span>
                                {q.exp}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 border-t border-border-default flex-shrink-0 bg-white space-y-2">
                    {!pretestSubmitted ? (
                      <Button onClick={handlePretestSubmit}
                        disabled={Object.keys(pretestAnswers).length < 2}
                        className="w-full cursor-pointer text-xs">
                        Lihat Jawaban
                      </Button>
                    ) : (
                      <Button onClick={() => updateStep(1)}
                        className="w-full bg-success hover:bg-success/90 text-white cursor-pointer text-xs flex items-center justify-center gap-1.5">
                        Mulai Pengamatan <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 1: OBSERVATION ── */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-gradient-to-br from-teal/5 to-sky-blue/5 border border-teal/20 rounded-xl p-3 flex items-start gap-2.5">
                      <CircleDot className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display font-semibold text-xs text-teal">Eksplorasi Bebas</h3>
                        <p className="text-[10px] text-teal/80 leading-snug mt-0.5">
                          Coba semua kontrol di bawah dan amati apa yang terjadi pada simulasi.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <ChecklistItem label="Mulai ayunan bandul" desc="Klik 'Mulai' untuk mengaktifkan gerak bandul." checked={isRunning} />
                      <ChecklistItem label="Ubah panjang tali" desc="Pergi ke tab Pengukuran, ubah slider L, dan perhatikan perubahan kecepatan ayunan." checked={expSteps.interactionChanged} />
                      <ChecklistItem label="Amati vektor gaya" desc="Toggle 'Vektor' di kanan atas untuk melihat gaya berat dan tegangan tali." checked={showVectors} />
                    </div>

                    {/* Progress indicator */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-border-default/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-semibold text-text-muted">Progress</span>
                        <span className="text-[10px] font-mono font-bold text-accent-cobalt">
                          {[isRunning, expSteps.interactionChanged, showVectors].filter(Boolean).length}/3
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div className="bg-accent-cobalt h-1.5 rounded-full" initial={{ width: 0 }}
                          animate={{ width: `${[isRunning, expSteps.interactionChanged, showVectors].filter(Boolean).length / 3 * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border-default flex-shrink-0 bg-white">
                    <Button onClick={() => updateStep(2)}
                      disabled={!(isRunning || expSteps.interactionChanged)}
                      className="w-full cursor-pointer text-xs flex items-center justify-center gap-1.5">
                      Mulai Pengukuran <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    {!observationDone && (
                      <p className="text-[10px] text-text-muted text-center mt-2">Jalankan simulasi atau ubah salah satu variabel dulu.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: MEASUREMENT ── */}
              {currentStep === 2 && (
                <>
                  {/* Sliders */}
                  <div className="p-4 border-b border-border-default flex-shrink-0 space-y-4">
                    <SliderField label="Panjang Tali (L)" unit="m" min={0.2} max={1.0} step={0.05}
                      value={sliders.length} onChange={v => { setSliders(p => ({ ...p, length: v })); updateExpStep("interactionChanged", true); }} decimals={2} />
                    <SliderField label="Massa Beban (m)" unit="g" min={0.05} max={0.5} step={0.05}
                      value={sliders.mass} onChange={v => setSliders(p => ({ ...p, mass: v }))} displayFn={v => (v * 1000).toFixed(0)} />
                    <SliderField label="Sudut Awal (θ₀)" unit="°" min={5} max={30} step={1}
                      value={sliders.angle} onChange={v => setSliders(p => ({ ...p, angle: v }))} />
                    <SliderField label="Gravitasi (g)" unit="m/s²" min={1.62} max={24.79} step={0.01}
                      value={sliders.gravity} onChange={v => setSliders(p => ({ ...p, gravity: v }))} decimals={2} />
                    <div className="flex gap-1.5">
                      {GRAVITY_PRESETS.map(preset => (
                        <button key={preset.label} type="button"
                          onClick={() => setSliders(prev => ({ ...prev, gravity: preset.g }))}
                          className={cn("flex-1 px-2 py-1 rounded-lg text-[9px] font-semibold border transition-all cursor-pointer",
                            Math.abs(sliders.gravity - preset.g) < 0.005
                              ? "bg-accent-cobalt/10 border-accent-cobalt text-accent-cobalt"
                              : "bg-white border-border-default text-text-muted hover:border-accent-cobalt/30")}>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-lg p-2 leading-relaxed">
                      💡 <strong>Uji Miskonsepsi:</strong> Coba variasikan <em>Massa Beban (m)</em> pada panjang tali tetap. Perhatikan apakah nilai periode (T) berubah!
                    </p>
                  </div>

                  {/* Data table */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default flex-shrink-0">
                    <h3 className="font-display font-semibold text-xs text-primary-navy">Data Percobaan</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{trials.length}/{MAX_TRIALS}</Badge>
                      {trials.length > 0 && (
                        <button onClick={handleResetLab}
                          className="text-[9px] text-danger font-semibold px-1.5 py-0.5 rounded border border-danger/30 hover:bg-danger/5 cursor-pointer transition-colors"
                          title="Menghapus SEMUA data percobaan dan pretest (ada konfirmasi)">
                          Hapus Semua Data
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 min-h-0">
                    <div className="rounded-xl border border-border-default overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-border-default">
                            {["#", "L (m)", "T (s)", "T² (s²)"].map(h => (
                              <th key={h} className="px-2 py-2 text-left font-display font-semibold text-text-muted">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {trials.length === 0 ? (
                            <tr><td colSpan={4} className="px-3 py-6 text-center text-[11px] text-text-muted italic">
                              Jalankan simulasi dan klik Rekam.
                            </td></tr>
                          ) : trials.map(t => (
                            <tr key={t.id} className="border-b border-border-default/50 hover:bg-accent-cobalt/[0.02]">
                              <td className="px-2 py-2 font-mono text-text-muted">{t.id}</td>
                              <td className="px-2 py-2 font-mono">{t.L.toFixed(2)}</td>
                              <td className="px-2 py-2 font-mono">{t.T.toFixed(3)}</td>
                              <td className="px-2 py-2 font-mono font-semibold text-accent-cobalt">{t.T2.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-border-default flex-shrink-0 space-y-2 bg-white">
                    {trials.length >= 3 ? (
                      <Link href={`/modules/${slug}/analysis`} className="block">
                        <Button size="md" className="w-full cursor-pointer text-xs">
                          Lanjut ke Analisis <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-700">
                          Rekam minimal <b>3 trial</b> untuk lanjut. ({trials.length}/3)
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href="/modules" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs cursor-pointer">
                          <BookOpen className="w-3.5 h-3.5 mr-1" /> Katalog
                        </Button>
                      </Link>
                      <Link href="/dashboard" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs cursor-pointer">
                          <BarChart2 className="w-3.5 h-3.5 mr-1" /> Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.aside>
      </div>
    </div>
  );
}

// ── Slider Field ──
function SliderField({ label, unit, min, max, step, value, onChange, decimals = 0, displayFn }: {
  label: string; unit: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; decimals?: number; displayFn?: (v: number) => string;
}) {
  const display = displayFn ? displayFn(value) : (decimals > 0 ? value.toFixed(decimals) : value.toString());
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-text-primary">{label}</span>
        <span className="font-mono text-accent-cobalt font-bold">{display} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-cobalt" />
      <div className="flex justify-between text-[9px] text-text-muted">
        <span>{displayFn ? displayFn(min) : min} {unit}</span>
        <span>{displayFn ? displayFn(max) : max} {unit}</span>
      </div>
    </div>
  );
}

// ── Checklist Item ──
function ChecklistItem({ label, desc, checked }: { label: string; desc: string; checked: boolean }) {
  return (
    <motion.div animate={{ borderColor: checked ? "rgba(16,185,129,0.4)" : "rgba(229,231,235,0.8)" }}
      className={cn("border rounded-xl p-3 transition-all flex items-start gap-2.5 text-left",
        checked ? "bg-success/5 border-success/30" : "bg-white border-border-default/80")}>
      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
        checked ? "bg-success border-success" : "border-border-default bg-slate-50")}>
        {checked && <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />}
      </div>
      <div>
        <h4 className={cn("font-display font-semibold text-[11px] leading-tight", checked ? "text-success" : "text-primary-navy")}>{label}</h4>
        <p className="text-[10px] text-text-muted leading-snug mt-0.5">{desc}</p>
      </div>
    </motion.div>
  );
}
