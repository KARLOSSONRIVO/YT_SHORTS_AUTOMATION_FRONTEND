import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(dir, "..", "src");

async function walk(d) {
  const entries = await readdir(d, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(tsx?|css)$/.test(e.name)) files.push(full);
  }
  return files;
}

test("no literal Material Symbols classes remain under src/", async () => {
  const files = await walk(srcDir);
  const offenders = [];
  for (const f of files) {
    const text = await readFile(f, "utf8");
    if (text.includes("material-symbols")) offenders.push(path.relative(srcDir, f));
  }
  assert.deepEqual(offenders, [], `material-symbols found in: ${offenders.join(", ")}`);
});
