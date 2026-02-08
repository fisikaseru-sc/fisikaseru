"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { StartAttemptButton } from "@/components/ui/StartAttemptButton";
import { loadAttemptIndex } from "@/lib/session/session-store";
import { useEffect, useState } from "react";
import { AttemptIndexItem } from "@/lib/session/types";

export default function AppDashboardPage() {
  const [items, setItems] = useState<AttemptIndexItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(loadAttemptIndex());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <Card className="space-y-2">
        <div className="text-sm text-slate-600">Mulai attempt baru untuk lab Millikan.</div>
        <StartAttemptButton />
      </Card>
      <Card>
        <div className="mb-2 text-sm font-semibold text-slate-700">Attempt terbaru</div>
        <div className="space-y-2 text-sm">
          {items.length === 0 && <div className="text-slate-500">Belum ada attempt.</div>}
          {items.map((item) => (
            <Link
              key={item.attemptId}
              href={`/app/attempt/${item.attemptId}/step/1`}
              className="block rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              <div className="font-medium text-slate-800">{item.labId}</div>
              <div className="text-xs text-slate-500">{item.updatedAtISO}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
