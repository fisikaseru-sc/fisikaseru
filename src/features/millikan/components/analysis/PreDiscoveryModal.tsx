"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreDiscoveryModalProps {
  candidateUnit: number;
  onConfirmDiscovery: () => void;
  onCancel: () => void;
}

export function PreDiscoveryModal({
  candidateUnit,
  onConfirmDiscovery,
  onCancel,
}: PreDiscoveryModalProps) {
  const [hypothesis, setHypothesis] = useState<string>("common_unit");
  const [reasoning, setReasoning] = useState<string>("");

  const choices = [
    {
      id: "common_unit",
      label: "Nilai-nilai muatan tampaknya memiliki satuan dasar pembagi yang sama",
    },
    {
      id: "coincidence",
      label: "Keteraturan ini mungkin hanya kebetulan sementara",
    },
    {
      id: "unsure",
      label: "Saya belum dapat menyimpulkan dengan pasti",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white border border-border-default rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cobalt/10 text-accent-cobalt text-[10px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Konfirmasi Artikulasi Ilmiah
          </div>
          <h3 className="font-display font-bold text-xl text-primary-navy">
            Apa yang Kamu Duga?
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Kandidat satuan <b className="font-mono text-primary-navy">{candidateUnit.toFixed(2)} × 10⁻¹⁹ C</b> membuat hasil pembagian berulang kali mendekati posisi bilangan bulat. Menurutmu, apa arti fenomena ini?
          </p>
        </div>

        {/* Structured Hypothesis Choices */}
        <div className="space-y-2">
          {choices.map((c) => {
            const isSelected = hypothesis === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setHypothesis(c.id)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between",
                  isSelected
                    ? "bg-accent-cobalt/5 border-accent-cobalt ring-1 ring-accent-cobalt text-primary-navy font-semibold"
                    : "bg-slate-50 border-border-default hover:bg-slate-100 text-text-muted hover:text-text-primary"
                )}
              >
                <span>{c.label}</span>
                <span
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border flex-shrink-0 ml-2 flex items-center justify-center text-[9px]",
                    isSelected ? "border-accent-cobalt bg-accent-cobalt text-white" : "border-slate-300"
                  )}
                >
                  {isSelected && "✓"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Reasoning Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-display font-semibold text-text-muted flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Apa bukti observasi yang membuatmu berpikir demikian? (Opsional)
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={2}
            placeholder="Contoh: Titik-titik rasio mengelompok sangat dekat di sekitar angka 1, 2, 3, 4 pada garis bilangan..."
            className="w-full text-xs p-3 rounded-xl border border-border-default bg-slate-50 focus:bg-white focus:ring-1 focus:ring-accent-cobalt focus:outline-hidden transition-all placeholder:text-slate-400 font-sans"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-default">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            className="text-xs cursor-pointer border-border-default"
          >
            Lanjut Uji Data Lain
          </Button>
          <Button
            size="md"
            onClick={onConfirmDiscovery}
            className="bg-accent-cobalt hover:bg-accent-cobalt/90 text-white cursor-pointer text-xs font-bold px-5 flex items-center gap-1.5 shadow-sm"
          >
            Buka Momen Penemuan!
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
