"use client";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/** Lightweight physics-flavored visual: animated pendulum swing (CSS/framer-motion, no 3D libs) */
function AnimatedPendulum() {
  return (
    <div
      className="relative h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
      role="img"
      aria-label="Animasi bandul sederhana yang berayun, menunjukkan gerak harmonik sederhana"
    >
      {/* pivot mount */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3 rounded-b-lg bg-slate-800" />
      <motion.div
        className="absolute top-2 left-1/2 origin-top"
        style={{ width: 2, height: 150 }}
        animate={{ rotate: [32, -32, 32] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* string */}
        <div className="w-0.5 h-full mx-auto bg-gradient-to-b from-slate-500 to-sky-blue" />
        {/* bob */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-sky-blue to-accent-cobalt shadow-[0_0_16px_rgba(59,158,226,0.6)]" />
      </motion.div>
      {/* arc guide */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-16 border-b-2 border-dashed border-slate-700 rounded-t-full" aria-hidden="true" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500">
        T = 2π√(L/g)
      </span>
      {/* period badge */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-teal/20 border border-teal/30 text-[9px] font-mono text-teal-light">
        Gerak Harmonik Sederhana
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-white to-sky-blue/5" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-accent-cobalt/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal/[0.04] blur-3xl" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-primary-navy) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Badge variant="primary" size="lg" className="mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Platform Eksperimen Fisika Mendalam
            </Badge>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-primary-navy leading-[1.1] tracking-tight mb-6">
              Bangun Pemahaman{" "}
              <span className="text-gradient-science">Fisika</span> yang{" "}
              <span className="text-gradient-discovery">Sesungguhnya</span>
            </h1>

            <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-xl">
              Bukan sekadar menghafal rumus. FisikaSeru membimbing siswa merekonstruksi
              pemahaman konsep melalui{" "}
              <strong className="text-text-primary font-medium">eksperimen virtual interaktif</strong> (seperti Tetes Minyak Millikan),{" "}
              <strong className="text-text-primary font-medium">refleksi terbimbing</strong>, dan{" "}
              <strong className="text-text-primary font-medium">AI Tutor Sokratis</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link href="/modules">
                <Button size="lg" className="cursor-pointer">
                  Mulai Eksperimen <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/modules/millikan/experiment">
                <Button variant="outline" size="lg" className="cursor-pointer">
                  <Play className="w-4 h-4" />
                  Lihat Demo Millikan
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Gratis untuk fitur inti
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cobalt" />
                Tanpa kartu kredit
              </div>
            </div>
          </motion.div>

          {/* Right - Simulation Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-depth border border-border-default bg-white">
              {/* Mock Lab Interface */}
              <div className="bg-primary-navy/[0.03] p-1.5">
                <div className="flex items-center gap-1.5 px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  <span className="ml-3 text-[11px] text-text-muted font-mono">
                    fisikaseru.id/lab/millikan
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-5">
                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  {["Prediksi", "Setup", "Eksperimen", "Analisis", "Refleksi"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-semibold ${
                          i <= 2
                            ? "bg-accent-cobalt text-white"
                            : "bg-gray-100 text-text-muted"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < 4 && (
                        <div
                          className={`w-6 h-0.5 ${
                            i < 2 ? "bg-accent-cobalt" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Pendulum visual (lightweight animated physics, no 3D lib) */}
                <AnimatedPendulum />

                {/* Data Preview */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Panjang L", value: "1.00", unit: "m" },
                    { label: "Periode T", value: "2.01", unit: "s" },
                    { label: "Gravitasi g", value: "9.79", unit: "m/s²" },
                  ].map((d) => (
                    <Card key={d.label} size="sm" className="bg-gray-50 border border-border-default/50 shadow-none">
                      <CardContent className="text-center">
                        <div className="text-[10px] text-text-muted font-medium mb-1">{d.label}</div>
                        <div className="font-mono font-bold text-primary-navy text-sm leading-none">
                          {d.value}
                          <span className="text-[10px] text-text-muted ml-0.5 font-normal">{d.unit}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating AI Hint */}
            <motion.div
              className="absolute -bottom-4 -left-8 bg-white rounded-xl shadow-depth border border-border-default p-4 max-w-[240px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <p className="text-xs font-display font-semibold text-primary-navy mb-1">AI Tutor</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    &ldquo;Jika massa bandul tidak mempengaruhi periode, mengapa prediksimu berbeda?&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
