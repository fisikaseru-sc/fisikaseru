"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Clock, BarChart3, Star, Lock, ArrowRight, FlaskConical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categories = ["Semua", "Mekanika", "Kelistrikan", "Fisika Modern", "Termodinamika", "Optika"];

const modules = [
  { id: "bandul", title: "Bandul Sederhana", category: "Mekanika", difficulty: 2, duration: "25 mnt", concept: "Gerak Harmonik Sederhana", desc: "Tentukan percepatan gravitasi bumi melalui periode ayunan bandul.", status: "free", progress: 75 },
  { id: "ohm", title: "Hukum Ohm", category: "Kelistrikan", difficulty: 2, duration: "20 mnt", concept: "Resistansi & Arus", desc: "Temukan hubungan tegangan, arus, dan hambatan.", status: "free", progress: 0 },
  { id: "jatuh-bebas", title: "Jatuh Bebas", category: "Mekanika", difficulty: 1, duration: "15 mnt", concept: "Kinematika Gerak", desc: "Analisis gerak jatuh bebas dari berbagai ketinggian.", status: "free", progress: 100 },
  { id: "millikan", title: "Tetes Minyak Millikan", category: "Fisika Modern", difficulty: 4, duration: "35 mnt", concept: "Kuantisasi Muatan", desc: "Temukan muatan elektron fundamental.", status: "pro", progress: 0 },
  { id: "boyle", title: "Hukum Boyle", category: "Termodinamika", difficulty: 2, duration: "20 mnt", concept: "Gas Ideal", desc: "Hubungan tekanan dan volume gas pada suhu tetap.", status: "coming", progress: 0 },
  { id: "snellius", title: "Pembiasan Cahaya", category: "Optika", difficulty: 3, duration: "25 mnt", concept: "Hukum Snellius", desc: "Verifikasi hukum pembiasan cahaya.", status: "coming", progress: 0 },
];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = modules.filter((m) => {
    const matchCat = activeCategory === "Semua" || m.category === activeCategory;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.concept.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-white border-b border-border-default sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-cobalt flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-primary-navy">FisikaSeru</span>
          </a>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Dashboard</Button>
            <Button size="sm">Profil</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <a href="/" className="hover:text-accent-cobalt transition-colors">Beranda</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium">Katalog Modul</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-navy mb-2">Katalog Eksperimen</h1>
          <p className="text-text-muted">Pilih modul eksperimen fisika dan mulai membangun pemahaman mendalam.</p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              placeholder="Cari modul atau konsep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cobalt/20 focus:border-accent-cobalt transition-all font-body"
              aria-label="Cari modul eksperimen"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-all cursor-pointer",
                  activeCategory === cat
                    ? "bg-accent-cobalt text-white shadow-sm"
                    : "bg-white border border-border-default text-text-muted hover:text-text-primary hover:border-accent-cobalt/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Module Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((mod, i) => (
              <motion.a
                key={mod.id}
                href={`/modules/${mod.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="science-card group cursor-pointer overflow-hidden block"
              >
                {/* Progress bar at top */}
                {mod.progress > 0 && (
                  <div className="h-1 bg-gray-100">
                    <div className="h-full bg-gradient-to-r from-accent-cobalt to-sky-blue rounded-r-full transition-all" style={{ width: `${mod.progress}%` }} />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" size="sm" className="mb-2">{mod.category}</Badge>
                      <h3 className="font-display font-semibold text-primary-navy group-hover:text-accent-cobalt transition-colors">{mod.title}</h3>
                    </div>
                    {mod.status === "pro" && <Badge variant="pro" size="sm"><Star className="w-3 h-3" />PRO</Badge>}
                    {mod.status === "coming" && <Badge variant="default" size="sm"><Lock className="w-3 h-3" />Segera</Badge>}
                    {mod.progress === 100 && <Badge variant="success" size="sm">✓ Selesai</Badge>}
                  </div>

                  <p className="text-sm text-text-muted leading-relaxed mb-4">{mod.desc}</p>

                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{mod.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />Lv.{mod.difficulty}</span>
                    {mod.progress > 0 && mod.progress < 100 && <span className="text-accent-cobalt font-medium">{mod.progress}%</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-accent-cobalt bg-accent-cobalt/5 px-2 py-1 rounded">{mod.concept}</span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-cobalt group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-40" />
            <p className="font-display font-semibold text-text-muted">Tidak ada modul ditemukan</p>
            <p className="text-sm text-text-muted mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        )}
      </main>
    </div>
  );
}
