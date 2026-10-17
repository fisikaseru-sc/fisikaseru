"use client";
import Link from "next/link";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Save,
  Eye, EyeOff, Radio, Zap, BarChart2,
  Microscope, LayoutGrid, AlertCircle, CheckCircle2, ArrowRight,
  BookOpen, Sparkles, CircleDot, Activity, ChevronDown, ChevronUp,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PredictionView, CompactPredictionCard } from "./PredictionView";
import { RealLabGuideModal } from "./RealLabGuideModal";
import { DropletSpec, ExperimentMission } from "../types";
import { generateDropletIdentity } from "../simulation/dataGenerator";
import type { MillikanDropletState } from "../views3d/MillikanChamber3D";
import { type MillikanTrialRecord, isMillikanTrial } from "@/features/shared/trialRecords";

const MillikanChamber3D = dynamic(() => import("../views3d/MillikanChamber3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <span className="text-xs text-slate-400 font-mono">Memuat scene 3D…</span>
    </div>
  ),
});

// ============================================================
// PHYSICAL CONSTANTS (Millikan Oil Drop)
// ============================================================
const ETA       = 1.81e-5;
const RHO_OIL   = 886;
const RHO_AIR   = 1.20;
const G         = 9.80665;
const E_CHARGE  = 1.602e-19;
const PLATE_D   = 0.005;
const STOKES_6PI = 6 * Math.PI;

const LAB_STEPS = ["Persiapan", "Pengamatan", "Pengukuran", "Analisis", "Refleksi"];

// ============================================================
// PHYSICS ENGINE
// ============================================================
function millikanVelocities(r_um: number, V: number, n: number, voltageOn: boolean) {
  const r = r_um * 1e-6;
  const dRho = RHO_OIL - RHO_AIR;
  const Fg = (4 / 3) * Math.PI * r ** 3 * dRho * G;
  const vf = Fg / (STOKES_6PI * ETA * r);
  const Fe = voltageOn ? (n * E_CHARGE * V) / PLATE_D : 0;
  const netForce = Fe - Fg;
  const vr = voltageOn ? (netForce > 0 ? netForce / (STOKES_6PI * ETA * r) : 0) : 0;
  // Deteksi kondisi melayang seimbang (Fe ≈ Fg) dalam toleransi realistis ±8%
  const isHovering = voltageOn && Math.abs(netForce) / Fg <= 0.08;
  return { vf, vr, Fg, Fe, isHovering, netForce };
}

interface SprayParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
}

function gaussianNoise(mean: number, std: number) {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function getExperimentMission(
  isRunning: boolean,
  voltageOn: boolean,
  isHovering: boolean,
  netForce: number,
  trialCount: number,
  atomizerActive: boolean
): ExperimentMission {
  if (trialCount >= 5) {
    return {
      phase: "readyForAnalysis",
      mission: "5 Bukti droplet telah terkumpul lengkap!",
      hint: "Data observasi sudah mencukupi untuk menemukan pola muatan. Buka tahap Analisis Data untuk menguak kuantisasi muatan elektron.",
      primaryAction: "Buka Analisis Data"
    };
  }
  if (trialCount > 0 && !isRunning && !atomizerActive) {
    return {
      phase: "nextDroplet",
      mission: `Droplet #${trialCount} berhasil direkam! Ambil droplet berikutnya.`,
      hint: "Tekan tombol Mulai Observasi atau Semprot Tetes Baru untuk mengamati droplet selanjutnya.",
      primaryAction: "Mulai Observasi"
    };
  }
  if (!isRunning) {
    return {
      phase: "prepare",
      mission: "Siapkan chamber & semprotkan tetesan minyak.",
      hint: "Tekan tombol 'Mulai Observasi' untuk mengaktifkan atomizer dan mengamati tetesan di antara kedua pelat.",
      primaryAction: "Mulai Observasi"
    };
  }
  if (!voltageOn) {
    return {
      phase: "observe",
      mission: "Amati tetesan jatuh bebas akibat gaya gravitasi (Fg).",
      hint: "Nyalakan medan listrik (V) pada panel instrumen untuk menyeimbangkan atau menaikkan tetesan.",
      primaryAction: "Nyalakan Medan Listrik"
    };
  }
  if (isHovering) {
    return {
      phase: "readyToRecord",
      mission: "✨ Kondisi Seimbang Tercapai! (Fe ≈ Fg, tetesan melayang).",
      hint: "Gaya elektrostatik tepat mengimbangi gaya berat. Rekam observasi sekarang!",
      primaryAction: "Rekam Observasi"
    };
  }
  if (netForce > 0) {
    return {
      phase: "readyToRecord",
      mission: "Droplet bergerak naik (Fe > Fg).",
      hint: "Tetesan bergerak stabil ke atas melintasi kisi reticle. Anda dapat merekam data atau mengatur voltase agar seimbang.",
      primaryAction: "Rekam Observasi"
    };
  }
  return {
    phase: "adjust",
    mission: "Droplet masih turun (Fg > Fe).",
    hint: "Naikkan tegangan (V) menggunakan slider atau tombol +10V agar gaya listrik mampu menahan atau mengangkat droplet.",
    primaryAction: "Naikkan Tegangan"
  };
}

// ============================================================
// COMPONENT
// ============================================================
export default function LabPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = (params?.moduleSlug as string) || "millikan";

  const [currentStep, setCurrentStep]       = useState(() => {
    const savedStep = localStorage.getItem(`fisikaseru:step:${slug}`);
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [isRunning, setIsRunning]           = useState(false);
  const [showVectors, setShowVectors]       = useState(true);
  const [viewMode, setViewMode]             = useState<"chamber" | "eyepiece">("chamber");
  const [visualMode, setVisualMode]          = useState<"2d" | "3d">("2d");
  const [resetCount, setResetCount]          = useState(0);
  const [sceneState, setSceneState]          = useState<MillikanDropletState | null>(null);
  const [voltageOn, setVoltageOn]           = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPhysicsInspect, setShowPhysicsInspect] = useState(false);
  const [showEvidenceTable, setShowEvidenceTable] = useState(false);
  const [currentDroplet, setCurrentDroplet] = useState<DropletSpec>(() => {
    // Bila siswa kembali dengan data tersimpan, siapkan droplet lanjutan
    // (setara triggerAtomizer saat restore). Generator seeded = murni,
    // aman dipanggil saat render pertama.
    let savedCount = 0;
    try {
      const saved = JSON.parse(localStorage.getItem(`fisikaseru:trials:${slug}`) || "[]");
      if (Array.isArray(saved) && saved.length > 0) savedCount = saved.length;
    } catch (_) {}
    return savedCount > 0 ? generateDropletIdentity(savedCount + 1) : generateDropletIdentity(1);
  });
  const [chargeN, setChargeN]               = useState(currentDroplet.trueN);
  const [ionFlash, setIonFlash]             = useState(false);
  const [measureAlert, setMeasureAlert]     = useState<string | null>(null);
  const [stopwatch, setStopwatch]           = useState(0);

  interface ExpSteps {
    sprayed: boolean;
    viewSwapped: boolean;
    voltageChanged: boolean;
    xrayTriggered: boolean;
  }
  const [expSteps, setExpSteps] = useState<ExpSteps>(() => {
    const savedExp = localStorage.getItem(`fisikaseru:exp:${slug}`);
    if (savedExp) { try { return JSON.parse(savedExp) as ExpSteps; } catch (_) {} }
    return { sprayed: false, viewSwapped: false, voltageChanged: false, xrayTriggered: false };
  });

  // Batas pencatatan = target misi (5 droplet) — konsisten dengan badge
  // "Target: x/5" dan gerbang "kumpulkan minimal 5 droplet". (Temuan audit P2.)
  const MAX_TRIALS = 5;
  // Komponen dimuat via dynamic({ ssr: false }) — lazy init localStorage aman
  // dari mismatch hidrasi. (Pembayaran debt lint: set-state-in-effect.)
  const [trials, setTrials] = useState<MillikanTrialRecord[]>(() => {
    const savedTrials = localStorage.getItem(`fisikaseru:trials:${slug}`);
    if (savedTrials) {
      try {
        const p: unknown = JSON.parse(savedTrials);
        if (Array.isArray(p) && p.length > 0 && p.every(isMillikanTrial)) return p;
      } catch (_) {}
    }
    return [];
  });
  const [sliders, setSliders] = useState(() => ({
    voltage: 300,
    // Radius mengikuti droplet restore (setara triggerAtomizer saat muat ulang).
    radius: currentDroplet.radiusUm,
  }));

  const millikanRef  = useRef<HTMLCanvasElement>(null);
  const dropFracRef  = useRef(0.5);
  const animRef      = useRef<number>(0);
  const lastT        = useRef<number>(0);
  const sprayRef     = useRef<SprayParticle[]>([]);
  const [atomizerActive, setAtomizerActive] = useState(() => trials.length > 0);
  // Partikel spray pembuka saat restore (penulisan ref — legal di effect,
  // bukan setState; tidak memicu render ulang).
  useEffect(() => {
    if (trials.length === 0) return;
    const pts: SprayParticle[] = [];
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: gaussianNoise(0, 1.5), y: 0,
        vx: gaussianNoise(0, 18), vy: gaussianNoise(80, 22),
        life: 1.0, decay: Math.random() * 0.5 + 0.4, size: Math.random() * 1.6 + 0.6,
      });
    }
    sprayRef.current = pts;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- restore sekali saat mount
  // Pemadaman spray restore via timeout (setState async = legal).
  useEffect(() => {
    if (!atomizerActive || trials.length === 0) return;
    const timeoutId = setTimeout(() => setAtomizerActive(false), 1400);
    return () => clearTimeout(timeoutId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- pemadaman spray restore sekali saat mount

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    localStorage.setItem(`fisikaseru:step:${slug}`, newStep.toString());
  };

  const handleResetLab = () => {
    // Konfirmasi — reset menghapus SEMUA data droplet tanpa undo.
    if (trials.length > 0 && !window.confirm(
      `Hapus semua ${trials.length} data droplet? Tindakan ini tidak bisa dibatalkan.`
    )) return;
    setTrials([]);
    localStorage.removeItem(`fisikaseru:trials:${slug}`);
    updateStep(0);
    const clearedExp = { sprayed: false, viewSwapped: false, voltageChanged: false, xrayTriggered: false };
    setExpSteps(clearedExp);
    localStorage.removeItem(`fisikaseru:exp:${slug}`);
  };

  const updateExpStep = (key: keyof typeof expSteps, value: boolean) => {
    setExpSteps(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`fisikaseru:exp:${slug}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSetViewMode = (mode: "chamber" | "eyepiece") => {
    setViewMode(mode);
    updateExpStep("viewSwapped", true);
  };

  function triggerAtomizer() {
    updateExpStep("sprayed", true);
    setAtomizerActive(true);
    const nextDrop = generateDropletIdentity(trials.length + 1);
    setCurrentDroplet(nextDrop);
    setChargeN(nextDrop.trueN);
    setSliders(p => ({ ...p, radius: nextDrop.radiusUm }));
    const pts: SprayParticle[] = [];
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: gaussianNoise(0, 1.5), y: 0,
        vx: gaussianNoise(0, 18), vy: gaussianNoise(80, 22),
        life: 1.0, decay: Math.random() * 0.5 + 0.4, size: Math.random() * 1.6 + 0.6,
      });
    }
    sprayRef.current = pts;
    setTimeout(() => setAtomizerActive(false), 1400);
  }

  function triggerIonization() {
    updateExpStep("xrayTriggered", true);
    setIonFlash(true);
    const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
    const newN = Math.max(1, Math.min(7, chargeN + delta));
    setChargeN(newN);
    setTimeout(() => setIonFlash(false), 600);
  }

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      const t0 = Date.now() - stopwatch * 1000;
      id = setInterval(() => setStopwatch((Date.now() - t0) / 1000), 30);
    }
    return () => clearInterval(id);
  }, [isRunning]);

  const physics = millikanVelocities(sliders.radius, sliders.voltage, chargeN, voltageOn);

  const mission = useMemo(() => {
    return getExperimentMission(
      isRunning,
      voltageOn,
      physics.isHovering,
      physics.netForce,
      trials.length,
      atomizerActive
    );
  }, [isRunning, voltageOn, physics.isHovering, physics.netForce, trials.length, atomizerActive]);

  const handleSceneStateChange = useCallback((state: MillikanDropletState) => {
    setSceneState(state);
  }, []);

  // ================================================================
  // MILLIKAN CANVAS
  // ================================================================
  function drawMillikan(dt: number) {
    const canvas = millikanRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr) { canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; }
    ctx.save(); ctx.scale(dpr, dpr);
    const W = rect.width; const H = rect.height;
    if (viewMode === "chamber") drawChamberView(ctx, W, H, dt);
    else drawEyepieceView(ctx, W, H, dt);
    ctx.restore();
  }

  function drawChamberView(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number) {
    const cx = W / 2; const cy = H / 2;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0e1a"); bg.addColorStop(1, "#0d1220");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(59,130,246,0.04)"; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const chW = Math.min(160, W * 0.38); const chH = Math.min(240, H * 0.68);
    const chX = cx - chW / 2; const chY = cy - chH / 2;
    const plateThick = 8; const plateW = chW - 10; const plateX = cx - plateW / 2;
    const topPlateY = chY + chH * 0.18; const botPlateY = chY + chH * 0.82 - plateThick;
    const innerTop = topPlateY + plateThick; const innerBot = botPlateY;
    const gapH = innerBot - innerTop;

    const glowR = ctx.createRadialGradient(cx, cy, chW * 0.1, cx, cy, chW * 0.7);
    glowR.addColorStop(0, "rgba(30,58,138,0.15)"); glowR.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowR; ctx.fillRect(chX - 20, chY - 20, chW + 40, chH + 40);

    const glassG = ctx.createLinearGradient(chX, cy, chX + chW, cy);
    glassG.addColorStop(0,    "rgba(15,23,42,0.97)");
    glassG.addColorStop(0.06, "rgba(30,41,59,0.95)");
    glassG.addColorStop(0.15, "rgba(51,65,85,0.4)");
    glassG.addColorStop(0.5,  "rgba(15,23,42,0.7)");
    glassG.addColorStop(0.85, "rgba(51,65,85,0.4)");
    glassG.addColorStop(0.94, "rgba(30,41,59,0.95)");
    glassG.addColorStop(1,    "rgba(15,23,42,0.97)");
    ctx.fillStyle = glassG; roundRect(ctx, chX, chY, chW, chH, 6); ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(chX + 8, chY + 6); ctx.lineTo(chX + 8, chY + chH - 6); ctx.stroke();
    ctx.strokeStyle = "rgba(100,116,139,0.6)"; ctx.lineWidth = 1.5;
    roundRect(ctx, chX, chY, chW, chH, 6); ctx.stroke();

    const capH = 12;
    drawSteelCap(ctx, chX - 6, chY - capH, chW + 12, capH, "top");
    drawSteelCap(ctx, chX - 6, chY + chH, chW + 12, capH, "bottom");

    if (voltageOn && sliders.voltage > 10) {
      ctx.save();
      const topGlow = ctx.createRadialGradient(cx, topPlateY, 0, cx, topPlateY, plateW * 0.6);
      topGlow.addColorStop(0, "rgba(239,68,68,0.12)"); topGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGlow; ctx.fillRect(plateX - 20, topPlateY - 15, plateW + 40, 30);
      const botGlow = ctx.createRadialGradient(cx, botPlateY + plateThick, 0, cx, botPlateY + plateThick, plateW * 0.6);
      botGlow.addColorStop(0, "rgba(59,130,246,0.12)"); botGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = botGlow; ctx.fillRect(plateX - 20, botPlateY - 5, plateW + 40, 30);
      ctx.restore();
    }

    drawBrassPlate(ctx, plateX, topPlateY, plateW, plateThick, voltageOn ? "#ef4444" : "#64748b");
    drawBrassPlate(ctx, plateX, botPlateY, plateW, plateThick, voltageOn ? "#3b82f6" : "#64748b");

    ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
    if (voltageOn) {
      ctx.fillStyle = "#fca5a5"; ctx.fillText("+", plateX - 14, topPlateY + 7);
      ctx.fillStyle = "#93c5fd"; ctx.fillText("−", plateX - 13, botPlateY + 7);
    }

    ctx.fillStyle = "#0a0e1a"; ctx.fillRect(cx - 2.5, topPlateY, 5, plateThick);

    if (voltageOn && sliders.voltage > 10) {
      ctx.save(); ctx.setLineDash([3, 5]);
      ctx.strokeStyle = "rgba(253,224,71,0.3)"; ctx.lineWidth = 0.8;
      const xOff = [-40, -20, 0, 20, 40];
      xOff.forEach(ox => {
        ctx.beginPath(); ctx.moveTo(cx + ox, innerTop); ctx.lineTo(cx + ox, innerBot); ctx.stroke();
        const ay = innerTop + gapH * 0.55;
        ctx.beginPath(); ctx.moveTo(cx + ox - 2.5, ay - 3); ctx.lineTo(cx + ox, ay); ctx.lineTo(cx + ox + 2.5, ay - 3);
        ctx.fillStyle = "rgba(253,224,71,0.35)"; ctx.fill();
      });
      ctx.restore();
    }

    const lampX = chX - 44; const lampY = cy;
    const lampG = ctx.createLinearGradient(lampX - 4, lampY - 14, lampX + 36, lampY + 14);
    lampG.addColorStop(0, "#1e293b"); lampG.addColorStop(0.5, "#334155"); lampG.addColorStop(1, "#1e293b");
    ctx.fillStyle = lampG; roundRect(ctx, lampX - 4, lampY - 14, 40, 28, 4); ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; roundRect(ctx, lampX - 4, lampY - 14, 40, 28, 4); ctx.stroke();
    ctx.beginPath(); ctx.arc(lampX + 32, lampY, 5, 0, Math.PI * 2); ctx.fillStyle = "#fef08a"; ctx.fill();
    const coneG = ctx.createLinearGradient(chX, lampY, cx, lampY);
    coneG.addColorStop(0, "rgba(253,224,71,0.18)"); coneG.addColorStop(1, "rgba(253,224,71,0)");
    ctx.fillStyle = coneG; ctx.beginPath();
    ctx.moveTo(chX, lampY - 6); ctx.lineTo(cx, lampY - gapH * 0.35); ctx.lineTo(cx, lampY + gapH * 0.35); ctx.lineTo(chX, lampY + 6);
    ctx.closePath(); ctx.fill();

    const scopeX = chX + chW + 4;
    const scopeG = ctx.createLinearGradient(scopeX, lampY - 12, scopeX + 46, lampY + 12);
    scopeG.addColorStop(0, "#1e293b"); scopeG.addColorStop(0.5, "#334155"); scopeG.addColorStop(1, "#1e293b");
    ctx.fillStyle = scopeG; roundRect(ctx, scopeX, lampY - 12, 46, 24, 4); ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; roundRect(ctx, scopeX, lampY - 12, 46, 24, 4); ctx.stroke();
    ctx.fillStyle = "#334155"; roundRect(ctx, scopeX, lampY - 8, 5, 16, 2); ctx.fill();
    ctx.beginPath(); ctx.arc(scopeX + 40, lampY, 4, 0, Math.PI * 2); ctx.fillStyle = "rgba(34,211,238,0.4)"; ctx.fill();
    ctx.fillStyle = "rgba(148,163,184,0.6)"; ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText("MIKROSKOP", scopeX + 23, lampY + 20);

    ctx.save();
    const xrX = chX - 22; const xrY = chY + chH * 0.78;
    ctx.translate(xrX, xrY); ctx.rotate(-Math.PI / 5.5);
    const xrG = ctx.createLinearGradient(-10, -16, 10, 16);
    xrG.addColorStop(0, "#0f172a"); xrG.addColorStop(0.5, "#1e293b"); xrG.addColorStop(1, "#0f172a");
    ctx.fillStyle = xrG; roundRect(ctx, -10, -16, 20, 32, 3); ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 0.8; roundRect(ctx, -10, -16, 20, 32, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -10, 5, 0, Math.PI * 2); ctx.fillStyle = "#06b6d4"; ctx.fill();
    if (ionFlash) {
      ctx.strokeStyle = "rgba(6,182,212,0.7)"; ctx.lineWidth = 1.5; ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 12;
      for (let r = 18; r < 90; r += 20) { ctx.beginPath(); ctx.arc(0, -10, r, -0.5, 0.5); ctx.stroke(); }
      ctx.shadowBlur = 0;
    }
    ctx.restore();
    ctx.fillStyle = "rgba(6,182,212,0.55)"; ctx.font = "6px monospace"; ctx.textAlign = "center";
    ctx.fillText("X-RAY", xrX - 4, xrY + 22);

    ctx.fillStyle = "#475569"; roundRect(ctx, cx - 5, chY - capH - 24, 10, 24, 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, chY - capH - 30, 10, 0, Math.PI * 2);
    const bulbG = ctx.createRadialGradient(cx - 3, chY - capH - 33, 2, cx, chY - capH - 30, 10);
    bulbG.addColorStop(0, "#f87171"); bulbG.addColorStop(1, "#b91c1c");
    ctx.fillStyle = bulbG; ctx.fill();

    if (sprayRef.current.length > 0) {
      const nozzleX = cx; const nozzleY = chY - capH - 6;
      ctx.save();
      sprayRef.current.forEach(p => {
        p.vx *= Math.pow(0.1, dt); p.vy *= Math.pow(0.15, dt); p.vy += G * 5 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
        if (p.life > 0) {
          ctx.beginPath(); ctx.arc(nozzleX + p.x, nozzleY + p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253,224,71,${p.life * 0.9})`; ctx.fill();
        }
      });
      sprayRef.current = sprayRef.current.filter(p => p.life > 0);
      ctx.restore();
    }

    // Fisika: saat medan ON tetapi lemah (Fe < Fg) tetesan harus TETAP TURUN,
    // bukan membeku diam. vr hanya kecepatan naik; gerak turun memakai -vf
    // (diredam 0.4 untuk keterbacaan visual, konsisten dengan tampilan okular).
    const { vf, vr, isHovering, netForce } = physics;
    const physVel = isRunning
      ? (voltageOn ? (isHovering ? 0 : netForce > 0 ? vr : -vf * 0.4) : -vf)
      : 0;
    const fracPerSec = physVel * (1 / 1e-3) * 0.001;
    dropFracRef.current -= fracPerSec * dt;
    if (dropFracRef.current < 0.02) dropFracRef.current = 0.98;
    if (dropFracRef.current > 0.98) dropFracRef.current = 0.02;

    const dropY = innerTop + dropFracRef.current * gapH;
    const dropR = 3.5 + sliders.radius * 1.2;

    const dropGlow = ctx.createRadialGradient(cx, dropY, 0, cx, dropY, dropR * 4);
    dropGlow.addColorStop(0, "rgba(253,224,71,0.25)"); dropGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = dropGlow; ctx.beginPath(); ctx.arc(cx, dropY, dropR * 4, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(cx, dropY, dropR, 0, Math.PI * 2);
    const dG = ctx.createRadialGradient(cx - dropR * 0.35, dropY - dropR * 0.35, dropR * 0.1, cx, dropY, dropR);
    dG.addColorStop(0, "#fef9c3"); dG.addColorStop(0.3, "#fde047"); dG.addColorStop(0.7, "#ca8a04"); dG.addColorStop(1, "#78350f");
    ctx.fillStyle = dG; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - dropR * 0.3, dropY - dropR * 0.3, dropR * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fill();

    ctx.strokeStyle = "rgba(34,211,238,0.85)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(cx, dropY, dropR + 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - dropR - 9, dropY); ctx.lineTo(cx - dropR - 3, dropY);
    ctx.moveTo(cx + dropR + 3, dropY); ctx.lineTo(cx + dropR + 9, dropY);
    ctx.moveTo(cx, dropY - dropR - 9); ctx.lineTo(cx, dropY - dropR - 3);
    ctx.moveTo(cx, dropY + dropR + 3); ctx.lineTo(cx, dropY + dropR + 9); ctx.stroke();

    if (showVectors) {
      const vScale = 1.8e14;
      const { Fg, Fe } = physics;
      drawArrow(ctx, cx - 18, dropY, cx - 18, dropY + Fg * vScale, "#ef4444", "Weff");
      if (voltageOn && Fe > 1e-16) drawArrow(ctx, cx + 18, dropY, cx + 18, dropY - Fe * vScale, "#22d3ee", "Fe");
      if (isRunning && Math.abs(physVel) > 1e-8) {
        const Fd = STOKES_6PI * ETA * (sliders.radius * 1e-6) * physVel;
        drawArrow(ctx, cx, dropY, cx, dropY + Fd * vScale, "#a3e635", "Fd");
      }
    }

    if (voltageOn) {
      ctx.save(); ctx.fillStyle = "rgba(15,23,42,0.75)"; roundRect(ctx, chX + 3, chY + 3, 68, 18, 3); ctx.fill();
      ctx.fillStyle = "#fde047"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`V = ${sliders.voltage} V`, chX + 7, chY + 14); ctx.restore();
    }
    ctx.fillStyle = "rgba(15,23,42,0.75)"; roundRect(ctx, chX + chW - 68, chY + 3, 65, 18, 3); ctx.fill();
    ctx.fillStyle = "#22d3ee"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
    ctx.fillText(currentDroplet.label, chX + chW - 64, chY + 14);
  }

  function drawEyepieceView(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number) {
    const cx = W / 2; const cy = H / 2;
    const R  = Math.min(W, H) * 0.42;
    ctx.fillStyle = "#03060d"; ctx.fillRect(0, 0, W, H);
    
    // Vignette bayangan luar lensa okular
    const vigG = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.25);
    vigG.addColorStop(0, "rgba(0,0,0,0)"); vigG.addColorStop(1, "rgba(0,0,0,0.97)");
    ctx.fillStyle = vigG; ctx.fillRect(0, 0, W, H);
    
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    
    // Latar gelap ruang pengamatan mikroskop optik
    const eyeBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    eyeBg.addColorStop(0, "#060914"); eyeBg.addColorStop(0.8, "#020409"); eyeBg.addColorStop(1, "#000103");
    ctx.fillStyle = eyeBg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    // Berkas cahaya lateral (Pencahayaan Samping / Efek Tyndall)
    const beamG = ctx.createLinearGradient(cx - R, cy, cx + R * 0.5, cy);
    beamG.addColorStop(0, "rgba(254, 240, 138, 0.09)");
    beamG.addColorStop(0.35, "rgba(254, 240, 138, 0.04)");
    beamG.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(cx - R, cy - R * 0.45);
    ctx.lineTo(cx + R * 0.8, cy - R * 0.6);
    ctx.lineTo(cx + R * 0.8, cy + R * 0.6);
    ctx.lineTo(cx - R, cy + R * 0.45);
    ctx.closePath();
    ctx.fill();

    // Partikel debu/kabut minyak latar yang out-of-focus (faint blurry specks)
    // Waktu dari timestamp rAF (lastT di-update loop animasi) — bukan
    // performance.now() langsung, agar fungsi draw murni terhadap input.
    const tSec = lastT.current * 0.001;
    [
      { ox: -R * 0.45, oy: -R * 0.25, r: 2.2, alpha: 0.12, sp: 0.15 },
      { ox: R * 0.35,  oy: R * 0.30,  r: 1.8, alpha: 0.10, sp: -0.1 },
      { ox: -R * 0.2,  oy: R * 0.45,  r: 2.8, alpha: 0.08, sp: 0.08 },
      { ox: R * 0.5,   oy: -R * 0.40, r: 1.5, alpha: 0.14, sp: -0.18 },
    ].forEach((p, idx) => {
      const driftY = ((p.oy + Math.sin(tSec * p.sp + idx) * 8 + R) % (2 * R)) - R;
      ctx.beginPath();
      ctx.arc(cx + p.ox, cy + driftY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253, 230, 138, ${p.alpha})`;
      ctx.fill();
    });

    // Kisi mikrometer okular halus
    ctx.strokeStyle = "rgba(148,163,184,0.08)"; ctx.lineWidth = 0.5;
    for (let y = cy - R; y <= cy + R; y += R * 0.125) { ctx.beginPath(); ctx.moveTo(cx - R, y); ctx.lineTo(cx + R, y); ctx.stroke(); }
    for (let x = cx - R; x <= cx + R; x += R * 0.125) { ctx.beginPath(); ctx.moveTo(x, cy - R); ctx.lineTo(x, cy + R); ctx.stroke(); }
    
    // Crosshair okular utama
    ctx.strokeStyle = "rgba(148,163,184,0.35)"; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

    // Skala Reticle Terkalibrasi (Jarak tempuh 1.0 mm)
    const scaleTop = cy - R * 0.5; const scaleBot = cy + R * 0.5;
    ctx.strokeStyle = "rgba(34,211,238,0.7)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - R * 0.14, scaleTop); ctx.lineTo(cx + R * 0.14, scaleTop);
    ctx.moveTo(cx - R * 0.14, scaleBot); ctx.lineTo(cx + R * 0.14, scaleBot); ctx.stroke();
    
    ctx.fillStyle = "rgba(34,211,238,0.85)"; ctx.font = `bold ${Math.round(R * 0.07)}px monospace`; ctx.textAlign = "left";
    ctx.fillText("0.0 mm (atas)", cx + R * 0.16, scaleTop + 4); 
    ctx.fillText("1.0 mm (bawah)", cx + R * 0.16, scaleBot + 4);

    for (let i = 0; i <= 10; i++) {
      const ty = scaleTop + (i / 10) * (scaleBot - scaleTop);
      const tw = i === 0 || i === 10 ? R * 0.14 : (i % 5 === 0 ? R * 0.09 : R * 0.05);
      ctx.strokeStyle = i % 5 === 0 ? "rgba(34,211,238,0.6)" : "rgba(148,163,184,0.3)"; 
      ctx.lineWidth = i % 5 === 0 ? 1.0 : 0.5;
      ctx.beginPath(); ctx.moveTo(cx - tw, ty); ctx.lineTo(cx + tw, ty); ctx.stroke();
    }

    const { vf, vr, isHovering, netForce } = physics;
    // Jika melayang seimbang (isHovering), kecepatan praktis 0
    const physVel = isRunning 
      ? (voltageOn ? (isHovering ? 0 : (netForce > 0 ? vr : -vf * 0.4)) : -vf) 
      : 0;
    
    const fracPerSec = physVel * (1 / 1e-3) * 0.001;
    dropFracRef.current -= fracPerSec * dt;
    if (dropFracRef.current < 0.02) dropFracRef.current = 0.98;
    if (dropFracRef.current > 0.98) dropFracRef.current = 0.02;
    
    // Posisi Y tetesan pada bidang fokus okular
    const eyeDropY = scaleTop + dropFracRef.current * (scaleBot - scaleTop);
    const dropR = Math.max(4, 3.2 + sliders.radius * 1.3);

    // Jejak pergerakan (Motion blur phosphorescent) saat bergerak
    if (isRunning && Math.abs(physVel) > 1e-6) {
      const trailLen = Math.min(28, Math.abs(physVel) * 4500);
      const trailDir = physVel > 0 ? 1 : -1;
      const trailG = ctx.createLinearGradient(cx, eyeDropY, cx, eyeDropY + trailLen * trailDir);
      trailG.addColorStop(0, "rgba(254,240,138,0.35)"); 
      trailG.addColorStop(1, "rgba(254,240,138,0)");
      ctx.fillStyle = trailG; 
      ctx.fillRect(cx - 1.2, eyeDropY, 2.4, trailLen * trailDir);
    }

    // ── EFEK BINTANG KECIL BERCAHAYA (STAR-LIKE DIFFRACTION & TYNDALL GLINT) ──
    const shimmer = Math.sin(tSec * 6) * 0.15 + 1.0;
    
    // 1. Halo aura difraksi luas
    const haloG = ctx.createRadialGradient(cx, eyeDropY, 0, cx, eyeDropY, dropR * 4.5);
    haloG.addColorStop(0, "rgba(254, 240, 138, 0.35)");
    haloG.addColorStop(0.3, "rgba(251, 191, 36, 0.18)");
    haloG.addColorStop(0.7, "rgba(245, 158, 11, 0.06)");
    haloG.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = haloG;
    ctx.beginPath(); ctx.arc(cx, eyeDropY, dropR * 4.5, 0, Math.PI * 2); ctx.fill();

    // 2. Starburst / Diffraction Spikes 4-titik (pantulan cahaya samping lensa)
    const spikeLen = (dropR * 2.8 + 6) * shimmer;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1.0;
    // Garis horizontal & vertikal difraksi
    ctx.beginPath();
    ctx.moveTo(cx - spikeLen, eyeDropY); ctx.lineTo(cx + spikeLen, eyeDropY);
    ctx.moveTo(cx, eyeDropY - spikeLen); ctx.lineTo(cx, eyeDropY + spikeLen);
    ctx.stroke();
    // Garis diagonal lembut
    ctx.strokeStyle = "rgba(254, 240, 138, 0.35)";
    ctx.lineWidth = 0.7;
    const diag = spikeLen * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - diag, eyeDropY - diag); ctx.lineTo(cx + diag, eyeDropY + diag);
    ctx.moveTo(cx - diag, eyeDropY + diag); ctx.lineTo(cx + diag, eyeDropY - diag);
    ctx.stroke();
    ctx.restore();

    // 3. Inti Tetesan Minyak Berpendar (White-gold Star Core)
    const dG2 = ctx.createRadialGradient(cx, eyeDropY, 0, cx, eyeDropY, dropR);
    dG2.addColorStop(0, "#ffffff");
    dG2.addColorStop(0.35, "#fef08a");
    dG2.addColorStop(0.7, "#f59e0b");
    dG2.addColorStop(1, "#b45309");
    ctx.beginPath(); ctx.arc(cx, eyeDropY, dropR, 0, Math.PI * 2); ctx.fillStyle = dG2; ctx.fill();

    // 4. Specular twinkle point
    ctx.beginPath(); ctx.arc(cx - dropR * 0.25, eyeDropY - dropR * 0.25, dropR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill();

    // Cincin target reticle (dashed)
    ctx.strokeStyle = isHovering ? "rgba(52,211,153,0.85)" : "rgba(34,211,238,0.7)"; 
    ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, eyeDropY, dropR + 6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

    // Indikator Posisi Jarak Terukur (mm)
    const distMM = ((eyeDropY - scaleTop) / (scaleBot - scaleTop) * 1).toFixed(2);
    ctx.fillStyle = "rgba(10,14,26,0.85)"; 
    roundRect(ctx, cx + R * 0.28, eyeDropY - 12, 64, 22, 4); ctx.fill();
    ctx.strokeStyle = isHovering ? "rgba(52,211,153,0.5)" : "rgba(34,211,238,0.4)";
    ctx.lineWidth = 0.8; roundRect(ctx, cx + R * 0.28, eyeDropY - 12, 64, 22, 4); ctx.stroke();
    
    ctx.fillStyle = isHovering ? "#34d399" : "#22d3ee"; 
    ctx.font = `bold ${Math.round(R * 0.065)}px monospace`; ctx.textAlign = "left";
    ctx.fillText(`y = ${distMM} mm`, cx + R * 0.31, eyeDropY - 1);
    
    // Status text di dalam okular
    ctx.font = `bold ${Math.round(R * 0.05)}px monospace`;
    if (isHovering) {
      ctx.fillStyle = "#34d399";
      ctx.fillText("✨ SEIMBANG", cx + R * 0.31, eyeDropY + 7);
    } else if (voltageOn && netForce > 0) {
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("▲ NAIK", cx + R * 0.31, eyeDropY + 7);
    } else {
      ctx.fillStyle = "#f59e0b";
      ctx.fillText("▼ JATUH", cx + R * 0.31, eyeDropY + 7);
    }

    ctx.restore();

    // Bezel cincin lensa mikroskop
    ctx.save();
    const rimG = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 14);
    rimG.addColorStop(0, "#334155"); rimG.addColorStop(0.5, "#475569"); rimG.addColorStop(1, "#0f172a");
    ctx.strokeStyle = rimG; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(cx, cy, R + 7, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = "rgba(148,163,184,0.4)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    // Watermark label mode okular
    ctx.fillStyle = "rgba(148,163,184,0.5)"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
    ctx.fillText("RETICLE OKULAR — SKALA 1.0 mm (DARK-FIELD ILLUMINATION)", cx, H - 12);
  }

  // Loop animasi rAF — diletakkan setelah semua fungsi draw dideklarasikan
  // agar closure mengakses nilai yang sudah ter-inisialisasi (React Compiler
  // menggarisbawahi akses variabel sebelum deklarasi bila ditaruh di atas).
  // Semua state yang dibaca fungsi draw menjadi dependencies.
  useEffect(() => {
    let lastTs = 0; // timestamp frame sebelumnya (0 → frame pertama dt=0)
    const draw = (ts: number) => {
      const dt = lastTs === 0 ? 0 : Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      lastT.current = ts;
      drawMillikan(dt);
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drawMillikan membaca seluruh state render berikut
  }, [isRunning, sliders, showVectors, voltageOn, chargeN, viewMode]);

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

  function drawBrassPlate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tintColor: string) {
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, "#78350f"); g.addColorStop(0.12, "#d97706"); g.addColorStop(0.5, "#fef3c7"); g.addColorStop(0.88, "#d97706"); g.addColorStop(1, "#78350f");
    ctx.fillStyle = g; roundRect(ctx, x, y, w, h, 2); ctx.fill();
    ctx.fillStyle = tintColor + "28"; roundRect(ctx, x, y, w, h, 2); ctx.fill();
    ctx.strokeStyle = "rgba(254,243,199,0.5)"; ctx.lineWidth = 0.8; roundRect(ctx, x, y, w, h, 2); ctx.stroke();
  }

  function drawSteelCap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pos: "top" | "bottom") {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (pos === "top") { g.addColorStop(0, "#64748b"); g.addColorStop(1, "#334155"); }
    else { g.addColorStop(0, "#334155"); g.addColorStop(1, "#64748b"); }
    ctx.fillStyle = g; roundRect(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 0.8; roundRect(ctx, x, y, w, h, 3); ctx.stroke();
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  // ── Record Trial ──
  function recordTrial() {
    if (trials.length >= MAX_TRIALS) return;
    const key = `fisikaseru:trials:${slug}`;
    const r = sliders.radius; const V = sliders.voltage;
    const { vf, vr, isHovering, netForce } = millikanVelocities(r, V, chargeN, voltageOn);

    if (!voltageOn) {
      setMeasureAlert("Medan listrik belum aktif! Nyalakan tombol tegangan (V) untuk menyeimbangkan (melayang) atau menaikkan tetesan minyak.");
      setTimeout(() => setMeasureAlert(null), 4500);
      return;
    }

    // Jika droplet masih jatuh bebas ke bawah tanpa mampu diimbangi medan listrik
    if (netForce < 0 && !isHovering) {
      setMeasureAlert("Droplet masih jatuh (Fg > Fe)! Naikkan slider Tegangan (V) agar gaya listrik mampu menyeimbangkan (melayang) atau mengangkat tetesan ke atas.");
      setTimeout(() => setMeasureAlert(null), 4500);
      return;
    }

    const tf_true = 1e-3 / vf;
    const tf_obs = gaussianNoise(tf_true, tf_true * 0.015);
    const vf_obs = 1e-3 / tf_obs;

    let q_calc = 0;
    let tr_obs = 9999;
    let method: "balanced" | "dynamic" = "dynamic";

    if (isHovering) {
      // METODE MELAYANG SEIMBANG (v2 = 0, Fe = Fg)
      // Rumus: q = (m · g · d) / V
      // Berdasarkan kesetimbangan Stokes m·g = 6πη·r·vf, sehingga (6πη·r·vf·d)/V identik dengan (m·g·d)/V
      method = "balanced";
      tr_obs = 9999;
      q_calc = (STOKES_6PI * ETA * (r * 1e-6) * vf_obs * PLATE_D) / V;
    } else {
      // METODE DINAMIS NAIK (v2 > 0)
      // Rumus: q = [6πη·r·(v1 + v2)·d] / V
      method = "dynamic";
      const tr_true = 1e-3 / vr;
      tr_obs = gaussianNoise(tr_true, tr_true * 0.015);
      const vr_obs = 1e-3 / tr_obs;
      q_calc = (STOKES_6PI * ETA * (r * 1e-6) * (vf_obs + vr_obs) * PLATE_D) / V;
    }

    const q19 = q_calc * 1e19;
    const newTrial = {
      id: trials.length + 1,
      dropletLabel: currentDroplet.label,
      r, V,
      tf: tf_obs,
      tr: tr_obs,
      method,
      q: q19,
      n: Math.round(q_calc / E_CHARGE) // disimpan untuk verifikasi, tidak ditampilkan sebelum discovery
    };
    const updated = [...trials, newTrial];
    setTrials(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    // Otomatis siapkan droplet baru untuk observasi berikutnya
    setTimeout(() => {
      triggerAtomizer();
    }, 400);
  }

  const moduleTitle = "Tetes Minyak Millikan";

  // Determine observation completion
  const observationDone =
    expSteps.sprayed && expSteps.viewSwapped && expSteps.voltageChanged && expSteps.xrayTriggered;

  return (
    <div className="h-screen bg-bg-primary flex flex-col relative font-body overflow-hidden">

      {/* ── X-Ray flash overlay ── */}
      <AnimatePresence>
        {ionFlash && (
          <motion.div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-cyan-400/10 backdrop-blur-[1px]" />
            <div className="bg-slate-900 border border-cyan-500/60 px-5 py-3 rounded-xl flex items-center gap-3 shadow-depth">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span className="font-mono text-cyan-400 text-xs font-semibold tracking-wider">
                Sinar-X Mengionisasi Udara — Muatan {currentDroplet.label} Berubah!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            const isDone = (i < 3 && i < currentStep) || (i === 3) || (i === 4);
            const isCurrent = (i < 3 && i === currentStep);
            const isLocked = (i < 3 && i > currentStep + 1);
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
          <button onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-accent-cobalt/10 border border-accent-cobalt/30 text-accent-cobalt hover:bg-accent-cobalt/20 transition-all cursor-pointer">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prinsip Lab</span>
          </button>
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

        {/* ── CANVAS & OBSERVATION HERO AREA ── */}
        <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden bg-slate-950">

          {/* ── CHAMBER / OKULAR HERO VIEWPORT ── */}
          <div className="flex-1 relative overflow-hidden" style={{ background: "#050810" }}>

            {/* Top-Left: Visual Mode (2D/3D) + Minimal View Switcher */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
                {(["2d", "3d"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setVisualMode(mode)}
                    aria-pressed={visualMode === mode}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      visualMode === mode ? "bg-accent-cobalt text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>

              {visualMode === "2d" && (
                <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
                  <button
                    onClick={() => handleSetViewMode("chamber")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                      viewMode === "chamber" ? "bg-accent-cobalt text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Chamber
                  </button>
                  <button
                    onClick={() => handleSetViewMode("eyepiece")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                      viewMode === "eyepiece" ? "bg-accent-cobalt text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Microscope className="w-3.5 h-3.5" /> Okular
                  </button>
                </div>
              )}
            </div>

            {/* Top-Right: Minimal Motion Status Pill & Physics Quick-Toggle */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold backdrop-blur-md shadow-md transition-all",
                !voltageOn
                  ? "bg-slate-900/90 border-slate-700 text-slate-300"
                  : physics.isHovering
                  ? "bg-emerald-950/90 border-emerald-500/70 text-emerald-300 animate-pulse ring-1 ring-emerald-500/30"
                  : physics.netForce > 0
                  ? "bg-cyan-950/90 border-cyan-500/70 text-cyan-300"
                  : "bg-amber-950/90 border-amber-500/70 text-amber-300"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  !voltageOn ? "bg-slate-500" :
                  physics.isHovering ? "bg-emerald-400 animate-ping" :
                  physics.netForce > 0 ? "bg-cyan-400" : "bg-amber-400"
                )} />
                <span>
                  {!voltageOn ? "E = 0 (Jatuh Bebas)" :
                   physics.isHovering ? "✨ Melayang Seimbang" :
                   physics.netForce > 0 ? "▲ Bergerak Naik" : "▼ Turun Lambat"}
                </span>
              </div>

              <button
                onClick={() => setShowPhysicsInspect(!showPhysicsInspect)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer",
                  showPhysicsInspect
                    ? "bg-accent-cobalt text-white border-accent-cobalt"
                    : "bg-slate-900/90 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                )}
                title="Buka / Tutup panel kalkulasi gaya fisika"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspeksi</span>
              </button>
            </div>

            {/* Canvas viewport (2D) / Scene 3D */}
            {visualMode === "2d" ? (
              <canvas
                ref={millikanRef}
                role="img"
                aria-label="Simulasi interaktif eksperimen tetes minyak Millikan: tetesan minyak melayang di antara dua pelat listrik di dalam chamber, dengan vektor gaya berat dan gaya listrik"
                className="w-full h-full block"
              />
            ) : (
              <MillikanChamber3D
                key={resetCount}
                dropletRadiusUm={sliders.radius}
                voltage={sliders.voltage}
                chargeCount={chargeN}
                voltageOn={voltageOn}
                running={isRunning}
                onStateChange={handleSceneStateChange}
              />
            )}

            {/* Live readout (3D) */}
            {visualMode === "3d" && (
              <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700/60 shadow-lg space-y-1 text-[10px] font-mono min-w-[170px]">
                <div className="text-slate-400 uppercase tracking-wider font-bold text-[8px] mb-1">Pengukuran Droplet 3D</div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Kecepatan</span>
                  <span className="font-bold text-accent-cobalt">
                    {sceneState ? `${(sceneState.velocity * 1000).toFixed(3)} mm/s` : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Posisi (dari pelat bawah)</span>
                  <span className="font-bold text-slate-200">
                    {sceneState ? `${(sceneState.yPosition * 1000).toFixed(2)} mm` : "—"}
                  </span>
                </div>
              </div>
            )}

            {/* Alert Notification */}
            <AnimatePresence>
              {measureAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-sm w-[90%] px-2 pointer-events-none"
                >
                  <div className="bg-amber-950/95 border border-amber-500/70 text-amber-200 text-xs p-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="leading-snug text-[11px] font-medium">{measureAlert}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── GROUNDED ACTION BAR (Directly below canvas, outside viewport) ── */}
          <div className="bg-white border-t border-border-default px-4 py-2.5 flex-shrink-0 z-20">
            {/* Mission status guidance banner */}
            <div className="flex items-center justify-between gap-3 mb-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  mission.phase === "readyToRecord" || mission.phase === "readyForAnalysis"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-accent-cobalt"
                )} />
                <p className="text-xs font-semibold text-primary-navy truncate">
                  {mission.mission}
                </p>
                {mission.hint && (
                  <span className="hidden md:inline text-[11px] text-text-muted truncate">
                    — {mission.hint}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="font-mono text-[10px]">
                  Target: {trials.length}/5 Droplet
                </Badge>
              </div>
            </div>

            {/* Primary Control Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left: Play/Pause & Reset */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setIsRunning(!isRunning);
                    if (!isRunning) triggerAtomizer();
                  }}
                  size="sm"
                  className={cn(
                    "font-bold text-xs gap-1.5 cursor-pointer shadow-xs transition-all",
                    isRunning
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-accent-cobalt hover:bg-accent-cobalt-light text-white"
                  )}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? "Pause Simulasi" : "Mulai Observasi"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsRunning(false);
                    setStopwatch(0);
                    dropFracRef.current = 0.5;
                    setResetCount(c => c + 1);
                    triggerAtomizer();
                  }}
                  className="text-text-muted hover:text-text-primary text-xs cursor-pointer gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              </div>

              {/* Center: Primary Record Action */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={recordTrial}
                  disabled={trials.length >= MAX_TRIALS || !isRunning}
                  size="sm"
                  className={cn(
                    "font-bold text-xs gap-2 px-5 py-2 cursor-pointer shadow-md transition-all",
                    physics.isHovering
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40 animate-pulse"
                      : isRunning && voltageOn && physics.netForce > 0
                      ? "bg-accent-cobalt hover:bg-accent-cobalt-light text-white"
                      : "bg-slate-700 hover:bg-slate-800 text-white opacity-85"
                  )}
                >
                  <Save className="w-4 h-4" />
                  <span>Rekam Observasi</span>
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                    {currentDroplet.label}
                  </span>
                </Button>
              </div>

              {/* Right: Stopwatch & Timer Readout */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Stopwatch</span>
                  <span className="font-mono font-bold text-sm text-primary-navy">
                    {stopwatch.toFixed(2)}<span className="text-[10px] text-slate-400 font-normal ml-0.5">s</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PROGRESSIVE EVIDENCE FEED (Below Action Bar) ── */}
          <div className="bg-slate-50 border-t border-border-default px-4 py-2.5 flex-shrink-0 z-20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs text-primary-navy">
                  Koleksi Bukti Observasi
                </span>
                {/* 5-dot visual status indicator */}
                <div className="flex items-center gap-1 ml-1.5">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <span
                      key={idx}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        idx < trials.length
                          ? "bg-accent-cobalt ring-2 ring-accent-cobalt/20"
                          : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-semibold text-accent-cobalt ml-1">
                  {trials.length}/5
                </span>
              </div>

              <div className="flex items-center gap-2">
                {trials.length >= 5 && (
                  <Link href={`/modules/${slug}/analysis`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs animate-pulse">
                      Buka Analisis Data <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
                {trials.length > 0 && (
                  <button
                    onClick={() => setShowEvidenceTable(!showEvidenceTable)}
                    className="text-xs text-text-muted hover:text-primary-navy font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {showEvidenceTable ? "Tutup Tabel" : "Lihat Tabel"}
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Cards Feed (Strict anti-leakage: no q, no e, no n) */}
            {trials.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center text-xs text-slate-500 bg-white/60">
                Belum ada tetesan yang direkam. Nyalakan tegangan, seimbangkan tetesan minyak di okular, lalu tekan &ldquo;Rekam Observasi&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {trials.slice(-5).map(t => (
                  <div
                    key={t.id}
                    className="bg-white border border-border-default/80 rounded-xl p-2.5 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[11px] text-accent-cobalt">
                        {t.dropletLabel || `Drop #${t.id}`}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-success/30 text-success bg-success/5 font-semibold">
                        ✓ Terekam
                      </Badge>
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Voltase:</span>
                        <span className="font-semibold">{t.V} V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Waktu:</span>
                        <span className="font-semibold">{t.tf.toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Kondisi:</span>
                        <span className={cn("font-semibold", t.method === "balanced" ? "text-emerald-600" : "text-cyan-600")}>
                          {t.method === "balanced" ? "Melayang" : "Naik"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expandable Evidence Table Drawer */}
            <AnimatePresence>
              {showEvidenceTable && trials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2.5 overflow-hidden border border-border-default rounded-xl bg-white shadow-xs"
                >
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border-default text-text-muted font-display font-semibold">
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Droplet</th>
                        <th className="px-3 py-2 text-left">Tegangan (V)</th>
                        <th className="px-3 py-2 text-left">Waktu Jatuh tf (s)</th>
                        <th className="px-3 py-2 text-left">Waktu Naik tr / Mode</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default/60 font-mono">
                      {trials.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-1.5 text-text-muted">{t.id}</td>
                          <td className="px-3 py-1.5 font-bold text-accent-cobalt">{t.dropletLabel || `Drop #${t.id}`}</td>
                          <td className="px-3 py-1.5">{t.V} V</td>
                          <td className="px-3 py-1.5">{t.tf.toFixed(2)} s</td>
                          <td className="px-3 py-1.5">
                            {t.method === "balanced" ? (
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                Melayang (Seimbang)
                              </span>
                            ) : (
                              t.tr < 200 ? `${t.tr.toFixed(2)} s` : "—"
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-success font-semibold text-[10px]">✓ Terekam</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ── UNIFIED RIGHT INSTRUMENT PANEL ── */}
        <motion.aside
          animate={{ width: panelCollapsed ? 44 : 330 }}
          transition={{ duration: 0.25 }}
          className="bg-white border-l border-border-default flex flex-col flex-shrink-0 overflow-hidden"
        >
          {panelCollapsed ? (
            <button onClick={() => setPanelCollapsed(false)}
              className="h-full flex flex-col items-center justify-start pt-4 gap-3 p-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-text-muted rotate-180" />
            </button>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Panel Header */}
              <div className="h-10 flex items-center justify-between px-4 border-b border-border-default flex-shrink-0 bg-gray-50/50">
                <h2 className="font-display font-bold text-xs text-primary-navy flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-accent-cobalt" />
                  {currentStep === 0 ? "Dugaan Awal" : currentStep === 1 ? "Pengamatan" : "Instrumen Lab"}
                </h2>
                <button onClick={() => setPanelCollapsed(true)} className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              {/* ── STEP 0: PREDICTION ── */}
              {currentStep === 0 && (
                <PredictionView
                  slug={slug}
                  onComplete={() => updateStep(1)}
                />
              )}

              {/* ── STEP 1: OBSERVATION / EXPLORATION CHECKLIST ── */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-gradient-to-br from-teal/5 to-sky-blue/5 border border-teal/20 rounded-xl p-3 flex items-start gap-2.5">
                      <CircleDot className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display font-semibold text-xs text-teal">Eksplorasi Lab Bebas</h3>
                        <p className="text-[10px] text-teal/80 leading-snug mt-0.5">
                          Eksplorasi instrumen di bawah dan amati bagaimana tetesan minyak merespon medan listrik dan sinar-X.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <>
                        <ChecklistItem label="Semprotkan minyak" desc="Klik 'Mulai' untuk menyemprotkan kabut minyak ke chamber." checked={expSteps.sprayed} />
                        <ChecklistItem label="Ganti ke tampilan Okular" desc="Klik 'Okular' di kiri atas kanvas — lihat tetesan berpendar seperti bintang kecil di mikroskop." checked={expSteps.viewSwapped} />
                        <ChecklistItem label="Ubah tegangan medan listrik" desc="Atur slider voltase atau nyala/matikan medan listrik." checked={expSteps.voltageChanged} />
                        <ChecklistItem label="Tembakkan Sinar-X" desc="Sinar-X mengionisasi udara dan elektron menempel pada tetesan, mengubah muatan listriknya!" checked={expSteps.xrayTriggered} />
                      </>
                    </div>

                    {/* Progress indicator */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-border-default/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-semibold text-text-muted">Checklist Eksplorasi</span>
                        <span className="text-[10px] font-mono font-bold text-accent-cobalt">
                          {`${Object.values(expSteps).filter(Boolean).length}/4`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div className="bg-accent-cobalt h-1.5 rounded-full" initial={{ width: 0 }}
                          animate={{ width: `${Object.values(expSteps).filter(Boolean).length / 4 * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border-default flex-shrink-0 bg-white">
                    <Button onClick={() => updateStep(2)}
                      disabled={!observationDone}
                      className="w-full cursor-pointer text-xs flex items-center justify-center gap-1.5">
                      Mulai Pengukuran Presisi <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    {!observationDone && (
                      <p className="text-[10px] text-text-muted text-center mt-2">Selesaikan semua checklist terlebih dahulu.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: MEASUREMENT / FULL INSTRUMENT CONTROLS ── */}
              {currentStep === 2 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">

                      <>
                        {/* Section 1: Medan Listrik Pelat */}
                        <div className="bg-white border border-border-default/80 rounded-xl p-3.5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-xs text-primary-navy flex items-center gap-1.5">
                              <Zap className={cn("w-3.5 h-3.5", voltageOn ? "text-amber-500" : "text-slate-400")} />
                              Medan Listrik Pelat
                            </span>
                            <button
                              onClick={() => {
                                setVoltageOn(!voltageOn);
                                updateExpStep("voltageChanged", true);
                              }}
                              className={cn(
                                "text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer",
                                voltageOn
                                  ? "bg-amber-100 border-amber-300 text-amber-800"
                                  : "bg-slate-100 border-slate-300 text-slate-500"
                              )}
                            >
                              {voltageOn ? "ON (Aktif)" : "OFF (Mati)"}
                            </button>
                          </div>

                          {/* Voltage Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-text-muted font-medium">Tegangan (V)</span>
                              <span className="font-mono font-bold text-accent-cobalt">{sliders.voltage} V</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={600}
                              step={5}
                              value={sliders.voltage}
                              onChange={e => {
                                setSliders(p => ({ ...p, voltage: parseFloat(e.target.value) }));
                                updateExpStep("voltageChanged", true);
                              }}
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-cobalt"
                            />
                            <div className="flex justify-between items-center text-[9px] text-text-muted">
                              <span>50 V</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setSliders(p => ({ ...p, voltage: Math.max(50, p.voltage - 10) }))}
                                  className="px-1.5 py-0.5 rounded border border-border-default hover:bg-slate-100 text-text-primary cursor-pointer"
                                >
                                  -10V
                                </button>
                                <button
                                  onClick={() => setSliders(p => ({ ...p, voltage: Math.min(600, p.voltage + 10) }))}
                                  className="px-1.5 py-0.5 rounded border border-border-default hover:bg-slate-100 text-text-primary cursor-pointer"
                                >
                                  +10V
                                </button>
                              </div>
                              <span>600 V</span>
                            </div>
                          </div>

                          {/* Field Readout */}
                          <div className="bg-slate-50 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">Kuat Medan E = V / d:</span>
                            <span className="font-bold text-primary-navy">
                              {voltageOn ? `${((sliders.voltage / PLATE_D) / 1000).toFixed(1)} kV/m` : "0.0 kV/m"}
                            </span>
                          </div>
                        </div>

                        {/* Section 2: Droplet Aktif & Atomizer */}
                        <div className="bg-white border border-border-default/80 rounded-xl p-3.5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-mono font-bold text-text-muted block">Droplet Aktif</span>
                              <h4 className="font-mono font-bold text-accent-cobalt text-xs">{currentDroplet.label}</h4>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={triggerAtomizer}
                              className="text-[10px] gap-1 cursor-pointer border-accent-cobalt/30 text-accent-cobalt hover:bg-accent-cobalt/5"
                            >
                              <Sparkles className="w-3 h-3" /> Tetes Baru
                            </Button>
                          </div>

                          <SliderField
                            label="Radius Tetesan (r)"
                            unit="µm"
                            min={0.70}
                            max={1.50}
                            step={0.05}
                            value={sliders.radius}
                            onChange={v => setSliders(p => ({ ...p, radius: v }))}
                            decimals={2}
                          />
                        </div>

                        {/* Section 3: Ionisasi Sinar-X */}
                        <div className="bg-cyan-50/50 border border-cyan-200/80 rounded-xl p-3 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-xs text-cyan-900 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-cyan-700" /> Sinar-X Pengion
                            </span>
                            <Button
                              size="sm"
                              onClick={triggerIonization}
                              className="bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] cursor-pointer py-1 h-auto"
                            >
                              ⚡ Tembakkan
                            </Button>
                          </div>
                          <p className="text-[10px] text-cyan-800/80 leading-relaxed">
                            Mengionisasi molekul udara. Elektron menempel pada tetesan dan mengubah jumlah muatannya secara spontan!
                          </p>
                        </div>

                        {/* Section 4: Compact Prediction Card */}
                        <CompactPredictionCard slug={slug} onExpand={() => updateStep(0)} />

                        {/* Section 5: Inspeksi Fisika Accordion */}
                        <div className="border border-border-default/80 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setShowPhysicsInspect(!showPhysicsInspect)}
                            className="w-full px-3 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-semibold text-primary-navy hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-accent-cobalt" />
                              Diagnostik Gaya Fisika
                            </span>
                            {showPhysicsInspect ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                          </button>

                          {showPhysicsInspect && (
                            <div className="p-3 bg-white space-y-1.5 font-mono text-[10px] border-t border-border-default/60">
                              <div className="flex justify-between text-slate-600">
                                <span>Gaya Berat W_eff (Fg):</span>
                                <span className="font-bold text-rose-600">{(physics.Fg * 1e14).toFixed(3)} × 10⁻¹⁴ N</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Gaya Listrik (Fe):</span>
                                <span className="font-bold text-accent-cobalt">
                                  {voltageOn ? `${(physics.Fe * 1e14).toFixed(3)} × 10⁻¹⁴ N` : "0.000 N (Mati)"}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Kecepatan Terminal Jatuh (vf):</span>
                                <span className="font-bold">{(physics.vf * 1000).toFixed(3)} mm/s</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Kecepatan Naik Listrik (vr):</span>
                                <span className="font-bold text-cyan-600">
                                  {physics.isHovering ? "0.000 mm/s (Seimbang)" : (physics.vr > 1e-8 ? `${(physics.vr * 1000).toFixed(3)} mm/s` : "0.000 mm/s")}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                  </div>

                  {/* Panel Footer Navigation Actions */}
                  <div className="p-4 border-t border-border-default flex-shrink-0 space-y-2 bg-white">
                    {trials.length >= 5 ? (
                      <Link href={`/modules/${slug}/analysis`} className="block">
                        <Button size="md" className="w-full cursor-pointer text-xs bg-accent-cobalt hover:bg-accent-cobalt-light text-white font-bold">
                          Lanjut ke Analisis Pola <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-800 leading-snug">
                          {`Kumpulkan minimal 5 droplet sebelum analisis data. (${trials.length}/5 selesai)`}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href="/modules" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs cursor-pointer">
                          <BookOpen className="w-3.5 h-3.5 mr-1" /> Katalog
                        </Button>
                      </Link>
                      {trials.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleResetLab} className="flex-1 text-xs text-danger hover:bg-danger/5 cursor-pointer">
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Data
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.aside>
      </div>

      {/* ── Real Lab & Physics Theory Modal ── */}
      <RealLabGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
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
