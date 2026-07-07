import { LabAttemptSession } from "@/lib/session/types";

function hasValidMarks(session: LabAttemptSession) {
  return session.trials.some((row) => row.S_lines > 0);
}

function hasTimes(session: LabAttemptSession) {
  return session.trials.some((row) => row.t2_s > 0 && (row.method === "floating" || (row.t1_s ?? 0) > 0));
}

export function evaluateMilikanGating(session: LabAttemptSession) {
  const trialCount = session.trials.length;
  const analysisDone = session.analysis.e_est_C !== null;
  const reportReady = session.reportReady;

  return {
    unlockedSteps: [
      true,
      true,
      session.prelab.completed,
      trialCount >= 6 && hasValidMarks(session) && hasTimes(session),
      analysisDone && reportReady,
    ],
    trialCount,
    analysisDone,
    reportReady,
  };
}
