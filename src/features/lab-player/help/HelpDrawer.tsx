"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function HelpDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Bantuan Praktikum</div>
        <Button variant="ghost" onClick={() => setOpen((prev) => !prev)}>
          {open ? "Tutup" : "Buka"}
        </Button>
      </div>
      {open ? (
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Atur topMark dan bottomMark dengan separation yang cukup besar (&gt;= 5 garis).</li>
          <li>Pilih droplet yang turun lambat saat U OFF untuk mengurangi error timer.</li>
          <li>Jika U ON tapi droplet turun, balik polarity.</li>
          <li>Kumpulkan minimal 6 trial sebelum lanjut analisis.</li>
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Buka drawer untuk checklist eksperimen.</p>
      )}
    </div>
  );
}
