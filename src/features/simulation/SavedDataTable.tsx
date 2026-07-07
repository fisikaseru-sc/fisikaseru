"use client";

import { MilikanTrialRow } from "@/labs/milikan/sim/types";

interface SavedDataTableProps {
  rows: MilikanTrialRow[];
}

export function SavedDataTable({ rows }: SavedDataTableProps) {
  return (
    <div className="panel overflow-x-auto p-4">
      <div className="mb-3 text-sm font-semibold text-slate-700">Saved Trials ({rows.length})</div>
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="text-slate-500">
            <th className="px-2 py-2">Trial</th>
            <th className="px-2 py-2">Method</th>
            <th className="px-2 py-2">U (V)</th>
            <th className="px-2 py-2">t1 (s)</th>
            <th className="px-2 py-2">t2 (s)</th>
            <th className="px-2 py-2">v2 (m/s)</th>
            <th className="px-2 py-2">r0 (m)</th>
            <th className="px-2 py-2">q0 (C)</th>
            <th className="px-2 py-2">qc (C)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.trialId} className="border-t border-slate-100 text-slate-700">
              <td className="px-2 py-2">{row.trialId.slice(-6)}</td>
              <td className="px-2 py-2">{row.method}</td>
              <td className="px-2 py-2">{row.U_V.toFixed(1)}</td>
              <td className="px-2 py-2">{row.t1_s ? row.t1_s.toFixed(3) : "-"}</td>
              <td className="px-2 py-2">{row.t2_s.toFixed(3)}</td>
              <td className="px-2 py-2">{row.v2_m_s.toExponential(3)}</td>
              <td className="px-2 py-2">{row.r0_m.toExponential(3)}</td>
              <td className="px-2 py-2">{row.q0_C.toExponential(3)}</td>
              <td className="px-2 py-2">{row.q_c_C ? row.q_c_C.toExponential(3) : "-"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="px-2 py-4 text-center text-slate-500">
                Belum ada trial tersimpan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
