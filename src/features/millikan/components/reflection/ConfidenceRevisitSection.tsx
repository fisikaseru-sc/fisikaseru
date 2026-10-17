// ============================================================
// FISIKASERU — LEARNING CONFIDENCE REVISIT
// SPRINT E: Intellectual Humility & Metacognitive Calibration
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackLearningEvent } from "../../analytics/learningEvents";

interface ConfidenceRevisitProps {
  initialConfidence: number; // 1 - 5
  onConfidenceChange: (data: {
    currentConfidence: number;
    reasonForChange: string;
  }) => void;
  savedCurrentConfidence?: number;
  savedReasonForChange?: string;
}

export function ConfidenceRevisitSection({
  initialConfidence = 3,
  onConfidenceChange,
  savedCurrentConfidence = 4,
  savedReasonForChange = "",
}: ConfidenceRevisitProps) {
  const [currentConfidence, setCurrentConfidence] = useState<number>(savedCurrentConfidence);
  const [reason, setReason] = useState<string>(savedReasonForChange);

  const isDecreased = currentConfidence < initialConfidence;
  const isIncreased = currentConfidence > initialConfidence;
  const isSame = currentConfidence === initialConfidence;

  useEffect(() => {
    onConfidenceChange({
      currentConfidence,
      reasonForChange: reason,
    });
  }, [currentConfidence, reason, onConfidenceChange]);

  const handleRatingSelect = (rating: number) => {
    setCurrentConfidence(rating);
    trackLearningEvent("millikan", "confidence_revisited", {
      initialConfidence,
      currentConfidence: rating,
      diff: rating - initialConfidence,
    });
  };

  return (
    <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm space-y-5 font-sans">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-accent-cobalt" />
        <h4 className="font-display font-bold text-sm text-primary-navy">
          Kalibrasi Keyakinan Berpikir (Metakognisi)
        </h4>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Dalam sains, keyakinan tidak harus selalu bertambah. Menyadari bahwa suatu fenomena memiliki kedalaman dan variabel tak terduga adalah bukti kedewasaan berpikir saintifik (*intellectual humility*).
      </p>

      {/* Comparison Grid: Before vs Now */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Before */}
        <div className="p-4 bg-slate-50 border border-border-default rounded-xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
            Sebelum Eksperimen (Dugaan Awal)
          </span>
          <div className="flex items-center gap-2 text-sm font-mono text-amber-500">
            <span className="font-bold text-base text-primary-navy">{initialConfidence}/5</span>
            <span className="tracking-widest">
              {"●".repeat(initialConfidence)}
              {"○".repeat(5 - initialConfidence)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tingkat keyakinan intuitifmu sebelum menguji bukti laboratorium.
          </p>
        </div>

        {/* Now */}
        <div className="p-4 bg-accent-cobalt/5 border border-accent-cobalt/20 rounded-xl space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-cobalt block">
            Sekarang (Setelah Pengujian Bukti)
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleRatingSelect(num)}
                className={cn(
                  "w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                  currentConfidence === num
                    ? "bg-accent-cobalt text-white shadow-xs scale-105"
                    : num <= currentConfidence
                    ? "bg-accent-cobalt/20 text-accent-cobalt hover:bg-accent-cobalt/30"
                    : "bg-white border border-border-default text-text-muted hover:bg-slate-50"
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">
            Pilih tingkat keyakinanmu terhadap model kuantisasi muatan saat ini.
          </p>
        </div>
      </div>

      {/* Constructive Pedagogical Framing based on change */}
      <div className="rounded-xl p-3.5 text-xs">
        {isDecreased && (
          <div className="bg-amber-50/70 border border-amber-200 text-amber-950 rounded-xl p-3 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block text-[11px]">
                Kedewasaan Saintifik: Menyadari Kompleksitas Fenomena
              </span>
              <p className="text-[11px] text-amber-900/80 mt-0.5 leading-relaxed">
                Tingkat keyakinanmu menurun dari {initialConfidence} menjadi {currentConfidence}. Ini adalah respons yang sangat wajar bagi peneliti saat menyadari adanya variabel nyata seperti koreksi Stokes, hambatan udara, dan sebaran galat.
              </p>
            </div>
          </div>
        )}

        {isIncreased && (
          <div className="bg-emerald-50/70 border border-emerald-200 text-emerald-950 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block text-[11px]">
                Keyakinan Tumbuh Berkat Landasan Bukti Nyata
              </span>
              <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed">
                Keyakinanmu meningkat dari {initialConfidence} menjadi {currentConfidence}. Keyakinan ini sekarang bukan lagi tebakan murni, melainkan ditopang oleh keteraturan rasio bilangan bulat yang telah kamu uji sendiri.
              </p>
            </div>
          </div>
        )}

        {isSame && (
          <div className="bg-slate-50 border border-border-default text-primary-navy rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-accent-cobalt flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">
                Konsistensi Penilaian Ilmiah
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Tingkat keyakinanmu stabil di angka {currentConfidence}. Kamu mempertahankan sikap berhati-hati yang objektif terhadap hasil eksperimen.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reason for change */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-primary-navy block">
          Apa yang paling menyebabkan perubahan (atau bertahannya) keyakinanmu?
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Karena saya melihat langsung bahwa rasio pembagian konsisten mengelompok di angka 1, 2, 3..."
          className="w-full p-2.5 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden text-xs"
        />
      </div>
    </div>
  );
}
