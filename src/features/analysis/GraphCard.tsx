"use client";

import { Card } from "@/components/ui/Card";

interface GraphPoint {
  x: number;
  y: number;
}

interface GraphCardProps {
  title: string;
  xLabel: string;
  yLabel: string;
  points: GraphPoint[];
  fitSlope?: number;
}

function extent(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return { min: 0, max: 1 };
  }
  return { min, max };
}

export function GraphCard({ title, xLabel, yLabel, points, fitSlope }: GraphCardProps) {
  const width = 360;
  const height = 220;
  const pad = 30;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xExt = extent(xs);
  const yExt = extent(ys);

  const projectX = (x: number) => pad + ((x - xExt.min) / (xExt.max - xExt.min || 1)) * (width - 2 * pad);
  const projectY = (y: number) => height - pad - ((y - yExt.min) / (yExt.max - yExt.min || 1)) * (height - 2 * pad);

  return (
    <Card className="space-y-2">
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full rounded border border-slate-100 bg-white">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#94a3b8" strokeWidth="1" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#94a3b8" strokeWidth="1" />
        {points.map((point, index) => (
          <circle key={index} cx={projectX(point.x)} cy={projectY(point.y)} r={3} fill="#0f766e" />
        ))}
        {fitSlope !== undefined && Number.isFinite(fitSlope) && (
          <line
            x1={projectX(xExt.min)}
            y1={projectY(fitSlope * xExt.min)}
            x2={projectX(xExt.max)}
            y2={projectY(fitSlope * xExt.max)}
            stroke="#b91c1c"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}
      </svg>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{xLabel}</span>
        <span>{yLabel}</span>
      </div>
    </Card>
  );
}
