"use client";

import { motion } from "framer-motion";
import { Eye, FlaskConical, Brain, Target, Lightbulb, BookOpen, Award } from "lucide-react";

const steps = [
  {
    icon: Eye,
    title: "Trigger Intuisi",
    desc: "Siswa menjawab pertanyaan prediksi sebelum eksperimen dimulai.",
    color: "bg-violet/10 text-violet",
  },
  {
    icon: FlaskConical,
    title: "Desain Eksperimen",
    desc: "Tentukan variabel bebas, terikat, dan kontrol.",
    color: "bg-accent-cobalt/10 text-accent-cobalt",
  },
  {
    icon: Target,
    title: "Eksperimen Virtual",
    desc: "Jalankan simulasi fisika 3D dengan data realistis.",
    color: "bg-sky-blue/10 text-sky-blue",
  },
  {
    icon: Brain,
    title: "Analisis Data",
    desc: "Buat grafik, regresi linear, dan hitung konstanta fisika.",
    color: "bg-teal/10 text-teal",
  },
  {
    icon: Lightbulb,
    title: "Konfrontasi & Refleksi",
    desc: "Bandingkan prediksi vs hasil. Rekonstruksi pemahaman.",
    color: "bg-amber/10 text-amber",
  },
  {
    icon: BookOpen,
    title: "Laporan Ilmiah",
    desc: "Generate laporan PDF berkualitas akademik secara otomatis.",
    color: "bg-rose/10 text-rose",
  },
  {
    icon: Award,
    title: "Eureka Card",
    desc: "Dapatkan kartu pencapaian yang bisa dibagikan.",
    color: "bg-success/10 text-success",
  },
];

export function LearningLoopSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent-cobalt/[0.02] blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-display font-semibold text-accent-cobalt tracking-wide uppercase mb-3">
            Learning Architecture
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-navy mb-4">
            7 Tahap Cognitive Learning Loop
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
            Setiap modul mengikuti alur pembelajaran yang dirancang berdasarkan
            Conceptual Change Theory dan Inquiry-Based Learning.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(50%-1px)] w-0.5 h-[calc(100%-60px)] bg-gradient-to-b from-accent-cobalt/20 via-teal/20 to-amber/20" />

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex items-start gap-5 lg:w-[45%] ${
                  i % 2 === 0 ? "lg:mr-auto lg:pr-12" : "lg:ml-auto lg:pl-12"
                } ${i > 0 ? "lg:-mt-2" : ""}`}
              >
                {/* Node on line (desktop) */}
                <div className="hidden lg:block absolute top-3 w-4 h-4 rounded-full bg-white border-2 border-accent-cobalt/30 z-10"
                  style={{ [i % 2 === 0 ? "right" : "left"]: "-38px" }}
                />

                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-muted">0{i + 1}</span>
                    <h3 className="font-display font-semibold text-primary-navy">{step.title}</h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
