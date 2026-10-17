"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RatioPoint {
  id: number;
  label?: string;
  q: number;
  ratio: number;
}

interface NumberLineVisualizationProps {
  ratios: RatioPoint[];
  maxRange?: number;
}

export function NumberLineVisualization({
  ratios,
  maxRange = 6,
}: NumberLineVisualizationProps) {
  const ticks = Array.from({ length: maxRange + 1 }, (_, i) => i);

  return (
    <div className="bg-white border border-border-default rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-muted">
            Distribusi Spasial Hasil Pembagian (Garis Bilangan)
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            Perhatikan posisi titik-titik rasio: apakah mereka tersebar acak di antara garis, atau berkumpul di dekat posisi bilangan bulat?
          </p>
        </div>
        <span className="text-[10px] font-mono text-text-muted bg-slate-100 px-2 py-0.5 rounded-md">
          Skala: Rasio (q / Kandidat)
        </span>
      </div>

      {/* Interactive Number Line Canvas */}
      <div className="pt-8 pb-10 px-6 sm:px-10 relative select-none">
        {/* Main Horizontal Axis Line */}
        <div className="h-1 bg-slate-200 rounded-full w-full relative">
          {/* Subtle Integer Target Zones (Quiet, no labels) */}
          {ticks.slice(1).map((t) => {
            const pct = (t / maxRange) * 100;
            return (
              <div
                key={`zone-${t}`}
                style={{ left: `${pct}%` }}
                className="absolute -top-3 bottom-0 w-6 -translate-x-1/2 h-7 bg-slate-100/80 rounded-md pointer-events-none border border-dashed border-slate-300/60"
              />
            );
          })}

          {/* Integer Ticks & Numbers */}
          {ticks.map((t) => {
            const pct = (t / maxRange) * 100;
            return (
              <div
                key={`tick-${t}`}
                style={{ left: `${pct}%` }}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              >
                <div className="w-0.5 h-3 bg-slate-400" />
                <span className="mt-2 font-mono font-bold text-xs text-slate-600">
                  {t}
                </span>
              </div>
            );
          })}

          {/* Ratio Observation Points */}
          {ratios.map((pt, idx) => {
            // Clamped percentage position on the number line
            const clampedRatio = Math.max(0, Math.min(pt.ratio, maxRange));
            const pct = (clampedRatio / maxRange) * 100;

            // Check proximity to nearest integer for subtle spatial clarity
            const nearestInt = Math.round(pt.ratio);
            const dist = Math.abs(pt.ratio - nearestInt);
            const isNear = dist <= 0.15;

            // Offset stacked points slightly if very close
            const verticalOffset = (idx % 3) * -14 - 18;

            return (
              <motion.div
                key={pt.id}
                layout
                initial={{ left: `${pct}%`, opacity: 0 }}
                animate={{ left: `${pct}%`, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                style={{ top: `${verticalOffset}px` }}
                className="absolute -translate-x-1/2 cursor-pointer group z-10"
              >
                {/* Visual Pin / Dot */}
                <div
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-sm transition-transform transform group-hover:scale-110 flex items-center gap-1",
                    isNear
                      ? "bg-accent-cobalt text-white border-accent-cobalt/80"
                      : "bg-slate-700 text-white border-slate-800"
                  )}
                >
                  <span className="text-[9px] opacity-75">#{pt.id}</span>
                  <span>{pt.ratio.toFixed(2)}</span>
                </div>

                {/* Vertical connecting pointer to axis */}
                <div
                  style={{ height: `${Math.abs(verticalOffset) - 6}px` }}
                  className={cn(
                    "w-px mx-auto transition-colors",
                    isNear ? "bg-accent-cobalt/40" : "bg-slate-400/40"
                  )}
                />

                {/* Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                  {pt.label || `Tetes #${pt.id}`}: q = {pt.q.toFixed(2)} × 10⁻¹⁹ C
                  <br />
                  Hasil bagi = {pt.ratio.toFixed(2)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-default/60 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cobalt" /> Titik hasil bagi data
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded border border-dashed border-slate-300 bg-slate-100/80" /> Posisi bilangan bulat
          </span>
        </div>
        <span className="font-mono text-[10px]">
          Toleransi ketidakpastian eksperimen: ±0.15
        </span>
      </div>
    </div>
  );
}
