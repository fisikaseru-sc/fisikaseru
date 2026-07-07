import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { StartAttemptButton } from "@/components/ui/StartAttemptButton";
import { LabCatalog } from "@/features/catalog/LabCatalog";

export default function MarketingHomePage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-teal-900 to-cyan-800 text-white">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
          <div>
            <h1 className="mb-3 text-3xl font-bold">FisikaSeru: Virtual Physics Labs</h1>
            <p className="mb-5 max-w-2xl text-sm text-cyan-50 md:text-base">
              Jalankan praktikum Millikan Oil Drop end-to-end: pre-lab, simulasi pengukuran t1/t2,
              analisis kuantisasi muatan, sampai export laporan.
            </p>
            <div className="flex flex-wrap gap-2">
              <StartAttemptButton label="Mulai Praktikum" />
              <Link
                href="/labs"
                className="inline-flex items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
              >
                Lihat katalog lab
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
            <div className="mb-2 font-semibold">Yang tersedia saat ini</div>
            <ul className="space-y-1 text-cyan-50">
              <li>• 5-step Lab Player</li>
              <li>• Simulasi Millikan dengan polarity + timer sequence</li>
              <li>• Analisis estimator e + CER</li>
              <li>• Export JSON/CSV/PDF(print)</li>
            </ul>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Katalog Lab</h2>
        <LabCatalog />
      </section>
    </div>
  );
}
