"use client";

import { Dispatch, SetStateAction } from "react";

import { LabAttemptSession } from "@/lib/session/types";

interface CERFormProps {
  session: LabAttemptSession;
  setSession: Dispatch<SetStateAction<LabAttemptSession | null>>;
}

export function CERForm({ session, setSession }: CERFormProps) {
  return (
    <div className="panel space-y-3 p-4">
      <div className="text-sm font-semibold text-slate-700">CER (Claim–Evidence–Reasoning)</div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Claim</span>
        <textarea
          className="h-20 w-full rounded-lg border border-slate-300 p-2"
          value={session.cer.claim}
          onChange={(event) =>
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    cer: { ...prev.cer, claim: event.target.value },
                    reportReady:
                      event.target.value.trim().length > 0 &&
                      prev.cer.evidence.trim().length > 0 &&
                      prev.cer.reasoning.trim().length > 0 &&
                      prev.analysis.e_est_C !== null,
                  }
                : prev,
            )
          }
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Evidence</span>
        <textarea
          className="h-24 w-full rounded-lg border border-slate-300 p-2"
          value={session.cer.evidence}
          onChange={(event) =>
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    cer: { ...prev.cer, evidence: event.target.value },
                    reportReady:
                      prev.cer.claim.trim().length > 0 &&
                      event.target.value.trim().length > 0 &&
                      prev.cer.reasoning.trim().length > 0 &&
                      prev.analysis.e_est_C !== null,
                  }
                : prev,
            )
          }
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Reasoning</span>
        <textarea
          className="h-24 w-full rounded-lg border border-slate-300 p-2"
          value={session.cer.reasoning}
          onChange={(event) =>
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    cer: { ...prev.cer, reasoning: event.target.value },
                    reportReady:
                      prev.cer.claim.trim().length > 0 &&
                      prev.cer.evidence.trim().length > 0 &&
                      event.target.value.trim().length > 0 &&
                      prev.analysis.e_est_C !== null,
                  }
                : prev,
            )
          }
        />
      </label>
    </div>
  );
}
