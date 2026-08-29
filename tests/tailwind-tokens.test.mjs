import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const config = await readFile(path.join(dir, "..", "tailwind.config.ts"), "utf8");

test("container radius token is 28px (1.75rem)", () => {
  assert.match(config, /container:\s*["']1\.75rem["']/);
});

test("control radius token is 12px (0.75rem)", () => {
  assert.match(config, /control:\s*["']0\.75rem["']/);
});

test("soft shadow is retuned for the dark ground", () => {
  assert.match(config, /soft:\s*["']0 18px 48px -20px rgba\(0, 0, 0, 0\.65\)["']/);
});

test("the invisible slate soft shadow is gone", () => {
  assert.doesNotMatch(config, /rgba\(15, 23, 42, 0\.28\)/);
});

test("unused dashboard-grid backgroundImage is removed", () => {
  assert.doesNotMatch(config, /dashboard-grid/);
});

test("vestigial darkMode class strategy is removed", () => {
  assert.doesNotMatch(config, /darkMode/);
});
