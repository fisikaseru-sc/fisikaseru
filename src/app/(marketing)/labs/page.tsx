import { LabCatalog } from "@/features/catalog/LabCatalog";

export default function MarketingLabsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Daftar Lab</h1>
      <LabCatalog />
    </div>
  );
}
