"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternObservationPromptProps {
  onObservationSelected?: (choiceId: string) => void;
}

export function PatternObservationPrompt({
  onObservationSelected,
}: PatternObservationPromptProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const choices = [
    {
      id: "random",
      label: "Nilainya tetap tampak acak",
      feedback: "Mungkin kandidat ini belum menjelaskan data dengan baik. Coba ubah nilainya dan amati kembali hasil pembagiannya.",
    },
    {
      id: "approaching",
      label: "Beberapa nilai mulai mendekati angka tertentu",
      feedback: "Menarik. Coba perhatikan apakah angka-angka tersebut cenderung berkumpul di posisi tertentu.",
    },
    {
      id: "integers",
      label: "Banyak nilai tampak dekat dengan bilangan bulat",
      feedback: "Itu pengamatan penting. Sebelum menarik kesimpulan, coba uji apakah pola tersebut tetap konsisten pada tetesan lainnya.",
    },
    {
      id: "unsure",
      label: "Saya belum yakin",
      feedback: "Coba bandingkan posisi nilai pada garis bilangan di atas. Apakah mereka tersebar bebas atau justru berkumpul?",
    },
  ];

  const handleSelect = (id: string) => {
    setSelectedChoice(id);
    if (onObservationSelected) onObservationSelected(id);
  };

  const activeFeedback = choices.find((c) => c.id === selectedChoice)?.feedback;

  return (
    <div className="bg-white border border-border-default rounded-2xl p-5 shadow-sm space-y-3.5">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-accent-cobalt" />
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-primary-navy">
          Apa yang Terjadi pada Hasil Pembagian?
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {choices.map((c) => {
          const isSelected = selectedChoice === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c.id)}
              className={cn(
                "p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between",
                isSelected
                  ? "bg-accent-cobalt/5 border-accent-cobalt ring-1 ring-accent-cobalt text-primary-navy font-semibold"
                  : "bg-slate-50/70 border-border-default hover:bg-slate-50 text-text-muted hover:text-text-primary"
              )}
            >
              <span>{c.label}</span>
              <span
                className={cn(
                  "w-3 h-3 rounded-full border flex-shrink-0 ml-2",
                  isSelected ? "border-accent-cobalt bg-accent-cobalt" : "border-slate-300"
                )}
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeFeedback && (
          <motion.div
            key={selectedChoice}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-accent-cobalt/5 border border-accent-cobalt/20 rounded-xl p-3.5 text-xs text-primary-navy font-medium flex items-start gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-accent-cobalt flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{activeFeedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
