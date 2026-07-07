"use client";

import Link from "next/link";

import { cn } from "@/lib/utils/cn";

interface Stepper5Props {
  attemptId: string;
  currentStep: number;
  unlockedSteps: boolean[];
}

const STEP_LABELS = [
  "1. Konsep",
  "2. Pre-lab",
  "3. Eksperimen",
  "4. Analisis",
  "5. Laporan",
];

export function Stepper5({ attemptId, currentStep, unlockedSteps }: Stepper5Props) {
  return (
    <div className="panel mb-4 flex flex-wrap gap-2 p-3">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const unlocked = unlockedSteps[index] ?? false;
        const active = step === currentStep;
        return (
          <Link
            key={label}
            href={unlocked ? `/app/attempt/${attemptId}/step/${step}` : "#"}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold",
              active && "bg-teal-700 text-white",
              !active && unlocked && "bg-slate-100 text-slate-700 hover:bg-slate-200",
              !unlocked && "cursor-not-allowed bg-slate-50 text-slate-400",
            )}
            aria-disabled={!unlocked}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
