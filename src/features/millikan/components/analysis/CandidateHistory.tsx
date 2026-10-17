// ============================================================
// FISIKASERU — CANDIDATE HISTORY & PRODUCTIVE FAILURE COMPARISON
// SPRINT E: Learning Signals & Evidence-Driven Hypothesis Comparison
// ============================================================

"use client";

import React, { useState } from "react";
import { History, RotateCcw, ArrowRightLeft, Sparkles, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TestedCandidateRecord {
  candidate: number;
  consistencyDescription: "Titik-titik masih tersebar" | "Mulai memperlihatkan pola" | "Struktur lebih konsisten";
  meanDeviation: number;
  testedAt: number;
}

interface CandidateHistoryProps {
  history: TestedCandidateRecord[];
  onReuseCandidate: (candidate: number) => void;
  onCompareCandidates?: (candA: number, candB: number) => void;
}

export function CandidateHistory({
  history,
  onReuseCandidate,
  onCompareCandidates,
}: CandidateHistoryProps) {
  const [comparing, setComparing] = useState<boolean>(false);
  const [selectedCandA, setSelectedCandA] = useState<number | null>(null);
  const [selectedCandB, setSelectedCandB] = useState<number | null>(null);

  if (history.length === 0) return null;

  const handleStartCompare = () => {
    if (history.length >= 2) {
      setSelectedCandA(history[history.length - 2].candidate);
      setSelectedCandB(history[history.length - 1].candidate);
      setComparing(true);
      if (onCompareCandidates) {
        onCompareCandidates(history[history.length - 2].candidate, history[history.length - 1].candidate);
      }
    }
  };

  const recordA = history.find((h) => h.candidate === selectedCandA);
  const recordB = history.find((h) => h.candidate === selectedCandB);

  return (
    <div className="bg-slate-50 border border-border-default rounded-2xl p-4 md:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-text-muted text-xs font-display font-semibold">
          <History className="w-4 h-4 text-accent-cobalt" />
          <span className="text-primary-navy">Jejak Hipotesis Satuan yang Diuji</span>
          <Badge variant="outline" size="sm" className="text-[10px] font-mono">
            {history.length} Teruji
          </Badge>
        </div>

        {history.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (comparing) setComparing(false);
              else handleStartCompare();
            }}
            className="text-[11px] h-7 px-2.5 cursor-pointer border-accent-cobalt/30 text-accent-cobalt hover:bg-accent-cobalt/10 font-semibold flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {comparing ? "Tutup Komparasi" : "Bandingkan 2 Hipotesis"}
          </Button>
        )}
      </div>

      {/* Grid of tested hypotheses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {history.slice(-6).map((item, idx) => {
          const isScattered = item.consistencyDescription === "Titik-titik masih tersebar";
          const isConsistent = item.consistencyDescription === "Struktur lebih konsisten";

          return (
            <div
              key={`${item.candidate}-${idx}`}
              className={cn(
                "bg-white border rounded-xl p-3 flex items-center justify-between text-xs font-mono shadow-xs transition-all",
                isConsistent
                  ? "border-teal/40 bg-teal/5"
                  : isScattered
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-border-default"
              )}
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary-navy">
                    {item.candidate.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-text-muted">× 10⁻¹⁹ C</span>
                </div>
                <p className="text-[10px] font-sans text-slate-600 mt-1 flex items-center gap-1">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isConsistent
                        ? "bg-teal"
                        : isScattered
                        ? "bg-amber-500"
                        : "bg-accent-cobalt"
                    )}
                  />
                  {item.consistencyDescription}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onReuseCandidate(item.candidate)}
                className="text-[10px] h-7 px-2.5 cursor-pointer flex items-center gap-1 bg-white hover:bg-slate-50"
              >
                <RotateCcw className="w-3 h-3 text-text-muted" /> Uji Lagi
              </Button>
            </div>
          );
        })}
      </div>

      {/* Productive Failure Insight Note if student tested a scattered candidate */}
      {history.some((h) => h.consistencyDescription === "Titik-titik masih tersebar") && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs font-sans text-amber-950 flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] text-amber-900 block">
              Nilai yang Belum Cocok Adalah Bukti Berharga (Productive Failure)
            </span>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Saat suatu kandidat menghasilkan titik yang tersebar acak, data tersebut membuktikan bahwa muatan <i>tidak</i> tersusun dari kelipatan angka tersebut. Bandingkan dengan kandidat yang membuat titik-titik merapat ke bilangan bulat.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Surface */}
      {comparing && recordA && recordB && (
        <div className="bg-white border border-accent-cobalt/30 rounded-xl p-4 shadow-sm space-y-3 mt-2">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-accent-cobalt">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Komparasi Dua Bukti Hipotesis</span>
            </div>
            <span className="text-[10px] text-text-muted font-sans">
              Apa yang dipelajari dari perbandingan ini?
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-border-default space-y-1">
              <span className="text-[10px] text-text-muted font-mono uppercase block">Hipotesis A</span>
              <div className="font-mono font-bold text-sm text-primary-navy">
                {recordA.candidate.toFixed(2)} × 10⁻¹⁹ C
              </div>
              <p className="text-[11px] font-sans text-slate-600">
                Status: <b>{recordA.consistencyDescription}</b>
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                Rata-rata Deviasi: ±{recordA.meanDeviation.toFixed(3)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-border-default space-y-1">
              <span className="text-[10px] text-text-muted font-mono uppercase block">Hipotesis B</span>
              <div className="font-mono font-bold text-sm text-primary-navy">
                {recordB.candidate.toFixed(2)} × 10⁻¹⁹ C
              </div>
              <p className="text-[11px] font-sans text-slate-600">
                Status: <b>{recordB.consistencyDescription}</b>
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                Rata-rata Deviasi: ±{recordB.meanDeviation.toFixed(3)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-muted font-sans italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            💡 <b>Pertanyaan Penyelidikan:</b> Kandidat dengan deviasi lebih kecil membuat titik-titik rasio terkonsentrasi sangat dekat dengan kelipatan bilangan bulat (1, 2, 3...). Ini adalah tanda bahwa kelipatan satuan tersebut merupakan hukum alam yang mendasar, bukan sekadar kebetulan.
          </p>
        </div>
      )}
    </div>
  );
}
