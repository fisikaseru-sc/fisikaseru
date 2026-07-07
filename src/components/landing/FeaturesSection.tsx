"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Simulasi Fisika Realistis",
    desc: "Engine fisika berbasis Rapier WASM dengan akurasi <0.1% dan noise Gaussian untuk data realistis.",
  },
  {
    icon: Shield,
    title: "Gratis & Terbuka",
    desc: "Seluruh pengalaman inti gratis selamanya. PRO hanya untuk laporan DOCX dan flashcard premium.",
  },
  {
    icon: Globe,
    title: "Untuk Indonesia",
    desc: "Konten Bahasa Indonesia, kurikulum relevan, dan server di Asia Tenggara untuk performa optimal.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-bg-primary relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-display font-semibold text-accent-cobalt tracking-wide uppercase mb-3">
            Mengapa FisikaSeru?
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-navy mb-4">
            Deep Understanding, Bukan Hafalan
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            FisikaSeru dirancang agar siswa benar-benar memahami konsep fisika —
            melalui pengalaman bereksperimen, bukan sekadar membaca teori.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="science-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-cobalt/10 flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-accent-cobalt" />
              </div>
              <h3 className="font-display font-semibold text-primary-navy mb-2">{feat.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Deep Understanding Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary-navy rounded-2xl p-10 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-navy to-accent-cobalt/30 -z-0" />
          <div
            className="absolute inset-0 opacity-[0.04] -z-0"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10">
            <p className="text-sm font-display font-semibold text-sky-blue tracking-wide uppercase mb-4">
              Filosofi Kami
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-snug mb-6 max-w-3xl mx-auto">
              &ldquo;Platform ini ada untuk membantu siswa{" "}
              <span className="text-sky-blue">benar-benar memahami</span> fisika —
              bukan sekadar menjawab soal dengan benar.&rdquo;
            </h3>
            <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm">
              Setiap fitur, setiap interaksi, setiap keputusan desain diukur dengan satu pertanyaan:
              apakah ini membangun mental model siswa?
            </p>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 cursor-pointer">
                Pelajari Pendekatan Kami <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
