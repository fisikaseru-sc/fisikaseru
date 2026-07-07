"use client";
import Link from "next/link";

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, ArrowLeft, Home, BookOpen, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cobalt/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal/5 filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 bg-white border-b border-border-default flex items-center px-6 sticky top-0 z-30 justify-between">
        <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-display font-medium">Kembali</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-cobalt flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-primary-navy text-sm">FisikaSeru</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-2xl border border-border-default shadow-depth p-8 text-center glass-panel relative overflow-hidden"
        >
          {/* Top colored indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-cobalt via-sky-blue to-teal" />

          {/* Interactive Floating Atom Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full bg-accent-cobalt/5 border border-accent-cobalt/10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            
            {/* Spinning orbital electron rings */}
            <motion.div
              className="absolute w-20 h-8 border border-teal/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            <motion.div
              className="absolute w-20 h-8 border border-sky-blue/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              style={{ transform: "rotate(60deg)" }}
            />
            <motion.div
              className="absolute w-20 h-8 border border-accent-cobalt/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
              style={{ transform: "rotate(-60deg)" }}
            />

            {/* Core Nucleus */}
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cobalt to-sky-blue flex items-center justify-center text-white"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Atom className="w-5 h-5 animate-pulse-soft" />
            </motion.div>
          </div>

          {/* Badge */}
          <div className="flex justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal/5 text-teal border border-teal/10">
              Fase Kalibrasi
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
              Coming Soon
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl font-bold text-primary-navy mb-3">
            Halaman Sedang Dirakit 🛠️
          </h2>

          {/* Description */}
          <p className="text-sm text-text-muted leading-relaxed mb-8 font-body">
            Sobat Sains, instrumen dan modul pembelajaran untuk topik ini sedang dirancang dan dikalibrasi oleh tim pengembang <b>FisikaSeru</b>. Kami sedang menyusun visualisasi interaktif dan kurikulum fisika terbaik agar Anda dapat benar-benar memahaminya.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full">
              <Button className="w-full h-11 text-sm font-semibold cursor-pointer gap-2">
                <Home className="w-4 h-4" /> Beranda FisikaSeru
              </Button>
            </Link>
            <Link href="/modules" className="w-full">
              <Button variant="outline" className="w-full h-11 text-sm font-semibold cursor-pointer gap-2 border-border-strong hover:bg-bg-primary">
                <BookOpen className="w-4 h-4" /> Buka Katalog Modul
              </Button>
            </Link>
            <p className="text-[10px] text-text-muted font-mono mt-2">
              Ada ide seru untuk modul ini? Hubungi kami di ide@fisikaseru.id
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border-default/60 text-center text-[10px] text-text-muted">
        © {new Date().getFullYear()} FisikaSeru Lab. Hak Cipta Dilindungi Undang-Undang.
      </footer>
    </div>
  );
}
