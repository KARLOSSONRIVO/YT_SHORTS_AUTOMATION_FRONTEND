import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
// container / control / pill are the radius vocabulary; rounded-none is the explicit
// "no radius" used for the full-bleed fullscreen video surface (media/video-player.tsx).
const ALLOWED = new Set(["rounded-container", "rounded-control", "rounded-full", "rounded-none"]);

function sourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry)) files.push(full);
  }
  return files;
}

test("only container / control / pill radii appear under src/", () => {
  const offenders = [];
  const re = /(?:[a-z-]+:)*rounded(?:-[a-z0-9[\]#%./-]+)?/g;
  for (const file of sourceFiles(srcDir)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.match(re) ?? []) {
      const base = match.replace(/^(?:[a-z-]+:)+/, ""); // strip lg:/hover:/motion-reduce: etc.
      if (!ALLOWED.has(base)) offenders.push(`${path.relative(srcDir, file)}: ${match}`);
    }
  }
  assert.deepEqual(offenders, [], `unexpected radius utilities:\n${offenders.join("\n")}`);
});
