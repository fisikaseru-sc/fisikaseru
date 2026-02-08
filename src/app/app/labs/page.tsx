import { Card } from "@/components/ui/Card";
import { StartAttemptButton } from "@/components/ui/StartAttemptButton";
import { LabCatalog } from "@/features/catalog/LabCatalog";

export default function AppLabsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Labs</h1>
      <Card className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Jalankan lab dari katalog berikut.</p>
        <StartAttemptButton label="Attempt Baru" />
      </Card>
      <LabCatalog />
    </div>
  );
}
