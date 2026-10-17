"use client";

import React from "react";
import { CheckCircle2, Lock, Eye, Compass, Search, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalysisStage = 1 | 2 | 3 | 4 | 5;

interface AnalysisStageProgressProps {
  activeStage: AnalysisStage;
  onSelectStage: (stage: AnalysisStage) => void;
  isDiscovered: boolean;
}

interface StageInfo {
  stage: AnalysisStage;
  num: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageInfo[] = [
  { stage: 1, num: "01", title: "Kaji Data", subtitle: "Observasi Mentah", icon: Eye },
  { stage: 2, num: "02", title: "Terjemahkan", subtitle: "Konversi ke Muatan q", icon: Compass },
  { stage: 3, num: "03", title: "Cari Pola", subtitle: "Uji Satuan Terkecil", icon: Search },
  { stage: 4, num: "04", title: "Temukan", subtitle: "Momen Kuantisasi", icon: Sparkles },
  { stage: 5, num: "05", title: "Pahami", subtitle: "Teori & Verifikasi NIST", icon: BookOpen },
];

export function AnalysisStageProgress({
  activeStage,
  onSelectStage,
  isDiscovered,
}: AnalysisStageProgressProps) {
  return (
    <div className="bg-white border border-border-default rounded-2xl p-2.5 shadow-sm mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {STAGES.map((s) => {
          const isActive = activeStage === s.stage;
          const isCompleted = isDiscovered
            ? activeStage > s.stage
            : s.stage < activeStage;
          const isLocked = !isDiscovered && (s.stage === 4 || s.stage === 5);

          return (
            <button
              key={s.stage}
              type="button"
              disabled={isLocked}
              onClick={() => !isLocked && onSelectStage(s.stage)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all relative select-none",
                isActive && "bg-accent-cobalt text-white shadow-sm ring-1 ring-accent-cobalt",
                !isActive && !isLocked && "hover:bg-slate-50 text-text-primary cursor-pointer",
                isLocked && "opacity-45 cursor-not-allowed text-text-muted bg-slate-50/50"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold transition-colors",
                  isActive && "bg-white/20 text-white",
                  !isActive && isCompleted && "bg-emerald-100 text-emerald-700",
                  !isActive && !isCompleted && !isLocked && "bg-slate-100 text-slate-600",
                  isLocked && "bg-slate-200/50 text-slate-400"
                )}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{s.num}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-display font-semibold truncate",
                      isActive ? "text-white" : "text-primary-navy"
                    )}
                  >
                    {s.title}
                  </span>
                  {s.stage === 4 && isDiscovered && (
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse flex-shrink-0" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-[10px] truncate leading-tight font-sans",
                    isActive ? "text-white/80" : "text-text-muted"
                  )}
                >
                  {isLocked ? "Terkunci (Cari Pola Dulu)" : s.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
