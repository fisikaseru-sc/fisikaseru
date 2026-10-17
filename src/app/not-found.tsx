"use client";
import Link from "next/link";

import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, Home, BookOpen, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cobalt/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border-default flex items-center px-6 sticky top-0 z-30 justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-muted hover:text-primary-navy transition-colors rounded-lg px-2 py-1 focus-visible:outline-2 focus-visible:outline-accent-cobalt"
          aria-label="Kembali ke beranda"
        >
          <FlaskConical className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-display font-medium">Beranda</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-cobalt flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" aria-hidden="true" />
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
          className="max-w-md w-full relative"
        >
          <Card className="glass-panel relative overflow-hidden shadow-depth">
            {/* Top colored indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-cobalt via-sky-blue to-teal" />

            <CardHeader className="pt-8 text-center">
              {/* Falling apple animation — Newton's 404 */}
              <div
                className="relative h-40 mx-auto mb-2"
                role="img"
                aria-label="Animasi apel jatuh mengenai kepala di bawah pohon — mengingatkan pada penemuan gravitasi oleh Newton"
              >
                {/* Tree branch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-1.5 rounded-full bg-primary-navy/70" />
                {/* Apple with bounce physics */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-4"
                  animate={{ y: [0, 88, 88, 0, 0] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    times: [0, 0.35, 0.55, 0.75, 1],
                    ease: ["easeIn", "easeOut", "easeIn", "easeOut"],
                  }}
                >
                  <Apple className="w-8 h-8 text-rose" aria-hidden="true" />
                </motion.div>
                {/* Impact ripple */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-[92px] w-16 h-3 rounded-full border-2 border-amber/40"
                  animate={{ scaleX: [0.2, 1.4, 0.2], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, times: [0.3, 0.45, 0.7] }}
                />
                {/* Ground line */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 border-t-2 border-dashed border-border-strong" />
                {/* Pendulum swinging beside */}
                <motion.div
                  className="absolute bottom-8 right-4 origin-top"
                  style={{ width: 2, height: 56 }}
                  animate={{ rotate: [25, -25, 25] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                >
                  <div className="w-0.5 h-full mx-auto bg-slate-400" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-cobalt" />
                </motion.div>
                {/* Formula hint */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-mono text-text-muted">
                  g ≈ 9.8 m/s² — halaman ini tetap tunduk pada gravitasi
                </span>
              </div>

              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="warning" size="sm">Error 404</Badge>
                <Badge variant="teal" size="sm">Eksperimen Ganda</Badge>
              </div>

              <CardTitle className="font-display text-2xl font-bold text-primary-navy text-center">
                Halaman Tidak Ditemukan 🍎
              </CardTitle>
              <CardDescription className="text-sm text-text-muted leading-relaxed text-center">
                Sobat Sains, seperti apel Newton yang jatuh — halaman yang Anda cari
                telah jatuh ke dimensi lain. Mari kembali ke lajur eksperimen yang ada.
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-3 bg-transparent border-t-0">
              <Link href="/" className="w-full">
                <Button className="w-full h-11 text-sm font-semibold cursor-pointer gap-2">
                  <Home className="w-4 h-4" aria-hidden="true" /> Beranda FisikaSeru
                </Button>
              </Link>
              <Link href="/modules" className="w-full">
                <Button variant="outline" className="w-full h-11 text-sm font-semibold cursor-pointer gap-2 border-border-strong hover:bg-bg-primary">
                  <BookOpen className="w-4 h-4" aria-hidden="true" /> Buka Katalog Modul
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border-default/60 text-center text-[10px] text-text-muted">
        © {new Date().getFullYear()} FisikaSeru Lab. Hak Cipta Dilindungi Undang-Undang.
      </footer>
    </div>
  );
}
