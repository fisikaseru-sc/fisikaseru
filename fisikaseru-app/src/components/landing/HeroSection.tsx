"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
              <strong className="text-text-primary font-medium">eksperimen virtual</strong>,{" "}
              <strong className="text-text-primary font-medium">refleksi terbimbing</strong>, dan{" "}
              <strong className="text-text-primary font-medium">AI Tutor Sokratis</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Button size="lg">
                Mulai Eksperimen <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Play className="w-4 h-4" />
                Lihat Demo
              </Button>
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
                    fisikaseru.id/lab/bandul
                  </span>
                </div>
              </div>
              <div className="p-6">
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-5">
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

                {/* Simulation Area Mock */}
                <div className="bg-gradient-to-br from-gray-50 to-sky-blue/5 rounded-xl h-48 flex items-center justify-center mb-5 border border-border-default/50 relative overflow-hidden">
                  {/* Pendulum Visual */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-navy/30" />
                    <motion.div
                      className="w-0.5 bg-primary-navy/40 origin-top"
                      style={{ height: 80 }}
                      animate={{ rotate: [15, -15, 15] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-accent-cobalt shadow-lg" />
                    </motion.div>
                  </div>
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: "linear-gradient(var(--color-primary-navy) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-navy) 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />
                </div>

                {/* Data Preview */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Periode (T)", value: "1.42", unit: "s" },
                    { label: "Panjang (L)", value: "0.50", unit: "m" },
                    { label: "Gravitasi (g)", value: "9.81", unit: "m/s²" },
                  ].map((d) => (
                    <div key={d.label} className="bg-gray-50 rounded-lg p-3 text-center border border-border-default/50">
                      <div className="text-[10px] text-text-muted font-medium mb-1">{d.label}</div>
                      <div className="font-mono font-bold text-primary-navy text-lg leading-none">
                        {d.value}
                        <span className="text-xs text-text-muted ml-1 font-normal">{d.unit}</span>
                      </div>
                    </div>
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
                    &ldquo;Perhatikan — apa yang terjadi jika tali diperpanjang?&rdquo;
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
