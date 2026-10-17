// ============================================================
// FISIKASERU — MILLIKAN REFLECTION EXPERIENCE
// SPRINT E: Learning Intelligence & Conceptual Validation Engine
// ============================================================

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight,
  HelpCircle, MessageCircle, Bot, User, Send, Download, Home,
  FileText, Atom, Layers, Compass, BrainCircuit, FlaskConical,
  Scale, ShieldAlert, AlertCircle, Lightbulb, Pause
} from "lucide-react";

const INTENT_LABELS: Record<string, string> = {
  INVITE_OBSERVATION: "Mencermati Detail Bukti",
  REQUEST_COMPARISON: "Membandingkan Perbedaan Nilai",
  PROBE_ASSUMPTION: "Menguji Asumsi Awal",
  REQUEST_EVIDENCE: "Menghubungkan Klaim dengan Data",
  TEST_HYPOTHESIS: "Menguji Hipotesis Lanjutan",
  HIGHLIGHT_CONTRADICTION: "Mendiskusikan Kontradiksi Pola",
  REFRAME_ERROR: "Memahami Ketidakpastian Pengukuran",
  CONNECT_PATTERN: "Menghubungkan Pola ke Satuan Dasar",
  REQUEST_EXPLANATION: "Mendalami Sebab-Akibat Fisis",
  INVITE_TRANSFER: "Menerapkan Konsep ke Data Baru",
  PROMPT_METACOGNITION: "Merefleksikan Perubahan Pemikiran",
  ALLOW_PRODUCTIVE_PAUSE: "Jeda Berpikir Mandiri",
};

const COGNITIVE_STATE_LABELS: Record<string, string> = {
  OBSERVING: "Mengamati Data",
  COMPARING: "Membandingkan",
  HYPOTHESIZING: "Membentuk Hipotesis",
  TESTING: "Menguji Nilai",
  PATTERN_RECOGNIZING: "Mengenali Keteraturan",
  EXPLAINING: "Menjelaskan Sebab-Akibat",
  RECONCILING: "Menyelaraskan Pemikiran",
  TRANSFERRING: "Mengaplikasikan Konsep",
  REFLECTING: "Refleksi Diri",
};

const THINKING_STARTERS = [
  "Saya memperhatikan bahwa...",
  "Menurut saya, hal ini terjadi karena...",
  "Bukti data yang paling kuat adalah...",
  "Saya masih ragu karena...",
];
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deriveMillikanAnalysisResult, MILLIKAN_CONSTANTS } from "@/features/millikan/simulation/physics";
import { StudentPrediction } from "@/features/millikan/types";
import { evaluateMillikanLearningState } from "../../intelligence/evaluator";
import { MillikanLearningSignals } from "../../intelligence/learningTypes";
import { trackLearningEvent } from "../../analytics/learningEvents";
import { TransferChallengeSection } from "./TransferChallengeSection";
import { ConfidenceRevisitSection } from "./ConfidenceRevisitSection";
import { ScientificJourneySummary } from "./ScientificJourneySummary";

export interface StudentReflectionData {
  metacognition: {
    thinkingChange: string;
    strongestEvidence: string;
    remainingQuestion: string;
  };
  studentConclusion: {
    claim: string;
    evidence: string;
    reasoning: string;
    pattern?: string;
    physicalMeaning?: string;
    strongestEvidence?: string;
  };
  transfer?: {
    studentExplanation: string;
    followUpInquiry: string;
    testedCandidate: number;
  };
  confidenceRevisit?: {
    currentConfidence: number;
    reasonForChange: string;
  };
  updatedAt: string;
}

export function MillikanReflectionExperience() {
  const [activeChapter, setActiveChapter] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [trials, setTrials] = useState<any[]>([]);
  const [savedPrediction, setSavedPrediction] = useState<StudentPrediction | null>(null);
  const [patternHistory, setPatternHistory] = useState<any[]>([]);

  // Reflection and conclusion state (CER framework)
  const [metacognition, setMetacognition] = useState({
    thinkingChange: "Saya berubah pikiran setelah melihat pola data",
    strongestEvidence: "Hasil bagi yang konsisten mendekati bilangan bulat",
    remainingQuestion: "",
  });

  const [conclusion, setConclusion] = useState({
    claim: "",
    evidence: "",
    reasoning: "",
  });

  const [transferData, setTransferData] = useState({
    studentExplanation: "",
    followUpInquiry: "",
    testedCandidate: 1.60,
  });

  const [confidenceData, setConfidenceData] = useState({
    currentConfidence: 4,
    reasonForChange: "",
  });

  // AI Dialogue state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "tutor" | "user"; text: string }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogueFinished, setDialogueFinished] = useState(false);
  const [recentIntents, setRecentIntents] = useState<string[]>([]);
  const [lastIntent, setLastIntent] = useState<string>("CONNECT_PATTERN");
  const [lastCognitiveState, setLastCognitiveState] = useState<string>("OBSERVING");
  const [isProductivePause, setIsProductivePause] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    // Dibaca di effect (bukan lazy init) karena komponen ini di-SSR:
    // render server harus konsisten dengan render klien pertama untuk
    // menghindari hydration mismatch; localStorage hanya ada di klien.
    // (Debt lint set-state-in-effect diterima secara sadar di sini.)
    // 1. Prediction
    try {
      const predRaw = localStorage.getItem("fisikaseru:prediction:millikan");
      if (predRaw) {
        const parsed = JSON.parse(predRaw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- pola hydration-safe untuk komponen SSR
        setSavedPrediction(parsed);
        if (parsed.confidence) {
          setConfidenceData((prev) => ({ ...prev, currentConfidence: parsed.confidence }));
        }
      }
    } catch (_) {}

    // 2. Trials
    try {
      const trialsRaw = localStorage.getItem("fisikaseru:trials:millikan");
      if (trialsRaw) {
        const parsed = JSON.parse(trialsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) setTrials(parsed);
      }
    } catch (_) {}

    // 3. Pattern History
    try {
      const histRaw = localStorage.getItem("fisikaseru:pattern-history:millikan");
      if (histRaw) setPatternHistory(JSON.parse(histRaw));
    } catch (_) {}

    // 4. Existing Reflection
    try {
      const refRaw = localStorage.getItem("fisikaseru:reflection:millikan");
      if (refRaw) {
        const parsed = JSON.parse(refRaw);
        if (parsed.metacognition) setMetacognition(parsed.metacognition);
        if (parsed.studentConclusion) {
          setConclusion({
            claim: parsed.studentConclusion.claim || parsed.studentConclusion.pattern || "",
            evidence: parsed.studentConclusion.evidence || parsed.studentConclusion.strongestEvidence || "",
            reasoning: parsed.studentConclusion.reasoning || parsed.studentConclusion.physicalMeaning || "",
          });
        }
        if (parsed.transfer) setTransferData(parsed.transfer);
        if (parsed.confidenceRevisit) setConfidenceData(parsed.confidenceRevisit);
      }
    } catch (_) {}
  }, []);

  // Single source of truth calculation from domain physics
  const analysisResult = useMemo(() => {
    return deriveMillikanAnalysisResult(trials);
  }, [trials]);

  // Build reactive learning signals
  const learningSignals: MillikanLearningSignals = useMemo(() => {
    return {
      prediction: {
        hypothesis: savedPrediction?.hypothesis || null,
        confidence: savedPrediction?.confidence || 3,
        reasoning: savedPrediction?.reasoning,
      },
      investigation: {
        trialsCollected: analysisResult.trialCount,
        candidatesTested: patternHistory.length || 1,
        candidateHistory: patternHistory.map((h) => ({
          candidate: h.candidate,
          meanDeviation: h.meanDeviation || 0.1,
          // eslint-disable-next-line react-hooks/purity -- fallback timestamp untuk riwayat lama tanpa testedAt; hanya pembulatan sinyal
          testedAt: h.testedAt || Date.now(),
        })),
        exploredNonIntegerCandidate: patternHistory.some((h) => (h.meanDeviation || 0) > 0.18),
        comparedMultipleCandidates: patternHistory.length >= 2,
      },
      discovery: {
        patternObserved: Boolean(analysisResult.calculatedE_corr !== null),
        discoveredCandidateUnit: patternHistory.length > 0 ? patternHistory[patternHistory.length - 1].candidate : 1.6,
        meanDeviation: analysisResult.stdDev ? analysisResult.stdDev / 1.6 : 0.05,
        nearIntegerPercentage: 85,
      },
      articulation: {
        claim: conclusion.claim,
        evidence: conclusion.evidence,
        reasoning: conclusion.reasoning,
      },
      transfer: {
        attempted: Boolean(transferData.studentExplanation),
        studentExplanation: transferData.studentExplanation,
        followUpInquiry: transferData.followUpInquiry,
        demonstratesTransfer: transferData.studentExplanation.length >= 15,
      },
      confidenceRevisit: {
        initialConfidence: savedPrediction?.confidence || 3,
        currentConfidence: confidenceData.currentConfidence,
        reasonForChange: confidenceData.reasonForChange,
      },
    };
  }, [savedPrediction, analysisResult, patternHistory, conclusion, transferData, confidenceData]);

  // Evaluate learning state using pure deterministic domain evaluator
  const conceptualEvaluation = useMemo(() => {
    return evaluateMillikanLearningState(learningSignals);
  }, [learningSignals]);

  // Persist reflection data whenever conclusion, transfer, or metacognition updates
  useEffect(() => {
    if (
      conclusion.claim ||
      conclusion.evidence ||
      conclusion.reasoning ||
      transferData.studentExplanation ||
      metacognition.remainingQuestion
    ) {
      const payload: StudentReflectionData = {
        metacognition,
        studentConclusion: {
          ...conclusion,
          pattern: conclusion.claim,
          strongestEvidence: conclusion.evidence,
          physicalMeaning: conclusion.reasoning,
        },
        transfer: transferData,
        confidenceRevisit: confidenceData,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem("fisikaseru:reflection:millikan", JSON.stringify(payload));
      } catch (_) {}
    }
  }, [metacognition, conclusion, transferData, confidenceData]);

  // Derive respectful classification for Chapter 2
  const outcomeClassification = useMemo(() => {
    const h = savedPrediction?.hypothesis;
    if (h === "QUANTIZED_PATTERN") {
      return {
        type: "SUPPORTED",
        badge: "Dugaan Terkonfirmasi Bukti",
        badgeVariant: "success" as const,
        narrative: "Dugaan awalmu mendapat dukungan kuat dari bukti data laboratorium. Kamu telah mengantisipasi adanya paket satuan dasar sebelum mengamati, dan keteraturan rasio empiris membuktikannya.",
      };
    }
    if (h === "ALL_SAME") {
      return {
        type: "REFINED",
        badge: "Dugaan Dipertajam oleh Data",
        badgeVariant: "primary" as const,
        narrative: "Data memberimu alasan untuk mempertajam dugaan awalmu. Tetesan tidak memiliki muatan yang bernilai sama persis satu sama lain, melainkan berbeda-beda namun semuanya dibangun dari kelipatan satu satuan dasar yang sama.",
      };
    }
    if (h === "COMPLETELY_RANDOM") {
      return {
        type: "CHALLENGED",
        badge: "Investigasi Membuka Cara Pandang Baru",
        badgeVariant: "warning" as const,
        narrative: "Investigasi ini memberikan bukti baru yang menantang dugaan awalmu. Muatan terbukti tidak tersebar acak bebas di sembarang desimal, melainkan mengelompok secara konsisten pada anak tangga kelipatan diskret.",
      };
    }
    return {
      type: "DEVELOPED",
      badge: "Berkembang Melalui Investigasi",
      badgeVariant: "primary" as const,
      narrative: "Pada awalnya kamu belum yakin dengan bagaimana muatan terbagi. Melalui pengumpulan bukti dan pengujian kandidat satuan secara mandiri, kamu berhasil membangun pemahaman baru berdasarkan fakta empiris.",
    };
  }, [savedPrediction]);

  // Initialize chat when entering Chapter 5
  useEffect(() => {
    if (activeChapter === 5 && chatMessages.length === 0) {
      const initialPrompt = savedPrediction?.hypothesis === "COMPLETELY_RANDOM"
        ? "Hai Sobat Sains! Di awal eksperimen, kamu menduga muatan listrik bernilai acak sembarang. Setelah kamu menguji sendiri rasio pembagian dan membuktikan keteraturan kelipatan bulat pada tetesan minyak, bagian bukti mana yang paling membuatmu mengubah pemikiran tersebut?"
        : "Hai Sobat Sains! Kamu telah berhasil meneliti bagaimana muatan listrik pada tetesan minyak selalu merupakan kelipatan bilangan bulat dari satu paket terkecil (e). Menurutmu, mengapa fakta bahwa muatan tidak kontinu seperti air mengalir ini sangat revolusioner bagi model atom fisika modern?";

      // eslint-disable-next-line react-hooks/set-state-in-effect -- init chat sekali saat bab dibuka; render klien pertama konsisten dengan SSR (chat kosong)
      setChatMessages([{ role: "tutor", text: initialPrompt }]);
    }
  }, [activeChapter, chatMessages.length, savedPrediction]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  // Send message to Socratic AI with learning intelligence context
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isGenerating || dialogueFinished) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userText = currentInput.trim();
    setCurrentInput("");
    setIsGenerating(true);
    setIsProductivePause(false);

    const updated = [...chatMessages, { role: "user" as const, text: userText }];
    setChatMessages(updated);

    try {
      const res = await fetch("/api/ai/socratic", {
        method: "POST",
        signal: abortControllerRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug: "millikan",
          trials: analysisResult.sortedTrials,
          prediction: savedPrediction,
          qId: `reflection_turn_${chatMessages.length}`,
          userResponse: userText,
          history: updated,
          recentIntents,
          learningContext: {
            studentPrediction: savedPrediction,
            predictionOutcome: outcomeClassification.type,
            candidateUnit: patternHistory.length > 0 ? patternHistory[patternHistory.length - 1].candidate : 1.6,
            evidenceSummary: analysisResult.evidenceSummary,
            metacognition,
            studentConclusion: {
              pattern: conclusion.claim,
              strongestEvidence: conclusion.evidence,
              physicalMeaning: conclusion.reasoning,
            },
            conceptualStage: conceptualEvaluation.stage,
            evidenceQuality: conceptualEvaluation.evidenceQuality,
            possibleMisconceptions: conceptualEvaluation.possibleConceptualSignals.map((s) => s.code),
            transferAttempted: Boolean(transferData.studentExplanation),
          },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) => [...prev, { role: "tutor", text: data.reply }]);
        if (data.usedIntent) {
          setLastIntent(data.usedIntent);
          setRecentIntents((prev) => [...prev, data.usedIntent].slice(-4));
        }
        if (data.cognitiveState) {
          setLastCognitiveState(data.cognitiveState);
        }
        if (updated.filter((m) => m.role === "user").length >= 3) {
          setDialogueFinished(true);
        }
      } else {
        throw new Error("No response");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      // Socratic offline fallback without answers
      setChatMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: "Penalaran yang sangat baik, Sobat Sains. Keteraturan ini membuktikan bahwa muatan bukanlah fluida kontinu tanpa batas, melainkan dibangun oleh paket diskret fundamental. Mari kita simpan perjalanan refleksi ilmiahmu hari ini!",
        },
      ]);
      setDialogueFinished(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProductivePause = () => {
    setIsProductivePause(true);
    setLastIntent("ALLOW_PRODUCTIVE_PAUSE");
    setChatMessages((prev) => [
      ...prev,
      {
        role: "tutor",
        text: "Tentu, luangkan waktu sejenak untuk menelaah datamu. Berpikir mendalam memerlukan ketenangan dan perenungan. Aku akan tetap di sini saat kamu siap mendiskusikan temuanmu.",
      },
    ]);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      {/* ─── Printable Document View (Hidden on Screen, Visible on Print) ─── */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-sans text-xs space-y-6">
        <div className="border-b-2 border-slate-900 pb-3">
          <h1 className="text-xl font-bold">Laporan Refleksi Saintifik &amp; Kuantisasi Muatan — Eksperimen Millikan</h1>
          <p className="text-[10px] text-slate-500">Platform Pembelajaran Inkuiri FisikaSeru · Validasi Bukti Konseptual</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-slate-50">
            <h4 className="font-bold text-[11px] mb-1">Dugaan Awal (Sebelum Eksperimen)</h4>
            <p>Hipotesis: <i>{savedPrediction?.hypothesis || "Belum tercatat"}</i></p>
            <p className="mt-1">Alasan: "{savedPrediction?.reasoning || "—"}"</p>
            <p className="mt-1">Keyakinan Awal: {savedPrediction?.confidence || 3}/5</p>
          </div>

          <div className="p-3 border rounded-lg bg-slate-50">
            <h4 className="font-bold text-[11px] mb-1">Hasil Analisis Empiris Laboratorium</h4>
            <p>Tetes Diobservasi: {analysisResult.trialCount}</p>
            <p>Satuan Terukur (e): {analysisResult.calculatedE_corr ? `${analysisResult.calculatedE_corr.toFixed(4)} × 10⁻¹⁹ C` : "Data belum cukup"}</p>
            <p>Tingkat Kualitas Bukti: {conceptualEvaluation.evidenceQualityLabel}</p>
          </div>
        </div>

        <div className="border p-4 rounded-lg space-y-3">
          <h4 className="font-bold text-sm">Kesimpulan Ilmiah Mandiri Siswa (Klaim - Bukti - Penalaran)</h4>
          <div>
            <p className="font-semibold text-slate-700">1. Apa Temuanmu? (Klaim):</p>
            <p className="italic text-slate-900 mt-0.5">{conclusion.claim || "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">2. Bukti Apa yang Mendukungnya?:</p>
            <p className="italic text-slate-900 mt-0.5">{conclusion.evidence || "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">3. Mengapa Bukti Itu Mendukung Temuanmu? (Penalaran Fisika):</p>
            <p className="italic text-slate-900 mt-0.5">{conclusion.reasoning || "—"}</p>
          </div>
        </div>

        {transferData.studentExplanation && (
          <div className="border p-4 rounded-lg space-y-2">
            <h4 className="font-bold text-sm">Aplikasi pada Skenario Baru (Transfer Challenge)</h4>
            <p><b>Penjelasan Data Peneliti Lain:</b> {transferData.studentExplanation}</p>
            {transferData.followUpInquiry && (
              <p><b>Investigasi Anomali:</b> {transferData.followUpInquiry}</p>
            )}
          </div>
        )}

        <div className="border p-4 rounded-lg space-y-2">
          <h4 className="font-bold text-sm">Refleksi Metakognitif &amp; Keyakinan</h4>
          <p><b>Perubahan Keyakinan:</b> Dari {savedPrediction?.confidence || 3}/5 menjadi {confidenceData.currentConfidence}/5</p>
          <p><b>Alasan Perubahan Keyakinan:</b> {confidenceData.reasonForChange || "—"}</p>
          <p><b>Pertanyaan yang Masih Mengundang Rasa Ingin Tahu:</b> {metacognition.remainingQuestion || "—"}</p>
        </div>
      </div>

      {/* ─── Chapter Progress Header (5 Chapters) ─── */}
      <div className="bg-white border border-border-default rounded-2xl p-2.5 shadow-sm print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {[
            { id: 1, label: "01. Temuanmu", desc: "Rekap Bukti Empiris", icon: FileText },
            { id: 2, label: "02. Dugaan vs Fakta", desc: "Komparasi Hipotesis", icon: Compass },
            { id: 3, label: "03. Uji Transfer", desc: "Skenario Data Baru", icon: FlaskConical },
            { id: 4, label: "04. Kesimpulan CER", desc: "Klaim · Bukti · Nalar", icon: BrainCircuit },
            { id: 5, label: "05. Narasi Ilmiah", desc: "Perjalananmu & AI", icon: MessageCircle },
          ].map((c) => {
            const isActive = activeChapter === c.id;
            const isDone = activeChapter > c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChapter(c.id as any)}
                className={cn(
                  "p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2",
                  isActive
                    ? "bg-accent-cobalt text-white shadow-sm ring-1 ring-accent-cobalt"
                    : isDone
                    ? "bg-slate-50 text-primary-navy hover:bg-slate-100"
                    : "text-text-muted hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                    isActive
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-display font-semibold block truncate leading-tight">
                    {c.label}
                  </span>
                  <span className={cn("text-[9px] truncate block mt-0.5", isActive ? "text-white/80" : "text-text-muted")}>
                    {c.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CHAPTER 1: LOOK BACK AT THE DISCOVERY ─── */}
      {activeChapter === 1 && (
        <motion.div
          key="chap1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 print:hidden"
        >
          <div className="bg-gradient-to-r from-accent-cobalt/5 via-teal/5 to-sky-500/5 border border-accent-cobalt/20 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-cobalt" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
                  Bab 01 · Rekap Penemuanmu
                </span>
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-primary-navy">
                Kembali ke Fakta Empiris yang Kamu Buktikan
              </h2>
              <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                Sebelum merefleksikan bagaimana pemikiranmu berkembang, mari kita tinjau kembali data konkret yang kamu kumpulkan di dalam bilik eksperimen.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-text-muted font-display uppercase tracking-wider">Tetes Minyak Terekam</span>
              <div className="font-mono text-2xl font-bold text-primary-navy">{analysisResult.trialCount} <span className="text-xs text-text-muted font-normal font-sans">droplet</span></div>
              <p className="text-[10px] text-slate-500">Masing-masing memiliki ukuran &amp; waktu jatuh unik</p>
            </div>

            <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-text-muted font-display uppercase tracking-wider">Satuan Dasar Terukur (e)</span>
              <div className="font-mono text-2xl font-bold text-teal">
                {analysisResult.calculatedE_corr !== null ? (
                  <>{analysisResult.calculatedE_corr.toFixed(3)} <span className="text-xs text-text-muted font-sans font-normal">× 10⁻¹⁹ C</span></>
                ) : (
                  <span className="text-xs text-amber-600 font-sans">Data belum cukup</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">Hasil penurunan dari kesetimbangan Stokes &amp; Cunningham</p>
            </div>

            <div className="bg-white border border-border-default rounded-xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] text-text-muted font-display uppercase tracking-wider">Sifat Struktur</span>
              <div className="font-mono text-xl font-bold text-indigo-700">Terkuantisasi</div>
              <p className="text-[10px] text-slate-500">Rasio hasil pembagian berkali-kali mendekati bilangan bulat</p>
            </div>
          </div>

          {/* Model Comparison Card */}
          <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-primary-navy">
              Pergeseran Model: Kontinu vs Terkuantisasi
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-border-default rounded-xl p-4 space-y-2">
                <span className="font-mono font-bold text-[10px] text-text-muted uppercase">Model Kontinu (Dugaan Awal Umum)</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Muatan listrik dianggap zat cair bebas yang dapat bernilai pecahan berapa saja di sepanjang garis tanpa ada batas minimum.
                </p>
              </div>
              <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 space-y-2">
                <span className="font-mono font-bold text-[10px] text-teal uppercase">Model Kuantisasi (Hasil Bukti Nyata)</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Muatan listrik selalu dibawa dalam paket diskret terkecil $e$. Setiap muatan adalah perkalian bilangan bulat $q = n \times e$.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="md"
              onClick={() => setActiveChapter(2)}
              className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-semibold px-6 shadow-sm flex items-center gap-2"
            >
              Lanjut: Bandingkan dengan Dugaan Awalmu <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── CHAPTER 2: COMPARE YOUR THINKING ─── */}
      {activeChapter === 2 && (
        <motion.div
          key="chap2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 print:hidden"
        >
          <div className="bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-accent-cobalt/5 border border-amber-500/20 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  Bab 02 · Membandingkan Pemikiran
                </span>
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-primary-navy">
                Bagaimana Data Mengubah Pemikiran Awalmu?
              </h2>
              <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                Dalam sains sejati, dugaan awal yang berbeda dari data bukanlah kegagalan. Dugaan awal adalah batu pijakan untuk membentuk pemahaman baru.
              </p>
            </div>
          </div>

          {/* Confrontation Card */}
          <div className="bg-white rounded-2xl border border-border-default shadow-card overflow-hidden">
            {/* Top: Initial Prediction */}
            <div className="p-5 border-b border-border-default bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Apa Dugaan Awalmu?
                </span>
                {savedPrediction && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                    <span className="text-[10px] text-text-muted">Keyakinan:</span>
                    <span className="text-amber-500 font-bold">
                      {"●".repeat(savedPrediction.confidence || 3)}
                      {"○".repeat(5 - (savedPrediction.confidence || 3))}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-sm font-semibold text-primary-navy">
                {savedPrediction?.hypothesis === "COMPLETELY_RANDOM" && "Muatan listrik dapat bernilai berapa saja secara acak & kontinu"}
                {savedPrediction?.hypothesis === "ALL_SAME" && "Semua tetes minyak memiliki nilai muatan yang persis sama"}
                {savedPrediction?.hypothesis === "QUANTIZED_PATTERN" && "Nilai muatan berbeda-beda tetapi merupakan kelipatan dari suatu satuan terkecil"}
                {savedPrediction?.hypothesis === "UNSURE" && "Belum yakin bagaimana sifat muatan listrik terbagi"}
                {!savedPrediction && "Dugaan awal belum sempat tercatat pada sistem"}
              </div>

              {savedPrediction?.reasoning && savedPrediction.reasoning !== "(Tidak ada catatan tambahan)" && (
                <div className="bg-white p-3 rounded-xl border border-border-default/60 text-xs text-slate-600 italic">
                  <span className="not-italic font-bold text-primary-navy block text-[10px] uppercase font-mono mb-1">
                    Alasan yang Kamu Tuliskan:
                  </span>
                  "{savedPrediction.reasoning}"
                </div>
              )}
            </div>

            {/* Bottom: Evidence & Respectful Outcome */}
            <div className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
                  Apa yang Ditunjukkan oleh Data Eksperimenmu?
                </span>
                <Badge variant={outcomeClassification.badgeVariant} size="sm">
                  {outcomeClassification.badge}
                </Badge>
              </div>

              <p className="text-xs text-primary-navy leading-relaxed">
                {outcomeClassification.narrative}
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-border-default/60 text-[11px] font-mono text-slate-600 flex justify-between items-center flex-wrap gap-2">
                <span>Rata-rata Satuan Terukur: <b className="text-teal font-bold">{analysisResult.calculatedE_corr !== null ? `${analysisResult.calculatedE_corr.toFixed(3)} × 10⁻¹⁹ C` : "—"}</b></span>
                <span>Standar Referensi NIST: <b className="text-primary-navy font-bold">{MILLIKAN_CONSTANTS.E_REF} × 10⁻¹⁹ C</b></span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveChapter(1)}
              className="text-xs cursor-pointer border-border-default"
            >
              Kembali
            </Button>
            <Button
              size="md"
              onClick={() => setActiveChapter(3)}
              className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-semibold px-6 shadow-sm flex items-center gap-2"
            >
              Lanjut: Uji Pemahaman Baru (Transfer) <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── CHAPTER 3: TRANSFER CHALLENGE (P0) ─── */}
      {activeChapter === 3 && (
        <motion.div
          key="chap3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 print:hidden"
        >
          <TransferChallengeSection
            initialExplanation={transferData.studentExplanation}
            initialFollowUp={transferData.followUpInquiry}
            onTransferCompleted={(data) => {
              setTransferData(data);
            }}
          />

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveChapter(2)}
              className="text-xs cursor-pointer border-border-default"
            >
              Kembali
            </Button>
            <Button
              size="md"
              onClick={() => setActiveChapter(4)}
              className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-semibold px-6 shadow-sm flex items-center gap-2"
            >
              Lanjut: Rumuskan Kesimpulan CER <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── CHAPTER 4: CER SCIENTIFIC CONCLUSION & CONFIDENCE REVISIT ─── */}
      {activeChapter === 4 && (
        <motion.div
          key="chap4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 print:hidden"
        >
          <div className="bg-gradient-to-r from-teal/5 via-indigo-500/5 to-accent-cobalt/5 border border-teal/20 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-teal" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal">
                  Bab 04 · Kesimpulan Mandiri &amp; Metakognisi
                </span>
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-primary-navy">
                Rumuskan Kesimpulan Ilmiahmu (Klaim · Bukti · Penalaran)
              </h2>
              <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                Sains bukan sekadar menghafal hasil orang lain, melainkan kemampuan menyatakan klaim yang didukung bukti data dan penalaran sebab-akibat yang logis.
              </p>
            </div>
          </div>

          {/* Guided CER Student Scientific Conclusion */}
          <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default pb-3">
              <h3 className="font-display font-bold text-sm text-primary-navy">
                Struktur Kesimpulan Ilmiah Mandiri
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                <span className="text-[10px] font-bold">Status:</span>
                <span className={cn(
                  "font-sans font-semibold text-[11px]",
                  conceptualEvaluation.cerEvaluation.isCompleteCER ? "text-emerald-700" : "text-amber-600"
                )}>
                  {conceptualEvaluation.cerEvaluation.overallStatusDescription}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Claim */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-display font-semibold text-text-primary block">
                    1. Apa temuan utamamu? (Klaim / Kesimpulan)
                  </label>
                  {conceptualEvaluation.cerEvaluation.hasClaim && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Klaim terdeteksi
                    </span>
                  )}
                </div>
                <textarea
                  value={conclusion.claim}
                  onChange={(e) => setConclusion({ ...conclusion, claim: e.target.value })}
                  placeholder="Contoh: Muatan pada tetesan minyak tidak bernilai sembarang, melainkan selalu merupakan kelipatan dari suatu satuan dasar terkecil..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden font-sans transition-all text-xs"
                />
                {!conceptualEvaluation.cerEvaluation.hasClaim && (
                  <p className="text-[11px] text-text-muted italic">
                    💡 {conceptualEvaluation.cerEvaluation.claimFeedback}
                  </p>
                )}
              </div>

              {/* 2. Evidence */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-display font-semibold text-text-primary block">
                    2. Bukti apa dari eksperimen yang mendukung temuanmu? (Data konkret)
                  </label>
                  {conceptualEvaluation.cerEvaluation.hasEvidence && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Bukti terdeteksi
                    </span>
                  )}
                </div>
                <textarea
                  value={conclusion.evidence}
                  onChange={(e) => setConclusion({ ...conclusion, evidence: e.target.value })}
                  placeholder="Contoh: Saat nilai muatan dibagi dengan kandidat ~1.60 × 10⁻¹⁹ C, rasionya berkali-kali mendekati bilangan bulat 1, 2, 3, dan 4 pada garis bilangan..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden font-sans transition-all text-xs"
                />
                {!conceptualEvaluation.cerEvaluation.hasEvidence && (
                  <p className="text-[11px] text-text-muted italic">
                    💡 {conceptualEvaluation.cerEvaluation.evidenceFeedback}
                  </p>
                )}
              </div>

              {/* 3. Reasoning */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-display font-semibold text-text-primary block">
                    3. Mengapa bukti itu mendukung temuanmu? (Penalaran Fisika)
                  </label>
                  {conceptualEvaluation.cerEvaluation.hasReasoning && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Penalaran terdeteksi
                    </span>
                  )}
                </div>
                <textarea
                  value={conclusion.reasoning}
                  onChange={(e) => setConclusion({ ...conclusion, reasoning: e.target.value })}
                  placeholder="Contoh: Hal ini terjadi karena tetesan minyak menangkap sejumlah integer elektron partikel dasar, sehingga muatan listrik bersifat diskret (terkuantisasi)..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden font-sans transition-all text-xs"
                />
                {!conceptualEvaluation.cerEvaluation.hasReasoning && (
                  <p className="text-[11px] text-text-muted italic">
                    💡 {conceptualEvaluation.cerEvaluation.reasoningFeedback}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Possible Misconception Signals Alert (Constructive & Respectful) */}
          {conceptualEvaluation.possibleConceptualSignals.length > 0 && (
            <div className="space-y-3">
              {conceptualEvaluation.possibleConceptualSignals.map((sig) => (
                <div
                  key={sig.code}
                  className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs font-sans text-amber-950 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-display font-bold text-amber-900 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Sudut Pandang untuk Diperiksa: {sig.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    {sig.description}
                  </p>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/50 text-[11px] text-amber-900 font-medium italic">
                    💡 <b>Pertanyaan Reflektif:</b> {sig.constructivePrompt}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confidence Revisit Section */}
          <ConfidenceRevisitSection
            initialConfidence={savedPrediction?.confidence || 3}
            savedCurrentConfidence={confidenceData.currentConfidence}
            savedReasonForChange={confidenceData.reasonForChange}
            onConfidenceChange={(data) => {
              setConfidenceData(data);
            }}
          />

          {/* Remaining Curiosity Question */}
          <div className="bg-white border border-border-default rounded-2xl p-5 shadow-sm space-y-2 text-xs">
            <label className="font-semibold text-primary-navy block">
              Bagian mana dari eksperimen ini yang masih membuatmu penasaran? (Opsional)
            </label>
            <input
              type="text"
              value={metacognition.remainingQuestion}
              onChange={(e) => setMetacognition({ ...metacognition, remainingQuestion: e.target.value })}
              placeholder="Contoh: Mengapa elektron memiliki massa yang sangat kecil dibanding proton?"
              className="w-full p-2.5 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden text-xs"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveChapter(3)}
              className="text-xs cursor-pointer border-border-default"
            >
              Kembali
            </Button>
            <Button
              size="md"
              onClick={() => {
                trackLearningEvent("millikan", "reflection_submitted", {
                  isCompleteCER: conceptualEvaluation.cerEvaluation.isCompleteCER,
                  stage: conceptualEvaluation.stage,
                });
                setActiveChapter(5);
              }}
              className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-semibold px-6 shadow-sm flex items-center gap-2"
            >
              Lanjut: Lihat Perjalanan Saintifikmu <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── CHAPTER 5: SCIENTIFIC JOURNEY NARRATIVE & SOCRATIC DIALOGUE ─── */}
      {activeChapter === 5 && (
        <motion.div
          key="chap5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 print:hidden"
        >
          {/* 5-Stage Scientific Journey Narrative Summary */}
          <ScientificJourneySummary
            prediction={savedPrediction}
            trialsCount={analysisResult.trialCount}
            candidatesTestedCount={patternHistory.length || 1}
            finalCandidateUnit={patternHistory.length > 0 ? patternHistory[patternHistory.length - 1].candidate : 1.60}
            conclusion={conclusion}
            remainingQuestion={metacognition.remainingQuestion}
            cerEvaluation={conceptualEvaluation.cerEvaluation}
            onDownloadReport={handlePrint}
          />

          {/* Socratic Dialogue Section — Socratic Thinking Partner Studio */}
          <div className="bg-white rounded-2xl border border-border-default shadow-sm overflow-hidden space-y-0">
            {/* Header with intent and cognitive state badges */}
            <div className="p-4 border-b border-border-default bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-accent-cobalt text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-primary-navy">
                    Teman Berpikir Sokratis (Thinking Partner)
                  </h4>
                  <p className="text-[10px] text-text-muted">
                    Mode Kognitif: <b className="text-primary-navy font-semibold">{COGNITIVE_STATE_LABELS[lastCognitiveState] || "Meneliti Data"}</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="sm" className="text-[10px] font-sans">
                  Fokus: {INTENT_LABELS[lastIntent] || "Penyelidikan Saintifik"}
                </Badge>
                {!dialogueFinished && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleProductivePause}
                    className="text-[10px] h-6 px-2 cursor-pointer border-border-default text-text-muted hover:text-primary-navy flex items-center gap-1"
                    title="Ambil jeda waktu berpikir mandiri tanpa tekanan menjawab segera"
                  >
                    <Pause className="w-3 h-3" />
                    Jeda Berpikir
                  </Button>
                )}
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto bg-slate-50/40 font-sans">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs",
                      msg.role === "tutor" ? "bg-accent-cobalt text-white" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {msg.role === "tutor" ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-xs leading-relaxed",
                      msg.role === "tutor"
                        ? "bg-white border border-border-default text-primary-navy rounded-tl-none shadow-xs"
                        : "bg-accent-cobalt text-white rounded-tr-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isGenerating && (
                <div className="flex gap-2.5 mr-auto max-w-[90%]">
                  <div className="w-7 h-7 rounded-full bg-accent-cobalt flex items-center justify-center flex-shrink-0 text-white animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-border-default rounded-2xl rounded-tl-none px-4 py-3 text-xs text-text-muted">
                    Sedang merenungkan tanggapanmu...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Thinking Starters Chips */}
            {!dialogueFinished && (
              <div className="px-4 py-2 bg-slate-50/80 border-t border-border-default/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[10px] font-mono text-text-muted flex-shrink-0 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Pemantik Berpikir:
                </span>
                {THINKING_STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentInput((prev) => (prev ? `${prev} ${starter}` : starter));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-border-default hover:border-accent-cobalt/40 text-slate-700 hover:text-accent-cobalt transition-colors cursor-pointer flex-shrink-0 text-[10px]"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-border-default p-3 flex gap-2 bg-white">
              <input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={isGenerating || dialogueFinished}
                placeholder={dialogueFinished ? "Dialog telah tuntas — silakan unduh laporan atau kembali ke katalog" : "Ketikkan pemikiran atau alasanmu di sini..."}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-accent-cobalt transition-all disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={isGenerating || !currentInput.trim() || dialogueFinished}
                className="px-4 py-2.5 h-auto text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
