"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-accent-cobalt/[0.03] to-transparent -z-10" />

      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-navy mb-4">
            Siap Memahami Fisika dengan Cara Baru?
          </h2>
          <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto">
            Mulai eksperimen pertamamu sekarang. Gratis, tanpa kartu kredit,
            langsung di browser.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl">
              Mulai Eksperimen Gratis <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl">
              Lihat Semua Modul
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
