"use client";
import Link from "next/link";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FlaskConical, ChevronLeft, Wrench, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleSlug = params?.moduleSlug as string;

  const isActive = moduleSlug === "millikan" || moduleSlug === "bandul";

  useEffect(() => {
    if (isActive) {
      router.replace(`/modules/${moduleSlug}/experiment`);
    }
  }, [isActive, moduleSlug, router]);

  if (isActive) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent-cobalt border-t-transparent animate-spin" />
          <span className="text-xs text-text-muted font-mono">Memuat simulasi...</span>
        </div>
      </div>
    );
  }

  // Display beautiful under development page
  const titleMap: Record<string, string> = {
    ohm: "Hukum Ohm",
    "jatuh-bebas": "Jatuh Bebas",
    boyle: "Hukum Boyle",
    snellius: "Pembiasan Cahaya (Snellius)"
  };

  const currentTitle = titleMap[moduleSlug] || "Eksperimen Baru";

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic blurred glow spots for premium modern tech aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cobalt/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-blue/5 filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 bg-white border-b border-border-default flex items-center px-6 sticky top-0 z-30 justify-between">
        <Link href="/modules" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-display font-medium">Katalog</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-cobalt flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-primary-navy text-sm">FisikaSeru</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-2xl border border-border-default shadow-depth p-8 text-center glass-panel relative overflow-hidden"
        >
          {/* Neon active border top indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-cobalt to-sky-blue" />

          {/* Icon Container */}
          <motion.div
            className="w-20 h-20 rounded-2xl bg-accent-cobalt/5 border border-accent-cobalt/10 flex items-center justify-center mx-auto mb-6 text-accent-cobalt"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Wrench className="w-9 h-9 animate-float-gentle" />
          </motion.div>

          {/* Badges */}
          <div className="flex justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-accent-cobalt/5 text-accent-cobalt border border-accent-cobalt/10">
              <Lock className="w-3 h-3" /> Segera Hadir
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
              Fase Inkubasi
            </span>
          </div>

          {/* Titles */}
          <h2 className="font-display text-2xl font-bold text-primary-navy mb-3">
            {currentTitle}
          </h2>
          
          <p className="text-sm text-text-muted leading-relaxed mb-8 font-body">
            Sobat Sains, mesin simulasi untuk topik ini sedang dirakit oleh tim ahli <b>FisikaSeru</b>. Kami sedang mematangkan visualisasi 3D interaktif dan kalkulasi fisika presisi tinggi untuk memberikan pengalaman laboratorium virtual terbaik bagi Anda.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/modules" className="w-full">
              <Button className="w-full h-11 text-sm font-semibold cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Katalog
              </Button>
            </Link>
            <p className="text-[10px] text-text-muted font-mono">
              Ingin memberikan masukan fitur? Hubungi riset@fisikaseru.id
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="py-4 border-t border-border-default/60 text-center text-[10px] text-text-muted">
        © 2026 FisikaSeru Lab. Hak Cipta Dilindungi Undang-Undang.
      </footer>
    </div>
  );
}
