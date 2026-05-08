"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ChevronRight, Sparkles, Play, Pause, RotateCcw, Save, ChevronLeft, ChevronDown, Settings, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const steps = ["Prediksi", "Setup", "Eksperimen", "Analisis", "Refleksi"];

export default function LabPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [sliderValues, setSliderValues] = useState({ length: 0.5, mass: 0.1, angle: 10 });
  const [isRunning, setIsRunning] = useState(false);
  const [trials, setTrials] = useState([
    { id: 1, L: 0.20, T: 0.89, T2: 0.79 },
    { id: 2, L: 0.40, T: 1.27, T2: 1.61 },
    { id: 3, L: 0.60, T: 1.55, T2: 2.40 },
  ]);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-border-default flex items-center px-4 gap-4 flex-shrink-0 z-30">
        <a href="/modules" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Katalog</span>
        </a>

        <div className="h-6 w-px bg-border-default" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-cobalt flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-sm text-primary-navy leading-none">Bandul Sederhana</h1>
            <p className="text-[10px] text-text-muted">Modul Mekanika • Gerak Harmonik</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            {steps.map((step, i) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-medium transition-all cursor-pointer",
                    i === currentStep ? "bg-accent-cobalt text-white" :
                    i < currentStep ? "bg-success/10 text-success" :
                    "bg-gray-100 text-text-muted hover:bg-gray-200"
                  )}
                  aria-current={i === currentStep ? "step" : undefined}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">
                    {i < currentStep ? "✓" : i + 1}
                  </span>
                  <span className="hidden lg:inline">{step}</span>
                </button>
                {i < steps.length - 1 && <div className={cn("w-4 h-0.5 rounded-full", i < currentStep ? "bg-success/30" : "bg-gray-200")} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted" aria-label="Bantuan">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted" aria-label="Pengaturan">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center cursor-pointer hover:bg-teal/20 transition-colors" title="AI Tutor">
            <Sparkles className="w-4 h-4 text-teal" />
          </div>
        </div>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Controls */}
        <motion.aside
          className={cn(
            "bg-white border-r border-border-default flex flex-col overflow-y-auto flex-shrink-0 transition-all duration-300",
            leftCollapsed ? "w-12" : "w-72"
          )}
          role="complementary"
          aria-label="Panel kontrol variabel"
        >
          {leftCollapsed ? (
            <button onClick={() => setLeftCollapsed(false)} className="p-3 hover:bg-gray-50 transition-colors" aria-label="Buka panel kontrol">
              <ChevronRight className="w-4 h-4 text-text-muted mx-auto" />
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-border-default flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-primary-navy">Kontrol Variabel</h2>
                <button onClick={() => setLeftCollapsed(true)} className="p-1 hover:bg-gray-100 rounded transition-colors" aria-label="Tutup panel">
                  <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />
                </button>
              </div>

              <div className="p-4 space-y-5 flex-1">
                {/* Variable Sliders */}
                {[
                  { key: "length", label: "Panjang Tali", symbol: "L", unit: "m", min: 0.1, max: 2.0, step: 0.01 },
                  { key: "mass", label: "Massa Bandul", symbol: "m", unit: "kg", min: 0.05, max: 1.0, step: 0.01 },
                  { key: "angle", label: "Sudut Awal", symbol: "θ₀", unit: "°", min: 1, max: 15, step: 1 },
                ].map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-text-primary" htmlFor={`slider-${variable.key}`}>
                        {variable.label} <span className="font-mono text-text-muted">({variable.symbol})</span>
                      </label>
                      <div className="font-mono text-sm font-semibold text-accent-cobalt">
                        {sliderValues[variable.key as keyof typeof sliderValues].toFixed(variable.key === "angle" ? 0 : 2)}
                        <span className="text-text-muted text-xs ml-0.5">{variable.unit}</span>
                      </div>
                    </div>
                    <input
                      id={`slider-${variable.key}`}
                      type="range"
                      min={variable.min}
                      max={variable.max}
                      step={variable.step}
                      value={sliderValues[variable.key as keyof typeof sliderValues]}
                      onChange={(e) => setSliderValues({ ...sliderValues, [variable.key]: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-accent-cobalt"
                      aria-label={`${variable.label} dalam ${variable.unit}`}
                      aria-valuemin={variable.min}
                      aria-valuemax={variable.max}
                      aria-valuenow={sliderValues[variable.key as keyof typeof sliderValues]}
                    />
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>{variable.min}{variable.unit}</span>
                      <span>{variable.max}{variable.unit}</span>
                    </div>
                  </div>
                ))}

                {/* Info chip */}
                <div className="bg-sky-blue/5 border border-sky-blue/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-sky-blue flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sky-blue/80 leading-relaxed">
                      Variasikan panjang tali untuk minimal 5 nilai berbeda. Massa adalah variabel kontrol.
                    </p>
                  </div>
                </div>
              </div>

              {/* Experiment Actions */}
              <div className="p-4 border-t border-border-default space-y-2">
                <Button
                  size="md"
                  className="w-full"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <><Pause className="w-4 h-4" /> Hentikan</> : <><Play className="w-4 h-4" /> Jalankan</>}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </Button>
                  <Button variant="teal" size="sm" className="flex-1">
                    <Save className="w-3.5 h-3.5" /> Simpan
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.aside>

        {/* CENTER - Simulation Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-sky-blue/[0.02] relative" role="main" aria-label="Area simulasi">
          {/* Simulation Canvas */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "linear-gradient(var(--color-primary-navy) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-navy) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            {/* Pendulum Simulation */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-1.5 bg-primary-navy/20 rounded-full mb-0" />
              <div className="w-3 h-3 rounded-full bg-primary-navy/40 -mt-1" />
              <motion.div
                className="origin-top relative"
                style={{ height: 120 + sliderValues.length * 100 }}
                animate={isRunning ? { rotate: [sliderValues.angle, -sliderValues.angle, sliderValues.angle] } : { rotate: 0 }}
                transition={isRunning ? { duration: 1.5 + sliderValues.length * 0.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
              >
                <div className="w-0.5 bg-primary-navy/30 h-full mx-auto" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-accent-cobalt shadow-lg flex items-center justify-center"
                  style={{ width: 24 + sliderValues.mass * 30, height: 24 + sliderValues.mass * 30 }}
                >
                  <span className="text-white text-[8px] font-mono font-bold">{sliderValues.mass}kg</span>
                </div>
              </motion.div>
            </div>

            {/* Measurement overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-border-default">
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Periode</div>
                <div className="font-mono font-bold text-xl text-primary-navy">
                  {(2 * Math.PI * Math.sqrt(sliderValues.length / 9.80665)).toFixed(3)}
                  <span className="text-sm text-text-muted ml-1">s</span>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-border-default">
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Frekuensi</div>
                <div className="font-mono font-bold text-xl text-primary-navy">
                  {(1 / (2 * Math.PI * Math.sqrt(sliderValues.length / 9.80665))).toFixed(3)}
                  <span className="text-sm text-text-muted ml-1">Hz</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL - Data */}
        <motion.aside
          className={cn(
            "bg-white border-l border-border-default flex flex-col overflow-y-auto flex-shrink-0 transition-all duration-300",
            rightCollapsed ? "w-12" : "w-80"
          )}
          role="complementary"
          aria-label="Panel data eksperimen"
        >
          {rightCollapsed ? (
            <button onClick={() => setRightCollapsed(false)} className="p-3 hover:bg-gray-50 transition-colors" aria-label="Buka panel data">
              <ChevronLeft className="w-4 h-4 text-text-muted mx-auto" />
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-border-default flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-primary-navy">Data Eksperimen</h2>
                <div className="flex items-center gap-1">
                  <Badge variant="primary" size="sm">{trials.length} trial</Badge>
                  <button onClick={() => setRightCollapsed(true)} className="p-1 hover:bg-gray-100 rounded transition-colors" aria-label="Tutup panel">
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Live Data Table */}
              <div className="p-4 flex-1">
                <div className="rounded-lg border border-border-default overflow-hidden">
                  <table className="w-full text-xs" role="table" aria-label="Tabel data trial">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border-default">
                        <th className="text-left px-3 py-2 font-display font-semibold text-text-muted">#</th>
                        <th className="text-left px-3 py-2 font-display font-semibold text-text-muted">L (m)</th>
                        <th className="text-left px-3 py-2 font-display font-semibold text-text-muted">T (s)</th>
                        <th className="text-left px-3 py-2 font-display font-semibold text-accent-cobalt">T² (s²)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trials.map((trial) => (
                        <tr key={trial.id} className="border-b border-border-default/50 hover:bg-accent-cobalt/[0.02] transition-colors">
                          <td className="px-3 py-2.5 font-mono text-text-muted">{trial.id}</td>
                          <td className="px-3 py-2.5 font-mono">{trial.L.toFixed(2)}</td>
                          <td className="px-3 py-2.5 font-mono">{trial.T.toFixed(2)}</td>
                          <td className="px-3 py-2.5 font-mono font-semibold text-accent-cobalt">{trial.T2.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-border-default/50">
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider mb-1">Min Trial</div>
                    <div className="font-mono font-bold text-sm text-primary-navy">3 / 5</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-border-default/50">
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider mb-1">Outlier</div>
                    <div className="font-mono font-bold text-sm text-success">0</div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-4 border-t border-border-default">
                <Button size="md" className="w-full" onClick={() => setCurrentStep(3)}>
                  Lanjut ke Analisis <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </motion.aside>
      </div>

      {/* AI Tutor Floating Hint */}
      <motion.div
        className="fixed bottom-6 right-6 bg-white rounded-xl shadow-depth border border-border-default p-4 max-w-[280px] z-50"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-teal" />
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-primary-navy mb-1">Petunjuk</p>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Coba ubah panjang tali ke 5 nilai yang berbeda. Pastikan massa tetap sama untuk setiap percobaan.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
