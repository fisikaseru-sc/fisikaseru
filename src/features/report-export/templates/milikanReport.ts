import { LabAttemptSession } from "@/lib/session/types";

export function buildMilikanReportText(session: LabAttemptSession) {
  const eEst = session.analysis.e_est_C;
  const diff = eEst ? ((Math.abs(eEst) - 1.6e-19) / 1.6e-19) * 100 : null;

  return [
    "Laporan Praktikum Millikan",
    `Attempt: ${session.attemptId}`,
    `Tujuan: Mengukur muatan tetes minyak dan kuantisasi q = n e`,
    `Metode: ${session.apparatus.method}`,
    `Setelan: d=${session.apparatus.d_mm} mm, V_obj=${session.apparatus.V_obj}x, T=${session.apparatus.T_C} C, P=${session.apparatus.P_hPa} hPa, eta0=${session.apparatus.eta0_Pa_s}`,
    `Cunningham: ${session.apparatus.cunningham_enabled ? "ON" : "OFF"}`,
    `Jumlah trial: ${session.trials.length}`,
    `e_est: ${eEst ? Math.abs(eEst).toExponential(4) : "-"} C`,
    `Perbandingan dengan 1.6e-19 C: ${diff !== null ? `${diff.toFixed(2)}%` : "-"}`,
    "",
    "CER:",
    `Claim: ${session.cer.claim}`,
    `Evidence: ${session.cer.evidence}`,
    `Reasoning: ${session.cer.reasoning}`,
    "",
    "Sumber error potensial: reaksi timer, pemilihan droplet, ketidakpastian U, dan pembacaan mark.",
  ].join("\n");
}
