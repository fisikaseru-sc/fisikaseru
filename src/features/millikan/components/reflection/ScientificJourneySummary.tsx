// ============================================================
// FISIKASERU — YOUR SCIENTIFIC JOURNEY (NARRATIVE SUMMARY)
// SPRINT E: 5-Stage Personal Scientific Learning Narrative
// ============================================================

"use client";

import React from "react";
import {
  Compass, FlaskConical, Sparkles, BrainCircuit, HelpCircle,
  CheckCircle2, Download, Home, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { StudentPrediction } from "../../types";
import { CERArticulationEvaluation } from "../../intelligence/learningTypes";

interface ScientificJourneySummaryProps {
  prediction: StudentPrediction | null;
  trialsCount: number;
  candidatesTestedCount: number;
  finalCandidateUnit?: number;
  conclusion: {
    claim: string;
    evidence: string;
    reasoning: string;
  };
  remainingQuestion?: string;
  cerEvaluation?: CERArticulationEvaluation;
  onDownloadReport: () => void;
}

export function ScientificJourneySummary({
  prediction,
  trialsCount,
  candidatesTestedCount,
  finalCandidateUnit = 1.60,
  conclusion,
  remainingQuestion,
  cerEvaluation,
  onDownloadReport,
}: ScientificJourneySummaryProps) {
  const predictionLabelMap: Record<string, string> = {
    ALL_SAME: "Semua tetes minyak memiliki muatan yang persis sama.",
    COMPLETELY_RANDOM: "Muatan bernilai bebas dan acak tanpa keteraturan tertentu.",
    QUANTIZED_PATTERN: "Nilai muatan berbeda namun merupakan kelipatan dari suatu satuan dasar.",
    UNSURE: "Belum yakin bagaimana muatan terbagi sebelum melihat bukti.",
  };

  const initialIdeaText = prediction?.hypothesis
    ? predictionLabelMap[prediction.hypothesis] || prediction.hypothesis
    : "Memulai dengan eksplorasi terbuka tanpa praduga.";

  return (
    <div className="space-y-6 font-sans">
      {/* Narrative Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-navy text-white rounded-2xl p-6 shadow-depth relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-cobalt/20 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <Badge className="bg-accent-cobalt/40 text-sky-200 border-accent-cobalt/50 text-[10px] font-mono uppercase tracking-wider">
            Sintesis Penyelidikan Ilmiah
          </Badge>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">
            Perjalanan Saintifikmu (Your Scientific Journey)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Inilah narasi lengkap bagaimana data laboratorium nyata membimbingmu menyusun model pemahaman baru tentang kelistrikan materi.
          </p>
        </div>
      </div>

      {/* 5-Step Journey Narrative Cards */}
      <div className="space-y-4">
        {/* Step 1: Initial Idea */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            1
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Gagasan Awal (Initial Idea)
              </span>
              <Compass className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Apa yang Awalnya Kamu Pikirkan?
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              "{initialIdeaText}"
            </p>
            {prediction?.reasoning && prediction.reasoning !== "(Tidak ada catatan tambahan)" && (
              <p className="text-[11px] text-text-muted italic">
                Alasan awal: "{prediction.reasoning}" (Keyakinan: {prediction.confidence}/5)
              </p>
            )}
          </div>
        </div>

        {/* Step 2: What You Tested */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-accent-cobalt/10 text-accent-cobalt font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            2
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cobalt">
                Investigasi Laboratorium (What You Tested)
              </span>
              <FlaskConical className="w-3.5 h-3.5 text-accent-cobalt" />
            </div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Eksperimen &amp; Pengujian Hipotesis Satuan
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Kamu mengamati dan menyeimbangkan <b>{trialsCount} tetesan minyak</b> di bawah pengaruh medan listrik, lalu menguji secara sistematis <b>{candidatesTestedCount} variasi kandidat satuan pembagi</b> untuk memeriksa keteraturan data.
            </p>
          </div>
        </div>

        {/* Step 3: What The Data Showed */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-teal/10 text-teal font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            3
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal">
                Bukti Empiris (What The Data Showed)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-teal" />
            </div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Pola Tersembunyi yang Diungkapkan oleh Data
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Data membuktikan bahwa muatan listrik tidak tersebar sembarang. Ketika diuji dengan satuan dasar <b className="font-mono text-teal">~{finalCandidateUnit.toFixed(2)} × 10⁻¹⁹ C</b>, rasio nilai-nilai muatan berkali-kali merapat sangat dekat ke posisi kelipatan bilangan bulat (1, 2, 3, 4...).
            </p>
          </div>
        </div>

        {/* Step 4: What You Now Think (CER) */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            4
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700">
                Model Mental Barumu (What You Now Think)
              </span>
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-700" />
            </div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Kesimpulan Saintifik Mandiri Berbasis Bukti
            </h4>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/80 space-y-2 text-xs">
              <div>
                <span className="font-bold text-primary-navy block text-[10px] uppercase font-mono">
                  Temuan Utama (Klaim):
                </span>
                <p className="text-slate-800 italic">{conclusion.claim || "—"}</p>
              </div>
              <div>
                <span className="font-bold text-primary-navy block text-[10px] uppercase font-mono">
                  Bukti Pendukung:
                </span>
                <p className="text-slate-800 italic">{conclusion.evidence || "—"}</p>
              </div>
              <div>
                <span className="font-bold text-primary-navy block text-[10px] uppercase font-mono">
                  Penalaran Fisika:
                </span>
                <p className="text-slate-800 italic">{conclusion.reasoning || "—"}</p>
              </div>
            </div>

            {cerEvaluation && (
              <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Status Artikulasi: <b>{cerEvaluation.overallStatusDescription}</b></span>
              </div>
            )}
          </div>
        </div>

        {/* Step 5: What You Want To Explore */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            5
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700">
                Teka-Teki Lanjutan (What You Want To Explore)
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <h4 className="font-display font-bold text-sm text-primary-navy">
              Pertanyaan Ilmiah yang Masih Mengundang Rasa Ingin Tahu
            </h4>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{remainingQuestion || "Bagaimana sifat partikel fundamental seperti elektron mempengaruhi susunan seluruh materi di alam semesta?"}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-border-default rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-text-muted">
          Simpan narasi saintifik ini untuk portofolio belajarmu.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={onDownloadReport}
            className="text-xs cursor-pointer border-border-default flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Dokumen Refleksi PDF
          </Button>
          <Link href="/modules">
            <Button
              size="md"
              className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Home className="w-3.5 h-3.5" /> Selesai &amp; Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
