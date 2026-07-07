"use client";

import { MilikanControllerState, MilikanRuntimeParams } from "@/labs/milikan/sim/controller";

interface SceneProps {
  state: MilikanControllerState;
  params: MilikanRuntimeParams;
}

export function MilikanScene({ state, params }: SceneProps) {
  const top = Math.min(params.topMark_lines, params.bottomMark_lines);
  const bottom = Math.max(params.topMark_lines, params.bottomMark_lines);
  const range = Math.max(40, bottom - top + 30);
  const yPercent = ((state.position_lines - (top - 10)) / range) * 100;

  return (
    <div className="panel relative h-[360px] overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50 to-slate-100 p-4">
      <div className="absolute inset-x-0 top-3 mx-auto h-4 w-[94%] rounded bg-slate-300" />
      <div className="absolute inset-x-0 bottom-3 mx-auto h-4 w-[94%] rounded bg-slate-300" />

      <div className="absolute inset-y-8 left-6 w-px bg-slate-300" />
      {Array.from({ length: 46 }).map((_, index) => (
        <div
          key={index}
          className="absolute left-6 h-px bg-slate-300"
          style={{ top: `${(index / 45) * 100}%`, width: index % 5 === 0 ? 18 : 9 }}
        />
      ))}

      {[top, bottom].map((mark, index) => {
        const markPercent = ((mark - (top - 10)) / range) * 100;
        return (
          <div
            key={mark}
            className="absolute inset-x-0 flex items-center gap-2 px-6"
            style={{ top: `${markPercent}%` }}
          >
            <div className="h-[2px] flex-1 bg-amber-400/90" />
            <div className="text-xs font-semibold text-amber-900">{index === 0 ? "Top" : "Bottom"}</div>
          </div>
        );
      })}

      <div
        className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-slate-700 bg-sky-600 shadow"
        style={{ top: `${yPercent}%` }}
      />

      <div className="absolute right-4 top-4 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-700">
        <div>Fokus: {state.focus}%</div>
        <div>Light: {state.lightIntensity}%</div>
        <div>v: {(state.velocity_up_m_s * 1000).toFixed(3)} mm/s (up +)</div>
        <div>Status: {state.sequencePhase}</div>
      </div>
    </div>
  );
}
