"use client";

/**
 * ReflectionView — langkah REFLECT modul Gerak Parabola.
 *
 * Mengonfrontasikan prediksi awal siswa (`parabola-prediction`) dengan
 * sudut terbaik dari data eksperimen (`parabola-trials`), mengajak siswa
 * menjawab 3 pertanyaan sokratis dari konfigurasi modul, lalu menutup
 * dengan tantangan transfer ke Bulan (g = 1,62 m/s²). Menandai modul
 * tuntas di `parabola-completed`.
 */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Lightbulb,
  Moon,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARABOLA_CONFIG } from "../config";
import { theoreticalRange } from "../simulation/projectile";
import {
  STORAGE_KEYS,
  bestTrial,
  loadTrials,
  type ParabolaCompletion,
  type ParabolaPrediction,
  type ParabolaTrial,
} from "../types";

const STEPS = ["Prediksi", "Eksperimen", "Analisis", "Refleksi"];

/** Batas ambang selisih sudut (°) untuk tiap kategori vonis prediksi. */
const AKURAT = 3;
const DEKAT = 10;

const slideIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ReflectionView() {
  const [prediction, setPrediction] = useState<ParabolaPrediction | null>(null);
  const [trials, setTrials] = useState<ParabolaTrial[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [moonGuess, setMoonGuess] = useState("");
  const [moonRevealed, setMoonRevealed] = useState(false);
  const [completed, setCompleted] = useState<ParabolaCompletion | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // ── Muat state tersimpan ──
  useEffect(() => {
    try {
      const rawPrediksi = window.localStorage.getItem(STORAGE_KEYS.prediction);
      if (rawPrediksi) {
        const parsed = JSON.parse(rawPrediksi) as ParabolaPrediction;
        if (typeof parsed.angle === "number") setPrediction(parsed);
      }
    } catch {
      // prediksi korup — biarkan null
    }

    setTrials(loadTrials());

    try {
      const rawSelesai = window.localStorage.getItem(STORAGE_KEYS.completed);
      if (rawSelesai) {
        const parsed = JSON.parse(rawSelesai) as ParabolaCompletion;
        if (parsed && typeof parsed.completedAt === "string") {
          setCompleted(parsed);
          setAnswers(parsed.answers ?? {});
        }
      }
    } catch {
      // penanda tuntas korup — abaikan
    }
  }, []);

  const best = useMemo(() => bestTrial(trials), [trials]);

  // v₀ untuk tantangan Bulan: dari percobaan terbaik siswa, atau default konfigurasi.
  const v0Tantangan = useMemo(() => {
    const varV0 = PARABOLA_CONFIG.simulation.independent.find((v) => v.key === "v0");
    return best?.v0 ?? varV0?.defaultValue ?? 25;
  }, [best]);

  const jarakBumi = useMemo(
    () => theoreticalRange(v0Tantangan, 45, PARABOLA_CONFIG.constants.G_BUMI),
    [v0Tantangan],
  );
  const jarakBulan = useMemo(
    () => theoreticalRange(v0Tantangan, 45, PARABOLA_CONFIG.constants.G_BULAN),
    [v0Tantangan],
  );

  // ── Vonis konfrontasi prediksi vs data ──
  const vonis = useMemo(() => {
    if (!prediction || !best) return null;
    const selisih = Math.abs(best.angle - prediction.angle);
    if (selisih <= AKURAT) {
      return {
        label: "Intuisimu tajam!",
        tone: "success" as const,
        pesan: `Tebakanmu (${prediction.angle}°) nyaris tepat sama dengan sudut terbaik di datamu (${best.angle}°). Sekarang jawab: mengapa sudut itu istimewa?`,
      };
    }
    if (selisih <= DEKAT) {
      return {
        label: "Hampir benar!",
        tone: "warning" as const,
        pesan: `Kamu menebak ${prediction.angle}°, tetapi sudut terbaik di datamu adalah ${best.angle}°. Selisih ${selisih}° — cukup dekat. Apa yang membuat intuisimu sedikit meleset?`,
      };
    }
    return {
      label: "Data membantah prediksi",
      tone: "warning" as const,
      pesan: `Kamu menebak ${prediction.angle}°, tetapi data eksperimenmu menunjukkan ${best.angle}° memberi jarak terjauh (${best.range.toFixed(1)} m). Meleset itu bagus — artinya kamu belajar sesuatu yang baru!`,
    };
  }, [prediction, best]);

  const semuaTerjawab = PARABOLA_CONFIG.reflectionQuestions.every(
    (q) => (answers[q.key] ?? "").trim().length >= 5,
  );

  const setJawab = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSelesai = () => {
    const payload: ParabolaCompletion = {
      completedAt: new Date().toISOString(),
      answers,
    };
    window.localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(payload));
    setCompleted(payload);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 4000);
  };

  const tebakanBulan = Number.parseFloat(moonGuess.replace(",", "."));
  const tebakanValid = Number.isFinite(tebakanBulan) && tebakanBulan > 0;
  const galatRelatif = tebakanValid ? Math.abs(tebakanBulan - jarakBulan) / jarakBulan : 0;

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
          <span className="text-text-primary font-semibold">Refleksi</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={
                  i === 3
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

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Judul langkah */}
        <motion.div {...slideIn} className="text-center">
          <Badge variant="warning" size="lg" className="mb-3">
            <Lightbulb className="w-3.5 h-3.5" /> Langkah 4 · Refleksi
          </Badge>
          <h1 className="font-display text-2xl font-bold text-primary-navy mb-1.5">
            Saatnya Berhadapan dengan Data
          </h1>
          <p className="text-sm text-text-muted">
            Bandingkan prediksimu dengan hasil eksperimen, jawab pertanyaan refleksi,
            lalu uji pemahamanmu dengan tantangan transfer ke Bulan.
          </p>
        </motion.div>

        {/* Penanda tuntas (bila sudah pernah selesai) */}
        {completed && !justSaved && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Modul ini sudah kamu tuntas</AlertTitle>
            <AlertDescription>
              Refleksi terakhir disimpan pada{" "}
              {new Date(completed.completedAt).toLocaleString("id-ID")}. Kamu boleh
              memperbarui jawaban di bawah — perubahan akan menimpa yang lama.
            </AlertDescription>
          </Alert>
        )}

        {justSaved && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertTitle>Refleksi tersimpan — modul tuntas! 🎉</AlertTitle>
              <AlertDescription>
                Perjalananmu di modul {PARABOLA_CONFIG.meta.title} selesai. Kamu bisa
                kembali ke katalog atau mencoba modul lain.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* ── 1. Konfrontasi prediksi vs data ── */}
        <motion.section {...slideIn} transition={{ delay: 0.05 }} className="space-y-4">
          <h2 className="font-display font-bold text-base text-primary-navy">
            Prediksimu vs Temuanmu
          </h2>

          {!prediction ? (
            <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 text-sm text-text-muted">
              Kamu belum mengisi langkah Prediksi. Kalau ingin intuisimu diuji,
              buka dulu{" "}
              <Link href="/modules/parabola/predict" className="text-accent-cobalt hover:underline font-medium">
                halaman prediksi
              </Link>
              . Kamu tetap bisa melanjutkan refleksi ini.
            </div>
          ) : !best ? (
            <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 text-sm text-text-muted">
              Belum ada data eksperimen yang terekam. Jalankan lab dan catat beberapa
              percobaan di{" "}
              <Link href="/modules/parabola/experiment" className="text-accent-cobalt hover:underline font-medium">
                langkah Eksperimen
              </Link>{" "}
              agar prediksimu (sudut {prediction.angle}°) bisa diadu dengan data.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Kartu prediksi */}
              <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 text-center">
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Prediksi awalmu
                </p>
                <p className="font-mono text-4xl font-bold text-primary-navy tabular-nums">
                  {prediction.angle}°
                </p>
                <p className="text-[11px] text-text-muted mt-2 italic truncate" title={prediction.reasoning}>
                  &ldquo;{prediction.reasoning}&rdquo;
                </p>
              </div>
              {/* Kartu temuan */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-depth p-5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cobalt/20 rounded-full filter blur-2xl pointer-events-none" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Temuan eksperimenmu
                </p>
                <p className="font-mono text-4xl font-bold text-amber-400 tabular-nums">{best.angle}°</p>
                <p className="text-[11px] text-slate-300 mt-2 font-mono">
                  jarak {best.range.toFixed(1)} m · {trials.length} data
                </p>
              </div>
            </div>
          )}

          {vonis && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{vonis.label}</AlertTitle>
              <AlertDescription>{vonis.pesan}</AlertDescription>
            </Alert>
          )}
        </motion.section>

        {/* ── 2. Pertanyaan sokratis ── */}
        <motion.section {...slideIn} transition={{ delay: 0.1 }} className="space-y-4">
          <h2 className="font-display font-bold text-base text-primary-navy">
            Pertanyaan Refleksi
          </h2>
          <p className="text-xs text-text-muted -mt-2">
            Tulis jawabanmu dengan kalimatmu sendiri — tidak dinilai benar/salah,
            yang penting proses berpikirmu.
          </p>

          {PARABOLA_CONFIG.reflectionQuestions.map((q, i) => (
            <div key={q.key} className="bg-white rounded-2xl border border-border-default shadow-sm p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent-cobalt/10 text-accent-cobalt flex items-center justify-center font-mono text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{q.q}</p>
              </div>
              <textarea
                value={answers[q.key] ?? ""}
                onChange={(e) => setJawab(q.key, e.target.value)}
                rows={3}
                placeholder="Tulis pemikiranmu di sini…"
                aria-label={`Jawaban pertanyaan refleksi ${i + 1}`}
                className="w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent-cobalt/40 focus:border-accent-cobalt resize-y"
              />
            </div>
          ))}
        </motion.section>

        {/* ── 3. Tantangan transfer ke Bulan ── */}
        <motion.section {...slideIn} transition={{ delay: 0.15 }} className="space-y-4">
          <h2 className="font-display font-bold text-base text-primary-navy">
            Tantangan: Pindahkan Meriam ke Bulan 🌙
          </h2>

          <div className="bg-white rounded-2xl border border-border-default shadow-sm p-5 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Di Bumi, meriammu meluncurkan bola dengan v₀ ={" "}
              <b className="font-mono text-accent-cobalt">{v0Tantangan} m/s</b> pada sudut 45°,
              dan bola menempuh sekitar{" "}
              <b className="font-mono text-accent-cobalt">{jarakBumi.toFixed(1)} m</b>.
              Sekarang meriam yang sama dipindahkan ke Bulan, tempat gravitasinya hanya{" "}
              <b className="font-mono">1,62 m/s²</b> (sekitar ⅙ gravitasi Bumi).
            </p>

            <p className="text-sm font-medium text-primary-navy">
              Menurutmu, kira-kira berapa meter jarak tempuh bola di Bulan?
            </p>

            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-40">
                <Label htmlFor="tebakan-bulan" className="text-xs font-medium text-text-muted mb-1.5 block">
                  Tebakan jarak di Bulan (m)
                </Label>
                <Input
                  id="tebakan-bulan"
                  type="number"
                  inputMode="decimal"
                  value={moonGuess}
                  onChange={(e) => {
                    setMoonGuess(e.target.value);
                    setMoonRevealed(false);
                  }}
                  placeholder="misal 250"
                  className="font-mono"
                  disabled={moonRevealed}
                />
              </div>
              <Button
                onClick={() => setMoonRevealed(true)}
                disabled={!tebakanValid || moonRevealed}
                className="cursor-pointer"
              >
                <Moon className="w-4 h-4" /> Cek Jawaban
              </Button>
            </div>

            {moonRevealed && tebakanValid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-2"
              >
                <p className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Jawaban fisika
                </p>
                <p className="text-sm leading-relaxed">
                  Bola menempuh <b className="font-mono text-amber-400">{jarakBulan.toFixed(1)} m</b>{" "}
                  di Bulan — sekitar <b className="font-mono text-amber-400">
                    {(jarakBulan / jarakBumi).toFixed(1)}×
                  </b>{" "}
                  jarak di Bumi. Tebakanmu meleset{" "}
                  <b className="font-mono">{(galatRelatif * 100).toFixed(0)}%</b> dari nilai sebenarnya.
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Karena R = v₀²·sin(2θ)/g, jarak berbanding <i>terbalik</i> dengan gravitasi.
                  Gravitasi Bulan {PARABOLA_CONFIG.constants.G_BUMI / PARABOLA_CONFIG.constants.G_BULAN}× lebih lemah,
                  maka jaraknya melonjak {PARABOLA_CONFIG.constants.G_BUMI / PARABOLA_CONFIG.constants.G_BULAN}× lipat —
                  itulah mengapa astronaut Apollo bisa melompat jauh di permukaan Bulan.
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ── Aksi akhir ── */}
        <motion.div
          {...slideIn}
          transition={{ delay: 0.2 }}
          className="flex justify-between gap-3 pt-2"
        >
          <Link href="/modules/parabola/analysis">
            <Button variant="outline" size="lg" className="cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Analisis
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {!semuaTerjawab && (
              <span className="text-[11px] text-text-muted hidden sm:block">
                Isi semua jawaban refleksi untuk menandai modul tuntas.
              </span>
            )}
            <Button
              size="lg"
              onClick={handleSelesai}
              disabled={!semuaTerjawab}
              className="cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tandai Tuntas <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
