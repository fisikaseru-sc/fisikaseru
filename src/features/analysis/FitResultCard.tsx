"use client";

import { Card } from "@/components/ui/Card";

interface FitResultCardProps {
  eEst: number | null;
  rmsResidual: number | null;
}

const E_REFERENCE = 1.6e-19;

export function FitResultCard({ eEst, rmsResidual }: FitResultCardProps) {
  const diffPercent = eEst ? ((Math.abs(eEst) - E_REFERENCE) / E_REFERENCE) * 100 : null;

  return (
    <Card className="space-y-2">
      <div className="text-sm font-semibold text-slate-700">Hasil Estimasi Muatan Elementer</div>
      <div className="font-mono text-base">
        e_est = {eEst !== null ? `${Math.abs(eEst).toExponential(4)} C` : "belum tersedia"}
      </div>
      <div className="text-sm text-slate-600">Referensi: 1.6e-19 C</div>
      <div className="text-sm text-slate-600">
        Selisih relatif: {diffPercent !== null ? `${diffPercent.toFixed(2)}%` : "-"}
      </div>
      <div className="text-sm text-slate-600">
        RMS residual: {rmsResidual !== null ? rmsResidual.toExponential(3) : "-"}
      </div>
    </Card>
  );
}
