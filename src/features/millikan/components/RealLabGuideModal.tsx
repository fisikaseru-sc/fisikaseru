"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BookOpen, Microscope, Zap, Radio, Sparkles, Scale,
  ChevronRight, ArrowRight, CheckCircle2, Atom, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RealLabGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RealLabGuideModal({ isOpen, onClose }: RealLabGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"principles" | "visual" | "math" | "methods">("principles");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-border-default w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden font-body z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-slate-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-cobalt flex items-center justify-center text-white">
                <Microscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm tracking-tight flex items-center gap-2">
                  Prinsip Nyata Lab Tetes Minyak Millikan
                  <Badge variant="outline" className="text-[9px] border-cyan-400/40 text-cyan-300 font-mono">
                    NIST Physics
                  </Badge>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Anatomi alat, optika okular, dan matematika keseimbangan gaya
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border-default bg-slate-50 px-6 gap-2 pt-2 flex-shrink-0">
            {[
              { id: "principles", label: "1. Anatomi Alat", icon: <Layers className="w-3.5 h-3.5" /> },
              { id: "visual",     label: "2. Okular Bintang", icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: "methods",    label: "3. Dua Metode", icon: <Scale className="w-3.5 h-3.5" /> },
              { id: "math",       label: "4. Rumus Stokes", icon: <Atom className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "principles" | "visual" | "math" | "methods")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2",
                  activeTab === tab.id
                    ? "border-accent-cobalt text-accent-cobalt bg-white shadow-sm"
                    : "border-transparent text-text-muted hover:text-primary-navy"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs leading-relaxed text-slate-700">
            
            {/* TAB 1: Anatomi Alat */}
            {activeTab === "principles" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
                  <h3 className="font-display font-bold text-sm text-primary-navy mb-1.5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-cobalt" />
                    Bagaimana Eksperimen Bekerja di Laboratorium Nyata?
                  </h3>
                  <p className="text-slate-600">
                    Eksperimen Millikan mengisolasi tetesan minyak mikroskopis dalam wadah tertutup berisi dua pelat logam sejajar horizontal berjarak <code className="font-mono bg-blue-100/60 px-1 py-0.5 rounded text-primary-navy">d = 5,0 mm</code> yang terhubung ke sumber tegangan tinggi DC.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-primary-navy font-bold">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">1</span>
                      Atomizer (Penyemprot)
                    </div>
                    <p className="text-text-muted text-[11px]">
                      Menyemprotkan minyak parafin menjadi butiran kabut mikro. Gesekan di ujung nosel melepaskan elektron, membuat tetesan bermuatan listrik statis negatif secara alami.
                    </p>
                  </div>

                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-primary-navy font-bold">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">2</span>
                      Dua Pelat Logam Sejajar
                    </div>
                    <p className="text-text-muted text-[11px]">
                      Pelat atas berlubang jarum agar tetesan bisa masuk. Pelat atas diberi kutub positif (+) dan pelat bawah kutub negatif (−), menghasilkan medan listrik homogen <code className="font-mono text-primary-navy">E = V / d</code> yang menarik tetesan negatif ke atas.
                    </p>
                  </div>

                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-primary-navy font-bold">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">3</span>
                      Sumber Sinar-X (Ionisasi)
                    </div>
                    <p className="text-text-muted text-[11px]">
                      Radiasi sinar-X mengionisasi molekul udara di sekitar ruang uji. Elektron bebas hasil ionisasi menempel pada tetesan, mengubah jumlah muatan <code className="font-mono text-primary-navy">q</code> secara melompat (diskrit).
                    </p>
                  </div>

                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-primary-navy font-bold">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono">4</span>
                      Mengapa Minyak, Bukan Air?
                    </div>
                    <p className="text-text-muted text-[11px]">
                      Tetesan air cepat menguap akibat panas lampu pencahayaan. Minyak parafin memiliki tekanan uap sangat rendah, sehingga massa dan jari-jarinya tetap konstan selama pengukuran.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Okular Bintang */}
            {activeTab === "visual" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Apa yang Sebenarnya Dilihat di Dalam Mikroskop?
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Ilmuwan tidak bisa melihat elektron secara kasat mata. Sebagai gantinya, mikroskop optik diarahkan secara tegak lurus terhadap berkas cahaya samping kuat (pencahayaan medan gelap / <i>dark-field</i>).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1.5">
                    <h4 className="font-bold text-primary-navy flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Efek Hamburan Tyndall (Bintang-Bintang Kecil)
                    </h4>
                    <p className="text-text-muted text-[11px]">
                      Tetesan minyak bertindak sebagai pusat hamburan cahaya. Dalam mikroskop okular, minyak terlihat menyerupai <b>bintang-bintang kecil yang bercahaya dan berkelap-kelip</b> di tengah langit malam yang gelap pekat.
                    </p>
                  </div>

                  <div className="border border-border-default rounded-xl p-3.5 bg-white space-y-1.5">
                    <h4 className="font-bold text-primary-navy flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                      Garis Skala Okular (Reticle Mikrometer)
                    </h4>
                    <p className="text-text-muted text-[11px]">
                      Di dalam lensa terpasang garis-garis skala terkalibrasi (misal jarak 0,0 mm hingga 1,0 mm). Pengamat mencatat waktu yang dibutuhkan tetesan untuk melintasi jarak tersebut menggunakan stopwatch untuk mendapatkan kecepatan terminal <code className="font-mono text-primary-navy">v₁</code> dan <code className="font-mono text-primary-navy">v₂</code>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Dua Metode */}
            {activeTab === "methods" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Metode Melayang */}
                  <div className="border-2 border-emerald-500/30 rounded-xl p-4 bg-emerald-50/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 text-xs uppercase tracking-wide">Metode 1: Keseimbangan</span>
                      <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700 bg-white">Melayang Diam</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tegangan <code className="font-mono text-primary-navy">V</code> disetel perlahan sampai tetesan berhenti bergerak dan melayang diam di udara (<code className="font-mono text-primary-navy">v₂ = 0</code>).
                    </p>
                    <div className="bg-white rounded-lg p-2.5 border border-emerald-200 font-mono text-[11px] space-y-1 text-slate-800">
                      <p className="text-emerald-700 font-bold">Gaya Listrik = Gaya Gravitasi</p>
                      <p>q · E = m · g</p>
                      <p className="text-accent-cobalt font-bold">q = (m · g · d) / V</p>
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Sangat intuitif: cukup mencatat voltase penyeimbang saat tetesan tidak bergerak naik ataupun turun.
                    </p>
                  </div>

                  {/* Metode Dinamis */}
                  <div className="border-2 border-cyan-500/30 rounded-xl p-4 bg-cyan-50/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-800 text-xs uppercase tracking-wide">Metode 2: Dinamis</span>
                      <Badge variant="outline" className="text-[9px] border-cyan-300 text-cyan-700 bg-white">Bergerak Naik</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tegangan disetel lebih tinggi agar tetesan bergerak naik dengan kecepatan terminal konstan <code className="font-mono text-primary-navy">v₂</code>.
                    </p>
                    <div className="bg-white rounded-lg p-2.5 border border-cyan-200 font-mono text-[11px] space-y-1 text-slate-800">
                      <p className="text-cyan-700 font-bold">Fe = Fg + F_stokes</p>
                      <p>q · E = 6πηr(v₁ + v₂)</p>
                      <p className="text-accent-cobalt font-bold">q = [6πηr(v₁ + v₂)d] / V</p>
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Metode ini menghilangkan ketergantungan pada pengukuran voltase keseimbangan yang sangat sensitif terhadap arus udara.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-border-default rounded-xl p-3 text-[11px] text-text-muted">
                  💡 <b>Fakta Elegan:</b> Saat tetesan melayang diam (<code className="font-mono text-primary-navy">v₂ = 0</code>), rumus dinamis otomatis tereduksi persis menjadi rumus keseimbangan, karena <code className="font-mono text-primary-navy">6πηrv₁ = mg</code>!
                </div>
              </motion.div>
            )}

            {/* TAB 4: Rumus Stokes */}
            {activeTab === "math" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="border border-border-default rounded-xl p-4 bg-white space-y-3">
                  <h4 className="font-display font-bold text-primary-navy text-sm">
                    Bagaimana Menimbang Objek Super Kecil yang Tak Bisa Ditimbang?
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Tantangan utama Millikan adalah mengetahui massa <code className="font-mono text-primary-navy">m</code> dan radius <code className="font-mono text-primary-navy">r</code> tetesan minyak parafin. Millikan menyelesaikannya lewat <b>Hukum Stokes fluida udara</b>:
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-border-default/70 space-y-2 font-mono text-[11px]">
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block">1. Keseimbangan Jatuh Bebas (E = 0):</span>
                      <p>m · g = 6π · η · r · v₁</p>
                      <p>(4/3)π · r³ · (ρ_m − ρ_u) · g = 6π · η · r · v₁</p>
                    </div>

                    <div className="pt-2 border-t border-border-default/60">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block">2. Solusi Jari-Jari (r):</span>
                      <p className="text-accent-cobalt font-bold text-xs">
                        r = √[ (9 · η · v₁) / (2 · (ρ_m − ρ_u) · g) ]
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border-default/60">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block">3. Massa Bola Minyak (m):</span>
                      <p className="text-teal font-bold">m = ρ_m · (4/3)π · r³</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                    <p className="font-semibold">Kesimpulan Kuantisasi Millikan:</p>
                    <p>
                      Setelah menghitung muatan <code className="font-mono text-primary-navy font-bold">q</code> pada ribuan tetesan, nilainya selalu merupakan kelipatan bilangan bulat dari satu muatan dasar:
                    </p>
                    <p className="font-mono font-bold text-xs text-primary-navy">
                      q = n × e &nbsp; (e ≈ 1,602 × 10⁻¹⁹ Coulomb, &nbsp; n = 1, 2, 3, ...)
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border-default bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-text-muted">
              FisikaSeru Interactive Physics Discovery Lab
            </span>
            <Button size="sm" onClick={onClose} className="cursor-pointer text-xs">
              Tutup Panduan
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
