"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  buildTrialRowFromController,
  createInitialControllerState,
  MilikanControllerState,
  MilikanRuntimeParams,
  tickController,
} from "@/labs/milikan/sim/controller";
import { LabAttemptSession } from "@/lib/session/types";
import { Canvas3D } from "@/features/simulation/Canvas3D";
import { GlassControlPanel } from "@/features/simulation/GlassControlPanel";
import { ReadoutRow5 } from "@/features/simulation/ReadoutRow5";
import { SavedDataTable } from "@/features/simulation/SavedDataTable";
import { TipsCoachPanel } from "@/features/simulation/TipsCoachPanel";

interface Step3SignatureProps {
  session: LabAttemptSession;
  updateSession: (updater: (prev: LabAttemptSession) => LabAttemptSession) => void;
}

function toRuntimeParams(session: LabAttemptSession): MilikanRuntimeParams {
  return {
    ...session.apparatus,
  };
}

export function Step3Signature({ session, updateSession }: Step3SignatureProps) {
  const [params, setParams] = useState<MilikanRuntimeParams>(() => toRuntimeParams(session));
  const [controller, setController] = useState<MilikanControllerState>(() =>
    createInitialControllerState(toRuntimeParams(session)),
  );

  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    updateSession((prev) => ({ ...prev, apparatus: { ...prev.apparatus, ...params } }));
  }, [params, updateSession]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setController((prev) => tickController(prev, paramsRef.current, 0.05));
    }, 50);
    return () => window.clearInterval(interval);
  }, []);

  const saveTrialBlockedByVoltage = params.U_V <= 0;
  const canSave = controller.saveEnabled && !saveTrialBlockedByVoltage;

  const onSaveTrial = () => {
    const row = buildTrialRowFromController(controller, params);
    if (!row) {
      return;
    }
    updateSession((prev) => ({
      ...prev,
      trials: [row, ...prev.trials],
      currentStep: Math.max(prev.currentStep, 3),
    }));
    setController((prev) => ({
      ...prev,
      saveEnabled: false,
    }));
  };

  const signatureLayout = useMemo(
    () => (
      <div className="space-y-4">
        <Canvas3D controller={controller} params={params} />
        <GlassControlPanel
          params={params}
          controller={controller}
          setParams={setParams}
          setController={setController}
        />
        <ReadoutRow5 params={params} controller={controller} />
        <SavedDataTable rows={session.trials} />
        <TipsCoachPanel hints={controller.hints} isStable={controller.isStable} />
      </div>
    ),
    [controller, params, session.trials],
  );

  return (
    <div className="space-y-3">
      {signatureLayout}
      {saveTrialBlockedByVoltage && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          U = 0 V. q0 tidak dihitung, sim memblokir Save Trial sampai U &gt; 0.
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button onClick={onSaveTrial} disabled={!canSave}>
          Save Trial
        </Button>
        <span className="text-sm text-slate-500">
          Save aktif ketika urutan timer selesai dan data t1/t2 valid.
        </span>
      </div>
    </div>
  );
}
