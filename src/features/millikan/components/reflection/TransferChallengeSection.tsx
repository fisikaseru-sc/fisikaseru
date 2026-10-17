// ============================================================
// FISIKASERU — TRANSFER CHALLENGE (P0)
// SPRINT E: Conceptual Application to a New Situation
// ============================================================

"use client";

import React, { useState } from "react";
import { Sparkles, HelpCircle, ArrowRight, CheckCircle2, FlaskConical, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackLearningEvent } from "../../analytics/learningEvents";

interface TransferChallengeProps {
  onTransferCompleted: (data: {
    studentExplanation: string;
    followUpInquiry: string;
    testedCandidate: number;
  }) => void;
  initialExplanation?: string;
  initialFollowUp?: string;
}

// The transfer scenario data from an independent experimenter
const TRANSFER_DATASET = [
  { id: 1, label: "Tetes A", q: 1.58 },
  { id: 2, label: "Tetes B", q: 3.21 },
  { id: 3, label: "Tetes C", q: 4.77 },
  { id: 4, label: "Tetes D", q: 6.42 },
];

export function TransferChallengeSection({
  onTransferCompleted,
  initialExplanation = "",
  initialFollowUp = "",
}: TransferChallengeProps) {
  const [explanation, setExplanation] = useState(initialExplanation);
  const [followUp, setFollowUp] = useState(initialFollowUp);
  const [testedUnit, setTestedUnit] = useState<number>(1.60);
  const [showFollowUp, setShowFollowUp] = useState<boolean>(Boolean(initialFollowUp));
  const [submitted, setSubmitted] = useState<boolean>(Boolean(initialExplanation));

  // Compute ratios for the transfer dataset against tested unit
  const transferRatios = TRANSFER_DATASET.map((d) => {
    const ratio = d.q / testedUnit;
    const nearest = Math.round(ratio);
    const dev = Math.abs(ratio - nearest);
    return {
      ...d,
      ratio,
      nearest,
      dev,
      isNear: dev <= 0.15,
    };
  });

  // Calculate anomaly 2.35 ratio
  const anomalyRatio = 2.35 / testedUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    trackLearningEvent("millikan", "transfer_explained", {
      explanationLength: explanation.trim().length,
      hasFollowUp: Boolean(followUp.trim()),
      testedUnit,
    });

    setSubmitted(true);
    onTransferCompleted({
      studentExplanation: explanation.trim(),
      followUpInquiry: followUp.trim(),
      testedCandidate: testedUnit,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Context & Narrative ── */}
      <div className="bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-accent-cobalt/5 border border-purple-500/20 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
              Uji Transfer Konsep · Skenario Baru
            </span>
          </div>
          <h3 className="font-display font-bold text-xl text-primary-navy">
            Menguji Pemahamanmu di Luar Data Laboratorium Awal
          </h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            Sains sejati terbukti ketika prinsip yang kamu temukan mampu menjelaskan fenomena pada data baru yang belum pernah kamu lihat sebelumnya.
          </p>
        </div>
      </div>

      {/* ── Scenario Presentation ── */}
      <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-cobalt" />
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Kasus: Hasil Pengukuran dari Peneliti Lain
            </h4>
          </div>
          <Badge variant="outline" size="sm" className="font-mono text-[10px]">
            Data Independen
          </Badge>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Seorang peneliti di laboratorium terpisah melakukan pengukuran muatan tetes minyak dan memperoleh 4 nilai berikut:
        </p>

        {/* Transfer Data Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRANSFER_DATASET.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 border border-border-default rounded-xl p-3 text-center space-y-1 shadow-xs"
            >
              <span className="text-[10px] font-mono text-text-muted uppercase block">
                {item.label}
              </span>
              <div className="font-mono font-bold text-sm text-primary-navy">
                {item.q.toFixed(2)}
              </div>
              <span className="text-[10px] text-text-muted font-mono">
                × 10⁻¹⁹ C
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Ratio Sandbox for Transfer Data */}
        <div className="bg-slate-50/70 border border-border-default/80 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-primary-navy">
              Uji Pembagian Nilai dengan Satuan yang Kamu Hipotesiskan:
            </span>
            <div className="flex items-center gap-1.5">
              {[1.20, 1.60, 2.00].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setTestedUnit(u);
                    trackLearningEvent("millikan", "transfer_attempted", { testedUnit: u });
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                    testedUnit === u
                      ? "bg-accent-cobalt text-white shadow-xs"
                      : "bg-white border border-border-default text-text-muted hover:bg-slate-100"
                  )}
                >
                  {u.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {transferRatios.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "p-2.5 rounded-lg border text-center space-y-0.5",
                  r.isNear ? "bg-emerald-50/60 border-emerald-200" : "bg-white border-border-default"
                )}
              >
                <div className="text-[10px] text-text-muted">{r.label} / {testedUnit.toFixed(2)}</div>
                <div className="font-bold text-primary-navy">{r.ratio.toFixed(2)}</div>
                <div className="text-[10px] font-sans text-slate-500">
                  {r.isNear ? `≈ ${r.nearest} (Bulat)` : `Deviasi ±${r.dev.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transfer Questions ── */}
      <form onSubmit={handleSubmit} className="bg-white border border-border-default rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="font-display font-bold text-sm text-primary-navy block flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-accent-cobalt" />
            1. Pertanyaan Transfer Konsep
          </label>
          <p className="text-xs text-text-muted leading-relaxed">
            Tanpa langsung mencari jawaban di buku teks, apa yang membuatmu menduga bahwa data di atas mendukung atau tidak mendukung gagasan tentang satuan dasar muatan?
          </p>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            placeholder="Jelaskan alasanmu (misalnya: perhatikan pola kelipatan atau rasio hasil pembagian nilai-nilai tersebut)..."
            className="w-full p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden text-xs leading-relaxed"
          />
        </div>

        {/* Follow-up challenge */}
        <div className="border-t border-border-default pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-display font-bold text-sm text-primary-navy block flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              2. Tantangan Lanjutan (Anomali Nilai)
            </label>
            {!showFollowUp && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFollowUp(true)}
                className="text-[10px] h-6 px-2 cursor-pointer text-accent-cobalt"
              >
                Buka Tantangan Ini
              </Button>
            )}
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Bagaimana jika dalam eksperimen tersebut ada tetesan kelima dengan muatan <b className="text-primary-navy font-mono">2.35 × 10⁻¹⁹ C</b> (hasil bagi dengan 1.60 adalah <span className="font-mono text-amber-600">{anomalyRatio.toFixed(2)}</span>)? Apa yang ingin kamu selidiki lebih lanjut?
          </p>

          {showFollowUp && (
            <textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              rows={2}
              placeholder="Contoh: Saya ingin memeriksa apakah ada ketidakpastian eksperimen, atau apakah ada partikel dengan muatan pecahan yang lebih kecil, atau menguji kembali pengukurannya..."
              className="w-full p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden text-xs leading-relaxed"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-text-muted italic">
            {submitted ? "✓ Jawaban transfer tersimpan" : "Jawab berdasarkan penalaranmu sendiri"}
          </span>
          <Button
            type="submit"
            disabled={!explanation.trim()}
            className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-semibold px-6 shadow-sm flex items-center gap-2"
          >
            {submitted ? "Perbarui Jawaban Transfer" : "Simpan Penjelasan Transfer"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
