"use client";

interface TipsCoachPanelProps {
  hints: string[];
  isStable: boolean;
}

export function TipsCoachPanel({ hints, isStable }: TipsCoachPanelProps) {
  return (
    <div className="panel p-4">
      <div className="mb-2 text-sm font-semibold text-slate-700">Tips Coach Panel</div>
      <div className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900">
        Stabilitas floating: {isStable ? "Stabil" : "Belum stabil"}
      </div>
      <ul className="space-y-2 text-sm text-slate-600">
        {hints.length > 0 ? (
          hints.map((hint, index) => <li key={`${hint}-${index}`}>• {hint}</li>)
        ) : (
          <li>• Tidak ada warning saat ini. Lanjutkan pengukuran.</li>
        )}
      </ul>
    </div>
  );
}
