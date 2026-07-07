import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <Card>
        <p className="text-sm text-slate-600">
          Mode penyimpanan saat ini: guest localStorage. Tidak ada sinkronisasi akun.
        </p>
      </Card>
    </div>
  );
}
