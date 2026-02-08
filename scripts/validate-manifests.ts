import { promises as fs } from "node:fs";
import path from "node:path";

import { LabManifestSchema } from "../src/lib/validation/manifest";

const REQUIRED_TABLE_COLUMNS = ["trialId", "method", "U_V", "t2_s", "v2_m_s", "r0_m", "q0_C"];

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
  const labsRoot = path.join(repoRoot, "src", "labs");
  const manifests = await collectManifestPaths(labsRoot);

  if (manifests.length === 0) {
    throw new Error("No manifest files found.");
  }

  for (const manifestPath of manifests) {
    const raw = await fs.readFile(manifestPath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = LabManifestSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Schema validation failed at ${manifestPath}: ${parsed.error.message}`);
    }

    if (parsed.data.controls.core.length > 3) {
      throw new Error(`controls.core length must be <= 3 at ${manifestPath}`);
    }

    if (parsed.data.readouts.length !== 5) {
      throw new Error(`readouts length must be exactly 5 at ${manifestPath}`);
    }

    const columnKeys = new Set(parsed.data.table.columns.map((column) => column.key));
    for (const required of REQUIRED_TABLE_COLUMNS) {
      if (!columnKeys.has(required)) {
        throw new Error(`Missing required table column '${required}' at ${manifestPath}`);
      }
    }
  }

  console.log(`Validated ${manifests.length} manifest file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
