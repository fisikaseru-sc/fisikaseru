"use client";
import Link from "next/link";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Save,
  Eye, EyeOff, Radio, Zap, Wrench, Lock, Settings, BarChart2,
  Microscope, LayoutGrid, AlertCircle, CheckCircle2, ArrowRight,
  BookOpen, Sparkles, CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const MODULE_TITLE: Record<string, string> = {
  millikan: "Tetes Minyak Millikan",
  bandul:   "Bandul Sederhana",
  ohm:      "Hukum Ohm",
  "jatuh-bebas": "Jatuh Bebas",
  boyle:    "Hukum Boyle",
  snellius: "Pembiasan Cahaya",
};

// ============================================================
// PHYSICS ENGINE
// ============================================================
function millikanVelocities(r_um: number, V: number, n: number, voltageOn: boolean) {
  const r = r_um * 1e-6;
  const dRho = RHO_OIL - RHO_AIR;
  const Fg = (4 / 3) * Math.PI * r ** 3 * dRho * G;
  const vf = Fg / (STOKES_6PI * ETA * r);
  const Fe = voltageOn ? (n * E_CHARGE * V) / PLATE_D : 0;
  const vr = voltageOn ? (Fe - Fg) / (STOKES_6PI * ETA * r) : 0;
  return { vf, vr, Fg, Fe };
}

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
  const slug     = (params?.moduleSlug as string) || "millikan";

  const isMillikan = slug === "millikan";
  const isBandul   = slug === "bandul";
  const isActive   = isMillikan || isBandul;

  const [currentStep, setCurrentStep]       = useState(0);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [isRunning, setIsRunning]           = useState(false);
  const [showVectors, setShowVectors]       = useState(true);
  const [viewMode, setViewMode]             = useState<"chamber" | "eyepiece">("chamber");
  const [voltageOn, setVoltageOn]           = useState(true);
  const [chargeN, setChargeN]               = useState(4);
  const [ionFlash, setIonFlash]             = useState(false);
  const [stopwatch, setStopwatch]           = useState(0);

  const [pretestAnswers, setPretestAnswers]     = useState<Record<number, number>>({});
  const [pretestSubmitted, setPretestSubmitted] = useState(false);
  const [expSteps, setExpSteps] = useState({
    sprayed: false, viewSwapped: false, voltageChanged: false, xrayTriggered: false,
  });

  const MAX_TRIALS = 10;
  const [trials, setTrials]   = useState<any[]>([]);
  const [sliders, setSliders] = useState({
    voltage: 300, radius: 1.5, length: 0.75, mass: 0.1, angle: 10,
  });

  const millikanRef  = useRef<HTMLCanvasElement>(null);
  const bandulRef    = useRef<HTMLCanvasElement>(null);
  const dropFracRef  = useRef(0.5);
  const dropYEye     = useRef(0);
  const animRef      = useRef<number>(0);
  const lastT        = useRef<number>(0);
  const pendAngleRef = useRef(0);
  const pendOmegaRef = useRef(0);
  const sprayRef     = useRef<any[]>([]);
  const [atomizerActive, setAtomizerActive] = useState(false);

  // ── Load saved progress ──
  useEffect(() => {
    const savedTrials = localStorage.getItem(`fisikaseru:trials:${slug}`);
    let hasTrials = false;
    if (savedTrials) {
      try {
        const p = JSON.parse(savedTrials);
        if (Array.isArray(p) && p.length > 0) { setTrials(p); hasTrials = true; }
      } catch (_) {}
    }
    const savedStep = localStorage.getItem(`fisikaseru:step:${slug}`);
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
    else setCurrentStep(0);

    const savedAns = localStorage.getItem(`fisikaseru:pretest:ans:${slug}`);
    if (savedAns) { try { setPretestAnswers(JSON.parse(savedAns)); } catch (_) {} }

    const savedSub = localStorage.getItem(`fisikaseru:pretest:sub:${slug}`);
    if (savedSub) setPretestSubmitted(savedSub === "true");

    const savedExp = localStorage.getItem(`fisikaseru:exp:${slug}`);
    if (savedExp) { try { setExpSteps(JSON.parse(savedExp)); } catch (_) {} }

    if (hasTrials && isMillikan) triggerAtomizer();
  }, [slug]);

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    localStorage.setItem(`fisikaseru:step:${slug}`, newStep.toString());
  };

  const handleResetLab = () => {
    setTrials([]);
    localStorage.removeItem(`fisikaseru:trials:${slug}`);
    updateStep(0);
    setPretestAnswers({});
    localStorage.removeItem(`fisikaseru:pretest:ans:${slug}`);
    setPretestSubmitted(false);
    localStorage.removeItem(`fisikaseru:pretest:sub:${slug}`);
    const clearedExp = { sprayed: false, viewSwapped: false, voltageChanged: false, xrayTriggered: false };
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

  const handleSetViewMode = (mode: "chamber" | "eyepiece") => {
    setViewMode(mode);
    updateExpStep("viewSwapped", true);
  };

  function triggerAtomizer() {
    updateExpStep("sprayed", true);
    setAtomizerActive(true);
    const pts: any[] = [];
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
    const newN = Math.floor(Math.random() * 7) + 1;
    setChargeN(newN);
    setTimeout(() => setIonFlash(false), 600);
  }

  useEffect(() => {
    let id: any;
    if (isRunning) {
      const t0 = Date.now() - stopwatch * 1000;
      id = setInterval(() => setStopwatch((Date.now() - t0) / 1000), 30);
    }
    return () => clearInterval(id);
  }, [isRunning]);

  const physics = millikanVelocities(sliders.radius, sliders.voltage, chargeN, voltageOn);

  const draw = useCallback((ts: number) => {
    const dt = Math.min((ts - lastT.current) / 1000, 0.05);
    lastT.current = ts;
    if (isMillikan) drawMillikan(dt);
    else if (isBandul) drawBandul(dt);
    animRef.current = requestAnimationFrame(draw);
  }, [isRunning, sliders, showVectors, isMillikan, isBandul, voltageOn, chargeN, viewMode]);

  useEffect(() => {
    lastT.current = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

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

    const { vf, vr } = physics;
    const physVel = isRunning ? (voltageOn ? vr : -vf) : 0;
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
    ctx.fillStyle = "rgba(15,23,42,0.75)"; roundRect(ctx, chX + chW - 52, chY + 3, 49, 18, 3); ctx.fill();
    ctx.fillStyle = "#22d3ee"; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
    ctx.fillText(`q = ${chargeN}e`, chX + chW - 48, chY + 14);
  }

  function drawEyepieceView(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number) {
    const cx = W / 2; const cy = H / 2;
    const R  = Math.min(W, H) * 0.42;
    ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);
    const vigG = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.25);
    vigG.addColorStop(0, "rgba(0,0,0,0)"); vigG.addColorStop(1, "rgba(0,0,0,0.95)");
    ctx.fillStyle = vigG; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    const eyeBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    eyeBg.addColorStop(0, "#04060f"); eyeBg.addColorStop(0.85, "#02040a"); eyeBg.addColorStop(1, "#000000");
    ctx.fillStyle = eyeBg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.strokeStyle = "rgba(148,163,184,0.12)"; ctx.lineWidth = 0.5;
    for (let y = cy - R; y <= cy + R; y += R * 0.125) { ctx.beginPath(); ctx.moveTo(cx - R, y); ctx.lineTo(cx + R, y); ctx.stroke(); }
    for (let x = cx - R; x <= cx + R; x += R * 0.125) { ctx.beginPath(); ctx.moveTo(x, cy - R); ctx.lineTo(x, cy + R); ctx.stroke(); }
    ctx.strokeStyle = "rgba(148,163,184,0.45)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    const scaleTop = cy - R * 0.5; const scaleBot = cy + R * 0.5;
    ctx.strokeStyle = "rgba(34,211,238,0.65)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - R * 0.12, scaleTop); ctx.lineTo(cx + R * 0.12, scaleTop);
    ctx.moveTo(cx - R * 0.12, scaleBot); ctx.lineTo(cx + R * 0.12, scaleBot); ctx.stroke();
    ctx.fillStyle = "rgba(34,211,238,0.75)"; ctx.font = `bold ${Math.round(R * 0.07)}px monospace`; ctx.textAlign = "left";
    ctx.fillText("0.0 mm", cx + R * 0.14, scaleTop + 4); ctx.fillText("1.0 mm", cx + R * 0.14, scaleBot + 4);
    for (let i = 0; i <= 10; i++) {
      const ty = scaleTop + (i / 10) * (scaleBot - scaleTop);
      const tw = i === 0 || i === 10 ? R * 0.12 : (i % 5 === 0 ? R * 0.08 : R * 0.05);
      ctx.strokeStyle = i % 5 === 0 ? "rgba(34,211,238,0.5)" : "rgba(148,163,184,0.3)"; ctx.lineWidth = i % 5 === 0 ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(cx - tw, ty); ctx.lineTo(cx + tw, ty); ctx.stroke();
    }
    const { vf, vr } = physics;
    const physVel = isRunning ? (voltageOn ? vr : -vf) : 0;
    const fracPerSec = physVel * (1 / 1e-3) * 0.001;
    dropFracRef.current -= fracPerSec * dt;
    if (dropFracRef.current < 0.02) dropFracRef.current = 0.98;
    if (dropFracRef.current > 0.98) dropFracRef.current = 0.02;
    const eyeDropY = scaleTop + dropFracRef.current * (scaleBot - scaleTop);
    const dropR = Math.max(4, 3 + sliders.radius * 1.5);
    if (isRunning && Math.abs(physVel) > 1e-7) {
      const trailLen = Math.min(30, Math.abs(physVel) * 5000);
      const trailDir = physVel > 0 ? 1 : -1;
      const trailG = ctx.createLinearGradient(cx, eyeDropY, cx, eyeDropY + trailLen * trailDir);
      trailG.addColorStop(0, "rgba(253,224,71,0.3)"); trailG.addColorStop(1, "rgba(253,224,71,0)");
      ctx.fillStyle = trailG; ctx.fillRect(cx - 1.5, eyeDropY, 3, trailLen * trailDir);
    }
    const dG2 = ctx.createRadialGradient(cx - dropR * 0.3, eyeDropY - dropR * 0.3, dropR * 0.1, cx, eyeDropY, dropR);
    dG2.addColorStop(0, "#fffde7"); dG2.addColorStop(0.25, "#fde047"); dG2.addColorStop(0.6, "#d97706"); dG2.addColorStop(1, "#7c2d12");
    ctx.beginPath(); ctx.arc(cx, eyeDropY, dropR, 0, Math.PI * 2); ctx.fillStyle = dG2; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - dropR * 0.3, eyeDropY - dropR * 0.3, dropR * 0.25, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
    ctx.strokeStyle = "rgba(34,211,238,0.7)"; ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, eyeDropY, dropR + 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const distMM = ((eyeDropY - scaleBot) / (scaleTop - scaleBot) * 1).toFixed(2);
    ctx.fillStyle = "rgba(10,14,26,0.8)"; roundRect(ctx, cx + R * 0.28, eyeDropY - 11, 58, 16, 3); ctx.fill();
    ctx.fillStyle = "#22d3ee"; ctx.font = `bold ${Math.round(R * 0.07)}px monospace`; ctx.textAlign = "left";
    ctx.fillText(`d = ${distMM} mm`, cx + R * 0.30, eyeDropY + 2);
    ctx.restore();
    ctx.save();
    const rimG = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 12);
    rimG.addColorStop(0, "#334155"); rimG.addColorStop(0.5, "#475569"); rimG.addColorStop(1, "#1e293b");
    ctx.strokeStyle = rimG; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = "rgba(100,116,139,0.4)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  }

  // ================================================================
  // PENDULUM CANVAS
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
      const acc = -(G / sliders.length) * Math.sin(pendAngleRef.current) - 0.012 * pendOmegaRef.current;
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
      const fS = 45; const fg = sliders.mass * G;
      drawArrow(ctx, bobX, bobY, bobX, bobY + fg * fS, "#10B981", "W");
      const ft = sliders.mass * G * Math.cos(pendAngleRef.current) + sliders.mass * sliders.length * pendOmegaRef.current ** 2;
      drawArrow(ctx, bobX, bobY, bobX - ft * fS * Math.sin(pendAngleRef.current), bobY - ft * fS * Math.cos(pendAngleRef.current), "#3B82F6", "T");
    }

    // Period readout
    const T_theory = 2 * Math.PI * Math.sqrt(sliders.length / G);
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
    if (isMillikan) {
      const r = sliders.radius; const V = sliders.voltage;
      const { vf, vr } = millikanVelocities(r, V, chargeN, voltageOn);
      const tf_true = 1e-3 / vf; const tr_true = vr > 1e-7 ? 1e-3 / vr : 9999;
      const tf_obs = gaussianNoise(tf_true, tf_true * 0.015);
      const tr_obs = tr_true < 200 ? gaussianNoise(tr_true, tr_true * 0.015) : tr_true;
      const vf_obs = 1e-3 / tf_obs; const vr_obs = tr_true < 200 ? 1e-3 / tr_obs : 0;
      const q_calc = (STOKES_6PI * ETA * (r * 1e-6) * (vf_obs + vr_obs) * PLATE_D) / V;
      const q19 = q_calc * 1e19;
      const newTrial = { id: trials.length + 1, r, V, tf: tf_obs, tr: tr_obs, q: q19, n: Math.round(q_calc / E_CHARGE) };
      const updated = [...trials, newTrial]; setTrials(updated); localStorage.setItem(key, JSON.stringify(updated));
    } else {
      const L = sliders.length; const T_true = 2 * Math.PI * Math.sqrt(L / G);
      const T_obs = gaussianNoise(T_true, T_true * 0.015);
      const newTrial = { id: trials.length + 1, L, T: T_obs, T2: T_obs ** 2 };
      const updated = [...trials, newTrial]; setTrials(updated); localStorage.setItem(key, JSON.stringify(updated));
    }
  }

  // ── Non-active module ──
  if (!isActive) {
    const title = MODULE_TITLE[slug] || "Eksperimen Baru";
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col font-body">
        <header className="h-14 bg-white border-b border-border-default flex items-center justify-between px-6 sticky top-0 z-30">
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
              className="w-[72px] h-[72px] rounded-2xl bg-accent-cobalt/5 border border-accent-cobalt/10 flex items-center justify-center mx-auto mb-5 text-accent-cobalt">
              <Wrench className="w-8 h-8" />
            </motion.div>
            <div className="flex justify-center gap-2 mb-3">
              <Badge variant="outline" className="text-[10px] font-mono"><Lock className="w-2.5 h-2.5 mr-1" /> Segera Hadir</Badge>
            </div>
            <h2 className="font-display text-xl font-bold text-primary-navy mb-2">{title}</h2>
            <p className="text-xs text-text-muted leading-relaxed mb-6">Simulasi untuk topik ini sedang dikembangkan.</p>
            <Link href="/modules" className="block"><Button className="w-full cursor-pointer"><ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Katalog</Button></Link>
          </motion.div>
        </main>
      </div>
    );
  }

  const moduleTitle = isMillikan ? "Tetes Minyak Millikan" : "Bandul Sederhana";

  // Determine observation completion
  const observationDone = isMillikan
    ? (expSteps.sprayed && expSteps.viewSwapped && expSteps.voltageChanged && expSteps.xrayTriggered)
    : (isRunning || expSteps.voltageChanged);

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
              <span className="font-mono text-cyan-400 text-xs font-semibold tracking-wider">Sinar-X Aktif — Muatan → {chargeN}e</span>
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
          <button onClick={() => setShowVectors(!showVectors)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 border border-border-default hover:bg-gray-100 transition-all text-text-muted">
            {showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Vektor</span>
          </button>
          <Link href="/dashboard" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 border border-border-default hover:bg-gray-100 transition-all text-text-muted">
            <BarChart2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── CANVAS AREA ── */}
        <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden" style={{ background: isMillikan ? "#050810" : "#f0f4f8" }}>

          {/* Millikan view switcher */}
          {isMillikan && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm p-1 rounded-xl border border-slate-700/60 shadow-depth">
              {[{ id: "chamber", icon: <LayoutGrid className="w-3 h-3" />, label: "Chamber" },
                { id: "eyepiece", icon: <Microscope className="w-3 h-3" />, label: "Okular" }].map(v => (
                <button key={v.id} onClick={() => handleSetViewMode(v.id as any)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer",
                    viewMode === v.id ? "bg-accent-cobalt text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}>
                  {v.icon}{v.label}
                </button>
              ))}
            </div>
          )}

          {/* Canvas */}
          <canvas ref={isMillikan ? millikanRef : bandulRef} className="w-full h-full block" />

          {/* ── Simulation Controls (floating bottom) ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-depth border border-border-default/80">
              <button
                onClick={() => { setIsRunning(!isRunning); if (!isRunning && isMillikan) triggerAtomizer(); }}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all",
                  isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-accent-cobalt hover:bg-accent-cobalt-light text-white")}>
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? "Pause" : "Mulai"}
              </button>
              <button
                onClick={() => { setIsRunning(false); setStopwatch(0); dropFracRef.current = 0.5; if (isMillikan) triggerAtomizer(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-text-muted hover:text-text-primary hover:bg-gray-50 transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
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

            {/* Millikan-specific controls */}
            {isMillikan && (
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-depth border border-border-default/80">
                <button onClick={() => { setVoltageOn(!voltageOn); updateExpStep("voltageChanged", true); }}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all",
                    voltageOn ? "bg-amber-100 border border-amber-300 text-amber-700" : "bg-gray-100 border border-gray-200 text-gray-500")}>
                  <Zap className={cn("w-3 h-3", voltageOn && "animate-pulse")} />
                  {voltageOn ? `${sliders.voltage}V` : "Mati"}
                </button>
                <button onClick={triggerIonization}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer bg-cyan-900/30 border border-cyan-600/40 text-cyan-400 hover:bg-cyan-800/40 transition-all">
                  <Radio className="w-3 h-3" /> X-Ray
                </button>
              </div>
            )}
          </div>

          {/* Live physics HUD (Millikan) */}
          {isMillikan && (
            <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60 shadow-depth space-y-1.5 text-[9px] font-mono min-w-[152px]">
              <div className="text-slate-400 uppercase tracking-wider font-bold text-[8px] mb-1.5">Fisika Real-Time</div>
              {[
                { label: "r", value: `${sliders.radius.toFixed(2)} µm`, color: "text-yellow-400" },
                { label: "vf", value: `${(physics.vf * 1000).toFixed(3)} mm/s`, color: "text-red-400" },
                { label: "vr", value: physics.vr > 1e-8 ? `${(physics.vr * 1000).toFixed(3)} mm/s` : "—", color: physics.vr > 1e-8 ? "text-cyan-400" : "text-slate-500" },
                { label: "Fg", value: `${(physics.Fg * 1e14).toFixed(2)}×10⁻¹⁴N`, color: "text-orange-400" },
                { label: "Fe", value: voltageOn ? `${(physics.Fe * 1e14).toFixed(2)}×10⁻¹⁴N` : "—", color: voltageOn ? "text-blue-400" : "text-slate-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-slate-400">{label}</span>
                  <span className={cn("font-bold", color)}>{value}</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                <span className="text-slate-400">q</span>
                <span className="text-green-400 font-bold">{chargeN}e</span>
              </div>
            </div>
          )}
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
                      {(slug === "millikan" ? [
                        {
                          id: 1,
                          q: "Apa yang terjadi pada tetesan minyak bermuatan negatif jika medan listrik ke atas diperkuat?",
                          opts: ["Bergerak naik lebih cepat (gaya listrik ke atas meningkat)", "Bergerak jatuh lebih cepat", "Kecepatan tidak berubah"],
                          ans: 0,
                          exp: "Medan ke atas menarik muatan negatif ke atas (Fe = qE). Memperkuat medan mempercepat gerak naik droplet."
                        },
                        {
                          id: 2,
                          q: "Jika muatan listrik bersifat kontinu (bisa bernilai berapa saja), grafik sebaran q akan terlihat...",
                          opts: ["Mengelompok di kelipatan diskret tertentu (1.6e, 3.2e, ...)", "Terdistribusi menyebar merata tanpa pola tangga", "Hanya satu nilai identik di semua trial"],
                          ans: 1,
                          exp: "Muatan kontinu = bisa bernilai berapa saja tanpa pola. Muatan terkuantisasi akan mengelompok hanya di kelipatan bulat dari e."
                        },
                        {
                          id: 3,
                          q: "Mengapa sinar X-Ray ditembakkan ke dalam kamar kapasitor?",
                          opts: ["Mengukur radius tetes secara optik", "Mengionisasi udara sehingga droplet menangkap elektron bebas", "Memanaskan pelat tembaga"],
                          ans: 1,
                          exp: "Sinar-X mengionisasi molekul udara. Droplet minyak menangkap elektron bebas tersebut, mengubah muatan netto-nya."
                        }
                      ] : [
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
                      ]).map((q) => {
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
                        disabled={Object.keys(pretestAnswers).length < (slug === "millikan" ? 3 : 2)}
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
                      {isMillikan ? (
                        <>
                          <ChecklistItem label="Semprotkan minyak" desc="Klik 'Mulai' untuk menyemprotkan kabut minyak ke chamber." checked={expSteps.sprayed} />
                          <ChecklistItem label="Ganti ke tampilan Okular" desc="Klik 'Okular' di kiri atas kanvas — lihat droplet dari perspektif mikroskop." checked={expSteps.viewSwapped} />
                          <ChecklistItem label="Ubah tegangan / matikan medan" desc="Klik tombol tegangan di bawah. Perhatikan arah gerak droplet berubah." checked={expSteps.voltageChanged} />
                          <ChecklistItem label="Tembakkan X-Ray" desc="Klik 'X-Ray' dan lihat angka muatan berubah — ini ionisasi!" checked={expSteps.xrayTriggered} />
                        </>
                      ) : (
                        <>
                          <ChecklistItem label="Mulai ayunan bandul" desc="Klik 'Mulai' untuk mengaktifkan gerak bandul." checked={isRunning} />
                          <ChecklistItem label="Ubah panjang tali" desc="Pergi ke tab Pengukuran, ubah slider L, dan perhatikan perubahan kecepatan ayunan." checked={expSteps.voltageChanged} />
                          <ChecklistItem label="Amati vektor gaya" desc="Toggle 'Vektor' di kanan atas untuk melihat gaya berat dan tegangan tali." checked={showVectors} />
                        </>
                      )}
                    </div>

                    {/* Progress indicator */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-border-default/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-semibold text-text-muted">Progress</span>
                        <span className="text-[10px] font-mono font-bold text-accent-cobalt">
                          {isMillikan
                            ? `${Object.values(expSteps).filter(Boolean).length}/4`
                            : `${[isRunning, expSteps.voltageChanged, showVectors].filter(Boolean).length}/3`
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div className="bg-accent-cobalt h-1.5 rounded-full" initial={{ width: 0 }}
                          animate={{ width: isMillikan
                            ? `${Object.values(expSteps).filter(Boolean).length / 4 * 100}%`
                            : `${[isRunning, expSteps.voltageChanged, showVectors].filter(Boolean).length / 3 * 100}%`
                          }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border-default flex-shrink-0 bg-white">
                    <Button onClick={() => updateStep(2)}
                      disabled={isMillikan
                        ? !observationDone
                        : !(isRunning || expSteps.voltageChanged)
                      }
                      className="w-full cursor-pointer text-xs flex items-center justify-center gap-1.5">
                      Mulai Pengukuran <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    {!observationDone && (
                      <p className="text-[10px] text-text-muted text-center mt-2">Selesaikan semua checklist dulu.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: MEASUREMENT ── */}
              {currentStep === 2 && (
                <>
                  {/* Sliders */}
                  <div className="p-4 border-b border-border-default flex-shrink-0 space-y-4">
                    {isMillikan ? (
                      <>
                        <SliderField label="Tegangan (V)" unit="V" min={50} max={600} step={10}
                          value={sliders.voltage} onChange={v => { setSliders(p => ({ ...p, voltage: v })); updateExpStep("voltageChanged", true); }} />
                        <SliderField label="Radius Droplet (r)" unit="µm" min={1.0} max={2.5} step={0.1}
                          value={sliders.radius} onChange={v => setSliders(p => ({ ...p, radius: v }))} decimals={2} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={triggerIonization}
                            className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] cursor-pointer py-1.5 h-auto">
                            <Radio className="w-3 h-3 mr-1" /> Ionisasi
                          </Button>
                          <div className="bg-slate-50 border border-border-default/60 rounded-lg px-3 py-1.5 flex-1 text-center">
                            <span className="text-[8px] text-text-muted font-mono block uppercase">Muatan</span>
                            <span className="font-mono text-xs font-bold text-slate-800">q = {chargeN}e</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <SliderField label="Panjang Tali (L)" unit="m" min={0.2} max={1.0} step={0.05}
                          value={sliders.length} onChange={v => { setSliders(p => ({ ...p, length: v })); updateExpStep("voltageChanged", true); }} decimals={2} />
                        <SliderField label="Massa Beban (m)" unit="g" min={0.05} max={0.5} step={0.05}
                          value={sliders.mass} onChange={v => setSliders(p => ({ ...p, mass: v }))} displayFn={v => (v * 1000).toFixed(0)} />
                        <SliderField label="Sudut Awal (θ₀)" unit="°" min={5} max={30} step={1}
                          value={sliders.angle} onChange={v => setSliders(p => ({ ...p, angle: v }))} />
                      </>
                    )}
                  </div>

                  {/* Data table */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default flex-shrink-0">
                    <h3 className="font-display font-semibold text-xs text-primary-navy">Data Percobaan</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">{trials.length}/{MAX_TRIALS}</Badge>
                      {trials.length > 0 && (
                        <button onClick={handleResetLab}
                          className="text-[9px] text-danger font-semibold px-1.5 py-0.5 rounded border border-danger/30 hover:bg-danger/5 cursor-pointer transition-colors">
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 min-h-0">
                    <div className="rounded-xl border border-border-default overflow-hidden">
                      {isMillikan ? (
                        <table className="w-full text-[9px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-border-default">
                              {["#", "V", "tf (s)", "tr (s)", "q (10⁻¹⁹C)"].map(h => (
                                <th key={h} className="px-2 py-2 text-left font-display font-semibold text-text-muted">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {trials.length === 0 ? (
                              <tr><td colSpan={5} className="px-3 py-6 text-center text-[10px] text-text-muted italic">
                                Jalankan simulasi dan klik Rekam.
                              </td></tr>
                            ) : trials.map(t => (
                              <tr key={t.id} className="border-b border-border-default/50 hover:bg-accent-cobalt/[0.02] transition-colors">
                                <td className="px-2 py-1.5 font-mono text-text-muted">{t.id}</td>
                                <td className="px-2 py-1.5 font-mono">{t.V}</td>
                                <td className="px-2 py-1.5 font-mono">{t.tf.toFixed(2)}</td>
                                <td className="px-2 py-1.5 font-mono">{t.tr < 200 ? t.tr.toFixed(2) : "∞"}</td>
                                <td className="px-2 py-1.5 font-mono font-semibold text-accent-cobalt">{t.q.toFixed(3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-border-default">
                              {["#", "L (m)", "T (s)", "T² (s²)"].map(h => (
                                <th key={h} className="px-3 py-2 text-left font-display font-semibold text-text-muted">{h}</th>
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
                                <td className="px-3 py-2 font-mono text-text-muted">{t.id}</td>
                                <td className="px-3 py-2 font-mono">{t.L.toFixed(2)}</td>
                                <td className="px-3 py-2 font-mono">{t.T.toFixed(3)}</td>
                                <td className="px-3 py-2 font-mono font-semibold text-accent-cobalt">{t.T2.toFixed(3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Quick stats (Millikan) */}
                    {isMillikan && trials.length >= 2 && (() => {
                      const valid = trials.filter(t => t.n > 0 && t.q > 0);
                      const eEst = valid.length > 0 ? valid.reduce((s: number, t: any) => s + t.q / t.n, 0) / valid.length : 0;
                      const err = eEst > 0 ? Math.abs((eEst - 1.602) / 1.602 * 100) : 0;
                      return (
                        <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-border-default/60 space-y-1">
                          <div className="text-[8px] font-mono text-text-muted uppercase tracking-wider mb-1.5">Estimasi dari data</div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-text-muted font-mono">Estimasi e</span>
                            <span className="font-mono font-bold text-accent-cobalt">{eEst.toFixed(3)} ×10⁻¹⁹ C</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-text-muted font-mono">Galat vs literatur</span>
                            <span className={cn("font-mono font-bold", err < 3 ? "text-success" : "text-amber-500")}>{err.toFixed(2)}%</span>
                          </div>
                        </div>
                      );
                    })()}
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
