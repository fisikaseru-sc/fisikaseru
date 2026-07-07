import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { labRegistry } from "@/labs/_registry";

export function LabCatalog() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {labRegistry.map((lab) => (
        <Card key={lab.slug} className="space-y-3">
          <div className="text-lg font-bold text-slate-900">{lab.title}</div>
          <p className="text-sm text-slate-600">{lab.description}</p>
          <div className="flex flex-wrap gap-2">
            {lab.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href={`/lab/${lab.slug}`} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
              Detail lab
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
