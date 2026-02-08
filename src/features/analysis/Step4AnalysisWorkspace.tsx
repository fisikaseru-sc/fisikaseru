"use client";

import { useEffect, useMemo } from "react";

import { CERForm } from "@/features/analysis/CERForm";
import { FitResultCard } from "@/features/analysis/FitResultCard";
import { GraphCard } from "@/features/analysis/GraphCard";
import { QualityHintPanel } from "@/features/analysis/QualityHintPanel";
import { estimateElementaryCharge } from "@/labs/milikan/sim/sim-core";
import { LabAttemptSession, fromElementaryEstimate } from "@/lib/session/types";

interface Step4AnalysisWorkspaceProps {
  session: LabAttemptSession;
  setSession: React.Dispatch<React.SetStateAction<LabAttemptSession | null>>;
}

export function Step4AnalysisWorkspace({ session, setSession }: Step4AnalysisWorkspaceProps) {
  const qUsed = useMemo(
    () => session.trials.map((row) => row.q_c_C ?? row.q0_C).filter((value): value is number => value !== null),
    [session.trials],
  );

  const estimate = useMemo(() => estimateElementaryCharge(qUsed), [qUsed]);

  useEffect(() => {
    if (!estimate) {
      return;
    }
    setSession((prev) =>
      prev
        ? {
            ...prev,
            analysis: fromElementaryEstimate(estimate),
            currentStep: Math.max(prev.currentStep, 4),
            reportReady:
              prev.cer.claim.trim().length > 0 &&
              prev.cer.evidence.trim().length > 0 &&
              prev.cer.reasoning.trim().length > 0,
          }
        : prev,
    );
  }, [estimate, setSession]);

  const timeVsVoltage = session.trials.map((row) => ({ x: row.U_V, y: row.t2_s }));
  const radiusVsVelocity = session.trials.map((row) => ({ x: row.v2_m_s, y: row.r0_m }));
  const qVsN = estimate?.rows.map((row) => ({ x: row.n, y: row.q_C })) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <GraphCard title="Time vs Voltage" xLabel="U (V)" yLabel="t (s)" points={timeVsVoltage} />
        <GraphCard title="Radius vs Velocity" xLabel="v2 (m/s)" yLabel="r0 (m)" points={radiusVsVelocity} />
        <GraphCard
          title="q vs n"
          xLabel="n"
          yLabel="q (C)"
          points={qVsN}
          fitSlope={estimate?.e_est_C}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FitResultCard eEst={session.analysis.e_est_C} rmsResidual={session.analysis.rmsResidual_C} />
        <QualityHintPanel
          trialCount={session.trials.length}
          hasCunninghamRows={session.trials.some((row) => row.cunningham_enabled)}
          rmsResidual={session.analysis.rmsResidual_C}
        />
      </div>

      <div className="panel overflow-x-auto p-4">
        <div className="mb-2 text-sm font-semibold text-slate-700">Tabel q_i, n_i, residual</div>
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="px-2 py-2">q_i (C)</th>
              <th className="px-2 py-2">n_i</th>
              <th className="px-2 py-2">residual (C)</th>
            </tr>
          </thead>
          <tbody>
            {session.analysis.rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                <td className="px-2 py-2">{row.q_C.toExponential(4)}</td>
                <td className="px-2 py-2">{row.n}</td>
                <td className="px-2 py-2">{row.residual_C.toExponential(4)}</td>
              </tr>
            ))}
            {session.analysis.rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-3 text-center text-slate-500">
                  Belum ada hasil fit. Kumpulkan trial dan kembali ke step ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CERForm session={session} setSession={setSession} />
    </div>
  );
}
