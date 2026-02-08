"use client";

import { Dispatch, SetStateAction } from "react";

import {
  MilikanControllerState,
  MilikanRuntimeParams,
  resetTimerState,
  sprayDroplets,
  startFloatingSequence,
  startRisingFallingSequence,
} from "@/labs/milikan/sim/controller";
import { Button } from "@/components/ui/Button";

interface GlassControlPanelProps {
  params: MilikanRuntimeParams;
  controller: MilikanControllerState;
  setParams: Dispatch<SetStateAction<MilikanRuntimeParams>>;
  setController: Dispatch<SetStateAction<MilikanControllerState>>;
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

export function GlassControlPanel({ params, controller, setParams, setController }: GlassControlPanelProps) {
  const selected = controller.selectedDropletId ?? "";

  return (
    <div className="panel space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Method</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={params.method}
            onChange={(event) => setParams((prev) => ({ ...prev, method: event.target.value as "floating" | "rising_falling" }))}
          >
            <option value="rising_falling">Rising/Falling</option>
            <option value="floating">Floating</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Polarity</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={params.polarity}
            onChange={(event) => setParams((prev) => ({ ...prev, polarity: event.target.value as "above" | "below" }))}
          >
            <option value="above">Above (+ atas)</option>
            <option value="below">Below (+ bawah)</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <NumberField
          label="Voltage U"
          value={params.U_V}
          min={0}
          max={600}
          step={1}
          unit="V"
          onChange={(value) => setParams((prev) => ({ ...prev, U_V: value }))}
        />
        <NumberField
          label="Top Mark"
          value={params.topMark_lines}
          min={-20}
          max={80}
          step={1}
          unit="lines"
          onChange={(value) => setParams((prev) => ({ ...prev, topMark_lines: value }))}
        />
        <NumberField
          label="Bottom Mark"
          value={params.bottomMark_lines}
          min={-20}
          max={120}
          step={1}
          unit="lines"
          onChange={(value) => setParams((prev) => ({ ...prev, bottomMark_lines: value }))}
        />
        <NumberField
          label="Scale"
          value={params.scaleDivision_mm_per_line}
          min={0.01}
          max={1}
          step={0.01}
          unit="mm/line"
          onChange={(value) => setParams((prev) => ({ ...prev, scaleDivision_mm_per_line: value }))}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <NumberField
          label="Suhu T"
          value={params.T_C}
          min={-5}
          max={45}
          step={0.5}
          unit="°C"
          onChange={(value) => setParams((prev) => ({ ...prev, T_C: value }))}
        />
        <NumberField
          label="Tekanan P"
          value={params.P_hPa}
          min={800}
          max={1100}
          step={0.1}
          unit="hPa"
          onChange={(value) => setParams((prev) => ({ ...prev, P_hPa: value }))}
        />
        <NumberField
          label="η0"
          value={params.eta0_Pa_s}
          min={1e-5}
          max={3e-5}
          step={1e-7}
          unit="Pa·s"
          onChange={(value) => setParams((prev) => ({ ...prev, eta0_Pa_s: value }))}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Select droplet</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={selected}
            onChange={(event) =>
              setController((prev) => ({
                ...prev,
                selectedDropletId: event.target.value,
              }))
            }
          >
            {controller.droplets.map((droplet) => (
              <option key={droplet.id} value={droplet.id}>
                {droplet.id}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={params.cunningham_enabled}
            onChange={(event) =>
              setParams((prev) => ({
                ...prev,
                cunningham_enabled: event.target.checked,
              }))
            }
          />
          Apply Cunningham correction (P akan dikonversi dari hPa ke Pa)
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Focus</span>
          <input
            type="range"
            min={0}
            max={100}
            value={controller.focus}
            onChange={(event) =>
              setController((prev) => ({
                ...prev,
                focus: Number(event.target.value),
              }))
            }
            className="w-full"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Light intensity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={controller.lightIntensity}
            onChange={(event) =>
              setController((prev) => ({
                ...prev,
                lightIntensity: Number(event.target.value),
              }))
            }
            className="w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            const droplets = sprayDroplets(8);
            setController((prev) => ({
              ...prev,
              droplets,
              selectedDropletId: droplets[0]?.id ?? null,
            }));
          }}
        >
          Spray
        </Button>

        <Button
          variant="secondary"
          onClick={() => setController((prev) => ({ ...prev, voltageOn: !prev.voltageOn }))}
        >
          Voltage {controller.voltageOn ? "ON" : "OFF"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => setController((prev) => ({ ...prev, timerOn: !prev.timerOn }))}
        >
          Timer {controller.timerOn ? "ON" : "OFF"}
        </Button>

        <Button onClick={() => setController((prev) => startRisingFallingSequence(prev, params))}>
          Start Rising/Falling
        </Button>

        <Button onClick={() => setController((prev) => startFloatingSequence(prev, params))}>
          Start Floating Capture
        </Button>

        <Button variant="ghost" onClick={() => setController((prev) => resetTimerState(prev, params))}>
          Reset timer
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Indikator stabil: |v| kecil selama 1.5 s. Saat stable dan mode floating aktif, gunakan tombol capture.
      </p>
    </div>
  );
}
