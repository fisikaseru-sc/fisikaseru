"use client";

/**
 * PredictionView — langkah PREDICT modul Gerak Parabola.
 *
 * Siswa menebak sudut peluncuran yang menghasilkan jarak terjauh
 * sebelum menyentuh simulasi. Prediksi disimpan ke localStorage
 * (`parabola-prediction`) dan dikonfrontasikan lagi di ReflectionView.
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, Lightbulb, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PARABOLA_CONFIG } from "../config";
import { STORAGE_KEYS, type ParabolaPrediction } from "../types";

const STEPS = ["Prediksi", "Eksperimen", "Analisis", "Refleksi"];

export default function PredictionView() {
  // Komponen dimuat via dynamic({ ssr: false }) — lazy init localStorage
  // aman dari mismatch hidrasi. (Pembayaran debt lint: set-state-in-effect.)
  const [savedInit] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.prediction);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ParabolaPrediction;
      return typeof parsed.angle === "number" ? parsed : null;
    } catch {
      // abaikan data korup — biarkan siswa mengisi ulang
      return null;
    }
  });
  const [angle, setAngle] = useState(savedInit?.angle ?? 45);
  const [reasoning, setReasoning] = useState(savedInit?.reasoning ?? "");
  const [confidence, setConfidence] = useState(savedInit?.confidence ?? 3);
  const [saved, setSaved] = useState<ParabolaPrediction | null>(savedInit);

  const handleSubmit = () => {
    const prediction: ParabolaPrediction = {
      angle,
      reasoning: reasoning.trim() || "(Tidak ada catatan tambahan)",
      confidence,
      submittedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEYS.prediction, JSON.stringify(prediction));
    setSaved(prediction);
  };

  const handleRevise = () => setSaved(null);

  return (
    <div className="min-h-screen bg-bg-primary font-body">
      {/* Header */}
      <header className="h-12 bg-white border-b border-border-default flex items-center px-4 sticky top-0 z-30">
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <Link href="/modules" className="hover:text-primary-navy transition-colors whitespace-nowrap">
            Katalog
          </Link>
          <span>/</span>
          <span className="text-xs font-semibold text-primary-navy truncate">{PARABOLA_CONFIG.meta.title}</span>
          <span>/</span>
          <span className="text-text-primary font-semibold">Prediksi</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={
                  i === 0
                    ? "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent-cobalt text-white"
                    : "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-text-muted bg-gray-50 opacity-40"
                }
              >
                <span className="font-mono opacity-70">{i + 1}</span>
                <span className="hidden lg:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-3 h-px bg-border-default" />}
            </React.Fragment>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {saved ? (
          /* ── Konfirmasi prediksi tersimpan ── */
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-primary-navy mb-2">Prediksi Terekam!</h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto mb-6">
              Kamu menebak sudut <b className="font-mono text-accent-cobalt">{saved.angle}°</b> memberi jarak terjauh.
              Simpan tebakan ini baik-baik — kita akan mengadunya melawan data eksperimenmu di akhir modul.
            </p>

            <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 mb-7 text-left max-w-md mx-auto">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-2">Catatan prediksimu</p>
              <p className="text-sm text-slate-700 italic leading-relaxed mb-3">&ldquo;{saved.reasoning}&rdquo;</p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="font-mono">Keyakinan:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={
                        n <= saved.confidence
                          ? "w-2 h-2 rounded-full bg-accent-cobalt"
                          : "w-2 h-2 rounded-full bg-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="font-mono font-bold text-primary-navy">{saved.confidence}/5</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/modules/parabola/experiment">
                <Button size="lg" className="cursor-pointer">
                  Mulai Eksperimen <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={handleRevise} className="cursor-pointer">
                Ubah Prediksi
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ── Formulir prediksi ── */
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-7">
              <Badge variant="warning" size="lg" className="mb-3">
                <Lightbulb className="w-3.5 h-3.5" /> Langkah 1 · Prediksi
              </Badge>
              <h1 className="font-display text-2xl font-bold text-primary-navy mb-1.5">
                Sebelum Membuka Laboratorium…
              </h1>
              <p className="text-sm text-text-muted">
                Rekam intuisimu dulu — tidak ada jawaban benar atau salah di tahap ini.
              </p>
            </div>

            {/* Pertanyaan besar */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-depth relative overflow-hidden border border-slate-800 mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full filter blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-500 text-white border-0 text-[9px] font-mono uppercase tracking-wider">
                  The Big Question
                </Badge>
              </div>
              <h2 className="font-display font-bold text-base leading-snug mb-1.5">
                &ldquo;Pada sudut berapa meriam harus diarahkan agar pelurunya menempuh jarak terjauh?&rdquo;
              </h2>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sebuah peluncur menembakkan bola dengan kecepatan awal yang sama, tetapi sudutnya bisa kamu atur
                dari 10° sampai 80°. Menurut intuisimu, sudut mana yang membuat bola jatuh sejauh mungkin?
              </p>
            </div>

            {/* Slider sudut */}
            <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 mb-4">
              <Label htmlFor="prediksi-sudut" className="font-display font-bold text-sm text-primary-navy">
                Tebakan sudut optimalmu
              </Label>

              <div className="flex items-baseline justify-center gap-2 my-5">
                <motion.span
                  key={angle}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="font-mono text-5xl font-bold text-accent-cobalt tabular-nums"
                >
                  {angle}
                </motion.span>
                <span className="font-mono text-xl text-text-muted">°</span>
              </div>

              <Slider
                id="prediksi-sudut"
                value={[angle]}
                min={10}
                max={80}
                step={1}
                onValueChange={(values) => {
                  const next = values[0];
                  if (typeof next === "number") setAngle(next);
                }}
                aria-label="Tebakan sudut optimal"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-2">
                <span>10° datar</span>
                <span>80° curam</span>
              </div>

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="prediksi-alasan" className="text-xs font-medium text-text-muted">
                  Mengapa kamu memilih sudut itu? (opsional)
                </Label>
                <Input
                  id="prediksi-alasan"
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Contoh: makin curam makin jauh karena tenaganya penuh ke atas…"
                  className="text-sm"
                />
              </div>

              <div className="mt-5">
                <Label className="text-xs font-medium text-text-muted">Seberapa yakin kamu?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    value={[confidence]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(values) => {
                      const next = values[0];
                      if (typeof next === "number") setConfidence(next);
                    }}
                    aria-label="Tingkat keyakinan"
                    className="flex-1"
                  />
                  <span className="font-mono text-sm font-bold text-primary-navy w-8 text-right">
                    {confidence}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Para fisikawan selalu memulai dari dugaan. Nanti kita akan bandingkan tebakanmu dengan data
                eksperimen — di situlah belajar sesungguhnya terjadi.
              </p>
            </div>

            <div className="flex justify-between gap-3">
              <Link href="/modules">
                <Button variant="outline" size="lg" className="cursor-pointer">
                  <ChevronLeft className="w-4 h-4" /> Katalog
                </Button>
              </Link>
              <Button size="lg" onClick={handleSubmit} className="cursor-pointer">
                Kirim Prediksi <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
