"use client";

import { Button } from "@/components/ui/Button";
import { buildMilikanReportText } from "@/features/report-export/templates/milikanReport";
import { LabAttemptSession } from "@/lib/session/types";
import { downloadBlob } from "@/lib/export/download";
import { trialsToCsv } from "@/lib/export/csv";

interface ExportButtonClusterProps {
  session: LabAttemptSession;
}

export function ExportButtonCluster({ session }: ExportButtonClusterProps) {
  const canExport = session.trials.length > 0;

  return (
    <div className="panel flex flex-wrap items-center gap-2 p-4">
      <Button
        variant="secondary"
        disabled={!canExport}
        onClick={() => downloadBlob(`milikan-${session.attemptId}.json`, JSON.stringify(session, null, 2), "application/json")}
      >
        Export JSON
      </Button>
      <Button
        variant="secondary"
        disabled={!canExport}
        onClick={() => downloadBlob(`milikan-${session.attemptId}.csv`, trialsToCsv(session.trials), "text/csv")}
      >
        Export CSV
      </Button>
      <Button variant="ghost" onClick={() => window.print()}>
        Export PDF (print)
      </Button>
      <Button
        variant="ghost"
        onClick={() => downloadBlob(`milikan-${session.attemptId}.txt`, buildMilikanReportText(session), "text/plain")}
      >
        Export TXT
      </Button>
    </div>
  );
}
