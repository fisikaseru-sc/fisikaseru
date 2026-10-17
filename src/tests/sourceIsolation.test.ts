// ============================================================
// FISIKASERU — SOURCE REGISTRY & ISOLATION REGRESSION TESTS
// Dijalankan via: npm run test:isolation
//
// Menguji (Fase 9 dari audit arsitektur sumber):
//   1. Resolusi PHYSICS_SOURCE_ROOT: path valid, path ber-spasi,
//      path hilang, tanpa env (default), dan tidak pernah melempar.
//   2. Metadata registry: kolom wajib terisi jujur (UNKNOWN kosong,
//      bukan tebakan), status REVIEWED hanya untuk yang benar ditelaah.
//   3. Isolasi: tidak ada path sumber yang menunjuk ke dalam repo;
//      tidak ada penulisan ke direktori sumber.
//   4. Ekstraksi Erlangga: buku scan terdeteksi sebagai keterbatasan
//      (bukan sumber terverifikasi penuh).
// ============================================================

import * as fs from "fs";
import * as path from "path";
import {
  PHYSICS_SOURCE_ROOT_ENV,
  REVIEWED_SOURCES,
  resolvePhysicsSourceRoot,
  getSourceMeta,
  getSourcePath,
} from "../lib/physicsSources/registry";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`❌ FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ── 1. Resolusi root ─────────────────────────────────────────

// 1a. Root default tersedia di mesin audit ini (path ber-spasi!).
const resDefault = resolvePhysicsSourceRoot({});
check(
  `Root default "${resDefault.root}" terselesaikan tanpa exception`,
  typeof resDefault.root === "string" && resDefault.root.length > 0
);
check(
  "Root default di mesin audit benar-benar ada dan terbaca",
  resDefault.available && resDefault.error === null,
  resDefault.error ?? ""
);
check(
  "Path dengan spasi ('Physics Source') didukung",
  resDefault.root.includes(" ") && resDefault.available
);
check("Root default bukan dari env", resDefault.fromEnv === false);

// 1b. Env var mengarahkan ke path yang benar (path ber-spasi via env).
const realRoot = "/home/si/AI-Workspace/Physics Source";
const resEnv = resolvePhysicsSourceRoot({ [PHYSICS_SOURCE_ROOT_ENV]: realRoot });
check("Env var dengan path ber-spasi tersedia", resEnv.available && resEnv.fromEnv);

// 1c. Path yang salah/ hilang → pesan error membantu, tanpa exception.
const resMissing = resolvePhysicsSourceRoot({ [PHYSICS_SOURCE_ROOT_ENV]: "/nonexistent/physics/source" });
check(
  "Path hilang → available=false + pesan menyebut env var",
  !resMissing.available &&
    resMissing.error !== null &&
    resMissing.error.includes(PHYSICS_SOURCE_ROOT_ENV),
  resMissing.error ?? ""
);
check(
  "Pesan error menyebut simulasi tetap berjalan (fallback non-fatal)",
  (resMissing.error ?? "").includes("Simulasi tetap berjalan")
);

// 1d. Env var kosong/whitespace → jatuh ke default, bukan error.
const resBlank = resolvePhysicsSourceRoot({ [PHYSICS_SOURCE_ROOT_ENV]: "   " });
check("Env var kosong → pakai default", !resBlank.fromEnv && typeof resBlank.root === "string");

// 1e. Root berupa file (bukan direktori) → dilaporkan tidak tersedia.
const tmpFile = path.join("/tmp", "opencode", "not-a-dir-test.txt");
try {
  fs.mkdirSync("/tmp/opencode", { recursive: true });
  fs.writeFileSync(tmpFile, "x");
  const resFile = resolvePhysicsSourceRoot({ [PHYSICS_SOURCE_ROOT_ENV]: tmpFile });
  check("Path menunjuk file (bukan dir) → tersedia=false", !resFile.available);
} finally {
  try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
}

// ── 2. Integritas metadata registry ───────────────────────────

check("Registry berisi 10 sumber terinventarisasi", REVIEWED_SOURCES.length === 10, `got ${REVIEWED_SOURCES.length}`);

const REQUIRED_FIELDS = [
  "source_id", "title", "author_or_institution", "publication_year", "edition",
  "source_type", "filename", "chapter", "page_range", "claim_supported",
  "review_status", "verification_date", "source_version_or_hash",
  "reviewer_or_process", "limitations",
] as const;

let allFieldsOk = true;
let unknownHonest = true;
for (const s of REVIEWED_SOURCES) {
  for (const f of REQUIRED_FIELDS) {
    const v = (s as unknown as Record<string, unknown>)[f];
    if (typeof v !== "string") { allFieldsOk = false; failures.push(`field ${f} bukan string pada ${s.source_id}`); }
  }
  // Kolom yang tak diketahui harus kosong atau eksplisit UNKNOWN — bukan tebakan.
  if (s.author_or_institution === "" || s.publication_year === "") {
    // Boleh kosong asalkan limitations menjelaskan kenapa.
    if (!s.limitations.toLowerCase().includes("verif") && !s.limitations.toLowerCase().includes("tidak")) {
      unknownHonest = false;
      failures.push(`${s.source_id}: kolom kosong tanpa penjelasan di limitations`);
    }
  }
  // Setiap sumber yang diklaim pernah ditelaah harus punya tanggal + proses.
  if (s.review_status === "REVIEWED" || s.review_status === "PARTIALLY_REVIEWED") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.verification_date) || s.reviewer_or_process === "") {
      unknownHonest = false;
      failures.push(`${s.source_id}: status ${s.review_status} tanpa tanggal/proses reviewer`);
    }
    if (s.claim_supported === "") {
      unknownHonest = false;
      failures.push(`${s.source_id}: status ditelaah tapi claim_supported kosong`);
    }
  }
}
check("Semua kolom metadata wajib terisi sebagai string", allFieldsOk);
check("Kolom tak diketahui jujur (kosong + dijelaskan), REVIEWED punya tanggal+proses+klaim", unknownHonest);

// Status REVIEWED hanya untuk dokumen yang dibaca penuh (CP IPA & CP Fisika F).
const reviewed = REVIEWED_SOURCES.filter((s) => s.review_status === "REVIEWED").map((s) => s.source_id);
check(
  "Hanya 2 dokumen berstatus REVIEWED (CP IPA, CP Fisika F — dibaca penuh)",
  reviewed.length === 2 && reviewed.includes("SRC-CP-IPA-2025") && reviewed.includes("SRC-CP-FISIKA-F-2025"),
  `got: ${reviewed.join(", ")}`
);

// Erlangga (scan) tidak boleh REVIEWED.
const erl = getSourceMeta("SRC-ERLANGGA-XI");
check(
  "Erlangga (PDF scan, OCR parsial) berstatus PARTIALLY_REVIEWED dengan keterbatasan tereksplicit",
  erl !== null && erl.review_status === "PARTIALLY_REVIEWED" && erl.limitations.includes("scan")
);

// Diskrepansi nomor keputusan CP Fisika F harus tercatat.
const cpF = getSourceMeta("SRC-CP-FISIKA-F-2025");
check(
  "Diskrepansi nomor keputusan (file 046 vs isi 064) tercatat di limitations",
  cpF !== null && cpF.limitations.includes("064")
);

// ── 3. Isolasi proyek ─────────────────────────────────────────

// Repo root dicari secara robust: naik dari __dirname sampai menemukan
// direktori berisi package.json bernama fisikaseru-app (tahan terhadap
// perubahan layout output tsc).
function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf-8"));
      if (pkg.name === "fisikaseru-app") return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("repo root fisikaseru-app tidak ditemukan dari " + start);
}
const repoRoot = findRepoRoot(__dirname);
let noRepoPaths = true;
for (const s of REVIEWED_SOURCES) {
  const p = getSourcePath(s, realRoot);
  if (p === null) { noRepoPaths = false; failures.push(`${s.source_id}: path null padahal root valid`); continue; }
  // Path sumber harus berada DI LUAR repo.
  if (path.resolve(p).startsWith(repoRoot)) {
    noRepoPaths = false;
    failures.push(`${s.source_id}: path sumber menunjuk ke dalam repo!`);
  }
}
check("Semua path sumber berada di luar repo (tidak ada salinan PDF di repo)", noRepoPaths);

// Tidak ada file PDF/database/secret ter-commit: cek daftar file repo aktual.
const tracked = execGitLsFiles();
check(
  "git ls-files: tidak ada PDF, .env, .db/.sqlite, atau 'secret' ter-commit (.env.example template dikecualikan)",
  !tracked.some((f) =>
    /\.(pdf|db|sqlite3?)$/i.test(f) ||
    /^\.env/.test(f) && f !== ".env.example" ||
    /secret|credential/i.test(f)
  ),
  tracked.filter((f) => /\.(pdf|db)$/i.test(f) || (/^\.env/.test(f) && f !== ".env.example")).slice(0, 3).join(", ")
);

// Direktori sumber bersama tidak berubah oleh repo:
// (verifikasi direktif) tidak ada file repo yang menulis ke root sumber.
let srcUnchanged = true;
for (const s of REVIEWED_SOURCES) {
  const p = path.join(realRoot, s.filename);
  if (!fs.existsSync(p)) { srcUnchanged = false; failures.push(`file sumber ${s.filename} tidak ditemukan di root`); }
}
check("Semua file sumber masih ada di root bersama (tidak dipindah/dihapus oleh proyek)", srcUnchanged);

// getData/getSourcePath tidak pernah menulis: bukti statis — registry.ts
// tidak memuat fungsi tulis file.
const registrySrc = fs.readFileSync(path.join(repoRoot, "src", "lib", "physicsSources", "registry.ts"), "utf-8");
check(
  "registry.ts read-only: tidak ada writeFileSync/appendFileSync/createWriteStream",
  !/writeFileSync|appendFileSync|createWriteStream/i.test(registrySrc)
);

// ── Hasil ────────────────────────────────────────────────────

function execGitLsFiles(): string[] {
  const { execSync } = require("child_process") as typeof import("child_process");
  try {
    return execSync("git ls-files", { cwd: repoRoot, encoding: "utf-8" }).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

console.log("");
if (failed > 0) {
  console.log(`❌ ${failed} assertion(s) gagal dari ${passed + failed}:`);
  for (const f of failures) console.log(`   - ${f}`);
  process.exit(1);
}
console.log(`🎉 All ${passed} source-registry & isolation regression tests passed!`);
