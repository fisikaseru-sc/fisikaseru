"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Step4AnalysisWorkspace } from "@/features/analysis/Step4AnalysisWorkspace";
import { PlayerShell } from "@/features/lab-player/PlayerShell";
import { PrelabForm } from "@/features/lab-player/PrelabForm";
import { evaluateMilikanGating } from "@/features/lab-player/gating/evaluateGating";
import { ExportButtonCluster } from "@/features/report-export/ExportButtonCluster";
import { ReportPreview } from "@/features/report-export/ReportPreview";
import { Step3Signature } from "@/features/simulation/Step3Signature";
import Step1Content from "@/labs/milikan/content/step1.mdx";
import Step2Content from "@/labs/milikan/content/step2.mdx";
import Step4Content from "@/labs/milikan/content/step4.mdx";
import Step5Content from "@/labs/milikan/content/step5.mdx";
import { useAttemptSession } from "@/lib/session/useAttemptSession";

function StepCard({ children }: { children: React.ReactNode }) {
  return <Card className="prose max-w-none text-sm">{children}</Card>;
}

function StepNavigation({ attemptId, step, nextEnabled }: { attemptId: string; step: number; nextEnabled: boolean }) {
  return (
    <div className="panel flex flex-wrap items-center gap-2 p-3">
      <Link
        href={step > 1 ? `/app/attempt/${attemptId}/step/${step - 1}` : "#"}
        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
      >
        Step sebelumnya
      </Link>
      <Link
        href={nextEnabled && step < 5 ? `/app/attempt/${attemptId}/step/${step + 1}` : "#"}
        className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Step berikutnya
      </Link>
    </div>
  );
}

export default function AttemptStepPage() {
  const params = useParams<{ attemptId: string; step: string }>();
  const attemptId = params.attemptId;
  const step = Number(params.step ?? 1);

  const { ready, session, setSession } = useAttemptSession(attemptId, "milikan", "milikan");

  const updateSession = (updater: (prev: NonNullable<typeof session>) => NonNullable<typeof session>) => {
    setSession((prev) => (prev ? updater(prev) : prev));
  };

  const gating = useMemo(() => {
    if (!session) {
      return null;
    }
    return evaluateMilikanGating(session);
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }
    setSession((prev) =>
      prev
        ? {
            ...prev,
            currentStep: Math.max(prev.currentStep, Math.min(step, 5)),
          }
        : prev,
    );
  }, [session, setSession, step]);

  if (!ready || !session || !gating) {
    return <div className="text-sm text-slate-600">Memuat attempt...</div>;
  }

  const unlocked = gating.unlockedSteps;
  const isUnlocked = unlocked[step - 1] ?? false;

  if (!isUnlocked) {
    return (
      <Card>
        <div className="space-y-2 text-sm text-slate-700">
          <div>Step {step} masih terkunci oleh gating.</div>
          <div>
            Kembali ke <Link href={`/app/attempt/${attemptId}/step/1`} className="font-semibold text-teal-700">Step 1</Link>.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <PlayerShell attemptId={attemptId} currentStep={step} unlockedSteps={unlocked}>
      <div className="space-y-4">
        {step === 1 && (
          <StepCard>
            <Step1Content />
          </StepCard>
        )}

        {step === 2 && (
          <>
            <StepCard>
              <Step2Content />
            </StepCard>
            <PrelabForm session={session} setSession={setSession} />
          </>
        )}

        {step === 3 && (
          <Step3Signature session={session} updateSession={updateSession} />
        )}

        {step === 4 && (
          <>
            <StepCard>
              <Step4Content />
            </StepCard>
            <Step4AnalysisWorkspace session={session} setSession={setSession} />
          </>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <StepCard>
              <Step5Content />
            </StepCard>
            <ReportPreview session={session} />
            <ExportButtonCluster session={session} />
            <Button
              onClick={() =>
                setSession((prev) =>
                  prev
                    ? {
                        ...prev,
                        reportReady: true,
                      }
                    : prev,
                )
              }
            >
              Tandai report ready
            </Button>
          </div>
        )}

        <StepNavigation
          attemptId={attemptId}
          step={step}
          nextEnabled={step < 5 ? Boolean(unlocked[step]) : true}
        />
      </div>
    </PlayerShell>
  );
}
