import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Tentang FisikaSeru</h1>
      <Card>
        <p className="text-sm text-slate-600">
          Platform praktikum fisika berbasis web untuk membantu pembelajaran berbasis inkuiri dengan data,
          simulasi, dan laporan terstruktur.
        </p>
      </Card>
    </div>
  );
}
