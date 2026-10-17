"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, HelpCircle, ArrowRight, CheckCircle2, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentPrediction, PredictionHypothesis } from "../types";
import { trackLearningEvent } from "../analytics/learningEvents";

interface PredictionViewProps {
  slug: string;
  onComplete: (prediction: StudentPrediction) => void;
}

const HYPOTHESIS_OPTIONS: { id: PredictionHypothesis; label: string; desc: string }[] = [
  {
    id: "COMPLETELY_RANDOM",
    label: "A. Muatan Acak & Kontinu",
    desc: "Setiap tetes minyak menangkap muatan sembarang nilai tanpa aturan (misal 1.23, 2.71, 4.05, dll)."
  },
  {
    id: "ALL_SAME",
    label: "B. Semua Tetes Identik",
    desc: "Semua tetes minyak yang menangkap muatan listrik akan memiliki besar muatan yang sama persis."
  },
  {
    id: "QUANTIZED_PATTERN",
    label: "C. Pola Kelipatan Tertentu",
    desc: "Nilai muatan berbeda-beda, tetapi semuanya merupakan kelipatan dari suatu paket satuan dasar terkecil."
  },
  {
    id: "UNSURE",
    label: "D. Belum Yakin",
    desc: "Belum memiliki gambaran pasti tentang bagaimana sifat muatan listrik terbagi di alam."
  }
];

export function PredictionView({ slug, onComplete }: PredictionViewProps) {
  // Komponen dipakai di dalam ExperimentView (dynamic ssr:false) — lazy init
  // localStorage aman dari mismatch hidrasi. (Pembayaran debt lint: set-state-in-effect.)
  const [savedInit] = useState<StudentPrediction | null>(() => {
    try {
      const saved = localStorage.getItem(`fisikaseru:prediction:${slug}`);
      return saved ? (JSON.parse(saved) as StudentPrediction) : null;
    } catch (e) {
      console.error("Error reading saved prediction:", e);
      return null;
    }
  });
  const [selectedHypothesis, setSelectedHypothesis] = useState<PredictionHypothesis | null>(
    savedInit?.hypothesis ?? null
  );
  const [reasoning, setReasoning] = useState(savedInit?.reasoning || "");
  const [confidence, setConfidence] = useState(savedInit?.confidence || 3);
  const [isSaved, setIsSaved] = useState(Boolean(savedInit));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHypothesis) return;

    const predictionData: StudentPrediction = {
      hypothesis: selectedHypothesis,
      reasoning: reasoning.trim() || "(Tidak ada catatan tambahan)",
      confidence,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem(`fisikaseru:prediction:${slug}`, JSON.stringify(predictionData));
    trackLearningEvent("millikan", "prediction_submitted", {
      hypothesis: selectedHypothesis,
      confidence,
    });
    setIsSaved(true);
    onComplete(predictionData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* The Big Question Header */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-depth relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cobalt/20 rounded-full filter blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-accent-cobalt text-white border-0 text-[9px] font-mono uppercase tracking-wider">
              Step 1 · The Big Question
            </Badge>
          </div>
          <h3 className="font-display font-bold text-sm leading-snug text-white mb-1.5">
            &quot;Apakah muatan listrik dapat bernilai berapa saja?&quot;
          </h3>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Sebelum memulai observasi laboratorium, seorang ilmuwan selalu merumuskan hipotesis. 
            Menurutmu, jika kita mengukur muatan dari banyak tetes minyak, apa yang akan kita temukan?
          </p>
        </div>

        {/* Form Hipotesis */}
        <div className="space-y-2.5">
          <label className="text-xs font-display font-bold text-primary-navy block">
            Pilih Dugaan Awalmu:
          </label>
          <div className="space-y-2">
            {HYPOTHESIS_OPTIONS.map((opt) => {
              const isSelected = selectedHypothesis === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSelectedHypothesis(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? "bg-accent-cobalt/10 border-accent-cobalt text-accent-cobalt shadow-sm"
                      : "bg-white border-border-default hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display font-semibold text-xs text-primary-navy">
                      {opt.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-accent-cobalt bg-accent-cobalt text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-normal">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reasoning Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-display font-bold text-primary-navy block">
            Kenapa kamu berpikir demikian?
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Tuliskan alasan atau intuisimu (contoh: Menurut saya muatan berasal dari elektron yang tidak bisa dipotong...)"
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-border-default focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt placeholder:text-text-muted/60 transition-all resize-none bg-slate-50/50"
          />
        </div>

        {/* Confidence Slider */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-display font-semibold text-primary-navy">Tingkat Keyakinan:</span>
            <span className="font-mono font-bold text-accent-cobalt">
              {confidence === 1 && "1/5 (Sangat Ragu)"}
              {confidence === 2 && "2/5 (Agak Ragu)"}
              {confidence === 3 && "3/5 (Netral)"}
              {confidence === 4 && "4/5 (Cukup Yakin)"}
              {confidence === 5 && "5/5 (Sangat Yakin)"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-cobalt"
          />
          <div className="flex justify-between text-[9px] text-text-muted font-mono">
            <span>Tidak Yakin</span>
            <span>Sangat Yakin</span>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-border-default bg-white flex-shrink-0">
        <Button
          onClick={handleSubmit}
          disabled={!selectedHypothesis}
          className="w-full cursor-pointer text-xs font-semibold h-10 flex items-center justify-center gap-1.5"
        >
          {isSaved ? "Lanjut ke Observasi Lab" : "Kunci Prediksi & Masuk Lab"} 
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <p className="text-[10px] text-text-muted text-center mt-2">
          Prediksimu akan dikonfrontasikan dengan data eksperimen di akhir modul.
        </p>
      </div>
    </div>
  );
}

export function CompactPredictionCard({
  slug,
  onExpand
}: {
  slug: string;
  onExpand?: () => void;
}) {
  // Dipakai di dalam ExperimentView (dynamic ssr:false) — lazy init aman.
  // (Pembayaran debt lint: set-state-in-effect.)
  const [prediction] = useState<StudentPrediction | null>(() => {
    try {
      const saved = localStorage.getItem(`fisikaseru:prediction:${slug}`);
      return saved ? (JSON.parse(saved) as StudentPrediction) : null;
    } catch (_) {
      return null;
    }
  });

  const labelMap: Record<PredictionHypothesis, string> = {
    COMPLETELY_RANDOM: "Muatan Acak & Bebas",
    ALL_SAME: "Semua Tetes Identik",
    QUANTIZED_PATTERN: "Pola Kelipatan Dasar",
    UNSURE: "Belum Yakin"
  };

  if (!prediction) {
    return (
      <div className="bg-slate-50 border border-dashed border-border-default rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="text-text-muted text-[11px]">Dugaan awal belum dicatat</span>
        {onExpand && (
          <button onClick={onExpand} className="text-[10px] text-accent-cobalt font-semibold hover:underline cursor-pointer">
            Isi Dugaan
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50/80 border border-border-default/80 rounded-xl p-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" /> Dugaan Awalmu
        </span>
        {onExpand && (
          <button
            onClick={onExpand}
            className="text-[10px] text-accent-cobalt font-semibold hover:underline cursor-pointer"
          >
            Ubah
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-primary-navy text-[11px]">
          {labelMap[prediction.hypothesis]}
        </span>
        <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
          Keyakinan: {prediction.confidence}/5
        </Badge>
      </div>
      {prediction.reasoning && prediction.reasoning !== "(Tidak ada catatan tambahan)" && (
        <p className="text-[10px] text-text-muted italic line-clamp-2">
          &ldquo;{prediction.reasoning}&rdquo;
        </p>
      )}
    </div>
  );
}
