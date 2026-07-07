import { Card } from "@/components/ui/Card";

export default function DocsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Dokumentasi</h1>
      <Card>
        <p className="text-sm text-slate-600">
          FisikaSeru memakai pola manifest-driven lab. Setiap lab disimpan di `src/labs/&lt;slug&gt;` dengan
          `manifest.json`, konten step, modul simulasi, dan skenario QC.
        </p>
      </Card>
    </div>
  );
}
