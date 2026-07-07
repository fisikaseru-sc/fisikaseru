"use client";

import { computeElectricField, computeMilikanTrial } from "@/labs/milikan/sim/sim-core";
import { MilikanControllerState, MilikanRuntimeParams } from "@/labs/milikan/sim/controller";

interface ReadoutRow5Props {
  params: MilikanRuntimeParams;
  controller: MilikanControllerState;
}

function formatValue(value: number | null, digits = 3) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) {
    return "-";
  }
  return value.toExponential(digits);
}

export function ReadoutRow5({ params, controller }: ReadoutRow5Props) {
  const calc =
    controller.t2_s && controller.t2_s > 0
      ? computeMilikanTrial({
          method: params.method,
          U_V: params.U_V,
          polarity: params.polarity,
          d_mm: params.d_mm,
          V_obj: params.V_obj,
          g_m_s2: params.g_m_s2,
          topMark_lines: params.topMark_lines,
          bottomMark_lines: params.bottomMark_lines,
          scaleDivision_mm_per_line: params.scaleDivision_mm_per_line,
          t1_s: params.method === "rising_falling" ? controller.t1_s : null,
          t2_s: controller.t2_s,
          T_C: params.T_C,
          P_hPa: params.P_hPa,
          eta0_Pa_s: params.eta0_Pa_s,
          rho_air_kg_m3: params.rho_air_kg_m3,
          rho_oil_kg_m3_at_15C: params.rho_oil_kg_m3_at_15C,
          rho_oil_kg_m3_at_25C: params.rho_oil_kg_m3_at_25C,
          cunningham_enabled: params.cunningham_enabled,
          cunningham_b: params.cunningham_b,
        })
      : null;

  const qDisplay = calc?.q_display_C ?? null;
  const E = computeElectricField(params.U_V, params.d_mm, params.polarity);

  const items = [
    { label: "U", value: `${params.U_V.toFixed(1)} V` },
    { label: "E=U/d", value: `${E.toExponential(3)} V/m` },
    { label: "t1", value: controller.t1_s ? `${controller.t1_s.toFixed(3)} s` : "-" },
    { label: "t2", value: controller.t2_s ? `${controller.t2_s.toFixed(3)} s` : "-" },
    { label: "q", value: `${formatValue(qDisplay)} C` },
  ];

  return (
    <div className="panel grid gap-2 p-4 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">{item.label}</div>
          <div className="font-mono text-sm font-semibold text-slate-800">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
