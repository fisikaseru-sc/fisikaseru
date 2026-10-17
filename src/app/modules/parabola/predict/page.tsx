"use client";

import dynamic from "next/dynamic";

const PredictionView = dynamic(
  () => import("@/features/parabola/components/PredictionView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div
          className="size-8 animate-spin rounded-full border-2 border-accent-cobalt border-t-transparent"
          aria-label="Memuat"
        />
      </div>
    ),
  }
);

export default function ParabolaPredictPage() {
  return <PredictionView />;
}
