"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, BarChart3, Lock, Star, ArrowRight } from "lucide-react";

const modules = [
  {
    id: "jatuh-bebas",
    title: "Jatuh Bebas",
    category: "Mekanika",
    difficulty: 1,
    duration: "15 menit",
    concept: "Kinematika Gerak",
    desc: "Analisis gerak jatuh bebas dari berbagai ketinggian.",
    status: "free" as "free" | "pro" | "coming",
    color: "from-violet/10 to-purple-50",
    iconBg: "bg-violet",
  },
  {
    id: "bandul",
    title: "Bandul Sederhana",
    category: "Mekanika",
    difficulty: 2,
    duration: "25 menit",
    concept: "Gerak Harmonik Sederhana",
    desc: "Tentukan percepatan gravitasi bumi melalui periode ayunan bandul.",
    status: "free" as const,
    color: "from-accent-cobalt/10 to-sky-blue/5",
    iconBg: "bg-accent-cobalt",
  },
  {
    id: "ohm",
    title: "Hukum Ohm",
    category: "Kelistrikan",
    difficulty: 2,
    duration: "20 menit",
    concept: "Resistansi & Arus",
    desc: "Temukan hubungan tegangan, arus, dan hambatan.",
    status: "free" as const,
    color: "from-teal/10 to-emerald-50",
    iconBg: "bg-teal",
  },
  {
    id: "boyle",
    title: "Hukum Boyle",
    category: "Termodinamika",
    difficulty: 2,
    duration: "20 menit",
    concept: "Gas Ideal",
    desc: "Hubungan tekanan dan volume gas pada suhu tetap.",
    status: "coming" as const,
    color: "from-rose/10 to-red-50",
    iconBg: "bg-rose",
  },
  {
    id: "snellius",
    title: "Pembiasan Cahaya",
    category: "Optika",
    difficulty: 3,
    duration: "25 menit",
    concept: "Hukum Snellius",
    desc: "Verifikasi hukum pembiasan cahaya.",
    status: "coming" as const,
    color: "from-sky-blue/10 to-cyan-50",
    iconBg: "bg-sky-blue",
  },
  {
    id: "millikan",
    title: "Tetes Minyak Millikan",
    category: "Fisika Modern",
    difficulty: 4,
    duration: "35 menit",
    concept: "Kuantisasi Muatan",
    desc: "Temukan muatan elektron fundamental.",
    status: "free" as const,
    color: "from-amber/10 to-yellow-50",
    iconBg: "bg-amber",
  },
];

export function ModulesSection() {
  return (
    <section id="modules" className="py-24 bg-bg-primary relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-display font-semibold text-teal tracking-wide uppercase mb-3">
            Kurikulum Fisika
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-navy mb-4">
            Modul Eksperimen
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Setiap modul dirancang dengan rigor ilmiah — lengkap dengan simulasi 3D,
            data realistis, dan alur pembelajaran terstruktur.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="group h-full transition-all hover:shadow-card-hover hover:-translate-y-0.5">
                {/* Header gradient */}
                <div className={`h-2 bg-gradient-to-r ${mod.color} mx-(--card-spacing) rounded-full`} />

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" size="sm">
                        {mod.category}
                      </Badge>
                      <CardTitle className="font-display font-semibold text-primary-navy text-lg group-hover:text-accent-cobalt transition-colors">
                        {mod.title}
                      </CardTitle>
                    </div>
                    {mod.status === "pro" && (
                      <Badge variant="pro" size="sm">
                        <Star className="w-3 h-3" aria-hidden="true" /> PRO
                      </Badge>
                    )}
                    {mod.status === "coming" && (
                      <Badge variant="warning" size="sm">
                        <Lock className="w-3 h-3" aria-hidden="true" /> Segera
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm text-text-muted leading-relaxed">
                    {mod.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {mod.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> Lv.{mod.difficulty}
                  </span>
                </CardContent>

                <CardFooter className="justify-between bg-transparent border-t-0">
                  <span className="text-xs font-mono text-accent-cobalt bg-accent-cobalt/5 px-2 py-1 rounded">
                    {mod.concept}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-text-muted group-hover:text-accent-cobalt group-hover:translate-x-1 transition-all"
                    aria-hidden="true"
                  />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
