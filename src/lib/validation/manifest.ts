import { z } from "zod";

const StepSchema = z.object({
  step: z.number().int().min(1).max(5),
  type: z.string().min(1),
  title: z.string().min(1),
  contentPath: z.string().optional(),
});

export const LabManifestSchema = z.object({
  id: z.string().min(1).optional(),
  labId: z.string().min(1),
  version: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()),
  assets: z.object({
    thumbnail: z.string().min(1),
    heroPoster: z.string().min(1),
    stepPreviews: z.record(z.string(), z.string()),
  }),
  steps: z.array(StepSchema).length(5),
  controls: z.object({
    core: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), kind: z.string().min(1) })),
    advanced: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), kind: z.string().min(1) })),
  }),
  readouts: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), unit: z.string().min(1) })),
  table: z.object({
    id: z.string().min(1),
    rowId: z.string().min(1),
    columns: z.array(z.object({ key: z.string().min(1), label: z.string().min(1), type: z.string().min(1) })),
  }),
});

export type LabManifest = z.infer<typeof LabManifestSchema>;
