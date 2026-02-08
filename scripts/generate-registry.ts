import { promises as fs } from "node:fs";
import path from "node:path";

interface ManifestLite {
  labId?: string;
  id?: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  assets: { thumbnail: string; heroPoster: string };
  steps: Array<{ step: number; type: string; title: string; contentPath?: string }>;
}

async function collectManifestPaths(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectManifestPaths(fullPath)));
    } else if (entry.isFile() && entry.name === "manifest.json") {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const repoRoot = process.cwd();
  const labsDir = path.join(repoRoot, "src", "labs");
  const manifestPaths = await collectManifestPaths(labsDir);
  const registry: ManifestLite[] = [];

  for (const manifestPath of manifestPaths) {
    const raw = await fs.readFile(manifestPath, "utf-8");
    const parsed = JSON.parse(raw) as ManifestLite;
    registry.push(parsed);
  }

  registry.sort((a, b) => a.title.localeCompare(b.title));

  const generated = `import { LabRegistryItem } from "./types";\n\nexport const labRegistry: LabRegistryItem[] = ${JSON.stringify(
    registry.map((manifest) => ({
      labId: manifest.labId ?? manifest.id ?? manifest.slug,
      slug: manifest.slug,
      title: manifest.title,
      description: manifest.description,
      tags: manifest.tags,
      thumbnail: manifest.assets.thumbnail,
      heroPoster: manifest.assets.heroPoster,
      steps: manifest.steps,
    })),
    null,
    2,
  )};\n\nexport function getLabBySlug(slug: string) {\n  return labRegistry.find((lab) => lab.slug === slug) ?? null;\n}\n`;

  const target = path.join(repoRoot, "src", "labs", "_registry", "index.ts");
  await fs.writeFile(target, generated, "utf-8");
  console.log(`Generated registry with ${registry.length} lab(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
