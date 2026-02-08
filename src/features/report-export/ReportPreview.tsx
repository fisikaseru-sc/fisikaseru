"use client";

import { Card } from "@/components/ui/Card";
import { LabAttemptSession } from "@/lib/session/types";
import { buildMilikanReportText } from "@/features/report-export/templates/milikanReport";

interface ReportPreviewProps {
  session: LabAttemptSession;
}

export function ReportPreview({ session }: ReportPreviewProps) {
  const text = buildMilikanReportText(session);

  return (
    <Card>
      <div className="mb-2 text-sm font-semibold text-slate-700">Preview Laporan</div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
        {text}
      </pre>
    </Card>
  );
}
