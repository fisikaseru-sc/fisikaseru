"use client";

import { ReactNode } from "react";

import { HelpDrawer } from "@/features/lab-player/help/HelpDrawer";
import { Stepper5 } from "@/features/lab-player/stepper/Stepper5";

interface PlayerShellProps {
  attemptId: string;
  currentStep: number;
  unlockedSteps: boolean[];
  children: ReactNode;
}

export function PlayerShell({ attemptId, currentStep, unlockedSteps, children }: PlayerShellProps) {
  return (
    <div className="space-y-4">
      <Stepper5 attemptId={attemptId} currentStep={currentStep} unlockedSteps={unlockedSteps} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>{children}</div>
        <HelpDrawer />
      </div>
    </div>
  );
}
