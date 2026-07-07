import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { StartAttemptButton } from "@/components/ui/StartAttemptButton";
import { getLabBySlug } from "@/labs/_registry";

interface LabDetailPageProps {
  params: Promise<{ labSlug: string }>;
}

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const { labSlug } = await params;
  const lab = getLabBySlug(labSlug);
  if (!lab) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">{lab.title}</h1>
        <p className="text-sm text-slate-600">{lab.description}</p>
        <div className="text-sm text-slate-700">Slug: {lab.slug}</div>
        <div className="text-sm text-slate-700">Jumlah step: {lab.steps.length}</div>
        <StartAttemptButton label="Mulai Attempt Lab Ini" />
      </Card>

      <Card>
        <div className="mb-2 text-sm font-semibold text-slate-700">Outline 5-step</div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          {lab.steps.map((step) => (
            <li key={step.step}>
              Step {step.step}: {step.title} ({step.type})
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
