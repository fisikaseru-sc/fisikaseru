import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Kontak</h1>
      <Card>
        <p className="text-sm text-slate-600">Email: hello@fisikaseru.local</p>
        <p className="text-sm text-slate-600">GitHub: github.com/fisikaseru</p>
      </Card>
    </div>
  );
}
