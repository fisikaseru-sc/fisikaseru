"use client";

/**
 * SimulationControls — bar kontrol simulasi berbasis shadcn/ui.
 * Murni presentasional & terkontrol: tidak punya state internal,
 * semua nilai (running/time/speed) datang dari parent.
 *
 * Ikon memakai atribut data-icon agar selaras dengan varian styling
 * Button shadcn (has-data-[icon=inline-start]).
 */

import { Gauge, Pause, Play, RotateCcw, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface SimulationControlsLabels {
  play?: string;
  pause?: string;
  reset?: string;
  speed?: string;
}

export interface SimulationControlsProps {
  running: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  /** Waktu simulasi dalam detik untuk readout. */
  time: number;
  speed: number;
  onSpeedChange: (value: number) => void;
  minSpeed?: number;
  maxSpeed?: number;
  speedStep?: number;
  disabled?: boolean;
  labels?: SimulationControlsLabels;
  className?: string;
}

function formatSpeedLabel(speed: number): string {
  return `${speed.toFixed(2).replace(/\.?0+$/, "")}×`;
}

export function SimulationControls({
  running,
  onPlayPause,
  onReset,
  time,
  speed,
  onSpeedChange,
  minSpeed = 0.25,
  maxSpeed = 3,
  speedStep = 0.25,
  disabled = false,
  labels,
  className,
}: SimulationControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Kontrol simulasi"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-depth backdrop-blur-sm",
        className
      )}
    >
      <Button
        type="button"
        variant={running ? "warning" : "primary"}
        size="sm"
        onClick={onPlayPause}
        disabled={disabled}
        className="min-w-24 cursor-pointer"
        aria-pressed={running}
      >
        {running ? (
          <Pause data-icon="inline-start" className="size-3.5" />
        ) : (
          <Play data-icon="inline-start" className="size-3.5" />
        )}
        {running ? labels?.pause ?? "Jeda" : labels?.play ?? "Mulai"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={disabled}
        className="cursor-pointer"
      >
        <RotateCcw data-icon="inline-start" className="size-3.5" />
        {labels?.reset ?? "Reset"}
      </Button>

      <Separator orientation="vertical" className="data-[orientation=vertical]:h-7" />

      <div className="flex min-w-40 flex-1 items-center gap-2">
        <Gauge
          className="size-3.5 shrink-0 text-text-muted"
          aria-hidden="true"
        />
        <span className="hidden shrink-0 text-xs font-medium text-text-muted sm:inline">
          {labels?.speed ?? "Kecepatan"}
        </span>
        <Slider
          value={[speed]}
          min={minSpeed}
          max={maxSpeed}
          step={speedStep}
          onValueChange={(values) => {
            const next = values[0];
            if (typeof next === "number") onSpeedChange(next);
          }}
          disabled={disabled}
          aria-label="Kecepatan simulasi"
          className="flex-1"
        />
        <span className="w-9 shrink-0 text-right font-mono text-xs font-semibold tabular-nums">
          {formatSpeedLabel(speed)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-border pl-3">
        <Timer className="size-3.5 text-text-muted" aria-hidden="true" />
        <span className="font-mono text-sm font-bold tabular-nums">
          t = {time.toFixed(2)} s
        </span>
      </div>
    </div>
  );
}

export default SimulationControls;
