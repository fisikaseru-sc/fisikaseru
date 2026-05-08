"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ChevronLeft, ChevronRight, TrendingUp, Info, Sparkles, Download } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const trialData = [
  { L: 0.20, T: 0.89, T2: 0.79 },
  { L: 0.40, T: 1.27, T2: 1.61 },
  { L: 0.60, T: 1.55, T2: 2.40 },
  { L: 0.80, T: 1.79, T2: 3.20 },
];

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);
  const sumY2 = data.reduce((s, d) => s + d.y * d.y, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = data.reduce((s, d) => s + (d.y - (slope * d.x + intercept)) ** 2, 0);
  const ssTot = data.reduce((s, d) => s + (d.y - sumY / n) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export default function AnalysisPage() {
  const [transform, setTransform] = useState<"T vs L" | "T² vs L" | "Log-Log">("T² vs L");

  const chartData = useMemo(() => {
    return trialData.map((d) => ({
      x: d.L,
      y: transform === "T vs L" ? d.T : transform === "T² vs L" ? d.T2 : Math.log(d.T),
    }));
  }, [transform]);

  const regression = useMemo(() => linearRegression(chartData), [chartData]);
  const calculatedG = useMemo(() => (4 * Math.PI * Math.PI) / regression.slope, [regression.slope]);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="h-14 bg-white border-b border-border-default flex items-center px-6 gap-4 sticky top-0 z-30">
        <a href="/modules/bandul/experiment" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Lab</span>
        </a>
        <div className="h-6 w-px bg-border-default" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-cobalt flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-mono uppercase">Langkah 4 dari 6 • Bandul</span>
            <h1 className="font-display font-semibold text-sm text-primary-navy leading-none">Analisis: T² vs L</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Hint Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal/5 border border-teal/20 rounded-xl px-5 py-3 flex items-center gap-3 mb-8"
        >
          <Sparkles className="w-5 h-5 text-teal flex-shrink-0" />
          <p className="text-sm text-teal/90">Atur garis regresi untuk menemukan gravitasi (g). Cek nilai R² — semakin dekat ke 1, semakin baik fitnya.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Chart Area - Left 3 columns */}
          <div className="lg:col-span-3">
            {/* Transform Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-display font-semibold text-text-muted mr-2">Transform:</span>
              {(["T vs L", "T² vs L", "Log-Log"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransform(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all cursor-pointer",
                    transform === t ? "bg-accent-cobalt text-white" : "bg-white border border-border-default text-text-muted hover:border-accent-cobalt/30"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Regression Stats Bar */}
            <div className="flex items-center gap-4 mb-4">
              {regression.r2 > 0.95 && (
                <Badge variant="success" size="lg">
                  <TrendingUp className="w-3.5 h-3.5" /> Eureka! Excellent Fit
                </Badge>
              )}
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-text-muted text-xs">Current R²</span>
                  <span className="ml-2 font-mono font-bold text-accent-cobalt">{regression.r2.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-text-muted text-xs">Gradient (m)</span>
                  <span className="ml-2 font-mono font-bold text-primary-navy">{regression.slope.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border border-border-default p-6 shadow-sm">
              <h3 className="font-display font-semibold text-primary-navy mb-4">
                Linear Regression Analysis
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      name="L"
                      unit=" m"
                      label={{ value: "Panjang Tali, L (m)", position: "bottom", offset: 10, style: { fontSize: 12, fill: "#6B7280" } }}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      domain={[0, "auto"]}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      name={transform === "T vs L" ? "T" : "T²"}
                      unit={transform === "T vs L" ? " s" : " s²"}
                      label={{ value: transform === "T vs L" ? "Periode T (s)" : "T² (s²)", angle: -90, position: "insideLeft", offset: 0, style: { fontSize: 12, fill: "#6B7280" } }}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, fontFamily: "JetBrains Mono" }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Scatter data={chartData} fill="#1B4FD8" r={6} stroke="#fff" strokeWidth={2} />
                    {/* Regression line approximation */}
                    <ReferenceLine
                      segment={[
                        { x: 0, y: regression.intercept },
                        { x: Math.max(...chartData.map(d => d.x)) * 1.1, y: regression.slope * Math.max(...chartData.map(d => d.x)) * 1.1 + regression.intercept }
                      ]}
                      stroke="#14213D"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Panel - Data & Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Data Points Table */}
            <div className="bg-white rounded-xl border border-border-default p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm text-primary-navy">Data Points</h3>
                <Badge variant="primary" size="sm">n = {trialData.length}</Badge>
              </div>
              <div className="rounded-lg border border-border-default overflow-hidden">
                <table className="w-full text-xs" aria-label="Data points">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border-default">
                      <th className="text-left px-3 py-2 font-display font-semibold text-text-muted">L (m)</th>
                      <th className="text-left px-3 py-2 font-display font-semibold text-text-muted">T (s)</th>
                      <th className="text-left px-3 py-2 font-display font-semibold text-accent-cobalt">T² (s²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialData.map((d, i) => (
                      <tr key={i} className="border-b border-border-default/50">
                        <td className="px-3 py-2.5 font-mono">{d.L.toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-mono">{d.T.toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-accent-cobalt">{d.T2.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculate Gravity */}
            <div className="bg-white rounded-xl border border-border-default p-5 shadow-sm">
              <h3 className="font-display font-semibold text-primary-navy mb-4">Calculate Gravity (g)</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-border-default/50">
                <p className="text-xs text-text-muted font-mono mb-2">Formula</p>
                <p className="font-mono text-lg text-primary-navy font-semibold">
                  g = 4π² / m
                </p>
              </div>
              <div className="bg-accent-cobalt/5 rounded-lg p-4 border border-accent-cobalt/20">
                <p className="text-xs text-text-muted mb-1">Calculated Value</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-primary-navy">{calculatedG.toFixed(2)}</span>
                  <span className="text-sm text-text-muted font-mono">m/s²</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <Button size="lg" className="w-full">
              Lanjut ke Refleksi <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
