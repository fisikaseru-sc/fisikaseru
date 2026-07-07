import { LabRegistryItem } from "./types";

export const labRegistry: LabRegistryItem[] = [
  {
    "labId": "milikan",
    "slug": "milikan",
    "title": "Eksperimen Tetes Minyak Millikan",
    "description": "Mengukur muatan tetes minyak dan menaksir muatan elementer e melalui kuantisasi q = n e menggunakan metode floating dan rising/falling.",
    "tags": [
      "fisika-modern",
      "muatan-elementer",
      "kuantisasi",
      "fluida",
      "listrik"
    ],
    "thumbnail": "/images/labs/milikan/thumbnail.webp",
    "heroPoster": "/images/labs/milikan/heroPoster.webp",
    "steps": [
      {
        "step": 1,
        "type": "mdx",
        "title": "Konsep & Rumus",
        "contentPath": "src/labs/milikan/content/step1.mdx"
      },
      {
        "step": 2,
        "type": "prelab",
        "title": "Pre-lab (Variabel & Desain Data)",
        "contentPath": "src/labs/milikan/content/step2.mdx"
      },
      {
        "step": 3,
        "type": "simulation",
        "title": "Eksperimen (Pengukuran t1/t2)",
        "sim": {
          "scene": "src/labs/milikan/sim/scene.tsx",
          "core": "src/labs/milikan/sim/sim-core.ts",
          "controller": "src/labs/milikan/sim/controller.ts",
          "instruments": "src/labs/milikan/sim/instruments.ts"
        }
      },
      {
        "step": 4,
        "type": "analysis",
        "title": "Analisis (r0, q0, Cunningham, e)",
        "contentPath": "src/labs/milikan/content/step4.mdx"
      },
      {
        "step": 5,
        "type": "report",
        "title": "Laporan & Export",
        "contentPath": "src/labs/milikan/content/step5.mdx"
      }
    ]
  }
];

export function getLabBySlug(slug: string) {
  return labRegistry.find((lab) => lab.slug === slug) ?? null;
}
