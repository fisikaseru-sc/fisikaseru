"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { loadAttemptIndex } from "@/lib/session/session-store";
import { AttemptIndexItem } from "@/lib/session/types";

export default function ReportsPage() {
  const [items, setItems] = useState<AttemptIndexItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(loadAttemptIndex());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      <Card>
        <div className="space-y-2 text-sm">
          {items.length === 0 && <div className="text-slate-500">Belum ada report.</div>}
          {items.map((item) => (
            <Link
              key={item.attemptId}
              href={`/app/attempt/${item.attemptId}/step/5`}
              className="block rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              Report {item.labId} ({item.attemptId.slice(0, 8)})
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
