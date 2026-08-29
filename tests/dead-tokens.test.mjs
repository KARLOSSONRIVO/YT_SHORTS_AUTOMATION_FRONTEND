import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function sourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...sourceFiles(full));
    else if (/\.(tsx?|css)$/.test(entry)) files.push(full);
  }
  return files;
}

test("no undefined color tokens remain under src/", () => {
  const offenders = sourceFiles(srcDir)
    .filter((file) => /\b(?:text-on-surface|bg-surface-base)\b/.test(readFileSync(file, "utf8")))
    .map((file) => path.relative(srcDir, file));
  assert.deepEqual(offenders, [], `dead tokens found in: ${offenders.join(", ")}`);
});
