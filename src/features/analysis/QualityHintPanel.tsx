"use client";

import { Card } from "@/components/ui/Card";

interface QualityHintPanelProps {
  trialCount: number;
  hasCunninghamRows: boolean;
  rmsResidual: number | null;
}

export function QualityHintPanel({ trialCount, hasCunninghamRows, rmsResidual }: QualityHintPanelProps) {
  const hints: string[] = [];

  if (trialCount < 6) {
    hints.push("Tambahkan jumlah trial minimal 6 untuk estimasi e yang lebih stabil.");
  }

  if (!hasCunninghamRows) {
    hints.push("Coba aktifkan Cunningham correction untuk droplet kecil agar bias berkurang.");
  }

  if (rmsResidual !== null && rmsResidual > 5e-20) {
    hints.push("Residual fit cukup besar. Periksa ulang timing t1/t2 dan pilih droplet yang lebih lambat.");
  }

  if (hints.length === 0) {
    hints.push("Kualitas data cukup baik untuk laporan akhir.");
  }

  return (
    <Card>
      <div className="mb-2 text-sm font-semibold text-slate-700">Quality Hints</div>
      <ul className="space-y-2 text-sm text-slate-600">
        {hints.map((hint, index) => (
          <li key={`${hint}-${index}`}>• {hint}</li>
        ))}
      </ul>
    </Card>
  );
}
