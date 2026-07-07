"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { AnalysisRegistry } from "@/features/registry";
import { FlaskConical } from "lucide-react";

export default function AnalysisPageWrapper() {
  const params = useParams();
  const moduleSlug = (params?.moduleSlug as string) || "millikan";

  const AnalysisComponent = AnalysisRegistry[moduleSlug];

  if (!AnalysisComponent) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-body text-text-muted">
        Modul tidak ditemukan atau belum tersedia.
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <FlaskConical className="w-8 h-8 animate-pulse text-accent-cobalt" />
      </div>
    }>
      <AnalysisComponent />
    </Suspense>
  );
}
